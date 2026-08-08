const fs = require('fs');
const path = require('path');

const WORKSHOP = 'D:\\Program Files (x86)\\Steam\\steamapps\\workshop\\content\\262060';
const VANILLA_SKILLS = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\dd-team-builder-assets\\images\\skills';
const SKILLS = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\dd-team-builder-assets\\images\\modded\\skills';

const vanillaFiles = fs.readdirSync(VANILLA_SKILLS);

// Remaining classes with skill errors
const reworkClasses = {
    'Grave Robber (Rework)': '3538150570',
    'Occultist (Rework)': '3654738622',
    'Ringmaster': '2572516217',
    'Floss': '3617180738',
    'Illusionist': '3631649848',
    'Initiator': '3670454697',
    'Lilith (Rework)': '3607474042',
    'Octopus': '3352861439',
    'Swordmaiden': '2832452821',
    'Unicorn (Rework) (3611958999)': '3611958999'
};

for (const [cls, modId] of Object.entries(reworkClasses)) {
    const modDir = path.join(WORKSHOP, modId);
    if (!fs.existsSync(modDir)) { console.log(cls + ': no workshop'); continue; }
    
    const heroesDir = path.join(modDir, 'heroes');
    if (!fs.existsSync(heroesDir)) continue;
    
    for (const hd of fs.readdirSync(heroesDir, { withFileTypes: true }).filter(d => d.isDirectory())) {
        const infoFiles = fs.readdirSync(path.join(heroesDir, hd.name)).filter(f => f.endsWith('.info.darkest'));
        for (const inf of infoFiles) {
            const content = fs.readFileSync(path.join(heroesDir, hd.name, inf), 'utf8');
            const seen = new Set();
            const regex = /combat_skill:\s*\.id\s+"([^"]+)"/g;
            let m;
            while ((m = regex.exec(content)) !== null) {
                if (!seen.has(m[1])) {
                    seen.add(m[1]);
                    // Check if vanilla icon exists
                    const vanillaName = m[1] + '.png';
                    if (vanillaFiles.includes(vanillaName)) {
                        console.log(cls + ' (' + modId + '): ' + m[1] + ' has vanilla icon!');
                    }
                }
            }
        }
    }
}
