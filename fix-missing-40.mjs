import fs from 'fs';
import path from 'path';

let code = fs.readFileSync('App.tsx', 'utf8');
const outDir = 'public/images';

// Get all files in uploads (non-thumbnail)
const allFiles = [];
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (!f.includes('-150x150') && !f.includes('-300x') && !f.includes('-460x250'))
      allFiles.push(full);
  }
}
walk('_uploads_tmp');

// Get all hotlinked recipes
const regex = /id: '([^']+)',\n\s+title: '([^']+)',\n\s+category: '[^']+',\n\s+summary: '[^']*',\n\s+image: '(https:\/\/[^']+)'/g;
const hotlinked = [...code.matchAll(regex)];
console.log('Hotlinked:', hotlinked.length);

// Keyword map: recipe id → search term in filenames
const keywordMap = {
  'acelgas-y-garbanzos-especiados': 'ACELGA',
  'albondigas-al-curry': 'albondigas',
  'albondigas-de-garbanzos': 'albondigas',
  'albondigas-de-soja-texturizada-con-salsa-de-pimientos-asados': 'albondigas',
  'alcachofas-con-carne-picada': 'ALCACHOFAS',
  'alcachofas-y-mozzarella': 'ALCACHOFAS',
  'alitas-de-pollo-con-salsa-de-tomate': 'alitas',
  'alubias-con-coles-de-bruselas': 'alubias',
  'alubias-con-esparragos': 'alubias',
  'alubias-con-quinoa-y-espinacas': 'alubias',
  'alubias-con-salsa-de-tomate': 'alubias',
  'alubias-con-setas-y-chorizo-iberico': 'alubias',
  'arroz-caldoso-con-pollo-habas-y-aceitunas': 'arroz',
  'arroz-con-leche-de-coco-y-champiñones': 'arroz',
  'arroz-con-leche-de-coco-y-pescado-a-la-plancha': 'arroz',
  'arroz-con-salsa-de-soja-y-tahini': 'arroz',
  'arroz-con-verduras-y-bacalao': 'arroz',
  'arroz-de-coliflor-con-bacalao': 'arroz',
  'asado-de-garbanzos': 'asado',
  'asado-de-pollo-a-la-mandarina': 'asado',
  'asado-de-pollo-con-coles-de-bruselas': 'asado',
  'asado-de-pollo-con-salsa-de-coco': 'asado',
  'asado-en-salsa-de-tomates-secos-y-romero': 'asado',
  'atun-al-jerez': 'atun',
  'atun-con-brocoli-y-setas': 'atun',
  'bacalao-a-la-americana': 'BACALAO',
  'bacalao-con-salsa-de-almendras': 'BACALAO',
  'bacalao-con-tomate-al-curry': 'BACALAO',
  'bizcocho-de-coco-y-te-matcha': 'BIZCOCHO',
  'bizcocho-de-pina': 'BIZCOCHO',
  'brochetas-de-solomillo-de-pavo': 'BROCHETAS',
  'calabacin-hasselback': 'CALABACIN',
  'carne-de-pavo-y-pollo-al-estilo-cajun': 'pavo',
};

let patched = 0;
const copied = new Set();

for (const [_, id, title, oldUrl] of hotlinked) {
  const keyword = keywordMap[id];
  if (!keyword) { console.log('NO KEYWORD:', id, '-', title); continue; }
  
  const found = allFiles.filter(f => path.basename(f).toUpperCase().includes(keyword.toUpperCase()));
  if (found.length === 0) { console.log('NOT FOUND:', id); continue; }
  
  // Pick largest (best quality)
  const best = found.sort((a, b) => fs.statSync(b).size - fs.statSync(a).size)[0];
  const filename = keyword.toLowerCase() + '_' + path.basename(best);
  const dest = path.join(outDir, filename);
  
  if (!copied.has(filename)) {
    fs.copyFileSync(best, dest);
    copied.add(filename);
  }
  
  // Replace in code
  code = code.replace("image: '" + oldUrl + "'", "image: 'images/" + filename + "'");
  patched++;
  console.log('OK:', title, '→', filename);
}

fs.writeFileSync('App.tsx', code);
console.log('\nPatched:', patched);
const remaining = [...code.matchAll(/image: '(https:\/\/[^']+)'/g)];
console.log('Still hotlinked:', remaining.length);
remaining.forEach(m => console.log(' -', m[1].substring(0, 80)));
