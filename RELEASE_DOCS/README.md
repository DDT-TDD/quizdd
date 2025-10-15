QuiZDD - Educational Quiz App

Version
-------
1.0.0 (2025-10-14)

Summary
-------
QuiZDD is an offline-capable educational quiz application targeting Key Stage 1 and 2 learners. It uses a Rust backend (Tauri) with an embedded SQLite database and a React + TypeScript frontend built with Vite.

This repository contains the full source for the desktop application, including a seeder for the content database, quiz engine and scoring logic in Rust (under `src-tauri/`), and the UI in `src/`.

Quick links
-----------
- Backend (Tauri/Rust): `src-tauri/`
- Frontend (React/TS): `src/`
- Seeder & DB tools: `src-tauri/src/bin/seed_database.rs`, `src-tauri/src/services/content_seeder.rs`
- Recent changelog and fixes: `COMPLETE_QUIZ_FIXES.md`, `FLAGPEDIA_MIGRATION_COMPLETE.md`, `SCORING_FIX_COMPLETE.md`

Getting started (development)
-----------------------------
Prerequisites
- Rust toolchain (recommended stable >= 1.60; see `src-tauri/.rustc_info.json` for the environment used during development)
- Node.js (LTS) and npm
- Optional: Tauri prerequisites for your OS (see https://tauri.app/)

Install dependencies (frontend)

```powershell
cd "C:\Users\DD\Desktop\QZ"
npm install
```

Build & run (development)

- Run the backend & UI in dev mode (Tauri):

```powershell
cd "C:\Users\DD\Desktop\QZ"
npm run tauri:dev
```

- Or build the production bundle:

```powershell
cd "C:\Users\DD\Desktop\QZ"
npm run build
```

Seeding the application database (important after content changes)
-----------------------------------------------------------------
The project seeds its embedded SQLite database with static educational content. If you change the seeder (`src-tauri/src/services/content_seeder.rs`), you must re-run the seeder so the running app uses the updated assets/URLs:

```powershell
cd "C:\Users\DD\Desktop\QZ\src-tauri"
# Recreate the DB in-app's AppData location by running the seed bin
cargo run --bin seed_database
```

On Windows the app database is stored in:
`%APPDATA%\Educational Quiz App\educational_quiz_app.db`

Changelog (selected, recent)
----------------------------
- 2025-10-14 — 1.0.0
  - Migrated flag image sources to Flagpedia.net (format: `https://flagpedia.net/data/flags/w580/{iso}.png`) in the content seeder and reseeded the DB. See `FLAGPEDIA_MIGRATION_COMPLETE.md` for details.
  - Fixed frontend placeholder and noisy "Invalid question state detected" logging by tightening completion checks in `src/components/QuizInterface.tsx`.
  - Corrected backend scoring bug where `total_questions` could be set incorrectly — now Score objects reflect the quiz length correctly (see `src-tauri/src/services/quiz_engine.rs`).
  - Verified and reseeded DB; sample flag images confirmed to load.

Project structure
-----------------
- `src/` — React + TypeScript frontend. Key components in `src/components/`.
- `src-tauri/` — Rust backend, seeder and bin tools.
- `public/` — static assets used by the frontend (audio, images).
- Various docs and fix logs at repository root.

How scoring works (brief)
-------------------------
Scoring is calculated in the backend (`src-tauri/src/services/quiz_engine.rs`). High-level components:
- Points per question are awarded by `calculate_points` (correctness + streaks).
- Additional bonuses: time bonus via `calculate_time_bonus` and streak bonus via `calculate_streak_bonus`.
- The final `Score` includes total questions, correct answers, accuracy percentage and bonuses.

If you change scoring logic, update the tests and re-run the Rust build.

Third-party assets & licenses
-----------------------------
This project uses several third-party libraries (see `package.json` and `src-tauri/Cargo.toml`) and external assets. A collected summary is in `THIRD_PARTY_LICENSES.md`.

Tests
-----
- Frontend: `npm run test` (vitest)
- Backend: Rust tests under `src-tauri/src/` (run with `cargo test` from `src-tauri/`).

Contributing
------------
- Keep changes focused and run the seeder when content files change.
- Avoid large, simultaneous edits to both backend and frontend without re-running builds and the DB seeder.

Contact / Maintainer
--------------------
See `Cargo.toml` authors and repository fields — update them to your name/email.

License
-------
This repository is provided under the MIT License (see `LICENSE`). Third-party notices are included in `THIRD_PARTY_LICENSES.md`.

Acknowledgements
----------------
- Flag images migrated to Flagpedia.net (https://flagpedia.net) — used under Flagpedia's stated terms (see `THIRD_PARTY_LICENSES.md`).

