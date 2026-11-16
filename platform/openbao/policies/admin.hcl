# admin: day-to-day administration of this OpenBao without the root token.
# Attached to userpass user "dan". A root token can be regenerated with the recovery keys
# (bao operator generate-root) when something here is not enough.
# No auth/token/* beyond the default policy: admin cannot mint tokens with other policies.

# secrets
path "kv/*" { capabilities = ["create", "read", "update", "patch", "delete", "list"] }

# policies
path "sys/policies/acl"   { capabilities = ["list"] }
path "sys/policies/acl/*" { capabilities = ["create", "read", "update", "delete", "list"] }

# auth methods and their configuration (AppRoles for machines, userpass for people)
path "sys/auth"            { capabilities = ["read"] }
path "sys/auth/*"          { capabilities = ["create", "read", "update", "delete", "sudo"] }
path "auth/approle/*"      { capabilities = ["create", "read", "update", "delete", "list"] }
path "auth/userpass/*"     { capabilities = ["create", "read", "update", "delete", "list"] }

# secret engines
path "sys/mounts"   { capabilities = ["read"] }
path "sys/mounts/*" { capabilities = ["create", "read", "update", "delete", "sudo"] }

# identity, leases, token housekeeping
path "identity/*"                    { capabilities = ["create", "read", "update", "delete", "list"] }
path "sys/leases/*"                  { capabilities = ["create", "read", "update", "delete", "list", "sudo"] }
path "auth/token/accessors"          { capabilities = ["list", "sudo"] }
path "auth/token/lookup-accessor"    { capabilities = ["update"] }
path "auth/token/revoke-accessor"    { capabilities = ["update"] }

# status and backups
path "sys/health"                      { capabilities = ["read", "sudo"] }
path "sys/seal-status"                 { capabilities = ["read"] }
path "sys/audit"                       { capabilities = ["read", "sudo"] }
path "sys/storage/raft/configuration"  { capabilities = ["read"] }
path "sys/storage/raft/snapshot"       { capabilities = ["read"] }
path "sys/capabilities-self"           { capabilities = ["update"] }
