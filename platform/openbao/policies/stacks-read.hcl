# Docker host: read the per-stack secrets, nothing else
path "kv/data/stacks/*"     { capabilities = ["read"] }
path "kv/metadata/stacks"   { capabilities = ["list"] }
path "kv/metadata/stacks/*" { capabilities = ["list"] }
