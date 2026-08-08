const fs = require('fs');
const path = require('path');

const MODDED_HEROES_FILE = path.join('F:', 'Personal_Fran', 'Programas', 'Softwares', 'nextjs_projects', 'dd-team-builder', 'src', 'data', 'modded_heroes.js');
const SKILLS_DIR = path.join('F:', 'Personal_Fran', 'Programas', 'Softwares', 'nextjs_projects', 'dd-team-builder', 'dd-team-builder-assets', 'images', 'modded', 'skills');

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
const workshopDir = 'D:\\Program Files (x86)\\Steam\\steamapps\\workshop\\content\\262060';

console.log('=== CLASSES WITH ALL SKILLS STILL MISSING ===\n');

for (const [name, cls] of Object.entries(classes)) {
    let missing = [];
    for (const s of cls.skills) {
        const f = skillToFilename(cls.modId, s);
        if (!skillFiles.has(f)) missing.push(s);
    }
    if (missing.length === cls.skills.length && missing.length > 0) {
        const hasWorkshop = fs.existsSync(path.join(workshopDir, cls.modId));
        console.log(name + ' (modId: ' + cls.modId + ')' + (hasWorkshop ? ' [workshop available]' : ' [NO workshop]'));
        for (const m of missing) console.log('  - ' + m);
        console.log();
    }
}
