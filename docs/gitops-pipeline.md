# GitOps pipeline

A private git repository is the source of truth for every stack. This public repository mirrors its compose files and
scripts (sanitized). All scripts referenced here are in [platform/](../platform/).

## Flow

```
commit on main (by hand, or a merged Renovate PR)
  │
  ▼
Komodo procedure "deploy-changed-stacks" (every 5 min)
  │  BatchDeployStackIfChanged: only stacks whose compose file (or listed config file) changed
  ▼
for each changed stack, on the Docker VM (Periphery, run directory = stacks/<stack> in Komodo's clone):
  1. pre_deploy    komodo-predeploy <stack>
                   renders .env from OpenBao kv/stacks/<stack> (mode 600), fails the deploy if OpenBao is unreachable
  2. compose       komodo-compose docker compose config | pull | up -d --remove-orphans
                   every .env value that looks like a secret is masked before Komodo stores the output
  3. post_deploy   bash ../../platform/docker-vm/komodo-postdeploy <stack>
                   waits up to 180 s until every container of the project is running, healthy where it has a
                   health check, and has not restarted between two checks; otherwise lists the bad containers
                   and fails the deploy
```

Nothing calls into the home network: Komodo polls git, there is no webhook.

## Secrets: OpenBao

- One KV path per stack (`kv/stacks/<stack>`). The renderer [`bao-render-env`](../platform/docker-vm/bao-render-env)
  writes values single-quoted, so Compose takes them literally; values with quotes or newlines are refused instead of
  being mangled.
- The Docker VM logs in with an AppRole bound to its address; tokens are short-lived and revoked after each run.
  Policy: read `kv/data/stacks/*`, nothing else ([policies/](../platform/openbao/policies/)).
- Containers cannot reach OpenBao at all ([docker-block-bao.service](../platform/docker-vm/docker-block-bao.service),
  a `DOCKER-USER` rule); only host processes can.
- Secret changes deploy themselves: [`komodo-bao-watch`](../platform/docker-vm/komodo-bao-watch) compares each
  rendered `.env` with OpenBao every 5 minutes and asks Komodo (service user with execute rights only) to redeploy.
- OpenBao auto-unseals through AWS KMS ([CloudFormation](../platform/aws/openbao-unseal.yaml)); every use of the key
  triggers an email. Expected: one per day (health check) and one per restart.
- Daily Raft snapshot to ZFS with a snapshot-only AppRole ([bao-snapshot](../platform/openbao/bao-snapshot)).

## Updates: Renovate + Trivy

- Every image is pinned to version and digest. Renovate ([config](../platform/github/renovate.json)) runs weekly as a
  GitHub Action and opens pull requests; nothing auto-merges. Database major versions are blocked (they need a dump
  and restore), digest-only refreshes are grouped into one PR.
- Trivy ([workflow](../platform/github/workflows/trivy.yml), [script](../platform/github/scripts/scan-pr-images.sh))
  pairs each changed image with the image it replaces (same file, same repository) and fails only on CRITICAL CVEs
  with a fix that the new image has and the old one did not. A digest refresh that removes CVEs stays green even if
  some remain. Result: commit status `trivy / critical` on the PR.
- Renovate PRs are opened with the workflow's token, which never triggers other workflows. The Trivy workflow
  therefore also runs after every Renovate run and scans all open Renovate PRs.

## Adding a stack

1. `stacks/<name>/compose.yaml` (pinned images, absolute data paths) and `.env.example`.
2. Secrets to OpenBao: `bao kv put -mount=kv stacks/<name> KEY=-` (value from stdin).
3. Create the Komodo stack like the others: git mode, `pre_deploy`, `post_deploy`, compose wrapper.
   [`set-postdeploy.sh`](../platform/komodo/set-postdeploy.sh) adds the post-deploy hook to any stack that lacks it.
4. Push. A never-deployed stack counts as changed and is deployed within 5 minutes.
5. Public? Add it to the route table in `gen.py`, regenerate, push, then create the Pangolin resource.

## Operating notes

- Restart the Docker VM only after Komodo has finished a running deploy. A restart in the middle of
  `docker compose up` leaves renamed half-replaced containers behind; the next deploy cleans them up, but a database
  container can stay in state `created` until then.
- Komodo's update log never contains secret values (`komodo-redact.py` masks keys with PASS/SECRET/TOKEN/KEY parts
  and any value of 24+ characters).
