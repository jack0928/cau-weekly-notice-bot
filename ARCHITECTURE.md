## Overview

This project is a weekly notice crawler bot for several Chung-Ang University
websites. It crawls notices, filters them within a recent time window,
formats a summary email, and is executed weekly via GitHub Actions.

## Folder structure

- `src/`
  - `app.ts` – application bootstrap that wires jobs and integrations.
  - `index.ts` – Node.js entrypoint, suitable for GitHub Actions and local runs.
  - `types/` – shared TypeScript types (notices, config, results).
  - `core/` – domain logic (crawling orchestration, filtering, formatting, jobs).
  - `integrations/` – external integrations such as CAU websites, email, storage.
  - `utils/` – cross-cutting utilities (logging, dates, env, HTTP, HTML, errors).
  - `jobs/` – concrete job runners that connect domain logic with integrations.

- `config/`
  - JSON configuration files for sites, app defaults, and email (non-secret).

- `.github/workflows/`
  - GitHub Actions workflows, including the weekly scheduled run.

- `scripts/`
  - Helper scripts for local development and debugging.

## Execution flow

1. GitHub Actions workflow triggers on a weekly schedule.
2. The workflow runs `node dist/index.js`, which uses `src/index.ts` as entrypoint.
3. The entrypoint bootstraps the app from `src/app.ts`, which will:
   - Load configuration from `config/` and environment variables.
   - Set up integrations (crawlers, email client, storage).
   - Invoke the weekly job in `src/jobs/runWeeklyNoticeJob.ts`.
4. The weekly job composes domain logic from `src/core/`:
   - Crawling via `core/crawling` and CAU integrations.
   - Filtering and deduplicating notices via `core/filtering`.
   - Formatting email content via `core/formatting`.
5. The email integration sends the final summary email.

Implementation of the functions and classes in these modules is intentionally
left as TODOs so that folder architecture and file layout are established
without business logic.

