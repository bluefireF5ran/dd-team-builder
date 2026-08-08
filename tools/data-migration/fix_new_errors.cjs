const fs = require('fs');
const path = require('path');

const ASSETS = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\dd-team-builder-assets';
const SKILLS = path.join(ASSETS, 'images', 'modded', 'skills');
const CAMP = path.join(ASSETS, 'images', 'modded', 'camp_skills');
const HEROES = path.join(ASSETS, 'images', 'modded', 'heroes');
const VANILLA_CAMP = path.join(ASSETS, 'images', 'camp_skills');

const skillFiles = new Set(fs.readdirSync(SKILLS));
const campFiles = new Set(fs.readdirSync(CAMP));
const heroFiles = new Set(fs.readdirSync(HEROES));

// Parse error file for URLs
const errors = fs.readFileSync('F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\src\\test\\error_data.txt', 'utf8').split('\n');
const urls = errors.filter(l => l.startsWith('https://')).map(l => l.trim());

let skillCopied = 0, campCopied = 0, heroCopied = 0;
const notFound = [];

for (const url of urls) {
    const parts = url.split('/');
    const folder = parts[parts.length - 2]; // 'skills', 'camp_skills', or 'heroes'
    const filename = parts[parts.length - 1];
    
    if (folder === 'skills') {
        if (!skillFiles.has(filename)) {
            // Check if there's a similar file in the skills dir
            const modId = filename.split('_')[0];
            const altFiles = [...skillFiles].filter(f => f.startsWith(modId + '_'));
            
            // Try to find by URL-encoded variants (e.g. __ instead of _)
            const norm = filename.toLowerCase();
            const match = altFiles.find(f => {
                const fn = f.toLowerCase();
                // Direct match ignoring special chars
                const a = norm.replace(/[^a-z0-9]/g, '');
                const b = fn.replace(/[^a-z0-9]/g, '');
                return a === b;
            });
            
            if (match) {
                fs.copyFileSync(path.join(SKILLS, match), path.join(SKILLS, filename));
                console.log('SKILL: ' + match + ' → ' + filename);
                skillCopied++;
            } else {
                notFound.push({ folder, filename, url });
            }
        }
    } else if (folder === 'camp_skills') {
        if (!campFiles.has(filename)) {
            const modId = filename.split('_')[0];
            const altFiles = [...campFiles].filter(f => f.startsWith(modId + '_'));
            const norm = filename.toLowerCase();
            const match = altFiles.find(f => {
                const fn = f.toLowerCase();
                const a = norm.replace(/[^a-z0-9]/g, '');
                const b = fn.replace(/[^a-z0-9]/g, '');
                return a === b;
            });
            
            if (match) {
                fs.copyFileSync(path.join(CAMP, match), path.join(CAMP, filename));
                console.log('CAMP: ' + match + ' → ' + filename);
                campCopied++;
            } else {
                notFound.push({ folder, filename, url });
            }
        }
    } else if (folder === 'heroes') {
        if (!heroFiles.has(filename)) {
            // Check if exists in heroes dir with different case
            const match = [...heroFiles].find(f => f.toLowerCase() === filename.toLowerCase());
            if (match) {
                fs.copyFileSync(path.join(HEROES, match), path.join(HEROES, filename));
                console.log('HERO: ' + match + ' → ' + filename);
                heroCopied++;
            } else {
                notFound.push({ folder, filename, url });
            }
        }
    }
}

console.log('\n=== Results ===');
console.log('Skill copies: ' + skillCopied);
console.log('Camp copies: ' + campCopied);
console.log('Hero copies: ' + heroCopied);
console.log('Still missing: ' + notFound.length);

// Group still missing by type
const missingSkills = notFound.filter(n => n.folder === 'skills');
const missingCamp = notFound.filter(n => n.folder === 'camp_skills');
const missingHero = notFound.filter(n => n.folder === 'heroes');
console.log('\nStill missing skills: ' + missingSkills.length);
console.log('Still missing camp: ' + missingCamp.length);
console.log('Still missing heroes: ' + missingHero.length);
