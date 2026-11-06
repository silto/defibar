# 008 — Cut over API, frontend, and updater

Status: Not started

## Prerequisites

- Tickets 006 and 007 pass. Railway API and Pages preview are healthy.
- AWS updater is disabled; Atlas and Heroku remain available.
- DNS rollback values and responsible operator are recorded.

## Work

- Change `api.defibar.finance` to Railway and verify old Heroku frontend still searches via that hostname.
- Attach/switch `defibar.finance` to Pages. Verify certificate, static assets, search, navigation, errors, and desktop/mobile behavior. Preserve MX/TXT records.
- Run Railway updater once manually against private MongoDB. Verify completion, row counts, and no duplicate data. Enable or confirm its 05:00 UTC schedule, then observe one scheduled run and API health afterward.
- If checks fail before Railway updater writes, reverse DNS and re-enable the AWS rule. After a Railway write, take a fresh private BSON dump and reconcile changes before returning to Atlas.

## Acceptance criteria

- Both public domains serve their intended new hosts and end-to-end search works.
- One manual and one scheduled Railway refresh succeed; AWS rule remains disabled.
- DNS changes, run IDs, validation results, and any rollback action are recorded in implementation notes.
