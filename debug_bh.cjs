const fs = require('fs');
const path = require('path');

const vd = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\dd-team-builder-assets\\images\\skills';
const f = fs.readdirSync(vd).filter(x => x.toLowerCase().includes('collect_bounty'));
console.log('collect_bounty exists in vanilla:', f.length > 0, f);

const md = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\dd-team-builder-assets\\images\\modded\\skills';
const mfiles = new Set(fs.readdirSync(md));
const expected = '3531691154_collect_bounty.png';
console.log('Expected file exists in modded:', mfiles.has(expected));

// Check info.darkest parsing
const darkest = fs.readFileSync('D:\\Program Files (x86)\\Steam\\steamapps\\workshop\\content\\262060\\3531691154\\heroes\\bounty_hunter\\bounty_hunter.info.darkest', 'utf8');
const seen = new Set();
const regex = /combat_skill:\s*\.id\s+"([^"]+)"/g;
const matches = darkest.matchAll(regex);
const ids = [];
for (const m of matches) {
    if (!seen.has(m[1])) {
        seen.add(m[1]);
        ids.push(m[1]);
    }
}
console.log('Skill IDs from info.darkest:', ids);
console.log('Number of unique skills:', ids.length);
