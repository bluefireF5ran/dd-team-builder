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
const skillFiles = fs.readdirSync(SKILLS);

let copied = 0;

// Read error data for skill files to know what's still missing
const errors = fs.readFileSync('F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\src\\test\\error_data.txt', 'utf8').split('\n');
const errorFilenames = new Set(errors.filter(l => l.startsWith('https://') && l.includes('/modded/skills/')).map(u => u.split('/').pop().trim()));

for (const [className, classData] of Object.entries(classes)) {
    const { modId, skills } = classData;
    if (!modId || skills.length < 2) continue;
    
    const half = Math.floor(skills.length / 2);
    
    // Check: are second-half skills the ones that are missing?
    let secondHalfMissing = 0;
    let firstHalfExist = 0;
    
    for (let i = 0; i < half; i++) {
        const fn = skillToFilename(modId, skills[i]);
        if (skillFiles.includes(fn)) firstHalfExist++;
    }
    for (let i = half; i < skills.length; i++) {
        const fn = skillToFilename(modId, skills[i]);
        if (errorFilenames.has(fn)) secondHalfMissing++;
    }
    
    if (secondHalfMissing === 0 || firstHalfExist === 0) continue;
    
    let classCopied = 0;
    for (let i = half; i < skills.length; i++) {
        const srcIdx = i - half;
        const srcFn = skillToFilename(modId, skills[srcIdx]);
        const dstFn = skillToFilename(modId, skills[i]);
        
        if (!errorFilenames.has(dstFn)) continue;
        
        const srcPath = path.join(SKILLS, srcFn);
        const dstPath = path.join(SKILLS, dstFn);
        
        if (fs.existsSync(srcPath) && !fs.existsSync(dstPath)) {
            fs.copyFileSync(srcPath, dstPath);
            console.log(className + ': ' + skills[srcIdx] + ' → ' + skills[i]);
            classCopied++;
        }
    }
    
    if (classCopied > 0) {
        console.log('  → ' + classCopied + ' copied');
        copied += classCopied;
    }
}

console.log('\nTotal copied: ' + copied);
