# Data migration scripts

One-shot Node scripts used to build the hero, skill and trinket data in `src/data/` from the
game files and from Steam Workshop mods.

They are kept for provenance — they document where the data came from and how it was
reconciled — but they are **not part of the build**. Nothing in `src/` imports them, and
`npm start` / `npm run build` never touch them. Several were written to fix one specific
inconsistency and have already served their purpose.

Rough order of use:

| Stage | Scripts |
|---|---|
| Extraction | `extract_from_workshop`, `extract_positional`, `extract_v2`, `extract_v3` |
| Reconciliation against vanilla | `copy_vanilla`, `check_vanilla_match`, `final_vanilla_pass` |
| Duplicate handling | `copy_dupes`, `fix_dupes` |
| Naming and images | `fix_skill_names`, `fix_rename_batch`, `fix_images`, `fix_sorted` |
| Verification | `check_remaining`, `final_check`, `final_remaining`, `_check_mods.ps1` |
| Debugging specific heroes | `debug_bh`, `debug_law*` |

The scraper that feeds these lives in a separate repository:
[dd-team-builder-assets](https://github.com/bluefireF5ran/dd-team-builder-assets).
