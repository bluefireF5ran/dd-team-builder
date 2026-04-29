const fs = require('fs');
const path = require('path');

const WORKSHOP = 'D:\\Program Files (x86)\\Steam\\steamapps\\workshop\\content\\262060';
const SKILLS = 'F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\dd-team-builder-assets\\images\\modded\\skills';

const skillFiles = new Set(fs.readdirSync(SKILLS));

// Parse error file to find remaining skill MODIDs
const errors = fs.readFileSync('F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\src\\test\\error_data.txt', 'utf8').split('\n');
const urls = errors.filter(l => l.startsWith('https://') && l.includes('/modded/skills/'));

// Group by MODID
const byModId = {};
for (const url of urls) {
    const filename = url.split('/').pop();
    const modId = filename.split('_')[0];
    if (!byModId[modId]) byModId[modId] = [];
    byModId[modId].push(filename);
}

for (const [modId, missingFiles] of Object.entries(byModId)) {
    const modDir = path.join(WORKSHOP, modId);
    if (!fs.existsSync(modDir)) {
        console.log(modId + ': NO WORKSHOP DIR - cannot fix ' + missingFiles.length + ' files');
        continue;
    }
    
    const heroesDir = path.join(modDir, 'heroes');
    if (!fs.existsSync(heroesDir)) continue;
    
    const heroDirs = fs.readdirSync(heroesDir, { withFileTypes: true }).filter(d => d.isDirectory());
    const allAbilityFiles = [];
    
    for (const hd of heroDirs) {
        const hp = path.join(heroesDir, hd.name);
        const files = fs.readdirSync(hp);
        const abFiles = files.filter(f => f.endsWith('.png') && f.includes('.ability.'));
        for (const af of abFiles) {
            // Extract ability name from file
            const abilityName = af.replace(/^[^.]+\.ability\./, '').replace('.png', '');
            allAbilityFiles.push({ name: abilityName, path: path.join(hp, af) });
        }
    }
    
    if (allAbilityFiles.length === 0) {
        console.log(modId + ': ' + missingFiles.length + ' missing, 0 ability files');
        continue;
    }
    
    // Check: do we have enough ability files?
    // Try: for each missing file, find the closest match
    let canFix = 0;
    for (const missing of missingFiles) {
        const missingName = missing.replace(modId + '_', '').replace('.png', '');
        const norm = missingName.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Check if file already exists with slightly different name
        if (skillFiles.has(missing)) { canFix++; continue; }
        
        // Look for ability files that could match
        for (const af of allAbilityFiles) {
            const afNorm = af.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (afNorm === norm || norm.includes(afNorm) || afNorm.includes(norm) || 
                (norm.length > 3 && afNorm.length > 3 && (norm.includes(afNorm.slice(0,4)) || afNorm.includes(norm.slice(0,4))))) {
                // Check the destination doesn't exist
                const dst = path.join(SKILLS, missing);
                if (!fs.existsSync(dst)) {
                    try {
                        fs.copyFileSync(af.path, dst);
                        console.log(modId + ': ' + af.name + ' → ' + missingName);
                        canFix++;
                    } catch(e) { /* ignore */ }
                }
                break;
            }
        }
    }
    
    if (canFix > 0) {
        console.log('  → ' + canFix + '/' + missingFiles.length + ' fixed');
    }
}
