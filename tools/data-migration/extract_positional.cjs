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
    return { skillIds, campSkillIds };
}

function main() {
    console.log('Loading modded_heroes.js...');
    const classes = parseModdedHeroes(MODDED_HEROES_FILE);
    
    const skillFiles = new Set(fs.readdirSync(SKILLS_DIR));
    const campSkillFiles = new Set(fs.readdirSync(CAMP_SKILLS_DIR));
    
    let totalExtracted = 0;
    let positionalMapped = 0;
    
    for (const [className, classData] of Object.entries(classes)) {
        const { modId, skills, campSkills } = classData;
        if (!modId) continue;
        
        const modDir = path.join(WORKSHOP_DIR, modId);
        if (!fs.existsSync(modDir)) continue;
        
        const heroesDir = path.join(modDir, 'heroes');
        if (!fs.existsSync(heroesDir)) continue;
        const heroEntries = fs.readdirSync(heroesDir, { withFileTypes: true }).filter(d => d.isDirectory());
        if (heroEntries.length === 0) continue;
        
        // For shared MODIDs, try to find matching hero dir by class name
        let targetHeroDirs = heroEntries.map(d => d.name);
        if (heroEntries.length > 1) {
            // Try to narrow down by class name similarity
            const cn = normalize(className);
            const matching = targetHeroDirs.filter(hd => cn.includes(normalize(hd)) || normalize(hd).includes(cn));
            if (matching.length > 0) targetHeroDirs = matching;
        }
        
        for (const heroDir of targetHeroDirs) {
            const heroPath = path.join(heroesDir, heroDir);
            const files = fs.readdirSync(heroPath);
            
            // Parse info.darkest for ordered skill IDs
            const infoFiles = files.filter(f => f.endsWith('.info.darkest'));
            if (infoFiles.length === 0) continue;
            
            const allSkillIds = [];
            for (const infoFile of infoFiles) {
                const info = parseInfoDarkest(path.join(heroPath, infoFile));
                allSkillIds.push(...info.skillIds);
            }
            
            if (allSkillIds.length === 0) continue;
            
            // Get ability files
            const abilityFiles = files
                .filter(f => f.endsWith('.png') && f.includes('.ability.'))
                .sort();
            
            if (abilityFiles.length === 0) continue;
            
            // Check which skills are still missing
            const missingSkillIndices = [];
            for (let i = 0; i < skills.length; i++) {
                if (!skillFiles.has(skillToFilename(modId, skills[i]))) {
                    missingSkillIndices.push(i);
                }
            }
            
            if (missingSkillIndices.length === 0) continue;
            
            // POSITIONAL MAPPING:
            // The ability files correspond to combat skills in order.
            // Combat skills are ordered as they appear in info.darkest.
            // Skills in modded_heroes.js should be in same order.
            
            let extracted = 0;
            
            // METHOD 1: Match by ability file name contains skill ID name
            for (let i = 0; i < allSkillIds.length && i < skills.length; i++) {
                const skillId = allSkillIds[i];
                const skill = skills[i];
                
                if (!missingSkillIndices.includes(i)) continue; // already exists
                
                const skillIdNorm = normalize(skillId);
                // Find ability file where name contains or is contained by skill ID
                let matchedFile = null;
                for (const af of abilityFiles) {
                    const afName = af.replace(/^[^.]+\.ability\./, '').replace('.png', '');
                    const afNorm = normalize(afName);
                    if (afNorm === skillIdNorm || skillIdNorm.includes(afNorm) || afNorm.includes(skillIdNorm)) {
                        matchedFile = path.join(heroPath, af);
                        break;
                    }
                }
                
                if (!matchedFile && i < abilityFiles.length) {
                    // Fallback: use positional match (sorted ability files)
                    matchedFile = path.join(heroPath, abilityFiles[i]);
                }
                
                if (matchedFile) {
                    const targetPath = path.join(SKILLS_DIR, skillToFilename(modId, skill));
                    if (!fs.existsSync(targetPath)) {
                        fs.copyFileSync(matchedFile, targetPath);
                        console.log(`${className}: [${i}] "${skillId}" → "${skill}"`);
                        extracted++;
                        positionalMapped++;
                    }
                }
            }
            
            if (extracted > 0) {
                console.log(`  → ${extracted} extracted from ${heroDir}`);
                totalExtracted += extracted;
            }
        }
    }
    
    console.log(`\nTotal extracted (positional): ${totalExtracted}`);
}

main();
