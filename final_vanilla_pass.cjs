const fs = require('fs');
const path = require('path');

const SKILLS_DIR = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\dd-team-builder-assets\\images\\modded\\skills';
const VANILLA_SKILLS_DIR = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\dd-team-builder-assets\\images\\skills';

const vanillaFiles = new Map();
for (const f of fs.readdirSync(VANILLA_SKILLS_DIR)) {
    if (f.endsWith('.png')) vanillaFiles.set(f.replace('.png', '').toLowerCase(), path.join(VANILLA_SKILLS_DIR, f));
}

const skillFiles = new Set(fs.readdirSync(SKILLS_DIR));

// Manual mapping for remaining classes that might match vanilla
const manualMappings = {
    // Grave Robber (Rework) 3538150570
    '3538150570': { 'pick': 'Pick to the Face' },
    // Octopus 3352861439  
    '3352861439': { 'crush': 'Crush' },
    // Starchild 1592074273
    '1592074273': { 'wish': 'Wish' },
    // Doppelsoldner 3595507195 / 2952526653 (riposte)
    '3595507195': { 'riposte': 'Riposte' },
    '2952526653': { 'riposte': 'Riposte' },
    // Timeless 3415493990 (riposte)
    '3415493990': { 'riposte': 'Riposte' },
    // Greyhawk 2564785375 (riposte)
    '2564785375': { 'riposte': 'Riposte' },
    // Hedge Knight 2955427995
    '2955427995': { 'wild_swing': 'Wild Swing' },
    // Joanofarc 2467434523 (riposte)
    '2467434523': { 'riposte': 'Riposte' },
};

let copied = 0;
for (const [modId, mappings] of Object.entries(manualMappings)) {
    for (const [vanillaName, skillName] of Object.entries(mappings)) {
        const expectedFile = modId + '_' + skillName.toLowerCase().replace(/[^a-z0-9\s\-]/g, '').replace(/\s+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') + '.png';
        if (skillFiles.has(expectedFile)) continue;
        if (vanillaFiles.has(vanillaName)) {
            fs.copyFileSync(vanillaFiles.get(vanillaName), path.join(SKILLS_DIR, expectedFile));
            console.log('Copied: ' + vanillaName + ' (vanilla) → ' + expectedFile);
            copied++;
        }
    }
}

console.log('\nCopied ' + copied + ' more from vanilla');
console.log('\n=== FINAL STATE ===');
const finalSkillCount = fs.readdirSync(SKILLS_DIR).length;
const finalCampCount = fs.readdirSync('F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\dd-team-builder-assets\\images\\modded\\camp_skills').length;
console.log('Skills: ' + finalSkillCount + ' (was 4474, change: ' + (finalSkillCount - 4474) + ')');
console.log('Camp skills: ' + finalCampCount + ' (was 3762, change: ' + (finalCampCount - 3762) + ')');
console.log('Total: ' + (finalSkillCount + finalCampCount) + ' (was 8236, change: ' + ((finalSkillCount + finalCampCount) - 8236) + ')');
