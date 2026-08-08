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
        let depth = 1;
        let pos = classRegex.lastIndex;
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
            let sPos = sIdx + 'skills: ['.length;
            let sDepth = 1;
            let sArr = '';
            while (sDepth > 0 && sPos < block.length) {
                const ch = block[sPos];
                if (ch === '[') sDepth++;
                else if (ch === ']') sDepth--;
                if (sDepth > 0) sArr += ch;
                sPos++;
            }
            const items = sArr.match(/'((?:[^'\\]|\\.)*)'/g);
            if (items) {
                for (const item of items) {
                    cls.skills.push(item.slice(1, -1).replace(/\\'/g, "'"));
                }
            }
        }

        const cIdx = block.indexOf('campSkills: [');
        if (cIdx !== -1) {
            let cPos = cIdx + 'campSkills: ['.length;
            let cDepth = 1;
            let cArr = '';
            while (cDepth > 0 && cPos < block.length) {
                const ch = block[cPos];
                if (ch === '[') cDepth++;
                else if (ch === ']') cDepth--;
                if (cDepth > 0) cArr += ch;
                cPos++;
            }
            const items = cArr.match(/'((?:[^'\\]|\\.)*)'/g);
            if (items) {
                for (const item of items) {
                    cls.campSkills.push(item.slice(1, -1).replace(/\\'/g, "'"));
                }
            }
        }

        classes[className] = cls;
    }

    return classes;
}

function skillToFilename(modId, skillName) {
    let name = skillName.toLowerCase();
    name = name.replace(/[^a-z0-9\s\-·♥★•●★☆▼–—]/g, '');
    name = name.replace(/[\s]+/g, '_');
    name = name.replace(/_+/g, '_');
    name = name.replace(/^_|_$/g, '');
    return modId + '_' + name + '.png';
}

function normalizeSkillName(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

function findWorkshopAbilityFiles(modId) {
    const modDir = path.join(WORKSHOP_DIR, modId);
    if (!fs.existsSync(modDir)) return null;
    
    const heroesDir = path.join(modDir, 'heroes');
    if (!fs.existsSync(heroesDir)) return null;
    
    const heroDirs = fs.readdirSync(heroesDir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);
    
    if (heroDirs.length === 0) return null;
    
    // Find ability files in each hero dir
    const abilityFiles = [];
    for (const heroDir of heroDirs) {
        const heroPath = path.join(heroesDir, heroDir);
        const files = fs.readdirSync(heroPath);
        
        for (const file of files) {
            if (file.endsWith('.png') && file.includes('.ability.')) {
                // Extract the ability name from the file
                const abilityName = file.replace(/^[^.]+\.ability\./, '').replace('.png', '');
                abilityFiles.push({
                    fullPath: path.join(heroPath, file),
                    fileName: file,
                    abilityName,
                    heroDir
                });
            }
        }
    }
    
    return abilityFiles;
}

function main() {
    console.log('Loading modded_heroes.js...');
    const classes = parseModdedHeroes(MODDED_HEROES_FILE);
    console.log(`Found ${Object.keys(classes).length} classes\n`);

    const skillFiles = new Set(fs.readdirSync(SKILLS_DIR));
    const campSkillFiles = new Set(fs.readdirSync(CAMP_SKILLS_DIR));

    let extracted = 0;
    let classesWithMods = 0;

    for (const [className, classData] of Object.entries(classes)) {
        const { modId, skills, campSkills } = classData;
        if (!modId) continue;

        // Find all missing skill filenames
        const missingSkills = [];
        for (const skill of skills) {
            const fname = skillToFilename(modId, skill);
            if (!skillFiles.has(fname)) {
                missingSkills.push({ skill, fname });
            }
        }

        if (missingSkills.length === 0) continue;

        // Check workshop
        const abilityFiles = findWorkshopAbilityFiles(modId);
        if (!abilityFiles || abilityFiles.length === 0) continue;

        classesWithMods++;
        console.log(`\n--- ${className} (modId: ${modId}) ---`);
        console.log(`  Workshop ability files: ${abilityFiles.map(a => a.abilityName).join(', ')}`);
        console.log(`  Missing skills: ${missingSkills.map(m => m.skill).join(', ')}`);

        // Try to map by name similarity
        let mapped = 0;
        for (const ms of missingSkills) {
            const skNormalized = normalizeSkillName(ms.skill);
            
            // Find the best matching ability file
            let bestMatch = null;
            let bestScore = 0;
            
            for (const af of abilityFiles) {
                const afNormalized = normalizeSkillName(af.abilityName);
                
                // Direct match
                if (afNormalized === skNormalized) {
                    bestScore = 2;
                    bestMatch = af;
                    break;
                }
                
                // One contains the other
                if (afNormalized.includes(skNormalized) || skNormalized.includes(afNormalized)) {
                    const score = Math.min(afNormalized.length, skNormalized.length) / Math.max(afNormalized.length, skNormalized.length);
                    if (score > bestScore) {
                        bestScore = score;
                        bestMatch = af;
                    }
                }
                
                // Word similarity
                const wordsA = new Set(skNormalized.split(/[_\s]+/));
                const wordsB = new Set(afNormalized.split(/[_\s]+/));
                let common = 0;
                for (const w of wordsA) if (w.length > 2 && wordsB.has(w)) common++;
                const score = common / Math.max(wordsA.size, 1);
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = af;
                }
            }
            
            if (bestMatch && bestScore >= 0.3) {
                const dstPath = path.join(SKILLS_DIR, ms.fname);
                if (!fs.existsSync(dstPath)) {
                    try {
                        fs.copyFileSync(bestMatch.fullPath, dstPath);
                        console.log(`  ✓ Extracted: ${bestMatch.abilityName} → ${ms.fname}`);
                        extracted++;
                        mapped++;
                    } catch (e) {
                        console.log(`  ✗ Error: ${e.message}`);
                    }
                }
            }
        }
        
        // For remaining unmapped skills, use positional mapping if counts match
        const remainingSkills = missingSkills.filter(ms => {
            const fname = skillToFilename(modId, ms.skill);
            return !fs.existsSync(path.join(SKILLS_DIR, fname));
        });
        
        const alreadyCopied = abilityFiles.filter(af => {
            return fs.existsSync(path.join(SKILLS_DIR, modId + '_' + af.abilityName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.png'));
        });
        
        if (remainingSkills.length > 0 && alreadyCopied.length === 0) {
            console.log(`  ${remainingSkills.length} skills unmapped, ${abilityFiles.length} ability files available`);
        }
    }

    console.log(`\n\n=== EXTRACTION SUMMARY ===`);
    console.log(`Classes with workshop mods: ${classesWithMods}`);
    console.log(`Files extracted: ${extracted}`);
}

main();
