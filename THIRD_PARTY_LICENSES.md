Third-Party Licenses and Attributions
=====================================

This file collects licensing and attribution information for third-party libraries and external assets used by the QuiZDD project. It is intended to be a convenient summary — see each dependency's own repository for complete license text.

1) Node / Frontend dependencies (from `package.json`)
- React (MIT) — https://github.com/facebook/react
- @tauri-apps/api — (MIT-like, check https://github.com/tauri-apps/tauri)
- lottie-react — MIT (check project repo)
- Vite, Vitest, Testing Library, TypeScript, ESLint and other dev tooling — licensing varies (mostly MIT/Apache-2.0). See each package's npm page for details.

2) Rust / Backend dependencies (from `src-tauri/Cargo.toml`)
- tauri — MIT/Apache-2.0 (see https://tauri.app/ and the tauri repo)
- rusqlite — MIT or Apache (see https://github.com/rusqlite/rusqlite)
- tokio — MIT/Apache (see https://github.com/tokio-rs/tokio)
- serde / serde_json — MIT/Apache
- reqwest — MIT/Apache

3) External assets and data sources
- Flag images (migrated to Flagpedia.net): https://flagpedia.net
  - We use Flagpedia's published flag image URLs in `src-tauri/src/services/content_seeder.rs` and the database. Check Flagpedia site terms for any attribution or usage requirements.
- Historical/previous sources referenced in repo docs (for auditing): freeflagicons.com, flagcdn.com, restcountries.com. Those references were removed from the active seeder and replaced with Flagpedia URLs. If you used any assets from these sources in the past, consult their site terms.

4) Other notes
- The Rust build may pull numerous transitive dependencies with differing licenses. For a complete, machine-generated list of licenses for the Rust toolchain/deps, run tools like `cargo-license` from `src-tauri/`.

Suggested actions to produce a fully auditable license bundle
-----------------------------------------------------------
- Frontend: `npm ls --json` and inspect each dependency's license field.
- Backend: from `src-tauri/` run `cargo license --json` (install `cargo-license`) to produce a detailed list of crates and their licenses.
