# DD Team Builder — Agent Guide


This file used to carry its own summary of the stack and architecture, and it
drifted: it described a `useHero` hook that no longer exists, a constant spelled
`HERGO_CONFIG`, Tailwind 3 (the project is on 4), six data files where there are
now twenty, and content switches living in `useTeam` after they had moved to
`useSettings`. Two guides that disagree are worse than one, and the stale one
wins arguments it should not.

So this is a pointer now, and deliberately holds nothing that can go out of date.

## Commands

| Command | Action |
| --- | --- |
| `npm start` | Dev server at localhost:3000 |
| `npm run build` | Production build to `build/` |
| `npm test` | Tests (Jest + React Testing Library) |
| `npm run lint` | ESLint over `src/` |

`prestart`, `prebuild` and `pretest` all regenerate `src/data/presetComps/index.js`,
so run things through `npm` rather than calling `react-scripts` directly.
