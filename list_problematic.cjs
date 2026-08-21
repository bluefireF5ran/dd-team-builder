const fs = require('fs');
const path = require('path');

const err = fs.readFileSync('F:\\Personal_Fran\\Programas\\Softwares\\nextjs_projects\\dd-team-builder\\src\\test\\error_data.txt','utf8').split('\n');
const urls = err.filter(l => l.startsWith('https://')).map(l => l.trim());

const byModId = {};
const byType = {};

for (const url of urls) {
    const parts = url.split('/');
    const folder = parts[parts.length - 2];
    const filename = parts[parts.length - 1].trim();
    const modId = filename.split('_')[0];
    
    if (!byModId[modId]) byModId[modId] = { skills: [], camp: [], heroes: [], types: new Set() };
    if (!byType[folder]) byType[folder] = [];
    
    if (folder === 'skills') { byModId[modId].skills.push(filename); byModId[modId].types.add('skills'); }
    else if (folder === 'camp_skills') { byModId[modId].camp.push(filename); byModId[modId].types.add('camp'); }
    else if (folder === 'heroes') { byModId[modId].heroes.push(filename); byModId[modId].types.add('heroes'); }
    byType[folder].push(filename);
}

console.log('=== ALL REMAINING ERRORS BY TYPE ===');
for (const [type, files] of Object.entries(byType)) {
    console.log('\n' + type + ': ' + files.length);
    // Show unique modIds
    const mods = [...new Set(files.map(f => f.split('_')[0]))];
    for (const m of mods.sort()) {
        const count = files.filter(f => f.startsWith(m)).length;
        console.log('  ' + m + ': ' + count + ' files');
    }
}

console.log('\n\n=== DETAILED BREAKDOWN ===');
const numeric = Object.entries(byModId).filter(([id]) => /^\d+$/.test(id)).sort((a,b) => a[0].localeCompare(b[0]));
const nonNumeric = Object.entries(byModId).filter(([id]) => !/^\d+$/.test(id));

for (const [modId, data] of numeric) {
    const parts = [];
    if (data.skills.length) parts.push(data.skills.length + ' skills');
    if (data.camp.length) parts.push(data.camp.length + ' camp');
    if (data.heroes.length) parts.push(data.heroes.length + ' heroes');
    console.log(modId + ': ' + parts.join(', '));
}

console.log('\n=== NON-NUMERIC (direct URLs, no modId prefix) ===');
for (const [modId, data] of nonNumeric) {
    const parts = [];
    if (data.skills.length) parts.push(data.skills.length + ' skills');
    if (data.camp.length) parts.push(data.camp.length + ' camp');
    if (data.heroes.length) parts.push(data.heroes.length + ' heroes');
    console.log(modId + ': ' + parts.join(', '));
}
