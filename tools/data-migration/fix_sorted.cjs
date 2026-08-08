const fs = require('fs');
const path = require('path');

const WORKSHOP = 'D:\\Program Files (x86)\\Steam\\steamapps\\workshop\\content\\262060';
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

// Numeric value mapping for ability file names
const numMap = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
    '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'i': 1, 'ii': 2, 'iii': 3, 'iv': 4, 'v': 5, 'vi': 6, 'vii': 7, 'viii': 8, 'ix': 9, 'x': 10
};

function sortAbilityFiles(files) {
    return files.sort((a, b) => {
        const nameA = a.replace(/^[^.]+\.ability\./, '').replace('.png', '');
        const nameB = b.replace(/^[^.]+\.ability\./, '').replace('.png', '');
        const numA = numMap[nameA.toLowerCase()] || 999;
        const numB = numMap[nameB.toLowerCase()] || 999;
        return numA - numB;
    });
}

const classes = parseModdedHeroes(MODDED_HEROES_FILE);

const errors = fs.readFileSync('F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\src\\test\\error_data.txt', 'utf8').split('\n');
const errorUrls = errors.filter(l => l.startsWith('https://') && l.includes('/modded/skills/'));
const missingSet = new Set(errorUrls.map(u => u.split('/').pop()));

console.log('Missing skill files: ' + missingSet.size);
let totalFixed = 0;

for (const [className, classData] of Object.entries(classes)) {
    const { modId, skills } = classData;
    if (!modId) continue;
    
    const modDir = path.join(WORKSHOP, modId);
    if (!fs.existsSync(modDir)) continue;
    
    const heroesDir = path.join(modDir, 'heroes');
    if (!fs.existsSync(heroesDir)) continue;
    
    const heroDirs = fs.readdirSync(heroesDir, { withFileTypes: true }).filter(d => d.isDirectory());
    
    let fixed = 0;
    
    for (const hd of heroDirs) {
        const hp = path.join(heroesDir, hd.name);
        const files = fs.readdirSync(hp);
        const abilityFiles = sortAbilityFiles(files.filter(f => f.endsWith('.png') && f.includes('.ability.')));
        if (abilityFiles.length === 0) continue;
        
        // Map: for each ability file (sorted by numeric name), copy to the corresponding skill
        for (let i = 0; i < abilityFiles.length && i < skills.length; i++) {
            const skill = skills[i];
            const expectedFile = skillToFilename(modId, skill);
            if (!missingSet.has(expectedFile)) continue;
            
            const srcPath = path.join(hp, abilityFiles[i]);
            const dstPath = path.join(SKILLS, expectedFile);
            if (fs.existsSync(srcPath) && !fs.existsSync(dstPath)) {
                fs.copyFileSync(srcPath, dstPath);
                console.log(className + ': ' + abilityFiles[i].replace(/^[^.]+\.ability\./, '').replace('.png', '') + ' → ' + skill);
                fixed++;
                missingSet.delete(expectedFile);
            }
        }
    }
    
    if (fixed > 0) {
        console.log('  → ' + fixed + ' fixed');
        totalFixed += fixed;
    }
}

console.log('\nTotal fixed: ' + totalFixed);
console.log('Remaining skill errors: ' + missingSet.size);
