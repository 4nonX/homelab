#!/usr/bin/env python3
"""komodo-redact.py <env file>: copy stdin to stdout with secret values from the env file replaced by REDACTED.
Secret = key has a secret-like part (PASS, SECRET, TOKEN, KEY, ...) or the value is long (>= 24 chars, random ids).
Also catches the forms compose prints: $ doubled to $$, JSON/YAML escaping, URL encoding."""
import json, re, sys, urllib.parse
PARTS = {"PASS", "PASSWORD", "PASSWD", "PWD", "SECRET", "TOKEN", "KEY", "SALT", "PRIVATE", "CREDENTIAL",
         "CREDENTIALS", "JWT", "COOKIE", "APIKEY", "DBPASS", "AUTHKEY"}
def is_secret(k, v):
    parts = [p.upper() for p in re.split(r"_+", k) if p]
    return len(v) >= 6 and (any(p in PARTS or p.endswith("PASS") for p in parts) or len(v) >= 24)
vals = set()
try:
    for line in open(sys.argv[1], encoding="utf-8", errors="replace"):
        line = line.rstrip("\n")
        if not line.strip() or line.lstrip().startswith("#") or "=" not in line: continue
        k, v = line.split("=", 1)
        k = re.sub(r"^\s*export\s+", "", k).strip(); v = v.strip()
        if len(v) >= 2 and v[0] == v[-1] and v[0] in "'\"": v = v[1:-1]
        if is_secret(k, v): vals.add(v)
except (FileNotFoundError, IndexError):
    pass
forms = set()
for v in vals:
    for w in (v, v.replace("$", "$$")):
        forms |= {w, json.dumps(w)[1:-1], w.replace("'", "''"), urllib.parse.quote(w, safe="")}
data = sys.stdin.read()
for f in sorted((f for f in forms if len(f) >= 6), key=len, reverse=True):
    data = data.replace(f, "REDACTED")
sys.stdout.write(data)
