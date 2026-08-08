const fs = require('fs');
const path = require('path');

const ASSETS_DIR = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\dd-team-builder-assets';
const MODDED_HEROES_FILE = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\src\\data\\modded_heroes.js';
const WORKSHOP_DIR = 'D:\\Program Files (x86)\\Steam\\steamapps\\workshop\\content\\262060';
const SKILLS_DIR = path.join(ASSETS_DIR, 'images', 'modded', 'skills');
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

function normalize(s) {
    return s.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

function parseInfoDarkest(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const skillIds = [];
    const matches = content.matchAll(/combat_skill:\s*\.id\s+"([^"]+)"/g);
    for (const m of matches) skillIds.push(m[1]);
    const campSkillIds = [];
    const campMatches = content.matchAll(/camping_skill:\s*\.id\s+"([^"]+)"/g);
    for (const m of campMatches) campSkillIds.push(m[1]);
    return { skillIds: [...new Set(skillIds)], campSkillIds: [...new Set(campSkillIds)] };
}

function wordSimilarity(wordA, wordB) {
    if (wordA === wordB) return 1;
    if (wordA.includes(wordB) || wordB.includes(wordA)) return 0.9;
    // Check common prefix of 3+ chars
    for (let len = Math.min(wordA.length, wordB.length); len >= 3; len--) {
        if (wordA.slice(0, len) === wordB.slice(0, len)) return 0.7 + (len / Math.max(wordA.length, wordB.length)) * 0.2;
    }
    return 0;
}

function similarity(a, b) {
    const na = normalize(a);
    const nb = normalize(b);
    if (na === nb) return 2;
    if (na.includes(nb) || nb.includes(na)) return 1 + Math.min(na.length, nb.length) / Math.max(na.length, nb.length);
    
    const wordsA = na.split(/[_\s]+/).filter(w => w.length > 1);
    const wordsB = nb.split(/[_\s]+/).filter(w => w.length > 1);
    if (wordsA.length === 0 || wordsB.length === 0) return 0;
    
    let bestTotal = 0;
    for (const wa of wordsA) {
        let bestWordScore = 0;
        for (const wb of wordsB) {
            bestWordScore = Math.max(bestWordScore, wordSimilarity(wa, wb));
        }
        bestTotal += bestWordScore;
    }
    
    return bestTotal / Math.max(wordsA.length, wordsB.length);
}

function findAbilityFileForSkillId(skillId, abilityFiles) {
    const normalizedId = normalize(skillId);
    
    // Exact match
    const exact = abilityFiles.find(af => normalize(af.abilityName) === normalizedId);
    if (exact) return exact;
    
    // Ability name is suffix of skill ID (e.g., "Flank" in "Clones_Flank")
    for (const af of abilityFiles) {
        const afNorm = normalize(af.abilityName);
        if (normalizedId.endsWith(afNorm) || normalizedId.startsWith(afNorm)) return af;
    }
    
    // Partial match
    let best = null, bestScore = 0;
    for (const af of abilityFiles) {
        const score = similarity(skillId, af.abilityName);
        if (score > bestScore) { bestScore = score; best = af; }
    }
    return bestScore > 0.5 ? best : null;
}

function main() {
    console.log('Loading modded_heroes.js...');
    const classes = parseModdedHeroes(MODDED_HEROES_FILE);
    
    const skillFiles = new Set(fs.readdirSync(SKILLS_DIR));
    const campSkillFiles = new Set(fs.readdirSync(CAMP_SKILLS_DIR));
    
    let totalExtracted = 0;
    
    for (const [className, classData] of Object.entries(classes)) {
        const { modId, skills, campSkills } = classData;
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
            
            const abilityFiles = files
                .filter(f => f.endsWith('.png') && f.includes('.ability.'))
                .map(f => ({ fullPath: path.join(heroPath, f), abilityName: f.replace(/^[^.]+\.ability\./, '').replace('.png', '') }));
            
            if (abilityFiles.length === 0) continue;
            
            const infoFiles = files.filter(f => f.endsWith('.info.darkest'));
            if (infoFiles.length === 0) continue;
            
            const allInfo = { skillIds: [], campSkillIds: [] };
            for (const infoFile of infoFiles) {
                const info = parseInfoDarkest(path.join(heroPath, infoFile));
                allInfo.skillIds.push(...info.skillIds);
                allInfo.campSkillIds.push(...info.campSkillIds);
            }
            allInfo.skillIds = [...new Set(allInfo.skillIds)];
            allInfo.campSkillIds = [...new Set(allInfo.campSkillIds)];
            
            // Check missing skills
            const missingSkills = skills.filter(s => !skillFiles.has(skillToFilename(modId, s)));
            if (missingSkills.length === 0) continue;
            
            let extracted = 0;
            
            // For each missing skill, try to find the corresponding ability file via skill ID
            for (const skill of missingSkills) {
                const targetPath = path.join(SKILLS_DIR, skillToFilename(modId, skill));
                if (fs.existsSync(targetPath)) continue;
                
                // Find the best matching combat skill ID
                let bestSkillId = null, bestScore = 0;
                for (const sid of allInfo.skillIds) {
                    const score = similarity(skill, sid);
                    if (score > bestScore) { bestScore = score; bestSkillId = sid; }
                }
                
                if (bestSkillId && bestScore >= 0.35) {
                    const abilityFile = findAbilityFileForSkillId(bestSkillId, abilityFiles);
                    if (abilityFile) {
                        fs.copyFileSync(abilityFile.fullPath, targetPath);
                        console.log(`${className}: "${bestSkillId}" (score:${bestScore.toFixed(2)}) → "${skill}"`);
                        extracted++;
                    }
                }
            }
            
            if (extracted > 0) {
                console.log(`  → ${extracted} extracted from ${heroDir}`);
                totalExtracted += extracted;
            }
        }
    }
    
    console.log(`\nTotal extracted: ${totalExtracted}`);
}

main();
