const fs = require('fs');
const path = require('path');

const MODDED_HEROES_FILE = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\src\\data\\modded_heroes.js';
const SKILLS_DIR = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\dd-team-builder-assets\\images\\modded\\skills';
const VANILLA_SKILLS_DIR = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\dd-team-builder-assets\\images\\skills';
const WORKSHOP_DIR = 'D:\\Program Files (x86)\\Steam\\steamapps\\workshop\\content\\262060';

function parseModdedHeroes(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const classRegex = /'([^']+)':\s*\{/g;
    const classes = {};
    let match;
    while ((match = classRegex.exec(content)) !== null) {
        const className = match[1];
        let depth = 1, pos = classRegex.lastIndex;
        while (depth > 0 && pos < content.length) {
            if (content[pos] === '{') depth++;
            else if (content[pos] === '}') depth--;
            pos++;
        }
        const block = content.substring(match.index, pos);
        const modIdMatch = block.match(/modId:\s*'(\d+)'/);
        if (!modIdMatch) continue;
        const cls = { modId: modIdMatch[1], skills: [] };
        const sIdx = block.indexOf('skills: [');
        if (sIdx !== -1) {
            let sPos = sIdx + 'skills: ['.length, sDepth = 1, sArr = '';
            while (sDepth > 0 && sPos < block.length) {
                const ch = block[sPos];
                if (ch === '[') sDepth++;
                else if (ch === ']') sDepth--;
                if (sDepth > 0) sArr += ch;
                sPos++;
            }
            const items = sArr.match(/'((?:[^'\\]|\\.)*)'/g);
            if (items) for (const item of items) cls.skills.push(item.slice(1, -1).replace(/\\'/g, "'"));
        }
        classes[className] = cls;
    }
    return classes;
}

function skillToFilename(modId, skillName) {
    let name = skillName.toLowerCase().replace(/[^a-z0-9\s\-·♥★•●★☆▼–—]/g, '').replace(/[\s]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    return modId + '_' + name + '.png';
}

const classes = parseModdedHeroes(MODDED_HEROES_FILE);
const skillFiles = new Set(fs.readdirSync(SKILLS_DIR));
const vanillaFiles = new Map();
for (const f of fs.readdirSync(VANILLA_SKILLS_DIR)) {
    if (f.endsWith('.png')) vanillaFiles.set(f.replace('.png', ''), path.join(VANILLA_SKILLS_DIR, f));
}

// Check which classes have ANY remaining missing skills
console.log('=== Remaining missing skills (that could match vanilla icons) ===\n');

const reworkClasses = [
    'Bounty Hunter (Rework)', 'Grave Robber (Rework)', 'Man At Arms',
    'Occultist (Rework)', 'Jester (Rework)', 'Leper (Rework)',
    'Initiator', 'Lilith (Rework)', 'Octopus',
    'Ringmaster', 'Floss', 'Swordmaiden',
    'Illusionist', 'Illusionist (3631649848)',
    'Unicorn (Rework) (3611958999)'
];

for (const [className, cls] of Object.entries(classes)) {
    const missing = [];
    for (const s of cls.skills) {
        if (!skillFiles.has(skillToFilename(cls.modId, s))) missing.push(s);
    }
    if (missing.length === 0) continue;
    
    // Check workshop for info.darkest with skill IDs
    const modDir = path.join(WORKSHOP_DIR, cls.modId);
    let skillIds = [];
    if (fs.existsSync(modDir)) {
        const heroesDir = path.join(modDir, 'heroes');
        if (fs.existsSync(heroesDir)) {
            const dirs = fs.readdirSync(heroesDir, { withFileTypes: true }).filter(d => d.isDirectory());
            for (const hd of dirs) {
                const infoFiles = fs.readdirSync(path.join(heroesDir, hd.name)).filter(f => f.endsWith('.info.darkest'));
                for (const infoFile of infoFiles) {
                    const content = fs.readFileSync(path.join(heroesDir, hd.name, infoFile), 'utf8');
                    const seen = new Set();
                    const regex = /combat_skill:\s*\.id\s+"([^"]+)"/g;
                    const matches = content.matchAll(regex);
                    for (const m of matches) if (!seen.has(m[1])) { seen.add(m[1]); skillIds.push(m[1]); }
                }
            }
        }
    }
    
    if (missing.length > 0) {
        console.log(className + ' (modId: ' + cls.modId + ') - ' + missing.length + ' missing:');
        console.log('  Skills: ' + missing.join(', '));
        if (skillIds.length > 0) {
            console.log('  Workshop skill IDs: ' + skillIds.join(', '));
            // Check which IDs match vanilla icons
            const matching = skillIds.filter(id => vanillaFiles.has(id));
            console.log('  Vanilla icons available for: ' + (matching.length > 0 ? matching.join(', ') : 'NONE'));
        }
        console.log();
    }
}
