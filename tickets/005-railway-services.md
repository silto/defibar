# 005 — Provision and test Railway services

Status: Not started

## Prerequisites

- Tickets 002 and 003 are locally verified.
- Railway account access and selected project/region/cost settings.

## Work

- Create a dedicated DEFIBAR Railway project with MongoDB and a persistent volume. Confirm target MongoDB version, capacity, backups, alerts, and restore path before import.
- Deploy API and cron as separate services from `backend/`. Use Node 24 and private MongoDB variable references pointing to the target `defibar` database. Set API build/start commands and health check.
- Configure the cron service's start command and rehearse `0 5 * * *` UTC in an isolated environment. Do not arm the production schedule or allow a production run until final data transfer and cutover. Verify run logs and process exit in isolation.
- Load a disposable Atlas snapshot or sample data to test Railway API search and updater behavior. Do not run the new cron against Atlas or the final production collection.
- Keep MongoDB without a public TCP proxy. Use an authorized temporary access method for the eventual restore.

## Acceptance criteria

- API can reach private MongoDB and passes health/search checks on a Railway test domain.
- Cron can run to completion, exit, and report failures; no production scheduled write occurs yet.
- Backup configuration and restore method are documented; database has no public endpoint.
