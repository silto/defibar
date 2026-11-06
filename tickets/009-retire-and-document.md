# 009 — Retire old services and finish handoff

Status: Not started

## Prerequisites

- Ticket 008 acceptance criteria pass, including one scheduled Railway run.
- A tested manual dump/restore path exists; Railway managed backups remain disabled by user choice.
- Verify the Heroku app IDs before deletion: `defibar-front` (`7ee2c278-ea68-46ac-9b22-9a96fc8af909`) and `defibar-backend` (`904405d0-7c51-4a58-9976-ad552da48cb6`). CLI access worked on 2026-11-06.

## Work

- Remove the unused `make-db-lambda/` package and obsolete duplicate updater code/config after confirming Railway owns the only refresh schedule.
- Remove AWS EventBridge rule/Lambda/Serverless resources, Heroku apps (including their Papertrail add-ons), and Atlas cluster only after verifying no needed data or traffic remains. Check billing and credentials. These deletions are irreversible; review exact resources before execution.
- Rotate or revoke credentials used only by retired services. Remove temporary Pages preview CORS origin if no longer needed.
- Update `README.md`, `AGENTS.md`, `PLAN.md`, environment examples, and operating instructions with final architecture, local commands, manual dump/restore, schedule, and incident steps.

## Acceptance criteria

- Only Cloudflare Pages and Railway serve production, and only Railway cron updates the database.
- No stale public database access, credentials, DNS targets, or paid services remain.
- A future maintainer can build, test, deploy, inspect cron runs, and restore the database using repository docs.
