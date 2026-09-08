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
 * no rule can bridge the two. All 213 quirks and all 80 camp skills but one
 * come through the rules above; only these five need writing down.
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
