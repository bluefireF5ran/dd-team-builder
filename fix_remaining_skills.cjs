const fs = require('fs');
const path = require('path');

const ASSETS_DIR = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\dd-team-builder-assets';
const MODDED_HEROES_FILE = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\src\\data\\modded_heroes.js';
const WORKSHOP_DIR = 'D:\\Program Files (x86)\\Steam\\steamapps\\workshop\\content\\262060';
const SKILLS_DIR = path.join(ASSETS_DIR, 'images', 'modded', 'skills');

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
        const cls = { modId: modIdMatch[1], skills: [], campSkills: [] };
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

function parseInfoDarkest(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const seen = new Set();
    const skillIds = [];
    const matches = content.matchAll(/combat_skill:\s*\.id\s+"([^"]+)"/g);
    for (const m of matches) {
        if (!seen.has(m[1])) { seen.add(m[1]); skillIds.push(m[1]); }
    }
    return skillIds;
}

function normalize(s) {
    return s.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

const classes = parseModdedHeroes(MODDED_HEROES_FILE);
const skillFiles = new Set(fs.readdirSync(SKILLS_DIR));

let total = 0;

// Read the error file to find which MODIDs we need to fix
const errors = fs.readFileSync('F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\src\\test\\error_data.txt', 'utf8');
const neededModIds = new Set();
const urlLines = errors.split('\n').filter(l => l.startsWith('https://') && l.includes('/modded/skills/'));
for (const url of urlLines) {
    const filename = url.split('/').pop();
    const modId = filename.split('_')[0];
    neededModIds.add(modId);
}

console.log('Remaining MODIDs with skill errors: ' + neededModIds.size);

for (const [className, classData] of Object.entries(classes)) {
    const { modId, skills } = classData;
    if (!modId || !neededModIds.has(modId)) continue;
    
    const modDir = path.join(WORKSHOP_DIR, modId);
    if (!fs.existsSync(modDir)) continue;
    
    const heroesDir = path.join(modDir, 'heroes');
    if (!fs.existsSync(heroesDir)) continue;
    
    const heroDirs = fs.readdirSync(heroesDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
    if (heroDirs.length === 0) continue;
    
    let extracted = 0;
    
    for (const heroDir of heroDirs) {
        const heroPath = path.join(heroesDir, heroDir);
        const files = fs.readdirSync(heroPath);
        
        const infoFiles = files.filter(f => f.endsWith('.info.darkest'));
        const abilityFiles = files.filter(f => f.endsWith('.png') && f.includes('.ability.')).sort();
        
        if (infoFiles.length === 0 || abilityFiles.length === 0) continue;
        
        const allSkillIds = [];
        for (const infoFile of infoFiles) {
            const ids = parseInfoDarkest(path.join(heroPath, infoFile));
            allSkillIds.push(...ids);
        }
        
        if (allSkillIds.length === 0) continue;
        
        // MAP: find which ability file matches which skill ID
        // Ability file names are often abbreviations or the same as skill IDs
        for (let i = 0; i < allSkillIds.length; i++) {
            const skillId = allSkillIds[i];
            const skillIdNorm = normalize(skillId);
            
            // Find matching ability file
            let matchedAbility = null;
            for (const af of abilityFiles) {
                const afName = af.replace(/^[^.]+\.ability\./, '').replace('.png', '');
                const afNorm = normalize(afName);
                if (afNorm === skillIdNorm || skillIdNorm.includes(afNorm) || afNorm.includes(skillIdNorm)) {
                    matchedAbility = path.join(heroPath, af);
                    break;
                }
            }
            
            // Fallback: use positional match
            if (!matchedAbility && i < abilityFiles.length) {
                matchedAbility = path.join(heroPath, abilityFiles[i]);
            }
            
            if (!matchedAbility) continue;
            
            // Try to match this to a skill name
            if (i < skills.length) {
                const skill = skills[i];
                const targetFile = skillToFilename(modId, skill);
                const targetPath = path.join(SKILLS_DIR, targetFile);
                
                if (!skillFiles.has(targetFile) && !fs.existsSync(targetPath)) {
                    fs.copyFileSync(matchedAbility, targetPath);
                    console.log(className + ': ' + skillId + ' → ' + skill);
                    extracted++;
                }
            }
        }
    }
    
    if (extracted > 0) {
        console.log('  → ' + extracted + ' images');
        total += extracted;
    }
}

console.log('\nTotal extracted: ' + total);
