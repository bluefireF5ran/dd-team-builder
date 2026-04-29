const fs = require('fs');
const path = require('path');

// Test with Lawbringer
const content = fs.readFileSync('D:\\Program Files (x86)\\Steam\\steamapps\\workshop\\content\\262060\\3063258394\\heroes\\lawbringer_fh\\lawbringer_fh.info.darkest', 'utf8');
const regex = /combat_skill:\s*\.id\s+"([^"]+)"/g;
let m;
const ids = [];
while ((m = regex.exec(content)) !== null) {
    ids.push(m[1]);
}
console.log('Raw skill IDs (' + ids.length + '):');
ids.forEach((id, i) => {
    const filtered = [...new Set(ids.slice(0, i+1))];
    if (filtered.length === i+1) console.log('  [' + (filtered.length-1) + '] ' + id);
});

// Also check ability files
const heroPath = 'D:\\Program Files (x86)\\Steam\\steamapps\\workshop\\content\\262060\\3063258394\\heroes\\lawbringer_fh';
const abilityFiles = fs.readdirSync(heroPath).filter(f => f.endsWith('.png') && f.includes('.ability.'));
console.log('\nAbility files:');
abilityFiles.forEach(f => {
    const name = f.replace(/^[^.]+\.ability\./, '').replace('.png', '');
    console.log('  ' + name);
});

// Now check what's missing
const SKILLS = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\dd-team-builder-assets\\images\\modded\\skills';
const skillFiles = new Set(fs.readdirSync(SKILLS));
const expectedSkills = ['Ad Mortem Inimicus', 'Drunken Convalescence', 'Rampage', 'Fierce Push', 'Long Arm Throw', 'Penetrate', 'Fire Bullet', 'Bring to Justice', 'Sentence to Death'];
console.log('\nExpected vs existing:');
const uniqueIds = [...new Set(ids)];
for (let i = 0; i < expectedSkills.length; i++) {
    const expectedFile = '3063258394_' + expectedSkills[i].toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') + '.png';
    const exists = skillFiles.has(expectedFile);
    const abilityName = i < uniqueIds.length ? uniqueIds[i] : 'N/A';
    const matchingAbility = abilityFiles.find(f => {
        const afName = f.replace(/^[^.]+\.ability\./, '').replace('.png', '');
        return afName.toLowerCase() === abilityName.toLowerCase();
    });
    console.log('  [' + i + '] ' + expectedSkills[i] + ' → exists=' + (exists ? 'YES' : 'NO') + ' ability=' + abilityName + ' file=' + (matchingAbility ? 'YES' : 'NO'));
}
