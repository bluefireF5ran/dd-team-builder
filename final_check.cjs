const fs = require('fs');
const path = require('path');

const MODDED_HEROES_FILE = path.join('F:', 'Personal_Fran', 'Programas', 'Softwares', 'nextjs_projects', 'dd-team-builder', 'src', 'data', 'modded_heroes.js');
const SKILLS_DIR = path.join('F:', 'Personal_Fran', 'Programas', 'Softwares', 'nextjs_projects', 'dd-team-builder', 'dd-team-builder-assets', 'images', 'modded', 'skills');
const CAMP_SKILLS_DIR = path.join('F:', 'Personal_Fran', 'Programas', 'Softwares', 'nextjs_projects', 'dd-team-builder', 'dd-team-builder-assets', 'images', 'modded', 'camp_skills');

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

const classes = parseModdedHeroes(MODDED_HEROES_FILE);
const skillFiles = new Set(fs.readdirSync(SKILLS_DIR));
const campSkillFiles = new Set(fs.readdirSync(CAMP_SKILLS_DIR));

let totalSkillMissing = 0;
let totalCampMissing = 0;
let fullMissingSkill = 0;
let partialMissingSkill = 0;
let fullMissingCamp = 0;

const workshopDir = 'D:\\Program Files (x86)\\Steam\\steamapps\\workshop\\content\\262060';

for (const [name, cls] of Object.entries(classes)) {
    let miss = 0, campMiss = 0;
    for (const s of cls.skills) {
        const f = skillToFilename(cls.modId, s);
        if (!skillFiles.has(f)) miss++;
    }
    for (const s of cls.campSkills) {
        const f = skillToFilename(cls.modId, s);
        if (!campSkillFiles.has(f)) campMiss++;
    }
    
    if (miss > 0) {
        if (miss === cls.skills.length) fullMissingSkill++;
        else partialMissingSkill++;
    }
    if (campMiss === cls.campSkills.length && cls.campSkills.length > 0) fullMissingCamp++;
    
    totalSkillMissing += miss;
    totalCampMissing += campMiss;
}

console.log('=== FINAL STATS ===');
console.log('Total classes: ' + Object.keys(classes).length);
console.log('Classes with ALL skills missing: ' + fullMissingSkill);
console.log('Classes with SOME skills missing: ' + partialMissingSkill);
console.log('Total missing skill files: ' + totalSkillMissing);
console.log('Total missing camp skill files: ' + totalCampMissing);
console.log('Classes with ALL camp skills missing: ' + fullMissingCamp);
