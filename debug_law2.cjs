const fs = require('fs');
const path = require('path');

const SKILLS = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\dd-team-builder-assets\\images\\modded\\skills';
const WORKSHOP = 'D:\\Program Files (x86)\\Steam\\steamapps\\workshop\\content\\262060';

// Test Lawbringer specifically
const modId = '3063258394';
const skills = ['Ad Mortem Inimicus', 'Drunken Convalescence', 'Rampage', 'Fierce Push', 'Long Arm Throw', 'Penetrate', 'Fire Bullet', 'Bring to Justice', 'Sentence to Death'];
const missingSet = new Set([
    '3063258394_drunken_convalescence.png',
    '3063258394_rampage.png',
    '3063258394_fierce_push.png',
    '3063258394_long_arm_throw.png',
    '3063258394_penetrate.png',
    '3063258394_fire_bullet.png',
    '3063258394_sentence_to_death.png',
    '3063258394_bring_to_justice.png'
]);

const heroesDir = path.join(WORKSHOP, modId, 'heroes');
const heroDirs = fs.readdirSync(heroesDir, { withFileTypes: true }).filter(d => d.isDirectory());

for (const hd of heroDirs) {
    const hp = path.join(heroesDir, hd.name);
    const files = fs.readdirSync(hp);
    const abilityFiles = files.filter(f => f.endsWith('.png') && f.includes('.ability.')).sort();
    const infoFiles = files.filter(f => f.endsWith('.info.darkest'));
    
    console.log('Hero dir: ' + hd.name);
    console.log('Ability files (' + abilityFiles.length + '): ' + abilityFiles.join(', '));
    
    for (const inf of infoFiles) {
        const content = fs.readFileSync(path.join(hp, inf), 'utf8');
        const seen = new Set();
        const ids = [];
        const regex = /combat_skill:\s*\.id\s+"([^"]+)"/g;
        let m;
        while ((m = regex.exec(content)) !== null) {
            if (!seen.has(m[1])) { seen.add(m[1]); ids.push(m[1]); }
        }
        console.log('Skill IDs (' + ids.length + '): ' + ids.join(', '));
    }
    
    console.log('Skills array (' + skills.length + '): ' + skills.join(', '));
    console.log('Ability vs Skill mapping:');
    for (let i = 0; i < Math.max(abilityFiles.length, skills.length); i++) {
        const af = i < abilityFiles.length ? abilityFiles[i] : '(none)';
        const sk = i < skills.length ? skills[i] : '(none)';
        console.log('  [' + i + '] ' + af + ' → ' + sk + ' (needed: ' + (missingSet.has('3063258394_' + sk.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_') + '.png') ? 'YES' : 'NO') + ')');
    }
}
