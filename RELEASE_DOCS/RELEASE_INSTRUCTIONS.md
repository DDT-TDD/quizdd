# Release Instructions (QUIZDD)

This file guides you through preparing and publishing a source-only release on GitHub.

Prerequisites
- git configured with your GitHub account
- PowerShell (Windows) to run the packaging script

1) Verify version
- Ensure `package.json` and `src-tauri/Cargo.toml` contain the correct version (e.g. `1.0.0`).

2) Run tests & type checks

```powershell
npm install
npm run type-check
npm run test
cd src-tauri
cargo test
```

3) Produce source ZIP (runs locally)

```powershell
# From repository root
powershell -ExecutionPolicy Bypass -File scripts\build_release.ps1 -Version 1.0.0
# This creates quizdd-1.0.0-source.zip in the repo root
```

4) Create git tag and push

```bash
git add -A
git commit -m "Release v1.0.0"
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main --follow-tags
```

5) Create a GitHub Release
- Go to your repository on GitHub, click "Releases" → "Draft a new release"
- Choose tag `v1.0.0` (or create it in the UI)
- Title: "v1.0.0"
- Description: paste `RELEASE_DOCS/CHANGELOG.md` content for v1.0.0
- Attach the generated `quizdd-1.0.0-source.zip` (optional binary assets if you built them)
- Click "Publish release"

6) Checklist & recommended excludes (do not delete from repo, suggested for a clean release-only branch if desired)
- Keep: `src/`, `src-tauri/`, `public/`, `package.json`, `Cargo.toml`, `README.md`, `CHANGELOG.md`, `LICENSE`, `THIRD_PARTY_LICENSES.md`, `RELEASE_DOCS/`
- Optional to remove (or move to an `archive/` branch): debug/fix logs, `*_FIXES*.md`, `*_SUMMARY.md`, `TAURI_API_FIX_SUMMARY.md`, personal notes

7) Post-release
- Monitor issues and patch as needed. Create hotfix releases as usual.

If you want, I can run the packaging step here to create the ZIP (I can only run file operations within the workspace). Tell me if you want me to produce it now.