---
name: friction-log
description:
  File durable developer, CI, or agent friction with priority P0-P3 and
  needs-human when a decision is required.
---

# Friction Log

1. **Bar:** durable (still true tomorrow), reproducible, owned in this repo.
   One papercut per issue. Never include secrets or user data.
2. **Search first:** check open `friction` issues (`gh issue list --label friction`)
   and add a comment if the same issue already exists.
3. **File with priority + marker:** use
   [`.github/ISSUE_TEMPLATE/friction.yml`](../../../.github/ISSUE_TEMPLATE/friction.yml)
   with `friction` plus `P0`–`P3`:
   - `P0`: broken for users or blocking agents now
   - `P1`: costs real time on most PRs
   - `P2`: worth fixing when nothing higher is open
   - `P3`: nice to have; batch with nearby work
     Add `needs-human` when the fix requires a human call.
4. **Deferred friction:** if intentionally skipped during a ship loop, label it
   `friction-skipped` with a brief comment explaining why.
