/**
 * The handful of internal ids a save file uses that the app cannot derive from
 * the display name.
 *
 * A Darkest Dungeon save stores everything by internal id — `zealous_accusation`,
 * `god_fearing`, `man_at_arms` — and almost all of them are the display name
 * with underscores for spaces, so `nameKey` matches them for free. Two cheap
 * rules cover nearly the whole roster:
 *
 *   - the key itself:            `zealous_accusation` -> "Zealous Accusation"
 *   - the key with spaces gone:  `grape_shot_blast`   -> "Grapeshot Blast"
 *
 * What is left over is not a spelling difference but a **rename**: the game
 * renamed the skill in the string table and kept the original id in saves, so
 * no rule can bridge the two.
 *
 * **These five are no longer the whole list.** This file once claimed they
 * were, and a real unmodded save disproved it with 74 names left unmatched —
 * `target_tag` (Mark for Death), `heroic_end` (Finale), `accurate` (Deadly),
 * `collector_1` (Dismas' Head). The complete list is generated from the game's
 * own string tables into `gameIdNames.js` (`scripts/importGameIds.js`), and the
 * parser consults it after these. They stay because they were verified by hand
 * and `first_aid` needs the class-aware rule described below.
 *
 * A rename is only applied when the class actually has that skill, so a flat
 * map cannot mis-resolve an id another class happens to reuse. Anything still
 * unmatched is reported by the parser rather than guessed at — see
 * `parseSaveProfile`'s `unmatched`.
 */

/** Combat skill ids the game renamed after shipping. */
export const SKILL_ID_RENAMES = {
  opened_vein: 'Open Vein',
  take_aim: 'Tracking Shot',
  disruptive_curse: 'Vulnerability Hex'
};

/**
 * Camp skill ids the game renamed after shipping.
 *
 * `first_aid` is the odd one: it is a single skill the app knows under two
 * names, because the two halves of `skillEffects.js` came from different
 * sources — the wiki CSV calls it "Wound Care" for the eighteen classes it
 * covers, and Fire's Edge, rendered from the install, calls it "First Aid" for
 * the Duelist and the Runaway. Both spellings are on the roster with the same
 * effect, so the class decides: the direct lookup wins where a class lists
 * "First Aid", and everyone else falls through to the rename.
 */
export const CAMP_SKILL_ID_RENAMES = {
  first_aid: 'Wound Care',
  preventative_medicine: 'The Cure'
};

/** Trinket ids the game renamed after shipping. */
export const TRINKET_ID_RENAMES = {};
