const fs = require('fs');
const path = require('path');

const ASSETS_DIR = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\dd-team-builder-assets';
const MODDED_HEROES_FILE = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\src\\data\\modded_heroes.js';
const WORKSHOP_DIR = 'D:\\Program Files (x86)\\Steam\\steamapps\\workshop\\content\\262060';
const SKILLS_DIR = path.join(ASSETS_DIR, 'images', 'modded', 'skills');
const VANILLA_SKILLS_DIR = path.join(ASSETS_DIR, 'images', 'skills');
const CAMP_SKILLS_DIR = path.join(ASSETS_DIR, 'images', 'modded', 'camp_skills');

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
        const cIdx = block.indexOf('campSkills: [');
        if (cIdx !== -1) {
            let cPos = cIdx + 'campSkills: ['.length, cDepth = 1, cArr = '';
            while (cDepth > 0 && cPos < block.length) {
                const ch = block[cPos];
                if (ch === '[') cDepth++;
                else if (ch === ']') cDepth--;
                if (cDepth > 0) cArr += ch;
                cPos++;
            }
            const items = cArr.match(/'((?:[^'\\]|\\.)*)'/g);
            if (items) for (const item of items) cls.campSkills.push(item.slice(1, -1).replace(/\\'/g, "'"));
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
    // Get unique combat skill IDs - they appear once per level (5 levels each)
    const seen = new Set();
    const skillIds = [];
    const matches = content.matchAll(/combat_skill:\s*\.id\s+"([^"]+)"/g);
    for (const m of matches) {
        if (!seen.has(m[1])) {
            seen.add(m[1]);
            skillIds.push(m[1]);
        }
    }
    const campSeen = new Set();
    const campSkillIds = [];
    const campMatches = content.matchAll(/camping_skill:\s*\.id\s+"([^"]+)"/g);
    for (const m of campMatches) {
        if (!campSeen.has(m[1])) {
            campSeen.add(m[1]);
            campSkillIds.push(m[1]);
        }
    }
    return { skillIds, campSkillIds };
}

const classes = parseModdedHeroes(MODDED_HEROES_FILE);
const skillFiles = new Set(fs.readdirSync(SKILLS_DIR));
const campFiles = new Set(fs.readdirSync(CAMP_SKILLS_DIR));
const vanillaSkills = new Map();
for (const f of fs.readdirSync(VANILLA_SKILLS_DIR)) {
    if (f.endsWith('.png')) vanillaSkills.set(f.replace('.png', '').toLowerCase(), path.join(VANILLA_SKILLS_DIR, f));
}

function normalize(s) {
    return s.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

let copied = 0;

for (const [className, classData] of Object.entries(classes)) {
    const { modId, skills } = classData;
    if (!modId) continue;
    
    const modDir = path.join(WORKSHOP_DIR, modId);
    if (!fs.existsSync(modDir)) continue;
    
    const heroesDir = path.join(modDir, 'heroes');
    if (!fs.existsSync(heroesDir)) continue;
    
    const heroDirs = fs.readdirSync(heroesDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
    if (heroDirs.length === 0) continue;
    
    for (const heroDir of heroDirs) {
        const heroPath = path.join(heroesDir, heroDir);
        const files = fs.readdirSync(heroPath);
        const infoFiles = files.filter(f => f.endsWith('.info.darkest'));
        if (infoFiles.length === 0) continue;
        
        const allInfo = parseInfoDarkest(path.join(heroPath, infoFiles[0]));
        if (allInfo.skillIds.length === 0) continue;
        
        // Check which skills are still missing
        const missingIndices = [];
        for (let i = 0; i < skills.length; i++) {
            if (!skillFiles.has(skillToFilename(modId, skills[i]))) missingIndices.push(i);
        }
        if (missingIndices.length === 0) continue;
        
        // Map by name similarity: find which skill ID best matches each skill name
        for (const idx of missingIndices) {
            const skill = skills[idx];
            const targetFile = skillToFilename(modId, skill);
            
            // Find the best matching vanilla icon by skill ID name
            let bestMatch = null;
            let bestScore = 0;
            
            for (const skillId of allInfo.skillIds) {
                // Check if vanilla icon exists for this skill ID
                const vanillaKey = skillId.toLowerCase();
                if (!vanillaSkills.has(vanillaKey)) continue;
                
                // Check similarity between skill ID and skill display name
                const normSkill = normalize(skill);
                const normId = normalize(skillId);
                
                let score = 0;
                if (normId === normSkill) score = 2;
                else if (normId.includes(normSkill) || normSkill.includes(normId)) score = 1.5;
                else {
                    const wordsS = normSkill.split(/[_\s]+/).filter(w => w.length > 2);
                    const wordsI = normId.split(/[_\s]+/).filter(w => w.length > 2);
                    let common = 0;
                    for (const ws of wordsS) for (const wi of wordsI) {
                        if (ws === wi || ws.includes(wi) || wi.includes(ws)) { common++; break; }
                    }
                    if (wordsS.length > 0 && wordsI.length > 0) score = common / Math.max(wordsS.length, wordsI.length);
                }
                
                if (score > bestScore) { bestScore = score; bestMatch = skillId; }
            }
            
            if (bestMatch && bestScore >= 0.4) {
                const vanillaPath = vanillaSkills.get(bestMatch.toLowerCase());
                const targetPath = path.join(SKILLS_DIR, targetFile);
                if (!fs.existsSync(targetPath)) {
                    fs.copyFileSync(vanillaPath, targetPath);
                    console.log(className + ': "' + bestMatch + '" (score:' + bestScore.toFixed(2) + ') → "' + skill + '"');
                    copied++;
                }
            }
        }
    }
}

console.log('\nCopied ' + copied + ' skill icons from vanilla');
