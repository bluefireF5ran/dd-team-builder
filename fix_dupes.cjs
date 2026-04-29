const fs = require('fs');
const path = require('path');

const SKILLS = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\dd-team-builder-assets\\images\\modded\\skills';
const MODDED_HEROES_FILE = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\src\\data\\modded_heroes.js';
const WORKSHOP = 'D:\\Program Files (x86)\\Steam\\steamapps\\workshop\\content\\262060';

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

// Read error data for skill files
const errors = fs.readFileSync('F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\src\\test\\error_data.txt', 'utf8').split('\n');
const errorUrls = errors.filter(l => l.startsWith('https://') && l.includes('/modded/skills/'));
const missingSet = new Set(errorUrls.map(u => u.split('/').pop()));

console.log('Missing skill files: ' + missingSet.size);
let totalFixed = 0;

for (const [className, classData] of Object.entries(classes)) {
    const { modId, skills } = classData;
    if (!modId) continue;
    
    // Find missing filenames for this class
    const missingIndices = [];
    for (let i = 0; i < skills.length; i++) {
        const f = skillToFilename(modId, skills[i]);
        if (missingSet.has(f)) missingIndices.push(i);
    }
    if (missingIndices.length === 0) continue;
    
    // Check workshop mod to count ability files
    const modDir = path.join(WORKSHOP, modId);
    let abilityCount = 0;
    if (fs.existsSync(modDir)) {
        const heroesDir = path.join(modDir, 'heroes');
        if (fs.existsSync(heroesDir)) {
            for (const hd of fs.readdirSync(heroesDir, { withFileTypes: true }).filter(d => d.isDirectory())) {
                abilityCount += fs.readdirSync(path.join(heroesDir, hd.name)).filter(f => f.endsWith('.png') && f.includes('.ability.')).length;
            }
        }
    }
    
    const half = Math.floor(skills.length / 2);
    let fixed = 0;
    
    // Try pattern: missing skill at index i might have same icon as skill at index i-half
    for (const idx of missingIndices) {
        // Try copying from a skill in the first half
        if (idx >= half) {
            const sourceIdx = idx - half;
            const sourceFile = skillToFilename(modId, skills[sourceIdx]);
            const destFile = skillToFilename(modId, skills[idx]);
            
            if (skillFiles.has(sourceFile) && !skillFiles.has(destFile)) {
                const srcPath = path.join(SKILLS, sourceFile);
                const dstPath = path.join(SKILLS, destFile);
                fs.copyFileSync(srcPath, dstPath);
                console.log(className + ': copy [' + sourceIdx + '] → [' + idx + ']: ' + skills[sourceIdx] + ' → ' + skills[idx]);
                fixed++;
                missingSet.delete(destFile);
            }
        }
        
        // Try copying from the first skill if it's a single skill
        if (skills.length === idx + 1 && idx > 0) {
            const sourceFile = skillToFilename(modId, skills[0]);
            const destFile = skillToFilename(modId, skills[idx]);
            if (skillFiles.has(sourceFile) && !skillFiles.has(destFile)) {
                fs.copyFileSync(path.join(SKILLS, sourceFile), path.join(SKILLS, destFile));
                console.log(className + ': copy [0] → [' + idx + ']: ' + skills[0] + ' → ' + skills[idx]);
                fixed++;
                missingSet.delete(destFile);
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
