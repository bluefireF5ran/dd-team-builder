#!/usr/bin/env node
/**
 * Re-equips every party a save actually took out, from the trinkets that save
 * owns today, with the tiered re-equip and with the old substitution, and
 * writes a report to judge the choices party by party.
 *
 *   node scripts/benchReequip.js --save testsave/profile_8 [--out report.md]
 *
 * The save's campaign log says who went (see `campaignHistory.js`). Heroes
 * still on the roster keep their current skills; the dead or dismissed take the
 * class's best-in-slot skills for that rank. Past loadouts are not in the save,
 * so the old substitution is fed the class BiS trinkets as the comp's ideals,
 * which is what Suggest Comp hands it for a library comp.
 */
const fs = require('fs');
const path = require('path');
const { loadEsm } = require('./lib/loadEsm');

const ROOT = path.join(__dirname, '..');
const argv = process.argv.slice(2);
const opt = (flag) => {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : undefined;
};
const SAVE = opt('--save');
const OUT = opt('--out');
if (!SAVE || !fs.existsSync(SAVE)) {
  console.error('Usage: node scripts/benchReequip.js --save <profile folder> [--out report.md]');
  process.exit(1);
}

const src = (file) => loadEsm(path.join(ROOT, 'src', file));
const { parseDson } = src('utils/dson.js');
const { parseSaveProfile, SAVE_FILES } = src('utils/saveParser.js');
const { readExpeditions } = src('utils/campaignHistory.js');
const { reequipParty } = src('utils/trinketReequip.js');
const { substituteTrinkets } = src('utils/trinketSubstitution.js');
const { trinketValue } = src('utils/trinketValue.js');
const { heroNeeds } = src('utils/heroNeeds.js');
const { bisLoadout } = src('data/bisIndex.js');

const buffers = Object.fromEntries(
  Object.values(SAVE_FILES)
    .filter((file) => fs.existsSync(path.join(SAVE, file)))
    .map((file) => [file, fs.readFileSync(path.join(SAVE, file))])
);
const profile = parseSaveProfile(buffers);
const owned = profile.ownedTrinkets;
const byGuid = new Map(profile.heroes.map((hero) => [String(hero.guid), hero]));
const expeditions = readExpeditions(parseDson(fs.readFileSync(path.join(SAVE, SAVE_FILES.campaignLog))))
  .filter((e) => e.heroes.length === 4 && e.heroes.every((h) => h.heroClass));

const lines = [];
const out = (text = '') => lines.push(text);
const totals = { newFilled: 0, oldFilled: 0, slots: 0, tiers: {}, negative: 0 };

out(`# Trinket re-equip bench`);
out('');
out(`Save: \`${SAVE}\`, ${owned.length} trinkets owned, ${expeditions.length} four-hero expeditions.`);
out('Ranks follow the order the campaign log lists the party in.');
out('');

expeditions.forEach((expedition, number) => {
  const party = expedition.heroes.map((member, index) => {
    const live = byGuid.get(member.guid);
    const skills = live?.activeSkills?.length
      ? live.activeSkills
      : bisLoadout(member.heroClass, index + 1)?.activeSkills || [];
    return {
      heroClass: member.heroClass,
      name: member.name,
      activeSkills: skills,
      activeCampSkills: [],
      trinket1: '',
      trinket2: '',
      quirks: { positive: [], negative: [] },
      diseases: [],
      live: !!live
    };
  });

  const fresh = reequipParty(party, owned);
  const ideals = party.map((hero, index) => {
    const bis = bisLoadout(hero.heroClass, index + 1);
    return { ...hero, trinket1: bis?.trinket1 || '', trinket2: bis?.trinket2 || '' };
  });
  const old = substituteTrinkets(ideals, owned);

  out(`## ${number + 1}. Week ${expedition.week}, ${expedition.dungeon || 'unknown region'}, level ${expedition.level}, length ${expedition.length}`);
  out('');
  out('| Rank | Hero | Goals | New trinkets (tier: why) | Old substitution |');
  out('|---|---|---|---|---|');
  party.forEach((hero, index) => {
    const needs = heroNeeds(fresh.heroes[index], { party: fresh.heroes, heroIndex: index });
    const cells = ['trinket1', 'trinket2'].map((slot) => {
      const pick = fresh.picks.find((p) => p.index === index && p.slot === slot);
      totals.slots += 1;
      if (!pick) return '_empty_';
      totals.newFilled += 1;
      totals.tiers[pick.tierLabel] = (totals.tiers[pick.tierLabel] || 0) + 1;
      if (pick.value < 0 && pick.tier !== 1) totals.negative += 1;
      return `**${pick.name}** (${pick.tierLabel}, ${pick.value}: ${pick.reasons.slice(0, 2).join('; ') || '-'})`;
    });
    const oldCells = ['trinket1', 'trinket2'].map((slot) => {
      const name = old.heroes[index][slot];
      if (!name) return '_empty_';
      totals.oldFilled += 1;
      return `${name} (${trinketValue(name, needs).value})`;
    });
    const who = `${hero.heroClass}${hero.name ? ` (${hero.name}${hero.live ? '' : ', gone'})` : ''}`;
    out(`| ${index + 1} | ${who} | ${needs?.goals.join(', ') || '-'} | ${cells.join('<br>')} | ${oldCells.join('<br>')} |`);
  });
  out('');
});

const summary = [
  `Slots filled: new ${totals.newFilled}/${totals.slots}, old ${totals.oldFilled}/${totals.slots}.`,
  `New picks by tier: ${Object.entries(totals.tiers).map(([tier, n]) => `${tier} ${n}`).join(', ')}.`,
  `New picks that are net negative on their hero: ${totals.negative}.`
];
lines.splice(4, 0, ...summary, '');

const report = lines.join('\n');
if (OUT) {
  fs.writeFileSync(OUT, report);
  console.log(`wrote ${OUT}`);
}
console.log(summary.join('\n'));
