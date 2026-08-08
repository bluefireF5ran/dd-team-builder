const fs = require('fs');
const path = require('path');

const ASSETS = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\dd-team-builder-assets';
const SKILLS = path.join(ASSETS, 'images', 'modded', 'skills');
const CAMP = path.join(ASSETS, 'images', 'modded', 'camp_skills');
const HEROES = path.join(ASSETS, 'images', 'modded', 'heroes');
const VANILLA_CAMP = path.join(ASSETS, 'images', 'camp_skills');
const VANILLA_SKILLS = path.join(ASSETS, 'images', 'skills');

const skillFiles = new Set(fs.readdirSync(SKILLS));
const campFiles = new Set(fs.readdirSync(CAMP));
const heroFiles = new Set(fs.readdirSync(HEROES));
const vanillaSkills = new Set(fs.readdirSync(VANILLA_SKILLS));
const vanillaCamp = new Set(fs.readdirSync(VANILLA_CAMP));

const errors = fs.readFileSync('F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\src\\test\\error_data.txt', 'utf8').split('\n');
const urls = errors.filter(l => l.startsWith('https://')).map(l => l.trim());

// Helper: try to find existing file by fuzzy name matching
function findMatch(missingName, existingFiles, modId) {
    // Direct match already checked by caller
    const candidates = [...existingFiles].filter(f => f.startsWith(modId + '_'));
    
    // Try removing double underscores, hyphens, etc.
    const missingNorm = missingName.toLowerCase().replace(/[^a-z0-9_]/g, '');
    
    for (const f of candidates) {
        const fNorm = f.toLowerCase().replace(/[^a-z0-9_]/g, '');
        if (fNorm === missingNorm) return f;
    }
    
    // Try prefix match of normalized names
    for (const f of candidates) {
        const fn = f.toLowerCase();
        // Handle special char encoding issues
        const fClean = fn.replace(/[^a-z0-9_]/g, '');
        if (fClean.includes(missingNorm) || missingNorm.includes(fClean)) return f;
    }
    
    return null;
}

let skillFixed = 0, campFixed = 0, heroFixed = 0, notFixed = [];

for (const url of urls) {
    const parts = url.split('/');
    const folder = parts[parts.length - 2];
    const filename = parts[parts.length - 1];
    
    if (folder === 'skills') {
        if (!skillFiles.has(filename)) {
            const modId = filename.split('_')[0];
            const match = findMatch(filename, skillFiles, modId);
            if (match && match !== filename) {
                fs.copyFileSync(path.join(SKILLS, match), path.join(SKILLS, filename));
                console.log('SKILL: ' + match + ' → ' + filename);
                skillFixed++;
            } else {
                notFixed.push({ folder, filename, url });
            }
        }
    } else if (folder === 'camp_skills') {
        if (!campFiles.has(filename)) {
            const modId = filename.split('_')[0];
            const match = findMatch(filename, campFiles, modId);
            if (match && match !== filename) {
                fs.copyFileSync(path.join(CAMP, match), path.join(CAMP, filename));
                console.log('CAMP: ' + match + ' → ' + filename);
                campFixed++;
            } else if (vanillaCamp.has(filename.replace(modId + '_', ''))) {
                // Check if it's just a vanilla camp skill with modId prefix
                const vanillaName = filename.replace(modId + '_', '');
                if (vanillaCamp.has(vanillaName)) {
                    fs.copyFileSync(path.join(VANILLA_CAMP, vanillaName), path.join(CAMP, filename));
                    console.log('CAMP (vanilla): ' + vanillaName + ' → ' + filename);
                    campFixed++;
                } else {
                    notFixed.push({ folder, filename, url });
                }
            } else {
                notFixed.push({ folder, filename, url });
            }
        }
    } else if (folder === 'heroes') {
        if (!heroFiles.has(filename)) {
            const match = [...heroFiles].find(f => f.toLowerCase() === filename.toLowerCase());
            if (match) {
                fs.copyFileSync(path.join(HEROES, match), path.join(HEROES, filename));
                console.log('HERO: ' + match + ' → ' + filename);
                heroFixed++;
            } else {
                notFixed.push({ folder, filename, url });
            }
        }
    }
}

console.log('\n=== Results ===');
console.log('Fixed skills: ' + skillFixed);
console.log('Fixed camp: ' + campFixed);
console.log('Fixed heroes: ' + heroFixed);
console.log('Still missing: ' + notFixed.length);

// Summarize remaining by category
const skillsRemaining = notFixed.filter(n => n.folder === 'skills');
const campRemaining = notFixed.filter(n => n.folder === 'camp_skills');
const heroRemaining = notFixed.filter(n => n.folder === 'heroes');
console.log('\nRemaining skills: ' + skillsRemaining.length);
console.log('Remaining camp: ' + campRemaining.length);
console.log('Remaining heroes: ' + heroRemaining.length);

// List remaining skill modIds
const skillModIds = [...new Set(skillsRemaining.map(n => n.filename.split('_')[0]))];
console.log('\nRemaining skill MODIDs: ' + skillModIds.length);
skillModIds.forEach(mid => {
    const count = skillsRemaining.filter(n => n.filename.startsWith(mid)).length;
    console.log('  ' + mid + ': ' + count + ' files');
});
