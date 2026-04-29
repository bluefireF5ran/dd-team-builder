const fs = require('fs');
const path = require('path');

const ASSETS_DIR = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\dd-team-builder-assets';
const MODDED_HEROES_FILE = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\src\\data\\modded_heroes.js';
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

        // Extract skills array
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

        // Extract campSkills array
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

function nameSimilarity(a, b) {
    const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const na = norm(a);
    const nb = norm(b);
    if (na === nb) return 1;
    if (na.includes(nb) || nb.includes(na)) return 0.8;

    const wordsA = new Set(na.split(/[_\s]+/));
    const wordsB = new Set(nb.split(/[_\s]+/));
    let common = 0;
    for (const w of wordsA) if (w.length > 2 && wordsB.has(w)) common++;
    const avg = (wordsA.size + wordsB.size) / 2;
    return avg > 0 ? common / avg : 0;
}

function main() {
    console.log('Parsing modded_heroes.js...');
    const classes = parseModdedHeroes(MODDED_HEROES_FILE);
    console.log('Found ' + Object.keys(classes).length + ' classes\n');

    const skillFiles = new Set(fs.readdirSync(SKILLS_DIR));
    const campSkillFiles = new Set(fs.readdirSync(CAMP_SKILLS_DIR));

    const renameActions = [];
    const trulyMissing = [];
    let totalSkillMissing = 0;
    let totalCampMissing = 0;

    for (const [className, classData] of Object.entries(classes)) {
        const { modId, skills, campSkills } = classData;
        if (!modId) continue;

        const classMissingSkills = [];
        const classMissingCamp = [];

        for (const skill of skills) {
            const expectedFile = skillToFilename(modId, skill);
            if (!skillFiles.has(expectedFile)) {
                classMissingSkills.push({ skill, expectedFile });
            }
        }

        for (const skill of campSkills) {
            const expectedFile = skillToFilename(modId, skill);
            if (!campSkillFiles.has(expectedFile)) {
                classMissingCamp.push({ skill, expectedFile });
            }
        }

        if (classMissingSkills.length || classMissingCamp.length) {
            console.log('\n--- ' + className + ' (modId: ' + modId + ') ---');

            for (const m of classMissingSkills) {
                console.log('  [SKILL] ' + m.skill + ' -> ' + m.expectedFile);
                const altFiles = [...skillFiles].filter(f => f.startsWith(modId + '_'));
                let bestMatch = null, bestScore = 0;
                for (const af of altFiles) {
                    const afName = af.replace(modId + '_', '').replace('.png', '');
                    const score = nameSimilarity(afName, m.skill);
                    if (score > bestScore) { bestScore = score; bestMatch = af; }
                }
                if (bestMatch && bestScore > 0.5) {
                    console.log('    RENAME: ' + bestMatch + ' (score: ' + bestScore.toFixed(2) + ')');
                    renameActions.push({ src: path.join(SKILLS_DIR, bestMatch), dst: path.join(SKILLS_DIR, m.expectedFile) });
                } else {
                    console.log('    MISSING - no match found');
                    trulyMissing.push({ className, modId, skill: m.skill, type: 'skill' });
                }
            }

            for (const m of classMissingCamp) {
                console.log('  [CAMP] ' + m.skill + ' -> ' + m.expectedFile);
                const altFiles = [...campSkillFiles].filter(f => f.startsWith(modId + '_'));
                let bestMatch = null, bestScore = 0;
                for (const af of altFiles) {
                    const afName = af.replace(modId + '_', '').replace('.png', '');
                    const score = nameSimilarity(afName, m.skill);
                    if (score > bestScore) { bestScore = score; bestMatch = af; }
                }
                if (bestMatch && bestScore > 0.5) {
                    console.log('    RENAME: ' + bestMatch + ' (score: ' + bestScore.toFixed(2) + ')');
                    renameActions.push({ src: path.join(CAMP_SKILLS_DIR, bestMatch), dst: path.join(CAMP_SKILLS_DIR, m.expectedFile) });
                } else {
                    console.log('    MISSING - no match found');
                    trulyMissing.push({ className, modId, skill: m.skill, type: 'camp' });
                }
            }

            totalSkillMissing += classMissingSkills.length;
            totalCampMissing += classMissingCamp.length;
        }
    }

    console.log('\n\n=== SUMMARY ===');
    console.log('Total missing skills: ' + totalSkillMissing);
    console.log('Total missing camp skills: ' + totalCampMissing);
    console.log('Files that can be renamed: ' + renameActions.length);
    console.log('Truly missing files: ' + trulyMissing.length);

    if (renameActions.length > 0) {
        console.log('\n=== EXECUTING RENAMES ===');
        let renamed = 0;
        for (const action of renameActions) {
            if (fs.existsSync(action.src) && !fs.existsSync(action.dst)) {
                fs.renameSync(action.src, action.dst);
                console.log('  ' + path.basename(action.src) + ' -> ' + path.basename(action.dst));
                renamed++;
            } else if (fs.existsSync(action.dst)) {
                console.log('  (skip, target exists): ' + path.basename(action.src) + ' -> ' + path.basename(action.dst));
            } else {
                console.log('  (skip, source missing): ' + path.basename(action.src));
            }
        }
        console.log('\nRenamed ' + renamed + ' files');
    }

    if (trulyMissing.length > 0) {
        console.log('\n=== TRULY MISSING FILES ===');
        const byClass = {};
        for (const m of trulyMissing) {
            if (!byClass[m.className]) byClass[m.className] = { modId: m.modId, skills: [], campSkills: [] };
            if (m.type === 'skill') byClass[m.className].skills.push(m.skill);
            else byClass[m.className].campSkills.push(m.skill);
        }
        for (const [cls, data] of Object.entries(byClass)) {
            console.log('\n' + cls + ' (modId: ' + data.modId + ')');
            if (data.skills.length) console.log('  Skills: ' + data.skills.join(', '));
            if (data.campSkills.length) console.log('  Camp: ' + data.campSkills.join(', '));
        }
    }
}

main();
