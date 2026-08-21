const fs = require('fs');
const path = require('path');

const CAMP = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\dd-team-builder-assets\\images\\modded\\camp_skills';
const VANILLA_CAMP = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\dd-team-builder-assets\\images\\camp_skills';

const err = fs.readFileSync('F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\src\\test\\error_data.txt','utf8').split('\n');
const urls = err.filter(l => l.startsWith('https://') && l.includes('/camp_skills/')).map(l => l.trim());

const campFiles = new Set(fs.readdirSync(CAMP));
const vanillaCamp = new Map();
for (const f of fs.readdirSync(VANILLA_CAMP)) {
    vanillaCamp.set(f.replace('.png', '').toLowerCase(), f);
}

let fixed = 0;

for (const url of urls) {
    const filename = url.split('/').pop().trim();
    if (campFiles.has(filename)) continue;
    
    const modId = filename.split('_')[0];
    // Check if modId looks like a number (actual mod) or a word (direct URL)
    if (!/^\d+$/.test(modId)) {
        // These are direct URLs without modId prefix, e.g. morale_boost.png
        // Check vanilla
        const vanillaName = filename.replace('.png', '').toLowerCase();
        if (vanillaCamp.has(vanillaName)) {
            fs.copyFileSync(path.join(VANILLA_CAMP, vanillaCamp.get(vanillaName)), path.join(CAMP, filename));
            console.log('CAMP (direct vanilla): ' + filename);
            fixed++;
        }
        continue;
    }
    
    // Try removing modId prefix and check vanilla
    const skillName = filename.replace(modId + '_', '').replace('.png', '').toLowerCase();
    if (vanillaCamp.has(skillName)) {
        fs.copyFileSync(path.join(VANILLA_CAMP, vanillaCamp.get(skillName)), path.join(CAMP, filename));
        console.log('CAMP (vanilla): ' + filename);
        fixed++;
    }
}

console.log('\nFixed: ' + fixed);
