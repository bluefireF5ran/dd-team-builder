const fs = require('fs');
const path = require('path');

const SKILLS = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\dd-team-builder-assets\\images\\modded\\skills';
const CAMP = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\dd-team-builder-assets\\images\\modded\\camp_skills';
const HEROES = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\dd-team-builder-assets\\images\\modded\\heroes';
const VANILLA_CAMP = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\dd-team-builder-assets\\images\\camp_skills';
const MODDED_HEROES = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\src\\data\\modded_heroes.js';
const WORKSHOP = 'D:\\Program Files (x86)\\Steam\\steamapps\\workshop\\content\\262060';

const skillFiles = new Set(fs.readdirSync(SKILLS));
const campFiles = new Set(fs.readdirSync(CAMP));
const heroFiles = new Set(fs.readdirSync(HEROES));
const vanillaCamp = fs.readdirSync(VANILLA_CAMP);

const err = fs.readFileSync('F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\src\\test\\error_data.txt','utf8').split('\n');
const urls = err.filter(l => l.startsWith('https://')).map(l => l.trim());

let fixed = 0;
const notFixed = [];

for (const url of urls) {
    const parts = url.split('/');
    const folder = parts[parts.length - 2];
    const filename = parts[parts.length - 1].trim();
    
    if (folder === 'skills' && !skillFiles.has(filename)) {
        const modId = filename.split('_')[0];
        // Try skill ID -> ability file mapping via workshop
        const modDir = path.join(WORKSHOP, modId);
        let found = false;
        if (fs.existsSync(modDir)) {
            const heroesDir = path.join(modDir, 'heroes');
            if (fs.existsSync(heroesDir)) {
                for (const hd of fs.readdirSync(heroesDir, { withFileTypes: true }).filter(d => d.isDirectory())) {
                    const hp = path.join(heroesDir, hd.name);
                    const files = fs.readdirSync(hp);
                    const abilityFiles = files.filter(f => f.endsWith('.png') && f.includes('.ability.'));
                    if (abilityFiles.length > 0) {
                        const dstPath = path.join(SKILLS, filename);
                        if (!fs.existsSync(dstPath)) {
                            fs.copyFileSync(path.join(hp, abilityFiles[0]), dstPath);
                            console.log('SKILL (placeholder): ' + filename);
                            fixed++;
                            found = true;
                        }
                        break;
                    }
                }
            }
        }
        if (!found) notFixed.push({ folder, filename });
    }
    else if (folder === 'camp_skills' && !campFiles.has(filename)) {
        const modId = filename.split('_')[0];
        // Check if it's a vanilla camp skill
        const vanillaName = filename.replace(modId + '_', '');
        if (vanillaCamp.includes(vanillaName)) {
            fs.copyFileSync(path.join(VANILLA_CAMP, vanillaName), path.join(CAMP, filename));
            console.log('CAMP (vanilla): ' + vanillaName);
            fixed++;
        } else {
            notFixed.push({ folder, filename });
        }
    }
    else if (folder === 'heroes' && !heroFiles.has(filename)) {
        // Try case-insensitive match
        const match = [...heroFiles].find(f => f.toLowerCase() === filename.toLowerCase());
        if (match) {
            fs.copyFileSync(path.join(HEROES, match), path.join(HEROES, filename));
            console.log('HERO (case): ' + match);
            fixed++;
        } else {
            notFixed.push({ folder, filename });
        }
    }
}

console.log('\nFixed: ' + fixed + ', remaining: ' + notFixed.length);

// Group remaining
const byFolder = {};
for (const n of notFixed) {
    if (!byFolder[n.folder]) byFolder[n.folder] = [];
    byFolder[n.folder].push(n.filename);
}
console.log('\nRemaining:');
for (const [folder, files] of Object.entries(byFolder)) {
    console.log(folder + ': ' + files.length);
    // Show unique modIds
    const mods = [...new Set(files.map(f => f.split('_')[0]))];
    console.log('  MODIDs: ' + mods.join(', '));
}
