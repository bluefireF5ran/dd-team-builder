# DD Team Builder — Agent Guide

The working guide to this repository: what each part does, and why it is the way it is.
Read it before changing anything under `src/data/` or `scripts/` — most of it is there
because something subtle went wrong once.

## Project Overview

**DD Team Builder** — a single-page React app for planning Darkest Dungeon 1 party compositions. Users configure 4-hero parties with skills, trinkets, quirks, and export/save them. Built with React 19 (Create React App), Tailwind CSS 4, and html2canvas for PNG export.

## Commands

| Command | Action |
| --- | --- |
| `npm start` | Dev server at localhost:3000 |
| `npm run build` | Production build to `build/` |
| `npm test` | Tests (Jest + React Testing Library) |
| `npm run lint` | ESLint over `src/` |

`prestart`, `prebuild` and `pretest` all regenerate `src/data/presetComps/index.js`, so run
things through `npm` rather than calling `react-scripts` directly.

Coverage is thin outside the data and utility layers. There is no single-test-file shortcut
configured; use `npm test -- --testPathPattern=FileName` to target one.

## Architecture

### Single-page app, no routing
`App.js` is the root. All UI is rendered on one page — team header/controls, party composition display, and per-hero configuration cards. The background image changes based on the selected dungeon location.

### State management
- **`useTeam` hook** (`src/hooks/useTeam.js`): Central state for team name, location, heroes array (4 slots), and saved teams. Handles save/load to localStorage and JSON file export/import.
- **`useSettings` hook** (`src/hooks/useSettings.js`): everything the app remembers between visits (see **Settings** below). The split matters: `useTeam` owns the comp you are building, `useSettings` owns what outlives it. The optional-content switches used to live in `useTeam`, where every reload reset them.
- No external state library — React hooks + callback props only.

### Hero data shape
Each hero slot follows `EMPTY_HERO` from `src/constants/index.js`:
```
{ heroClass, activeSkills[], activeCampSkills[], trinket1, trinket2, quirks: { positive[], negative[] }, lockedQuirks: { positive[], negative[] }, diseases[] }
```
Constants like `MAX_SKILLS: 4`, `MAX_TRINKETS: 2`, `MAX_HEROES: 4`, `MAX_DISEASES: 3` live in `src/constants/index.js`.

`diseases` is a **separate list, not five more negative quirks**. The game keeps them apart — different slots, cured in a different building — and folding them in would mean three diseases cost you three of the five negative quirk slots. Anything that walks a hero has to carry it: `validateHeroSchema`, `pickHeroFields` in `heroClipboard`, `canonicalizeHero`, `cloneHero`.

### Component organization (`src/components/`)
- **team/** — TeamHeader, TeamControls, LoadCompModal + CompCard/CompFilters (the comp library)
- **party/** — PartyComposition (drag-and-drop hero cards, uses forwardRef for html2canvas export)
- **hero/** — HeroConfiguration, skill/trinket selectors
- **quirks/** — QuirkPicker (the modal) and QuirkSlot (one row)
- **settings/** — SettingsModal
- **common/** — Shared UI (ConfirmDialog, HoverCard, ImageWithFallback, Toast, ErrorBoundary, KeyboardShortcuts)
- **debug/** — ImageTester modal for checking missing/broken assets

### Data files (`src/data/`)
- `heroes.js` — Vanilla hero definitions with skills and camp skills
- `modded_heroes.js` — Modded hero classes, general trinkets, and workshop IDs
- `trinkets.js` — Full trinket database
- `hero_specific_trinkets.js` — Class-to-trinket mappings
- `backer_trinkets.js` — Backer-specific trinkets
- `trinketEffects.js` — What each trinket *does* (see below); the files above only carry names
- `quirks.js` — Positive and negative quirk rosters (names only)
- `diseases.js` — Disease roster, split into the plain ones and the four Crimson Court stages
- `quirkEffects.js` — What each quirk and disease *does* (see below); generated, like `trinketEffects.js`
- `skillTiers.js` — one community tier list for combat skills, off by default (see below)
- `gameIds.js` — the five internal save ids that no naming rule can reach (see **Importing a
  Darkest Dungeon save**)
- `locations.js` — Dungeon locations plus `LOCATION_THEME` (per-zone accent colour and short label)
- `questMap.js` — where each zone sits on the game's Quest Select map (see below)
- `presetComps/` — 163 community comps as JSON, wired up by an auto-generated `index.js`
- `compLibrary.js` — presets + community comps normalized into one list
- `compTaxonomy.js` / `compIndex.js` — naming vocabulary, and the memoized search index built from it
- `compNaming.js` (in `utils/`) — the engine that turns a comp into `Family: Variant` (see below)

### The ranker's fourth category: comps (2026-08-26)

`#/ranker` ranks heroes, skills, camp skills — and now **comps**, head to head,
with both parties drawn in full so a pick is made on the build rather than on a
name.

**Why it exists.** The sibling RL project (`SIM/`) scores comps by having a
trained policy play them, and that policy trained on this very comp library —
so its ranking measures how well the model *knows* a comp, not how good the
comp is. Fran's ranking is the ruler with no model in it. The saved JSON is
meant to be read back **outside** this app, which is why a comp item carries its
whole loadout (`heroes`, `location`, `alias`) and not just a name — and why
`src/utils/rankerExport.js` is a pure function with its own test rather than
inline in `ResultsView`. The export is a contract with something outside this
repo. It spent a while writing only `{rank, name, classes}`, silently dropping
the loadout it was designed to carry; two comps of the same four classes were
indistinguishable in the file.

Rules that must not be regressed:

- **Comps are ranked ONE REGION at a time** (`COMP_REGIONS`,
  `buildCompItems(region)`). Not a convenience filter: a comp is *built* for a
  region — the enemy pool, the DoT resistances and the corpse and size mix all
  differ — so a single global order would average four different questions into
  one answer. It is also what makes a run finishable: the library is ~160 comps
  and an exact pairwise sort of that is over a thousand picks.
- **Results are stored per region** (`resultsKey` = `comps:<region>`), so
  ranking the Weald cannot overwrite the Ruins.
- **A session belongs to its region.** `isSessionUsable` checks it, because
  switching region replaces the whole pool and every stored id would be missing.
- **Rank order IS the comp.** `position = index`, front to back, so nothing on
  the way into an item may sort or dedupe `heroes` — the card draws 1-2-3-4 and
  the export preserves it. Pinned by `src/utils/__tests__/rankerComps.test.js`.
- **The card is ordered the way a party is BUILT**: class and rank, then the
  four skills, then the trinkets, then quirks. That is Fran's own build order,
  and reading the card in that order is what makes a mis-built comp visible.
- **The roster gates heroes/skills/campSkills, never comps** — the comp pool is
  the comp library.

### Asset system
Images are served from an external GitHub repo (`dd-team-builder-assets`), configured in `src/config/assets.js`. Toggle `USE_EXTERNAL_ASSETS` to switch between local (`/public/images/`) and remote assets. `src/utils/imageHelper.js` contains all path-resolution logic, handling vanilla vs modded vs backer asset paths. Modded assets use a `modId` prefix in filenames.

### Tailwind theme
The theme lives in the `@theme` block at the top of `src/index.css` — custom Darkest Dungeon
colours (`dd-red`, `dd-gold`, `dd-parchment`), a custom `font-darkest` (DwarvenAxe gothic
font), and atmospheric animations (torch-flicker, fade-in-up).

**This is Tailwind 4, but `tailwind.config.js` is still load-bearing — do not delete it.**
It looks like a v3 leftover, because the theme tokens in it are duplicated by the `@theme`
block. They are dead. Its `content` array is not: `@tailwindcss/postcss` reads this file, and
it is the only thing telling Tailwind where to find classes. Delete it and the build still
says "Compiled successfully" while emitting a stylesheet with **no utilities at all** — no
`flex`, no `grid`, no `hidden` — so every `hidden` element renders visible and the layout
collapses. The only numeric tell is main.css dropping from ~15 kB gzip to ~7 kB.
`src/__tests__/tailwindConfig.test.js` pins it.

What the config does *not* have is a `screens` key, so `xs:` has never been a real breakpoint
here — which is how six button labels written as `hidden xs:inline` stayed invisible at every
width. A new breakpoint goes in `@theme` as `--breakpoint-*`.

## Key patterns

- **Modded content**: Toggled via `showModdedHeroes` state. Modded heroes have a `modId` linking to their Steam Workshop ID and may reference `vanillaCampSkills` for skills that use vanilla art assets.
- **Backer trinkets**: Toggled separately via `showBackerTrinkets`. Checked via `BACKER_TRINKETS` array for image path routing.
- **Drag & drop**: PartyComposition uses HTML5 drag-and-drop to swap hero positions via `swapHeroes` callback.
- **Persistence**: localStorage auto-save + optional JSON file download. `src/utils/storageHelper.js` handles all serialization.
- **Clipboard**: two levels. Whole team via `TeamControls` (`Ctrl+Shift+C` too); a single hero via the copy/paste buttons on each `HeroConfiguration` card, for moving a loadout between comps. `src/utils/heroClipboard.js` owns both directions — `copyTextToClipboard` (with the execCommand fallback, shared with the team copy) and `parseHeroClipboard`, which accepts its own tagged payload or a bare hero object, validates against `validateHeroSchema`, whitelists the hero fields and canonicalizes names. It never coerces: a wrong type is an error with a message, not a half-applied paste. Pasting over a configured hero asks first; pasting into an empty slot does not.
- **PNG export**: html2canvas captures `PartyComposition` via ref, with style adjustments for rendering quality.

## Comp library (`LoadCompModal`)

The bundled comps and the user's saved teams share one browser. Three layers:

- **`src/data/presetComps/index.js`** — the barrel, generated by
  `scripts/generatePresetCompsIndex.js`. It is a *static* list of imports (webpack has to
  see every JSON path), so a file dropped into the folder by hand — which is exactly what
  the app's "Preset comp file" save produces — stays invisible until the script runs
  again. That is wired into `prestart` / `prebuild` / `pretest` now, and
  `data/__tests__/presetCompsIndex.test.js` fails if disk and barrel ever disagree.
  **Nothing in the library dedupes by roster**: comps sharing four classes and differing
  in skills, trinkets or region are separate rows, and that test pins it. Two Curious Coin
  comps once looked like the modal refusing a duplicate; they were simply never imported.
- **`src/data/compIndex.js`** — memoized, and built on first open rather than at import:
  the app boots without paying for 163 comps. `src/data/recommendations.js` is lazy for
  the same reason (it sweeps the whole library to rank trinkets/quirks per class).
- **`src/utils/compFilters.js`** — pure functions over normalized comps. `buildCompEntry`
  turns a comp into family/variant, hero classes, mechanics, flags and a lowercase
  `search` blob (name, alias, classes, nicknames, skills, trinkets, tags) so typing only
  ever does a substring test. Also holds `SORT_OPTIONS` and the facet counters.
  `normalizeSavedTeam` maps `teamName` → `name` so both tabs share card, filters and sort.
- **Filter semantics** — terms in the search box are AND. Within a facet, regions and
  families are OR (alternatives); heroes and flags are AND ("carries all of them").
  Facet counts are recomputed against the live result set, so a chip that would return
  nothing is not offered.

Sort by name, family, region, party size, or by class reading from either end of the rank
line. Paginated at 24 (4×6) by default; rendering all 163 cards at once meant ~600 portrait
requests to the assets repo in one go.

**Rank convention** (easy to get backwards — `PartyComposition` reverses on render): the
`heroes` array runs front to back, so `heroes[0]` is rank 1 and `heroes[3]` is rank 4. Both
`PartyComposition` and `CompCard` *display* it reversed, rank 4 leftmost, matching the game.
`compFilters` keeps `heroClasses` positional rather than compacting it, so a comp with a hole
in the middle doesn't slide its backline forward; `size` carries the real hero count.
`CompCard.test.js` asserts the card and the party view agree, so flipping one of them fails.

## Regions, colours and the quest map

`LOCATIONS` is twelve vanilla/DLC zones plus five that only exist with mods (`Sunward
Isles`, `The Pet Cemetery`, `The Mountain`, `The Arena`, `Dimensional Havoc`, also listed
in `MODDED_LOCATIONS`). Array order is what `regionRank` sorts the comp library by.

`LOCATION_THEME` gives each one `{ short, accent }`. The palette is Fran's, not a
screenshot's: Ruins grey, Cove dark blue, Warrens brown-pink, Weald yellow-green, Farmstead
cyan, Courtyard pure red, Hamlet burnt orange, all four Darkest Dungeons one dark red (the
numeral in `short` already separates them), then pink / purple / white / light red / black
for the modded five. **`Butcher Circus` is the only zone with no entry in that list** — it
keeps its old orange, because the mods put it and `The Arena` on the map as different
places.

`getLocationTheme` adds a third field, `ink`: the palette now runs from white (Mountain) to
black (Dimensional Havoc), so anything painting `accent` as a *background* — the region
chips in `CompFilters`, the map pins — must take its text colour from `ink` rather than the
hardcoded near-black it used before. It is derived from the accent's luminance, so a new
colour never needs a matching text rule.

**The quest map picker** (`QuestMapModal`, opened from the map button beside the location
dropdown in `TeamHeader`) is the same choice made the way the game makes it. Coordinates in
`src/data/questMap.js` are **read out of the game's own layout files**, not eyeballed:
`.quest_map_pos X Y` inside each `quest_select_dungeon_layout_<zone>`, in the 1920×1080
space the backgrounds are drawn in. Three sources, and the *mod's* values win because its
background is the one being drawn — mixing base-game positions onto the merged map puts
pins in the sea:

| source | file |
| --- | --- |
| base game | `campaign/town/quest_select/quest_select.layout.darkest` |
| DLC | `dlc/580100_crimson_court/…` (Courtyard), `dlc/735730_color_of_madness/…` (Farmstead) |
| mod | Workshop `3447439638`, *Merged Quest Map Screen for New Dungeons* — Mountain, Pet Cemetery, Arena, and new spots for the base-game zones |

Two details that are deliberate. The four Darkest Dungeons share one `.quest_map_pos` in
the game (it lays their four quests out in a row from that point), so `questMap.js` spreads
them along that row instead of stacking four pins on one pixel. And Sunward Isles and
Dimensional Havoc carry `estimated: true` — their mods are not installed locally, so the
pin is a free spot on the map rather than a fact, and the modal marks it with a `?`.

The map art lives in the assets repo like every other image
(`dd-team-builder-assets/images/bg/quest_select.background.png` — the game's own Quest
Select backdrop, 1920×1080, the space the coordinates are measured in). If it 404s the
modal drops the `<img>`
and keeps the pins on a dark panel: the image is scenery, not the control.

## Comp naming taxonomy

Every bundled comp is named `Family: Variant` — two slots, nothing else. `src/utils/compNaming.js`
is the engine, `src/data/compTaxonomy.js` is the vocabulary (data only: that is where you tune it).
Everything the taxonomy knows beyond those two slots lives in `tags`, which is what the library
filters on.

- **Family** = the engine of the comp: a signature of 2-3 interacting classes (`Feral Contract` =
  Abomination + Houndmaster + Arbalest/Musketeer), a class stack (`Ballad Quartet`), or a strategy
  (`Waiting Blade` = riposte). Highest matching `priority` wins; the priority bands double as
  documentation.
- **Variant** = the *minimal distinguishing description* within that family. A single token when it
  is exclusive there (`Marked Prey: Money` can only be the Antiquarian one), a pair otherwise
  (`Marked Prey: Royal & Bulwark`).

**Names are made of words, never numbers.** When the roster no longer separates two comps, pass 3
reaches into a deliberately wide bank of tiebreakers, cheapest first — camp term, region, mechanic,
skill, and finally rank (`Rabid Devotion: Beast Second` for two comps that differ only in who stands
where). Rank sits last precisely because every comp has four of them, so it would otherwise crowd
out better answers. Widening that bank is how you kill a `... 2`: add the missing region to
`REGION_TOKENS`, the missing camp skill to `CAMP_TERMS`, and so on. A trailing ordinal is the one
thing left when two comps are byte-identical — which means one of them should be deleted, and the
report says so as `DUPLICADA`.

A tiebreaker only counts if it separates the comp from *every* sibling competing for the same base
name, not just the one holding it. Sharing the roster half is expected — that is what makes them
siblings; sharing the tiebreaker is the bug.

Four invariants are worth not breaking, and each has a test in `compNaming.test.js`:

1. **No word means two things.** Not across hero tokens, `aka` synonyms, mechanic labels, camp
   labels, region tokens or rank words. `Hymn` was once both the Vestal's nickname and the
   stress-mechanic label, so `Feral Contract: Contract & Hymn` read as "has a Vestal" when it meant
   "heals stress"; the label is `Rally` now. Same reason `gold` is `Coin` (not the Antiquarian's
   `Money`) and `burn` is `Pyre` (not the Runaway's `Burn`).
2. **One token, one class.** `Snipe` is the Musketeer everywhere. `HERO_TOKENS[x].aka` holds the
   retired synonyms (`Musket`, `Buckshot`, `Hex`, `Chop`); they feed the search blob only and never
   reach a name. The taxonomy this replaced used them as tiebreakers, and one family ended up
   calling the same hero three different things.
3. **A shared token never stands alone** unless the siblings that share it extend it. `Beast` next
   to `Beast & Ritual` reads; `Royal` next to `Chop` does not.
4. **`MECHANIC_FAMILIES` names never collide with `FAMILIES` names.** Falling back to the dominant
   mechanic is allowed, but it has to be visible — a comp called `Hammer Fall` is one nothing
   explained, and the script reports it as `SIN FIRMA` so it can earn a signature.

**The naming is a fixed point.** `--apply` rewrites `teamName`, and `teamName` feeds the next run, so
nothing in the assignment may depend on the current name: siblings are ordered by a content-derived
key, and a variant already on disk is kept whenever it is still valid. Without that, every run
proposes a fresh shuffle and `--check` never says "al dia". There is a test for it.

Filenames drop the `&` (`Dark_Ritual__Cross_Volley.json`): it is legal on Windows but is a shell
metacharacter, so any unquoted `for %%f in (*.json)` mangles it. The full name lives in `teamName`.
`--apply` verifies after renaming that every planned file landed and nothing is left over.

A comp can opt out entirely with `"taxonomy": false` in its JSON — `The_Old_Road.json` does, because
it is the game's tutorial party and not a community comp. Exempt comps keep their name and filename
through `--apply`.

`node scripts/nameComps.js` reports; `--changed`, `--warnings`, `--json`, `--check` narrow it;
`--apply` rewrites `teamName`, renames the files, regenerates the index and leaves an undo manifest
in `scripts/nameComps.manifest.json`. `rebuild_taxonomy.bat` wraps that with a confirmation. The
warnings are the point of the report: `DUPLICADA` (identical body), `MISMO ROSTER` (same classes, so
only an ordinal separates them) and `SIN FIRMA`.

## Names that only mean something next to a class

`src/data/name_aliases.js` has two tables and they are not interchangeable.
`NAME_ALIASES` resolves **globally** — good for a trinket typo (`Vvulf's Tassle`), wrong
for a skill. `CLASS_NAME_ALIASES` is indexed by class, and it exists because the same
string can be right in one class and wrong in another:

| class | canonical | also accepted |
| --- | --- | --- |
| Shieldbreaker | `Snake Skin` | `Snakeskin` |
| Duelist, Runaway | `First Aid` | `Wound Care` |

`Wound Care` is the correct name in the eighteen classes the wiki CSV covered and the
*wrong* one in the two Fire's Edge classes, which the game renders as `First Aid` — the
same split AGENTS.md already describes for the save importer's `first_aid` id. A flat
alias would rewrite the skill for all twenty. `addClassAliases` in
`src/utils/nameNormalizer.js` therefore **skips any alias whose canonical name the class
does not actually have**, which is the rule `gameIds.js` follows for save ids: a rename
never invents a skill.

Order inside `getClassIndexes` is load-bearing. The class's own names go in first, then
the class aliases, and `COMMON_VANILLA_CAMP_SKILLS` (`Encourage`, `Wound Care`,
`Pep Talk`) last — it is a fallback for modded classes with no camp data, and if it ran
first it would resolve `Wound Care` to itself for the Duelist and hand back a camp skill
that class does not have. `buildIndex` keeps the first entry per key, so "first wins" is
the whole mechanism.

**The bug this fixes was silent.** A comp storing `Snakeskin` made the hero card read
`Selected: 4/4` while none of the seven camp-skill buttons lit up: the counter reads the
hero's array, the buttons iterate the class roster, and nothing compared the two. Five
slots across the bundled comps were affected. Two things now stop it recurring —
`src/data/__tests__/presetCompNames.test.js` fails if any bundled comp names a skill,
camp skill or trinket its class does not own, and `SelectionCount` in
`HeroConfiguration` names the unmatched entries under the counter instead of leaving the
mismatch invisible. Deleting the unknown name is not an option: it may belong to a mod
this build does not carry.

That test carries one deliberate exception, `KNOWN_BAD_TRINKETS`: `Ballad_Quartet.json`
puts the Grave Robber's Butcher's Circus trinket `Cloak and Dagger` on a Jester. That is
not a spelling — it is a trinket the class cannot equip, and `TrinketPicker` only offers
general trinkets plus the hero's own, so the comp cannot be reproduced in the app.
Choosing the replacement is a build decision, so it is written down rather than guessed.

## Quirks and diseases

Three lists per hero, drawn in six colours. `src/data/quirks.js` and `src/data/diseases.js` are
the rosters (arrays of names, like `trinkets.js`); `src/data/quirkEffects.js` is the generated
lookup answering "what does it do?", keyed by exact name: `{ kind, classification, flavour, effect }`.

**The effects file is generated — don't hand-edit it.** `scripts/importQuirkEffects.js` rebuilds it
from the game install, reading the same sources the game reads to draw a quirk tooltip:
`shared/quirk/quirk_library.json` (which buffs a quirk grants, and its `is_positive` / `is_disease`
flags), `shared/buffs/*.buffs.json`, and the English `str_quirk_name_*` / `str_quirk_description_*`
/ `buff_stat_tooltip_*` templates. The Crimson Court and Color of Madness libraries come along, which
is where the Crimson Curse stages and the prismatic / corvid sets live.

```bash
node scripts/importQuirkEffects.js --game "D:/…/steamapps/common/DarkestDungeon"
node scripts/importQuirkEffects.js --game … --check     # report, write nothing
```

Coverage is all 213: 91 positive, 93 negative, 29 diseases. The 91/93 match `quirks.js` exactly in
both directions — the script reports drift either way, so a roster typo shows up as a name the game
has never heard of.

Three renderer details worth not re-deriving, each pinned by a test:

1. **A third of the quirks grant no buff at all.** Kleptomaniac, Faithless, Dipsomania change what a
   hero does in town or at a curio, and their flavour line IS the mechanic ("Prone to stealing
   items."). Those fall back to `str_quirk_description_*`.
2. **…but only when nothing else rendered.** The Crimson Curse has real numbers *and*
   "M-madness...in my veins!"; appending the atmosphere to the stats says nothing a party planner
   can use, so a quirk that produced stat clauses drops its description.
3. **Some stat templates drop the sub-type.** `stress_on_miss_STRESS_AMOUNT` has no template, only
   `stress_on_miss`, so the lookup falls back to the bare `stat_type`. Perfectionist and Antsy
   rendered blank until it did.

### Colours (`src/utils/quirkStyle.js`)

Six tones, because a hero sheet mixes quirks from four sources and the colour is the only thing that
says which one you are looking at without reading the name:

| tone | colour | what it is |
| --- | --- | --- |
| `positive` / `negative` | yellow / red | the ordinary rosters |
| `disease` | green | base game and Color of Madness diseases |
| `crimson` | a heavier red | the Crimson Curse and its three stages |
| `prismatic` | blue | the Color of Madness `alien_*` set |
| `corvid` | purple | the Color of Madness `corvids_*` set |

**Flavour beats side.** `Prismatic Calm` sits in the positive list and is still blue;
`Corvid's Blindness` is negative and still purple. `quirkTone(name, fallback)` takes the list the
name came out of as its fallback, so a modded or misspelt quirk the taxonomy has never heard of
still draws as the slot it is sitting in rather than vanishing into a default colour.

Every class string is **written out in full**. Tailwind scans source text for class names, so a
template-built one (`bg-${colour}-900/40`) never reaches the stylesheet. There is a test for it.

### The picker (`QuirkPicker`)

Choosing a quirk works the way choosing a trinket already does: a modal with a search box and a grid
of colour-coded cards, each carrying what the quirk actually does. The dropdown it replaced listed 91
names and nothing else, so picking one meant knowing the roster by heart. **Quirks have no art in
Darkest Dungeon** — the effect line is the picture, which is why importing the effects had to come
first.

Sections are Recommended, then the game's own Physical / Mental split, then `In Town & At Curios`
(the ones it classifies as neither — a real third group, not a leftovers bucket). Diseases get their
own two: Diseases, and Crimson Court behind its switch.

**Recommended is capped at five, in usage order** (`TOP_N_QUIRKS` in `src/data/recommendations.js`).
It was ten, and the tail of a ten-item list is quirks one or two comps happened to carry, which reads
as advice it is not. Usage order, not alphabetical: the first one is what the library reaches for
most, and the old selector threw that away by putting the list through a `Set`.

## Settings

`src/hooks/useSettings.js` + `src/components/settings/SettingsModal.jsx`. One JSON blob under
`dd_settings`, **merged over the defaults** so a key added later reads as its default on a save
written before it existed rather than as `undefined`. The theme's old standalone `dd_theme` key is
picked up once, for anyone who set a theme before this existed.

| setting | what it does |
| --- | --- |
| `theme` | Default / Bloodmoon / Frost |
| `showModdedHeroes`, `showBackerTrinkets` | optional content, as before |
| `showDiseases`, `showCrimsonCourt` | the third quirk list, and the Crimson Court inside it |
| `compSort`, `compPageSize` | what `LoadCompModal` **opens** with |
| `autoSortSkills` | see below |
| `showSkillTiers` | the S-D badge on combat skills (see **Skill tiers**) |
| `ownedTrinketsOnly` | narrows the trinket picker to an imported save's inventory |
| `defaultLocation` | where a new or cleared team starts |

Two rules that are easy to break:

- **Auto-sort only fires when a slot changes.** It lives in `toggleSkill` / `toggleCampSkill` in
  `HeroConfiguration` and nowhere else, so a comp you merely *load* keeps the order it was saved
  with and one you *edit* gets tidied into the class's declared order. Putting it in a render effect
  would rewrite all 163 preset comps the moment you opened them. `sortToRoster` (in `heroHelper.js`)
  keeps a name the roster has never heard of, at the end — sorting must never lose a selection.
- **Turning optional content off never hides data that is really there.** A comp carrying diseases
  still shows them with the switch off; the switch only decides whether you can *add* more. Same
  rule the modded-hero paste warning already follows.

The optional-content switches are in two places on purpose: the second row of `TeamControls` for the
ones you flip mid-build, and the Settings panel, which holds those plus everything that has no
business taking up header space. `Crimson Court` only appears on the header row once `Diseases` is
on — on its own it would toggle a list nothing is showing.

## Trinket effects

The roster files (`trinkets.js`, `hero_specific_trinkets.js`, `backer_trinkets.js`) are arrays of
names and stay that way — plenty of code iterates them as strings. `src/data/trinketEffects.js` is
the separate lookup answering "what does it do?", keyed by exact trinket name:
`{ rarity, effect }`, plus `getTrinketEffect` and `getTrinketEffectText` (the `"Rare — +10% DMG"`
one-liner used in tooltips).

**The file is generated — don't hand-edit it.** `scripts/importTrinketEffects.js` rebuilds it from
the game install, reading the same three sources the game itself reads to draw a trinket tooltip:
`trinkets/*.entries.trinkets.json` (which buffs a trinket grants), `shared/buffs/*.buffs.json` (what
each buff does) and the English `buff_stat_tooltip_*` / `buff_rule_tooltip_*` templates in
`localization/*.string_table.xml`. It sweeps `dlc/` too, so Crimson Court, Color of Madness,
Shieldbreaker and Fire's Edge (Duelist / Runaway) come along.

```bash
node scripts/importTrinketEffects.js --game "D:/…/steamapps/common/DarkestDungeon" --csv "…/Trinkets.csv"
node scripts/importTrinketEffects.js --game … --check     # report, write nothing
```

Coverage is the whole roster — 719 entries across hero-specific, generic and backer. Three
exceptions have no entry at all (`Stake`, `Necklace`, `Flickering Lamplight`): the game ships them
with an empty buff list and no source describes them, so `getTrinketEffect` returns null and callers
fall back to the name. That is deliberate — a blank effect would render a stranded `"Very Rare — "`.

**Butcher's Circus is the one gap in the game data.** `arena.entries.trinkets.json` ships encrypted
(multiplayer anti-cheat), so those ~104 trinkets fall back to a wiki CSV export passed via `--csv`.
Everything else is rendered from the install and is more complete than the wiki: the hand-written
text this replaced routinely dropped a trinket's downsides (Wrathful Bandana was missing its
`+30% Debuff / -50% Healing`, Smoking Skull its `-15 ACC`).

Two conventions the renderer enforces, both pinned by tests: clauses are joined with `" | "`, and
the game's internal `CRT` is rewritten to `CRIT`. A buff's condition stays attached to the clause it
qualifies (`+25% DMG if in position 4`), which is why the separator matters.

`rarity` is the tier or set (Very Common…Very Rare, `CC Set`, `SB Set`, `Crystalline`, `Kickstarter`,
`Butcher's Circus`, `Ancestral`, `Trophy`…), or `null` for the Runaway's Sunstone chain, which
transforms instead of dropping at a tier. Rarities already on disk are preserved across a rerun, so
the curated `CC Set` / `SB Set` labels survive the generator's own mapping.

Roster and effects are separate files that could drift, so `data/__tests__/trinketEffects.test.js`
pins them together: every roster trinket needs an entry (bar the three named exceptions), and every
entry needs to still be on the roster. Adding a trinket without its effect fails the suite rather
than quietly rendering a name-only tooltip.

Shown in three places, all degrading to name-only when the effect is unknown: `TrinketPicker` grid
cells (effect under the name), `HeroConfiguration`'s `TrinketSlotButton` (the equipped slot) and the
`PartyHeroCard` icons. All three also open a `HoverCard` — see **Hover cards** below.

### Set bonuses (`TRINKET_SETS`)

The same generator also emits `TRINKET_SETS` — the Crimson Court (17 per-class), Shieldbreaker and
Fire's Edge sets, read from `*.sets.trinkets.json` (buffs) joined to each entry's `set_id`
(membership). Every set is exactly two trinkets and a `bonus` string; **the bonus applies only when
both members are equipped on the same hero**. `getTrinketSet(name)` is the set one trinket belongs
to; `getSetBonus(a, b)` is the bonus for an equipped pair plus `active` (both members present).
Modded sets live in `moddedEffects.js` as `MODDED_TRINKET_SETS` and its own `getSetBonus` wraps the
generated one then falls through to them — call the modded one everywhere so both are covered
(Sibyl's `cc_sibyl_ms` is the first). Surfaced under the two trinket slots in `HeroConfiguration`
(`TrinketSetLine`) and in the `PartyHeroCard` trinket hover: gold when active, grey and
struck-through when only one half is on, so the second half's value is visible.

Running `importTrinketEffects.js` **without `--csv`** is safe now — the ~100 encrypted Butcher's
Circus entries are carried over from the previous file, so a set-only refresh does not need the wiki
export.

## Skill effects

`src/data/skillEffects.js` is the same idea for skills, and is **also generated** —
`scripts/importSkillEffects.js`. The split between sources is the opposite of the trinkets', because
each source knows a different half:

- **Combat skills come from the wiki CSV** (`--csv`). The game encodes an effect structurally
  (`.effect "Vestal Stun 5"` → an effects table → buff ids); the CSV already carries the readable
  prose (`Blight (140% base) 5 pts/rd for 3 rds`) and the rank/DMG/ACC/CRIT columns. 18 classes × 7.
- **Fire's Edge is missing from that CSV**, so the Duelist's and Runaway's 14 skills are rendered
  from the install: `<hero>.info.darkest` for the mechanics, joined to `*.effects.darkest` and the
  buff tables for the text. That path is what produces `Coup de Grâce: Ignores PROT | Bonus action
  next turn on kill`.
- **Camp skills are not in the CSV at all** — all 80 come from `*.camping_skills.json` plus the
  `camping_skill_*` localization templates, with loot tables resolved so `Trinket Scrounge` reads
  "Chance to produce a trinket" rather than its internal table code `T_ANTIQ_CAMP`.

```bash
node scripts/importSkillEffects.js --game "D:/…/common/DarkestDungeon" --csv "…/Skills.csv"
node scripts/importSkillEffects.js --game … --csv … --check
```

Combat entries are keyed **class then skill name**, because a skill name only means something next
to its class; camp entries are keyed by name alone, since Encourage is shared by 16 classes and does
the same thing for each. `launch` and `target` are written **rank 1 first**, matching the
`heroes[0] = rank 1` convention the rest of the app uses.

Two renderer details worth not re-deriving: a buff carrying a `description_tooltip_id` uses that
string instead of its stat template (`"Attacks usable in any position"` beats the `+0 DODGE` its
stat line renders as), and in `.info.darkest` target syntax `@` means allies while `~` means area of
effect — not negation.

### Skill tiers (`src/data/skillTiers.js`)

An opinion, not game data, which is the whole reason it is behind `showSkillTiers` and
**off by default**. The source is an image — `dd-team-builder-assets/images/tierlist/tierlist.png`,
119 skill icons in five tiers with no names written anywhere — read back by matching each
73px tile against the icons in `images/skills`.

**17 classes × 7 = the 119 tiles exactly**, which is what proves the transcription complete:
every covered class accounts for its whole kit. Musketeer, Duelist and Runaway are absent
because the author left them out, not because they were missed, and Musketeer is *not* folded
into Arbalest despite sharing most of an icon set. Camp skills and modded classes are untiered
too. `getSkillTier` returns null for all of them and both call sites draw nothing — no empty
badge, no stranded `"Tier "`.

Six skills share pixel-identical art with another skill and could not be placed by icon alone.
Four fell out of the missing classes (Arbalest's `Battlefield Bandage` over Musketeer's
`Patch Up`; `Abyssal Artillery` over the stray `occultist.ability.two.png`, which is a byte
duplicate of it and could be deleted). `Protect Me` / `Withstand` both landed in B so the split
is moot. `Solemnity` / `Lick Wounds` and `Mark for Death` / `Sniper's Mark` were Fran's call —
re-deriving them from the image is not possible.

Shown in two places, both in `HeroConfiguration` and both gated on the setting: a badge on the
combat-skill buttons, and a line in the skill `HoverCard`. `skillHover`'s third argument
(`{ showTier }`) defaults to false, so `PartyHeroCard` — which is what html2canvas captures for
the PNG export — is untouched and an exported comp never carries someone's tier opinion.

## Modded hero data (`src/data/modded_heroes.js`)

**Generated — do not hand-edit.** `scripts/importModdedHeroes.js` rebuilds it from the Steam
Workshop folder, the same way the game reads a mod, and `scripts/exportModdedAssets.js` builds
the matching image tree for `dd-team-builder-assets`.

```bash
node scripts/importModdedHeroes.js --workshop "D:/…/steamapps/workshop/content/262060" --game "D:/…/common/DarkestDungeon"
node scripts/importModdedHeroes.js --workshop … --game … --check     # report, write nothing
node scripts/importModdedHeroes.js --workshop … --game … --prune     # drop what cannot be shown
node scripts/auditModdedHeroes.js  --workshop … --game …             # diff the file against disk
node scripts/exportModdedAssets.js --workshop … --game … --out "<assets>/images"
```

`--game` is optional but wanted: it is what resolves the vanilla ids a mod reuses without
redefining (`encourage`, `first_aid`) and what lets a rebalance mod borrow the base game's art.

### What the old pipeline got wrong

The file was previously produced by `scraper/dd_mod_scraper.py` in the assets repo, which listed a
class's skills by **sweeping the localization XML for `combat_skill_name_*` entries in file order**.
It never opened `<hero>.info.darkest`. That single shortcut caused all four symptoms:

- **Skill order was string-table order**, not the kit — 141 of 626 classes.
- **Skills the mod had removed stayed** (their string entries linger), and skills whose name lives
  elsewhere were missed.
- **`alwaysActive` was a guess.** The game states it as
  `skill_selection: .can_select_combat_skills false`; the sweep never saw it, nor the `mode:` lines,
  so 116 classes were wrong and nearly all of them are stance classes.
- **Every skill icon shifted with the order**, because `copy_skill_images` paired `skills[idx]` with
  `<hero>.ability.<ordinal>.png` *by position*. Proven byte-for-byte: the assets repo's
  `2001406494_rupture.png` is `alchemist.ability.one.png`, which that mod maps to `alch_putre` —
  Rupture was drawing Putrefaction.

Class trinkets were separately unreachable: 83.5% of them had their picture filed under the mod's
**internal id** (`2001406494_alch_newt.png`) while `getTrinketImagePath` builds the **display name**
(`…_eye_of_newt.png`). The art was there; nothing could find it.

### Where each field comes from

| field | source |
| --- | --- |
| `skills` | `<hero>.info.darkest` `combat_skill` ids, ordered by `<hero>.art.darkest`'s icon ordinal |
| `campSkills` | `raid/camping/*.camping_skills.json`, the entries listing this hero class |
| `vanillaCampSkills` | those whose id the base game also defines |
| `classSpecificTrinkets` | `trinkets/*.entries.trinkets.json` where `hero_class_requirements` names the class |
| `alwaysActive` | `skill_selection: .can_select_combat_skills false` |
| `stances` | the `mode:` ids, when there are two or more |
| `heroId` | the mod's own folder/class id — the link back to the workshop folder |
| `MODDED_GENERAL_TRINKETS` | entries whose `hero_class_requirements` is **empty** — worn by anyone |

Names come from the string tables and nowhere else. Four traps, each of which silently produced
wrong names before:

1. **A table can hold the english block more than once.** Mods append a new
   `<language id="english">` rather than editing the first, and Dr. Livesey's has fourteen. Reading
   only the first left nine trinkets unnamed whose names were in the file.
2. **The localised siblings each carry an english block too**, as an untranslated fallback, and
   `acolyte_brazilian` sorts before `acolyte_english`. First-wins on a plain walk reads the stale one.
3. **A name can be dressed.** `{colour_start|…}¤¦¤¦¤{colour_end}\nRegenerate` — ornament on one line,
   the name on the next. `nameText` keeps the line that still has letters once the ornament is
   stripped, and falls back to `upgrade_tree_name_<hero>.<skill>` only for a dressed entry: that key
   is often a leftover from whatever class the mod was cloned from (Alonne's "Elegant Strike" is
   filed there as "Crusader Strike"), so it must not win outright.
4. **Zero-width padding.** Kuuga's "Chouhenshin" carries 700 U+200B characters to widen the tooltip.
   They are not whitespace, so they survive every other clean-up.

### Names already in the app are kept, not overwritten

25 of the installed mods ship no english at all, and `modded_heroes.js` carries hand-written english
for them. Those survive a re-import because **the old scraper's ordering rule can be replayed**
(`replayScraperOrder`): 503 of the 616 verifiable classes come back byte-identical to what is on
disk today, which makes it a mapping rather than a guess, and for the chinese-only mods it yields
the same order the english was typed against — so each name moves onto the skill id it was written
for. The replay runs twice: english blocks first, then **every** language block, because the
scraper's XML parse failed often enough that its regex fallback (which ignores language sections)
is how those names got in.

`chooseName` then prefers, in order: the mod's own latin name, the name already in the app, an
untranslated (CJK) name, and finally the internal id read as words — the last marked in the report,
since it is the only case where a name was invented. English the app carries that no skill claimed
is listed as `orphaned` rather than dropped onto some other skill; pinning the class by adding
`heroId` to its entry is what fixes those, and `pickHero` reads that before anything else.

### Which hero, and which classes are the same class

`pickHero` resolves a class to a hero inside its mod folder in this order: an explicit pin, the
`heroId` already in the data file, the mod's own class name, the folder id, and finally **which
hero's skills the class already lists** — comparing the mod's own skill names *and* their
translations, since the classes that get this far are mostly the Chinese-only ones.

**A Chinese name has an empty `nameKey`, and every string contains the empty string.** The
substring fallback was unguarded, so `key.includes(nameKey(h.name))` was true for every hero whose
name is CJK — one 21-hero compilation had eleven app classes all pointing at `exorcist` because of
it, and they looked like duplicates of each other. Both `pickHero`s now require three characters on
each side before a substring counts.

What survives all of that is a mod shipping several heroes, no english, and an app name that shares
no letters with any folder id. Those are written down in `scripts/lib/heroPins.js` with the evidence
for each — replaying the old ordering against the pinned hero reproduces exactly the names already
in the app, which is what restores `Blood Hunter (CN)` and `Crusader (Kaze)` to full english rather
than the raw ids their mod ships.

**Two workshop entries are the same class when they share an internal id *and* a set of skill
ids.** A popular class gets re-uploaded as a port, a translation or a rebalance under a fresh mod
id and often a fresh title — the app's `Illusionist` is `3631649848/Mesmer` while
`3025352993/Mesmer` is the same hero's original upload, and `Dragon Rider` has a second id too.
Neither half of the test is enough alone: the mod id changes between uploads, and two authors can
both name a hero `Gabriel`. 134 installed heroes are re-uploads of a class already carried and are
skipped on that basis; 29 more share a *name* with a different kit and are added under the app's
`Name (modId)` convention.

**The skills decide whether a class is worth adding, not its name.** A class whose seven skills
all read `jd_skill1` is content nobody can use, and 93 of those are skipped. A class the mod names
only in Chinese but whose whole kit is in english is the opposite case, and its folder id stands in
for the missing name — that is where `Abysssinker`, `Gabriel`, `Ailuoli`, `Doombringer`, `Altair`
and `Uika` come from.

### Translating the Chinese-only mods

Forty of the installed mods ship complete string tables that simply are not in english. Without
something to read them, a class whose whole kit is named in Chinese is skipped entirely and one
that is carried ends up with `Ceobe 9` for a trinket, so `scripts/lib/moddedTranslations.js` holds
english for all 315 distinct strings they use.

**It is keyed by the source string, not by mod and id.** The same Chinese name means the same thing
wherever it appears, and these mods are re-uploaded constantly — the Plague Doctor joke class is
installed five times under five mod ids with byte-identical strings. Keying by text translates each
of them once, and 445 slots collapse to 315 entries.

`chooseName` consults it **after** the mod's own latin name and after the name already in
`modded_heroes.js`, so it fills gaps and never overwrites hand-written english. Several of the
translations agree with that existing english exactly — the Ancestor Narrator's kit, the Blood
Saint's, the Unicorn's — which is a useful check that both readings match.

Two details are easy to get wrong:

1. **Look the translation up on the raw string.** Camp skills ship SHOUTED and get title-cased, but
   title-casing first mangles the key — `…的PVP视频` becomes `…的Pvp视频` and misses the table. The
   raw name goes into `chooseName` and the title-casing comes out of it.
2. **Decode mojibake before looking up.** A table saved in the wrong encoding holds the same
   characters underneath, so `translationFor` re-decodes and tries again.

The kit gate counts a skill as named if the mod names it in english *or* the table covers its
Chinese; otherwise a class every word of which we can read would still be turned away.
`moddedHeroes.test.js` asserts no CJK name survives into the data at all, so installing a mod
nothing has translated fails the suite rather than quietly showing a name nobody can search for.

What it cannot reach is a mod with **no string at all** for a skill: `remilia_scarlet` and
`lc_plowmare` name none of their kit in any language, and there is nothing to translate.

### Unclassed trinkets

`MODDED_GENERAL_TRINKETS` was an empty array that five modules already consumed. It now holds the
460 trinkets whose `hero_class_requirements` is empty, which the game lets any hero wear — **a
mod's theming is not a restriction the game enforces**, and 369 of the entries the old data filed
as class kit are declared unrestricted in the mod's own JSON. (That old data also carried 2,267
class trinkets that appear nowhere in their mod under any name: the sweep had picked up string
entries for trinkets that had since been removed.)

A name that collides with a vanilla, backer or class trinket is left out, and so is the second mod
to ship a name. `getTrinketImagePath` tests the general list *before* falling through to the
vanilla folder, so a modded "Ancestor's Bottle" would take the real one's picture.
`MODDED_GENERAL_TRINKET_MODS` records which mod each came from, because the image is filed as
`<modId>_<name>.png` like every other modded asset — a name on its own is not unique across 800
mods.

### Pruning (`--prune`)

**Off by default**, because unsubscribing a mod for an afternoon should not silently delete fifty
classes from the app. With the flag, three things go, and each is a fact rather than a judgement:

- **the mod is not installed** — nothing can be verified against it or drawn from it;
- **another class already carries the same hero id and the same set of skill ids** — one class
  uploaded twice, which the old scraper kept as two. 54 of the 710 were that;
- **half or more of the kit has no name in any language** — the card would read `Fydt Skill 1` all
  the way down. Seven of those, and none has a surviving equivalent except `Unicorn (Rework)`.

A duplicate group collapses onto the **best entry under the best name**, which are not always the
same row: `Unicorn (Rework)` had the readable name and `Unicorn (Rework) (3611958999)` had the
translated kit, so the survivor is the second one's data under the first one's name.

`betterName` picks the plain one: a trailing parenthetical is a disambiguator the old scraper added
(`(3397134362)`, `(CN)`, `(Legacy)`), a lower-case name is a slip, and beyond that the shorter name
wins. That last preference is deliberately weak — choosing between "Nin Robber" and "Assault
Kunoichi" is taste, and the rule that tried to have taste (prefer a name that is not the folder id)
was the one that kept `Falconer (Legacy)` over `Falconer` because the folder is called `falconer`.

Afterwards any `(modId)` suffix whose sibling is gone comes off, so `Duchess` and `Wildcat` — whose
original mods have been taken down — are reclaimed by the versions that are actually installed.
A suffix is kept when the plain name belongs to a vanilla class, which is the one case it is load-
bearing.

### Rules that must not be regressed

- **Class names are the key.** Saved teams and preset comps store `heroClass` as a string, so a
  class is never renamed by the importer — a mod calling itself something else is reported, not
  applied.
- **A modded class never takes a vanilla class's name.** `HeroConfiguration` merges the two rosters
  with the modded one last, so a workshop rebalance calling itself "Crusader" would *replace* the
  Crusader the moment modded content is switched on. Those are added as `Crusader (3106860450)`,
  the app's existing convention for two classes with one name.
- **A name appears once per class.** The app addresses a skill, camp skill or trinket by its display
  name everywhere — `activeSkills` is a list of names, `toggleSkill` matches on one, `imageHelper`
  builds the filename from one — so two entries sharing a name are the same thing to all of it.
  The source really does repeat them (Mordekaiser has two "Mace of Spades", one per stance; Abigail
  has ten camp slots labelled "Do Not Select"), and the later ones are dropped and reported.
- **A vanilla camp skill keeps its vanilla name** even when the mod relabels it ("Wounds Care" for
  `first_aid`, "Bénir" in a french-only mod), because `getCampSkillImagePath` sends anything in
  `vanillaCampSkills` to the vanilla art folder, which is keyed by that name. `Hobby` is the one
  vanilla camp skill no vanilla class carries and is the single documented exception.
- **A new class is only added when its kit is named.** A class whose seven skills all read
  `jd_skill1` is content nobody can use; those are reported under `skippedNew`.
- **No modded trinket may share a name with a vanilla, backer or class trinket**, for the same
  image-routing reason. `moddedHeroes.test.js` pins that the four lists stay disjoint.

`src/data/__tests__/moddedHeroes.test.js` pins the shape, the dedup, the vanilla-camp rule, the
sort order and the no-shadowing rule.

### The asset export

The importer writes **`scripts/importModdedHeroes.manifest.json`** alongside the data file: for each
class, the internal id paired with the display name that run settled on. `exportModdedAssets.js`
copies straight from those pairs and re-derives nothing.

That is the structural fix for the icon bug. The old pipeline resolved names in one place and paired
them with icons *by position* in another, so any disagreement about order silently mislabeled every
picture. It is also why the exporter cannot simply rebuild the names itself: **resolution is not
idempotent.** The names in `modded_heroes.js` feed the next run, and a class whose repeated names
were deduped no longer replays to the same count — running the builder a second time re-decided 45
classes. The manifest is the record of one run, so there is nothing left to disagree about; the
exporter only checks that its names still match `modded_heroes.js` and says so if not.

It takes `toImageFileName` from `src/utils/imageHelper.js` rather than reimplementing it — the old
scraper had its own `sanitize_filename`, and the two drifting apart is the other half of why so
little art resolved.

| what | from | to |
| --- | --- | --- |
| skill icon | `heroes/<id>/<id>.ability.<icon>.png` | `images/modded/skills/<modId>_<name>.png` |
| camp skill icon | `raid/camping/skill_icons/camp_skill_<id>.png` | `images/modded/camp_skills/<modId>_<name>.png` |
| trinket icon | `panels/icons_equip/trinket/inv_trinket+<id>.png` | `images/modded/trinkets/class_specific/<modId>_<name>.png` |
| portrait | `heroes/<id>/<id>_A/<id>_portrait_roster.png` | `images/modded/heroes/<image>` |

The portrait is the **roster** portrait, not the `_guild_header.png` sitting beside it: that one is
a wide banner twenty times the size and the wrong shape for a hero card. Camp skills marked vanilla
are skipped — the app draws those from `/images/camp_skills/`. A rebalance mod that reuses vanilla
art (one reworks the Antiquarian and ships a single new icon) borrows the missing files from the
install, because the app resolves *every* skill of a modded class through the modded path.

### Modded heroes (`src/data/moddedEffects.js`)

The import scripts only see the base-game install, and `skillEffects.test.js` / `trinketEffects.test.js`
pin the generated files to the vanilla roster — so a modded hero's effects cannot live there.
`moddedEffects.js` is the hand-authored companion: `MODDED_COMBAT_SKILL_EFFECTS` (class → skill),
`MODDED_CAMP_SKILL_EFFECTS` and `MODDED_TRINKET_EFFECTS`, same shapes as the generated stores, derived
by hand from the mod's own `.info.darkest` / `*.effects.darkest` / `*.buffs.json` /
`*.camping_skills.json` / string tables at max rank. `hoverInfo.js` and the two direct
`getTrinketEffect` call sites fall back to `getModdedSkillEffect` / `getModdedTrinketEffect`.
`moddedEffects.test.js` pins each class listed in `MODDED_COMBAT_SKILL_EFFECTS` against
`modded_heroes.js` (skills, non-vanilla camp skills, class trinkets, both directions) — other modded
classes are simply uncovered, not failures. Sibyl (Workshop `3490076588`) is the first covered class. Comps exported by the SIM
tooling name her class by the mod's internal id `sibyl_ms`; `NAME_ALIASES` maps it to
`Sibyl`, and the file-import paths (`storageHelper`, `useTeam.importFromClipboard`) now
canonicalize **before** `validateTeamSchema` so her 7-skill `alwaysActive` roster is not
rejected against the default 4-skill cap.
It also carries `MODDED_TRINKET_SETS` and the merged `getSetBonus` / `getTrinketSet` — see **Set
bonuses** above.

## What a skill does (`src/utils/skillProfile.js`)

`rankValidity` proved the pattern for positions; this is the same move for the rest of the
text. `skillEffects.js` carries `launch`, `target` and a prose `effect` for all 140 vanilla
combat skills and all 80 camp skills, and `skillProfile` turns that prose into tags —
`stun`, `blight`, `bleed`, `mark`, `markPayoff`, `heal`, `stressHeal`, `stressResist`,
`guard`, `riposte`, `selfMove`, `enemyMove`, `cleanse`, `damage`, `aoe`.

**The clause prefix decides who a clause lands on, and it is not decoration.** The
Abomination's `Transform` reads `Other Heroes: Stress +8 | Self: ... Heal 5 HP` — the same
line both costs the party stress and heals the caster. Same trap `trinketSubstitution`
documents for `+10% Stress`: the sign does not tell you whether something is good.

Four rules, each with a test, and each one a bug that was there first:

1. **No prefix does not mean "the enemy" — it means whoever the skill targets.** The
   Crusader's `Inspiring Cry` says a bare `Stress -8` and targets `ally 1·2·3·4 / self`.
   Reading the prefix without the target counted the classic stress heals — Jester,
   Crusader, Houndmaster — as something done *to the enemy*, and found only 3 stress
   healers instead of 8.
2. **A resistance is not the thing it resists.** `+15% Bleed Resist` bleeds nobody.
3. **A conditional bonus is not the condition.** `+60% DMG vs Stunned` does not stun;
   `vs Marked` does not mark.
4. **Cleansing is the opposite of applying**, and a lookbehind is not enough to see it:
   `Cure Blight/Bleed` leaves `Bleed` preceded by a slash. The cleansing verb and
   everything up to the next separator is struck out *before* anything is matched.

Flat stress and percentage stress are different things — `Stress -12` heals what is
already there, `-20% Stress` is resistance. `Inspiring Tune` carries both in one line, and
"the party has a stress healer" means the first.

`analyzeSynergy` is built on this now, and the tables it replaced show why it was worth
it. `HEALER_CLASSES` had two names against 19 healing skills across 13 classes;
`MARK_BONUS_ABILITIES` had three classes against eight; stress healing was a literal
four-name array. The Plague Doctor's entry said `Battle Medicine` while the skill is
`Battlefield Medicine`, so it had never matched anything. None of the tables knew the
Duelist or the Runaway, let alone a modded class.

**Potential and actual.** A hero with no skills chosen is judged on their class's whole
kit; one who has chosen is judged on what they chose. Picking a Vestal should not read as
"no healer", and a Crusader carrying four non-healing skills should. The switch is per
hero, so a half-built party still behaves, and the panel says which heroes it is assuming
for.

`partyCoverage` is exported separately from the notes because the same question is asked
by more than the panel: what a party can do also decides a recommended loadout and drives
comp generation. Unknown skills stay `null` and are never reported as a fault — silence is
the right answer when you do not know, which is what keeps uncovered modded classes quiet.

## Best-in-slot, per class **and rank** (`src/data/bisIndex.js`)

There is no such thing as one recommended build for a class. A skill has ranks it can be
used from, so the Leper's answer at rank 1 and at rank 4 cannot be the same one — his
`launchableByRank` is 7/5/2/1 and the Arbalest's is 2/2/7/7, the same question with
opposite answers. `bisLoadout(heroClass, rank)` is keyed on both.

**Counting is not enough, and it fails exactly where help is needed.** The comp library is
not a census: the Houndmaster holds 97 of 704 hero slots and the Duelist 9. Measured per
class *and* rank it is worse — **33 of the 80 cells hold fewer than 3 comps**, and several
hold none at all (Arbalest r1, Musketeer r1, Plague Doctor r1, Leper r3, Occultist r4).
Recommending by frequency alone returns good answers only where good answers already
existed, which is the same complaint that makes `suggestTeam` useless outside the popular
classes.

So three sources, in order, because none is honest alone:

1. **The comp library**, when the cell has `MIN_LIBRARY_SAMPLES` or more. Houndmaster r3
   has 40 slots and a clean consensus: Hound's Rush 40/40, Cry Havoc 37/40, Guard Dog
   35/40, Target Whistle 32/40.
2. **`modelUsage.json`** for the thin cells — 166,259 decisions from a trained policy,
   covering all 20 vanilla classes, and crucially *not* sharing the library's bias. It
   carries no rank dimension, so it may only say **which** skills, never from where.
3. **Rank legality**, from `skillProfile`, which filters rather than breaking ties.

The returned build says which source answered (`source`, `samples`), so the UI can tell a
40-comp consensus from a guess instead of presenting both as fact.

**Fran's rule: at least 3 of 4 skills must launch from the hero's rank.** The fourth is
spent deliberately on the skill that reaches the most ranks *other* than the hero's,
because the best skill in the kit is worth nothing the turn you get shuffled out of
position.

**Dancers are exempt, but they have to earn it.** A class with a self-movement attack
places itself, so judging it by where the round starts is judging it by where it spends
the least time — but the exemption is only granted if the build *actually takes* a
movement skill. A Shieldbreaker without `Serpent Sway` is as stuck as anyone, and handing
her the exemption for her class name would be going back to judging by name. Stance classes
(`alwaysActive`) get all seven skills, because they do not choose.

The button lives on the hero card and passes `position`, which is the rank — `App` renders
the cards reversed and passes `4 - idx`. It confirms before overwriting a configured hero,
the same rule as paste, and **keeps locked quirks**, because the game will not let you drop
them.

## Building a comp instead of looking one up (`src/utils/compGenerator.js`)

`suggestTeam` searches `COMP_LIBRARY`, so it can only ever hand back something already
written. And the library is distributed the way it is — 97 of 704 hero slots are
Houndmaster, 9 are Duelist — so a roster without the popular classes gets nothing useful.
`generateComps` answers the same question from the other end: **what party makes sense with
these heroes**, judged by the game's rules rather than by a tally.

**Classes and their ranks are chosen together**, because the same class is worth a lot or
nothing depending on where it stands. `scoreParty` is the objective, and it reads
`partyCoverage`, so it is the same derivation the party panel uses:

| weight | what |
| --- | --- |
| ×40 | how many of the four enemy ranks the party can actually reach |
| +20 / +15 / +10 | heals, answers stress, brings stun-or-blight-or-bleed |
| +8 / +4 | mark paired with a payoff, a guard |
| −50 each | a hero who cannot use a single skill from their rank |
| −3 each | a skill that cannot be launched from where its hero stands |

That last row matters more than it looks. Punishing only the *fully* stranded hero let an
Arbalest sit at rank 2 with two of four skills dead — not broken, just wrong, which is
exactly the case Fran's three-of-four rule is about.

Two things stop it being a plain greedy fill:

- **A swap pass.** Filling rank 1 to 4 never reconsiders, so a back-line class that was the
  best available early gets stuck up front. All six pairs are tried and kept if they score
  better. Swapping *rebuilds* both loadouts, since `bisLoadout` depends on the rank.
- **`generateComps` returns several distinct comps, best first**, deduplicated by class
  placement. Searching for the optimum and keeping only it returns the same comp for the
  same roster forever, and "give me another" has to be able to. The only randomness is
  `EXPLORE`: sometimes take the second-best candidate. Variety comes from the search, not
  from noise in the score — every alternative is still checked.

A generated comp is named by `nameCompAgainst`, the same engine the save dialog uses, so it
arrives as `Family: Variant` and comparable with the library rather than as "Random Team".
`placeGeneratedComp` in `useTeam` drops it in as one undoable step.

**`COMP_REGIONS` is derived now** (`compRegions()` in `rankerItems`, which was written and
then never called). The hardcoded four were the regions that had comps on the day it was
typed, so a region stayed unrankable after comps were written for it. The threshold keeps
it honest at the other end — the library also touches Darkest Dungeon II with 2 comps and
the Farmstead with 1, and a pairwise sort of one comp is not a sort.

## What you fight in each region (`src/data/regionProfiles.js`)

**Generated — do not hand-edit.** `scripts/importRegionProfiles.js` rebuilds it from a game
install, the same shape as every other importer here: read at build time, **commit the
output**, so nothing in `src/` ever needs the game. That is the whole point — the app has
to work for someone who has never installed Darkest Dungeon.

Two sources, and it is the pairing that makes it a region profile rather than a bestiary:
`monsters/**/*.info.darkest` for each enemy's stats (hp, prot, spd, the five resistances,
`enemy_type`, size, whether it leaves a corpse), and `dungeons/<zone>/*.mash.darkest` for
the weighted tables of which enemies actually turn up together. Enemies are weighted by
their table's `.chance`, so a rare party cannot drag the averages.

This is what turns "a Ruins comp" from a label into a target, and the numbers come out
matching what any player already knows, with no hand-written list behind them:

| | Ruins | Warrens | Weald | Cove |
| --- | --- | --- | --- | --- |
| bleed resist | **151%** | 44% | 50% | 59% |
| blight resist | 35% | 62% | 62% | 40% |
| dominant type | unholy 61% | man 54% | man 51% | eldritch 61% |

Bleed is wasted in the Ruins and blight is not; the Warrens are the other way round; the
Crusader's and Occultist's bonuses are live in the Ruins and the Cove. `regionProfiles.test.js`
pins those four facts.

Three things worth not re-deriving:

1. **Resistances go above 100 and that is real.** A skeleton ships `bleed_resist 200%`, so
   the Ruins average is over 150. It looks like a parse bug and is not.
2. **`flashback.<zone>.*` tables are skipped.** The Shieldbreaker DLC drops them into the
   real zone folders, but they are her own scripted dungeon — folding them in puts her
   snakes in every region.
3. **A zone whose tables do not describe how it works gets no profile at all.** The Darkest
   Dungeon ships one table with one enemy and the Farmstead two, because neither picks its
   fights this way. "The Darkest Dungeon: average party size 1" would be a confident lie,
   and the rule everywhere else here is that silence beats a guess.

`src/data/regionEnemies.js` holds the 310 per-enemy rows and **nothing imports it on
purpose**. It is provenance — with it the summary can be re-derived or re-weighted without
the game, the same reason `importModdedHeroes` keeps its manifest — and it lives in its own
file so it cannot be dragged into the bundle behind `REGION_PROFILES`, which *is* imported.

The same script picks up `campaign/progression/progression.json`, so `resolveLevel` finally
answers the question the save importer had to leave open: it showed raw XP because "the
threshold table lives in the game install, which this app does not read". It does now.

## Hover cards

`src/components/common/HoverCard.jsx` is the panel that opens on the small icons. It is
`position: fixed`, placed from the trigger's bounding rect, **and portalled into `document.body`**.
Both halves are load-bearing and neither is enough alone: fixed positioning escapes the grids and
cards that *clip* their overflow, and the portal escapes their *stacking contexts*. A party card
mid-drag carries `opacity` and the icons carry a hover `transform` — either one creates a stacking
context that traps a fixed child no matter how high its z-index, which is exactly what made the
panel draw behind the neighbouring hero cards. `PartyHeroCard.test.js` pins the portal.

It opens on hover *and* on keyboard focus, and carries `pointer-events: none` so it can never
swallow a click or a drag (the party cards are drag-and-drop targets). With nothing worth showing it
renders its child untouched and introduces no wrapper at all.

`src/utils/hoverInfo.js` turns a name into the three fields the card draws (`trinketHover`,
`skillHover`): the effect stores join their clauses with `" | "`, and splitting there is what turns
one dense string into a readable stack.

Note for tests: React's `onMouseEnter` does not bubble, so `fireEvent` has to be aimed at the
`HoverCard` wrapper, not at the icon or button inside it.

## Downloading a file

Every JSON download goes through `downloadJSON(fileName, payload)` in
`src/utils/download.js` — the preset comp, the whole-library backup, and both ranker
exports. There were four copies of the same `data:` URI, and that shape does not scale:
`encodeURIComponent` more than doubles the byte count and browsers cap `data:` navigations
around 2 MB. The comp ranking carries a full party per comp, so **the biggest export is the
one the RL project reads**, and it would have failed by being silently refused. A `Blob` has
no such ceiling. The `data:` path survives only as a fallback for environments without
`URL.createObjectURL` (jsdom), so the storage tests still exercise the real function.

## The comp you are building, and undoing it

Two different things live in localStorage and it is worth keeping them apart.

- **`dd_draft_team_v1`** is the comp *in progress*: no name of yours on it, not in
  "My Teams", and its only job is to survive a reload. It did not exist, so an F5 threw
  away the party while `README.md` advertised auto-save. Written debounced (the name
  changes on every keystroke and this serialises four heroes), read once through
  `useState(loadDraftTeam)`, and **validated and canonicalised on the way in** like an
  imported file — a draft is the least trustworthy input there is, bytes written by an
  older build weeks ago. Saving it is deliberately silent: a toast every time the disk is
  full while you type would be worse than losing it.
- **`dd_team_builder_teams`** is the explicit save, unchanged.

**Undo covers the whole comp — name, location and heroes — not just the heroes.** The
history used to snapshot `heroes` alone, so undoing after loading a comp handed back the
old party wearing the new comp's name and dungeon: a state that never existed, and one
that looks fine. `TeamControls` was already promising "This can be undone with Ctrl+Z"
for actions that change all three.

Three rules hold it together:

1. **The history is state, not a ref.** A ref does not schedule a render, so the
   Undo/Redo buttons only got their `disabled` right by luck — the neighbouring
   `setHeroes` happened to re-render them.
2. **Nothing writes history inside a `setState` updater.** React double-invokes updaters
   under `StrictMode` (which `index.js` enables), so one edit could stack two entries.
   `commit` does the work in the callback body and `setHistory` stays pure.
3. **`compRef` is updated on every write, not only on render.** React batches, so two
   `updateHero` calls in one tick both read the ref before any render — without the eager
   sync the second silently clobbered the first. That is what the functional updaters
   used to give for free, and it is why `setTeamName`/`setLocation` are wrapped: they are
   *not* history steps (one entry per keystroke would be useless) but they must still
   keep the ref current, or the next `commit` would snapshot a stale name and put it back.

**Dragging sets `dataTransfer`.** Firefox refuses to start a drag when nothing has been
put on the event, so reordering by drag was Chrome-only; the index travels through state
regardless, that call is purely the browser's toll.

## Saving a team

One **Save** button, two destinations (`SaveTeamModal`):

- **Browser storage** — localStorage, keeps the name you typed. Shows under "My Teams".
- **Preset comp file** — runs the naming engine against the live library (`nameCompAgainst`) and
  downloads `Family__Variant.json` ready to drop into `src/data/presetComps`. The taxonomic name
  goes in `teamName`, yours is kept as `alias`. `toCompFileName` is shared with
  `scripts/nameComps.js` so the app and the script agree on the filename.

Naming against the library never renames anything already in it: if the engine picks a name a
bundled comp already wears, the new comp is the one that cedes.

## Importing a Darkest Dungeon save

The **Roster** button in `TeamControls` reads a real profile folder and builds with the heroes
and trinkets the player actually owns. (It is not called "Save" — that is the team-save button
two along; this one names what you get out of it, not the file it reads.) Three layers:

- **`src/utils/dson.js`** — the format. Files in `Documents/Darkest/profile_N/` are named
  `persist.*.json` and none of them is JSON: they are the game's own binary format (magic
  `01 B1 00 00`), a flat pre-order list of fields plus a table of per-object child counts to
  rebuild the tree from. A hero is a whole nested save file inside its parent's `raw_data`,
  so decoding recurses.
- **`src/utils/saveParser.js`** — what to take from which file, and how internal ids become
  app names.
- **`ImportSaveModal`** + **`useSaveProfile`** — the UI, and the parsed profile kept in
  localStorage (`dd_save_profile_v1`). Only the *parsed* result is stored, never the save's
  bytes.

**The bug this replaces is the whole reason it is a parser.** The old loader scanned the
binary for printable strings and matched them against the hero pool. A save spells `crusader`
the same way whether the Crusader is standing in the Hamlet, waiting in the Stage Coach, or
named in the campaign log of the run that killed him — so the list offered heroes the player
had buried, and recruits they had not hired. `persist.roster.json`'s `heroes` map is the
living roster and nothing else. There is no string-scanning fallback left: a file that is
neither a hero list nor a save is an error with a message, not a guess.

| file | what is taken |
| --- | --- |
| `persist.roster.json` | the living roster — class, name, resolve XP, stress, HP, quirks (with locks), diseases, selected combat and camp skills, equipped trinkets |
| `persist.estate.json` | the trinket inventory |
| `persist.game.json` | estate name, game mode, DLC and applied mods |
| `persist.campaign_log.json` | the week number |
| `persist.town.json` | the Graveyard, so the dead are not offered as heroes |

Only the roster is required. `resolveXp` is shown as **a resolve level and the raw XP**.
The threshold table lives in the game install, which this app used not to read;
`scripts/importRegionProfiles.js` extracts it and commits it, so `resolveLevel` works
without the game (see **What you fight in each region**).

**The dead are subtracted from the roster.** A hero who dies is *not* moved anywhere: they
stay in `persist.roster.json` carrying `roster.status: 3`. Do not go looking in
`persist.town.json` — its `graveyard` building decodes as empty even in a save with eight
buried heroes, and an earlier version of this parser walked that node, found nothing, and
offered corpses as heroes you could field.

`ROSTER_STATUS` names the three values a real save uses: `0` in roster, `1` in the party
currently selected for a quest (alive — it matches `last_party.last_party_guids`), `3` dead.
The identification is not a guess: on the fixture under
`src/utils/__tests__/fixtures/save-with-deaths/`, the `status === 3` set matches
`persist.campaign_log.json`'s `died: true` records exactly, in both directions, and a test
asserts it. Their equipped trinkets go with them, which falls out of `ownedTrinkets` being
built from the living.

There are two save fixtures for this reason. The early one has nobody dead, which is
precisely why the first attempt looked in the wrong file and passed.

Three details are easy to get wrong and each has a test:

1. **The bytes between a field's name and its value are junk, not padding.** The game aligns
   values to 4 bytes and never clears the gap, so it routinely holds the tail of an earlier
   name — `colour_variation` reads as `6910707` instead of `0` if you start at the end of the
   name rather than at the alignment boundary.
2. **Booleans are written unaligned**, one byte straight after the name, so a raw length of
   exactly 1 has to be tested *before* alignment is applied.
3. **Four bytes mean nothing on their own.** `current_hp` and `m_Stress` are floats;
   `wallet.amount` is four bytes and an integer. The float fields are named, and everything
   else numeric reads as a signed int.

**Ids are resolved, never invented.** The save says `man_at_arms`, `god_fearing`,
`zealous_accusation`, and `nameKey` already folds those onto the display names for almost
everything; a squashed variant of the same key closes the "one word or two" gap
(`grape_shot_blast` → `Grapeshot Blast`). What is left is not spelling but **renames the game
made after shipping**, and those five are written down in `src/data/gameIds.js`. A rename only
applies when the class really has that skill, so a flat table cannot mis-resolve an id another
class reuses — which is what makes `first_aid` work: it is one skill the app knows under two
names (`Wound Care` for the eighteen classes the wiki CSV covered, `First Aid` for the two
Fire's Edge ones rendered from the install), and the class decides which one it is. Anything
still unresolved lands in `unmatched` and the modal says so, rather than being dropped
silently.

**A directory pick is not just a filter.** A profile folder holds its own `backup/` copy of
every file — same basenames, older bytes — and a player who picks `Darkest/` instead of
`Darkest/profile_3` hands over every profile at once. `chooseProfileFiles` groups by folder,
keeps only folders holding a roster, takes the shallowest (the backup is one level deeper),
and breaks ties on the most recently written roster.

Three places consume the profile:

- **`ImportSaveModal`** lists heroes, not classes — two Plague Doctors are two rows, because
  they are two different heroes with different quirks. Picking is ordered and the badge is the
  **rank**, so the first hero picked is `heroes[0]`, rank 1, the front line. `placeHeroes` in
  `useTeam` drops the run into the party as **one** undoable step and leaves the slots past
  the end alone.
- **`SuggestCompModal`** gains a *Use Save Roster* button and accepts a one-shot
  `initialRoster` hand-over from the import modal. It is cleared on close: left set, it would
  overwrite whatever the player edited by hand next time. See **A roster is a multiset** and
  **Stress bends the draw**.
- **`TrinketPicker`** gains an *Owned only* filter, behind the `ownedTrinketsOnly` setting.
  Owned means the estate inventory plus whatever is already equipped, matched on `nameKey`.
  It only appears once a save is imported, and — like every optional-content switch — it never
  hides a trinket already on a hero.

The fixture under `src/utils/__tests__/fixtures/save/` is a real profile (week 4, nine living
heroes, eight classes, an always-active Duelist), because the format's traps only show up in
bytes the game actually wrote.

### A roster is a multiset (`src/utils/rosterAvailability.js`)

**Owning one Antiquarian must not offer you a comp that fields four.** Fifty-one of the
bundled comps run a duplicated class — `Ballad Quartet` is four Jesters, `Bulwark Pack:
Heist` three Men-at-Arms, `Blood Money: Twin Beast` two Abominations — and the suggester
used to test membership with a `Set`, so any comp whose *classes* you had passed, however
many of each it wanted. Availability is now a containment test between two counted
collections: `compFitsRoster` needs `have >= need` for every class.

A roster is stored as **a list with repeats** (`['Crusader', 'Antiquarian', 'Antiquarian']`)
rather than a count object, and that is what makes the change invisible to anything written
before it: a roster saved as a list of unique names is exactly "one of each".
`toRosterCounts` also accepts an object or a `Map`, and is idempotent — feeding it its own
output returns the same map, which is what stops `expandRoster(counts)` silently yielding
nothing.

Two rules that are not obvious:

- **A class is capped at the party size.** Six Jesters cannot matter to four slots, and
  leaving the tail in would bias a random draw towards whichever class you hoard.
- **A comp must be four *named* classes.** `The_Old_Road` is the game's tutorial pair with
  two empty slots, and an empty slot asks nothing of a roster — so it would otherwise fit
  every roster and be suggested as a half party. The `Set` this replaced excluded it by
  accident, because `''` was never a roster member.

In the Suggest modal a hero tile **cycles 0 → 1 → 2 → 3 → 4 → 0**, with `×N` on the badge
past one. The mount effect normalizes rather than deduplicates: a `Set` there would flatten
"I have two Plague Doctors" back to one every time the modal reopened.

### Stress bends the draw (`src/utils/heroStress.js`)

**A hero at 90 stress is one bad turn from ruining the run**, so the suggester should stop
offering them — but stress is a soft fact. A roster where everyone is spent still has to be
given a party, and "everyone is tired, here is nothing" is not an answer. So stress never
excludes anyone; it only makes a comp **less likely to be drawn**.

It happens in **two steps, and the order matters**:

1. `restedCandidates` drops every comp that would field a hero at or past `STRAINED` (50) —
   but only while some comp your rested heroes can field is left standing. This is the part a
   weight cannot do. However small you make it, a weight only makes the tired comp *rarer*,
   and rare still reads as "sometimes, for no reason I can see". A first pass on weights alone
   left the exhausted half of a test roster at ~2% of the slots drawn, and a hero at 70 kept
   turning up; the filter takes it to zero.
2. The weighting then orders whatever survived — which is the whole list when nothing clean
   fits, so a roster where everyone is at 60 still gets an answer rather than silence.

The weight itself has a **knee at `STRAINED`**, because a player does not read stress on one
scale. Below half a bar it is bookkeeping and the curve barely moves (0 → 1, 25 → 0.94,
49 → 0.76); above it every point is a reason to stay home, so it decays geometrically the rest
of the way (60 → 0.30, 70 → 0.12, 80 → 0.05, 90 → 0.02, 100 → the `MIN_WEIGHT` floor). A
single squared falloff over the whole range was the first attempt and it left a hero at 70 on
half weight — nowhere near enough when the other three slots are uncontested.

`compStressWeight` **multiplies** the weights across the heroes the comp would field.
Averaging would let three rested heroes hide the fourth who is about to break — exactly the
comp a player does not want. `compPeakStress`, which the filter sorts on, takes the worst
member for the same reason: three fresh heroes do not make the fourth at 78 safer to take.

Three things that are not obvious:

- **The pool is ordered by `bySuitability`, and so is the assignment.** A comp fielding two
  Highwaymen fields *your two* — the calm one and the wreck — so the second slot is weighed
  against your second hero. Weighing a comp against heroes it would not field would be
  weighing the wrong thing, so `stressPool` and `assignSaveHeroes` pull from the same queue.
- **`bySuitability` now sorts the stress band above resolve XP.** A Resolve 5 veteran at 95
  stress is a worse pick than a Resolve 0 recruit at 0, and XP-first kept handing over the
  veteran. Below `STRAINED` (50) experience still decides — 10 and 30 stress are the same
  hero for this purpose.
- **A class you own nobody of weighs 1, not 0.** The comp's own hero fills that slot, and a
  hero you do not have cannot be tired. `stressWeightsFor` reports `stress: null` there, which
  is how "rested" is told from "unknown".

The draw itself is Efraimidis–Spirakis (`weightedSample`): key every item `u^(1/w)` and take
the largest. One pass, no rejection loop, and it samples without replacement — which is what
the fallback random roll needs when no bundled comp fits the roster, since that draws four
classes at once rather than one comp. That roll gets both steps too: the strained are set
aside only while four rested entries remain, because setting them aside otherwise would leave
too few heroes for a party.

The switch is *Favour rested heroes* in the Suggest modal (`preferRested`, on by default,
shown only once some hero carries stress); with it off the draw is the old uniform one. Any
strained hero who lands in the comp anyway is reported back as `stressedHeroes` and named in
the toast — the bias is not a promise, and finding out in the dungeon is worse.

### Re-equipping a comp from your own trinkets (`trinketProfile` / `trinketSubstitution`)

A comp names the trinkets it was built with, and with a save imported you probably do not own
them. So the comp's trinkets become a **target** — what they were *for* — and the suggester
fields the closest thing in your inventory. Off unless `reequip` is passed; the switch is in
the Suggest modal and only appears once there is an inventory to draw from.

**A trinket is not a number.** Its text mixes upside and downside in one line and the sign
does not say which is which: `+10% Stress` on Grim Bandana is the price of its damage,
`-15% Stress` on Shameful Shroud is the point of it, and `+20% Stress Dealt` is a benefit
that merely shares a word. Across the corpus `Stress` runs +101/-110, so there is no
convention to lean on. Every clause therefore becomes a **benefit** — magnitude × the stat's
polarity — and `LOWER_IS_BETTER` lists the handful where more is worse. It holds exact base
stats rather than keywords precisely because of the near-misses (`stress` vs `stress dealt`,
`chance party surprised` vs `chance monsters surprised`).

Four things worth not re-deriving:

- **Only the ideal's upside is the target.** Its downsides are a cost the comp accepted, not
  a goal; hunting for a replacement that also adds stress would be matching the bill instead
  of the meal.
- **Coverage, not similarity.** Scoring the angle between the two vectors marks a candidate
  down for carrying stats the target never asked for — Feather Crystal covers a wanted
  `+2 SPD` in full and adds dodge, and cosine scored it 0.13 and rejected it. The score is
  now how much of the wanted upside is actually delivered, capped per stat so overshoot is
  not rewarded, minus what the candidate costs elsewhere.
- **Units come from the data.** `+2 SPD` and `+25% MAX HP` are divided by the median
  magnitude that stat takes across the corpus, so nothing is hand-tuned and it survives a
  regeneration.
- **Vanilla class-trinket data is authoritative.** Several workshop mods copy vanilla class
  trinkets wholesale — the Carbineer claims the Crusader's Holy Orders — so treating a
  contested name as unrestricted put class trinkets on the wrong classes. Modded classes may
  only claim what vanilla has not.

Assignment is best-match-first across the whole party, not hero by hero, so the one trinket
that strongly suits rank 3 is not taken by rank 1 first. The pool is consumed as it is handed
out, because a trinket is a physical item: two heroes cannot wear the same one, and no hero
wears one twice. A slot nothing matches is left **empty** rather than filled with something
you do not own.

### What an imported save adds to a suggestion

- **Counts come from your heroes, not your classes.** *Use Save Roster* expands the roster
  one entry per hero, so two Plague Doctors unlock the comps that field two.
- **Heroes busy in town are left out.** A hero locked into the Abbey, Tavern or Sanitarium,
  or missing after a town event, cannot go out this week — `isHeroAvailable`. The switch is
  on by default and only appears when somebody actually is busy.
- **The comp is the build; your heroes are who plays it.** `assignSaveHeroes` keeps the
  comp's skills and trinkets — that is the recommendation — and takes from the save
  everything you cannot choose: the quirks that hero is stuck with, the locked ones, and any
  disease. Handing back a Plague Doctor with blank quirks when yours has Kleptomaniac and
  the Red Plague would be describing somebody else's hero. Where you own two of a class the
  readier hero goes in first (not busy, then more resolve XP, then less stress), and a
  `shift` off the pool is what stops one hero filling both slots of a doubled comp.
- **Trinkets you do not own are reported, and optionally required.** `missingTrinkets` always
  comes back; *Only comps I can fully equip* filters to comps you own every trinket for, and
  when that leaves nothing it says so and suggests the best fit anyway rather than refusing.

`suggestTeam` returns `{ teamName, assignedHeroes, missingTrinkets, warning, fromPreset }` so
the toast can name the heroes that went in.


## Second app: Ranking Engine (`#/ranker`)

Two rankings that answer different questions, behind one mode switch in `RankerApp`:
**Your ranking** is a pairwise "which do you prefer?" ranker (Pub Meeple style), **Generalist**
reads what the comp library actually fields. `src/index.js` is a two-route hash switch: `#/ranker`
renders `components/ranker/RankerApp`, anything else renders the Team Builder. `start_ranker.bat`
boots the dev server and opens that URL.

### Pairwise mode

- **Roster config** — `src/config/rankerRoster.js` holds `DEFAULT_ACTIVE_HEROES` (the 20 vanilla
  classes) and `EXTRA_HEROES`. Adding a hero there also adds all of its skills and camp skills to
  the other two rankings. The in-app Roster panel edits the same list into localStorage and can
  copy it back out as config code.
- **Algorithm** — `src/utils/pairwiseRanker.js` is a bottom-up merge sort driven by human answers,
  ~n·log2(n) comparisons (near the log2(n!) minimum for an exact order). A session is only
  `(shuffled ids, answers[])`; everything else is replayed from it, which is what makes undo and
  resume-after-reload trivial. `estimateComparisons` powers the "estimated N comparisons" prompt.
- **Item pools** — `src/utils/rankerItems.js` turns the roster into hero / skill / camp-skill items.
  Skills and camp skills are deduped by name (Encourage is shared by 19 classes) and carry the list
  of owning classes for on-card context.

### Generalist mode (`src/utils/generalistStats.js`)

A usage ranking over the comp library — heroes, skills, camp skills and trinkets — rather than a
preference ranking. `src/data/generalistIndex.js` memoizes the sweep and builds it on first use,
same as `compIndex`/`recommendations`; the stats module itself is pure and takes the comp entries.

The library is not a neutral census: the Houndmaster holds 95 of 650 hero slots, so counting raw
appearances puts his whole kit above everyone else's before any skill is judged. Two knobs correct
for that, and both are exposed in the UI because they answer different questions:

- **`alpha`, the flatten slider.** Every item carries `picks` (times taken) and `opportunities`
  (slots where a class that *has* it was fielded). `score = picks^(1-alpha) · rate^alpha`, which is
  just `picks / opportunities^alpha` rewritten so the ends read plainly: `alpha=0` is popularity,
  `alpha=1` is adoption rate (class popularity cancels — it is in both numerator and denominator),
  in between interpolates in log space. Flattening only reorders *across* classes; within one
  class's seven skills the denominator is shared, so nothing moves.
- **`unit`, what counts as one observation.** Per hero slot, or per comp *family* — "Dark Ritual"
  alone is 16 of the 163 comps, and counting families makes those 16 worth one.

Rates are shrunk towards the library average with a prior (~5% of the observations, floor 2) so a
5-of-5 does not tie a 50-of-50 at 100%. `flattenSwing` reports how many places an item moves
between `alpha` 0 and 1 — that number *is* the popularity bias being corrected, and the UI shows it
per row. Availability comes from the class definitions, unioned with whatever a comp actually used,
so bad data can never leave `opportunities` below `picks`. Trinkets with no entry in
`HERO_SPECIFIC_TRINKETS` are universal: their opportunity is every slot in the library, which is why
they need the Universal / Class-specific pool filter to compete on comparable terms.
