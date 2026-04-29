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

function similarity(a, b) {
    const na = normalize(a);
    const nb = normalize(b);
    if (na === nb) return 2;
    if (na.includes(nb) || nb.includes(na)) return 1 + Math.min(na.length, nb.length) / Math.max(na.length, nb.length);
    
    const wordsA = na.split(/[_\s]+/).filter(w => w.length > 2);
    const wordsB = nb.split(/[_\s]+/).filter(w => w.length > 2);
    if (wordsA.length === 0 || wordsB.length === 0) return 0;
    
    let common = 0;
    for (const wa of wordsA) {
        for (const wb of wordsB) {
            if (wa === wb || wa.includes(wb) || wb.includes(wa)) {
                common++;
                break;
            }
        }
    }
    
    return common / Math.max(wordsA.length, wordsB.length);
}

function findBestMatch(name, candidates) {
    let best = null, bestScore = 0;
    for (const c of candidates) {
        const score = similarity(name, c.name);
        if (score > bestScore) { bestScore = score; best = c; }
    }
    return bestScore >= 0.35 ? best : null;
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
        
        // Check if mod exists in workshop
        const modDir = path.join(WORKSHOP_DIR, modId);
        if (!fs.existsSync(modDir)) continue;
        
        const heroesDir = path.join(modDir, 'heroes');
        if (!fs.existsSync(heroesDir)) continue;
        const heroDirs = fs.readdirSync(heroesDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
        if (heroDirs.length === 0) continue;
        
        // Gather ability files and skill IDs from ALL hero subdirs
        const allAbilityFiles = [];
        const allSkillIds = [];
        const allCampSkillIds = [];
        
        for (const heroDir of heroDirs) {
            const heroPath = path.join(heroesDir, heroDir);
            const files = fs.readdirSync(heroPath);
            
            // Find ability icon files
            for (const file of files) {
                if (file.endsWith('.png') && file.includes('.ability.')) {
                    const abilityName = file.replace(/^[^.]+\.ability\./, '').replace('.png', '');
                    allAbilityFiles.push({ fullPath: path.join(heroPath, file), abilityName, heroDir });
                }
            }
            
            // Parse info.darkest files
            const infoFiles = files.filter(f => f.endsWith('.info.darkest'));
            for (const infoFile of infoFiles) {
                const info = parseInfoDarkest(path.join(heroPath, infoFile));
                allSkillIds.push(...info.skillIds);
                allCampSkillIds.push(...info.campSkillIds);
            }
        }
        
        if (allAbilityFiles.length === 0) continue;
        
        // Check which skills are still missing
        const missingSkills = skills.filter(s => !skillFiles.has(skillToFilename(modId, s)));
        const missingCamp = campSkills.filter(s => !campSkillFiles.has(skillToFilename(modId, s)));
        
        if (missingSkills.length === 0 && missingCamp.length === 0) continue;
        
        const uniqueSkillIds = [...new Set(allSkillIds)];
        const uniqueCampSkillIds = [...new Set(allCampSkillIds)];
        
        let classExtracted = 0;
        
        if (missingSkills.length > 0) {
            // Build candidate list from skill IDs
            const candidates = uniqueSkillIds.map(id => ({ name: id, type: 'skill_id' }));
            // Also add ability file names as candidates
            for (const af of allAbilityFiles) {
                if (!candidates.find(c => c.name === af.abilityName)) {
                    candidates.push({ name: af.abilityName, type: 'ability_file' });
                }
            }
            
            for (const skill of missingSkills) {
                const expectedFile = skillToFilename(modId, skill);
                const targetPath = path.join(SKILLS_DIR, expectedFile);
                if (fs.existsSync(targetPath)) continue;
                
                // Try to find matching ability file via combat skill ID
                const match = findBestMatch(skill, candidates);
                if (match) {
                    // Find the corresponding ability file
                    const abilityFile = allAbilityFiles.find(af => 
                        af.abilityName.toLowerCase() === match.name.toLowerCase() || 
                        match.type === 'skill_id' && af.abilityName.toLowerCase().replace(/[^a-z0-9]/g, '') === normalize(match.name)
                    );
                    
                    if (abilityFile) {
                        fs.copyFileSync(abilityFile.fullPath, targetPath);
                        console.log(`${className}: ${match.name} → ${skill} (mapped via ${match.type})`);
                        classExtracted++;
                    }
                }
            }
        }
        
        if (missingCamp.length > 0) {
            const candidates = uniqueCampSkillIds.map(id => ({ name: id, type: 'camp_skill_id' }));
            
            for (const skill of missingCamp) {
                const expectedFile = skillToFilename(modId, skill);
                const targetPath = path.join(CAMP_SKILLS_DIR, expectedFile);
                if (fs.existsSync(targetPath)) continue;
                
                const match = findBestMatch(skill, candidates);
                if (match) {
                    // Camp skill icons might not use the same naming convention
                    // Some mods have camp ability files too
                    const campAbilityFile = allAbilityFiles.find(af => 
                        af.abilityName.toLowerCase().replace(/[^a-z0-9]/g, '') === normalize(match.name)
                    );
                    
                    if (campAbilityFile) {
                        fs.copyFileSync(campAbilityFile.fullPath, targetPath);
                        console.log(`${className}: [CAMP] ${match.name} → ${skill}`);
                        classExtracted++;
                    }
                }
            }
        }
        
        if (classExtracted > 0) {
            console.log(`  → ${classExtracted} images extracted`);
            totalExtracted += classExtracted;
        }
    }
    
    console.log(`\n\nTotal extracted: ${totalExtracted}`);
}

main();
