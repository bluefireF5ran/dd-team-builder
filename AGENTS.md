# DD Team Builder — Agent Guide

## Stack

- **Create React App** (react-scripts 5), **React 19**, **Tailwind CSS 3**, **PostCSS**, **Autoprefixer**
- No TypeScript, no router, no state library — plain JSX + React hooks + localStorage
- Entry: `src/index.js` → `src/App.js`
- Font: DwarvenAxe in `src/font/` (loaded via `@font-face` in `src/index.css`)

## Commands

| Command | Action |
|---------|--------|
| `npm start` | Dev server at localhost:3000 |
| `npm run build` | Production build to `build/` |
| `npm test` | Run tests (react-scripts test, watch mode) |

No lint or typecheck scripts exist. ESLint config is embedded in `package.json` (`react-app` + `react-app/jest`).

## Architecture

- **Data**: `src/data/` — `heroes.js`, `trinkets.js`, `quirks.js`, `locations.js`, `modded_heroes.js`, `backer_trinkets.js`
- **Hooks**: `useTeam` (team state + localStorage persistence), `useHero` (per-hero skill/trinket/quirk toggles)
- **Constants**: `src/constants/index.js` — `HERGO_CONFIG`, `PARTY_CONFIG`, `EMPTY_HERO`
- **Storage**: localStorage key `dd_team_builder_teams` + JSON file download/upload via `<a>` click
- **Image paths**: `src/utils/imageHelper.js` routes to correct folders (vanilla, modded, backer) based on content type
- **Validation**: `src/utils/validation.js` — `alwaysActive` heroes (Abomination, Flagellant) need all 7 skills selected, not 4

## Assets

Images are served from a **separate GitHub repo** (`dd-team-builder-assets`). Toggle in `src/config/assets.js`:
- `USE_EXTERNAL_ASSETS = true` (default) — fetches from GitHub raw
- `USE_EXTERNAL_ASSETS = false` — expects images in `public/images/` (gitignored)

## Quirks & Gotchas

- **Font**: DwarvenAxe lives in `src/font/` (copied from `public/font/` for CRA production build compatibility), referenced as `url('./font/...')` in `src/index.css`.
- **Modded hero data**: `src/data/modded_heroes.js` has `.bak` / `.bak2` / `.bak3` backup files — ignore them.
- **PNG export**: Uses `html2canvas` with `useCORS: true` — external images must support CORS (GitHub raw does).
- **`alwaysActive` heroes** (Abomination, Flagellant) have 7 skills, must all be selected for validation to pass.
- **Backer trinkets** and **modded heroes** are toggled via boolean state in `useTeam` (`showBackerTrinkets`, `showModdedHeroes`).
- No CI workflows exist.