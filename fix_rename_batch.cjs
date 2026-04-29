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

function parseUniqueSkillIds(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const seen = new Set();
    const ids = [];
    const regex = /combat_skill:\s*\.id\s+"([^"]+)"/g;
    let m;
    while ((m = regex.exec(content)) !== null) {
        if (!seen.has(m[1])) { seen.add(m[1]); ids.push(m[1]); }
    }
    return ids;
}

const classes = parseModdedHeroes(MODDED_HEROES_FILE);
const skillFiles = fs.readdirSync(SKILLS);

// Read error file for still-missing skill URLs
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
    if (heroDirs.length === 0) continue;
    
    // Count what's still missing for this class
    const classMissing = skills.filter(s => missingSet.has(skillToFilename(modId, s)));
    if (classMissing.length === 0) continue;
    
    let fixed = 0;
    
    for (const hd of heroDirs) {
        const hp = path.join(heroesDir, hd.name);
        const files = fs.readdirSync(hp);
        const infoFiles = files.filter(f => f.endsWith('.info.darkest'));
        const abilityFiles = files.filter(f => f.endsWith('.png') && f.includes('.ability.')).sort();
        
        if (infoFiles.length === 0) continue;
        
        const skillIds = parseUniqueSkillIds(path.join(hp, infoFiles[0]));
        if (skillIds.length === 0) continue;
        
        // For each remaining skill, find the corresponding ability file
        for (let i = 0; i < skills.length; i++) {
            const skill = skills[i];
            const expectedFile = skillToFilename(modId, skill);
            if (!missingSet.has(expectedFile)) continue;
            
            // Get the ability file at this position (if available)
            if (i < abilityFiles.length) {
                const srcPath = path.join(hp, abilityFiles[i]);
                const dstPath = path.join(SKILLS, expectedFile);
                if (fs.existsSync(srcPath) && !fs.existsSync(dstPath)) {
                    fs.copyFileSync(srcPath, dstPath);
                    console.log(className + ': [' + i + '] → ' + skill);
                    fixed++;
                    missingSet.delete(expectedFile);
                }
            } else if (skillIds.length > 0) {
                // Try to find by skill ID matching
                const sid = i < skillIds.length ? skillIds[i] : null;
                if (sid) {
                    // Check if any ability file matches this skill ID
                    const sidNorm = sid.toLowerCase().replace(/[^a-z0-9]/g, '');
                    for (const af of abilityFiles) {
                        const afName = af.replace(/^[^.]+\.ability\./, '').replace('.png', '');
                        const afNorm = afName.toLowerCase().replace(/[^a-z0-9]/g, '');
                        if (afNorm === sidNorm || sidNorm.includes(afNorm) || afNorm.includes(sidNorm)) {
                            const dstPath = path.join(SKILLS, expectedFile);
                            if (!fs.existsSync(dstPath)) {
                                fs.copyFileSync(path.join(hp, af), dstPath);
                                console.log(className + ': ' + sid + ' → ' + skill);
                                fixed++;
                                missingSet.delete(expectedFile);
                            }
                            break;
                        }
                    }
                }
            }
        }
    }
    
    if (fixed > 0) {
        console.log('  → ' + fixed + ' fixed for ' + className);
        totalFixed += fixed;
    }
}

console.log('\nTotal fixed: ' + totalFixed);
console.log('Remaining skill errors: ' + missingSet.size);
