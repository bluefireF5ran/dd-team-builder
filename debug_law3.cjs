const fs = require('fs');
const path = require('path');

const SKILLS = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\dd-team-builder-assets\\images\\modded\\skills';
const MODDED_HEROES_FILE = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\src\\data\\modded_heroes.js';

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
const skillFiles = new Set(fs.readdirSync(SKILLS));

// Debug Lawbringer specifically
const law = classes['Lawbringer'];
console.log('Lawbringer modId: ' + law.modId);
console.log('Skills (' + law.skills.length + '): ' + law.skills.join(', '));

// Check what files exist
for (let i = 0; i < law.skills.length; i++) {
    const fn = skillToFilename(law.modId, law.skills[i]);
    console.log('  [' + i + '] ' + fn + ' exists=' + skillFiles.has(fn));
}

// Now check half mapping
const half = Math.floor(law.skills.length / 2);
console.log('\nHalf: ' + half);
for (let i = half; i < law.skills.length; i++) {
    const srcIdx = i - half;
    const srcFn = skillToFilename(law.modId, law.skills[srcIdx]);
    const dstFn = skillToFilename(law.modId, law.skills[i]);
    console.log('  [' + srcIdx + '] ' + srcFn + ' → [' + i + '] ' + dstFn + ' | srcExists=' + skillFiles.has(srcFn) + ' dstExists=' + skillFiles.has(dstFn));
}
