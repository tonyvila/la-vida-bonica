import fs from 'fs';

let allRecipes = [];
for (let b = 1; b <= 14; b++) {
  const file = `batch-${b}-recipes.js`;
  if (!fs.existsSync(file)) continue;
  const content = fs.readFileSync(file, 'utf8');
  // Extract the JSON array
  try {
    // Try JSON first
    const match = content.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        const recipes = JSON.parse(match[0].replace(/,\s*\]/g, ']'));
        allRecipes = allRecipes.concat(recipes);
        console.log(`Batch ${b}: ${recipes.length} recipes`);
        continue;
      } catch {}
    }
    // Fallback: eval as JS module
    const tmpFile = `/tmp/batch-${b}-eval.mjs`;
    fs.writeFileSync(tmpFile, content.replace(/module\.exports.*/, '') + '\nexport default BATCH_' + b + '_RECIPES;');
    const mod = await import(tmpFile);
    const recipes = mod.default;
    allRecipes = allRecipes.concat(recipes);
    console.log(`Batch ${b}: ${recipes.length} recipes (via eval)`);
  } catch(e) {
    console.log(`Batch ${b}: error - ${e.message}`);
  }
}

console.log(`\nTotal: ${allRecipes.length} recipes`);

// Check for duplicate IDs
const ids = new Set();
let dupes = 0;
allRecipes.forEach(r => {
  if (ids.has(r.id)) { 
    r.id = r.id + '-2'; 
    dupes++;
  }
  ids.add(r.id);
});
if (dupes) console.log(`Fixed ${dupes} duplicate IDs`);

// Generate the JS code to insert into App.tsx
let code = '';
allRecipes.forEach(r => {
  code += `  {\n`;
  code += `    id: '${r.id}',\n`;
  code += `    title: '${r.title.replace(/'/g, "\\'")}',\n`;
  code += `    category: '${r.category}',\n`;
  code += `    summary: '${r.summary.replace(/'/g, "\\'")}',\n`;
  code += `    image: '${r.image}',\n`;
  code += `    defaultServings: ${r.defaultServings},\n`;
  code += `    ingredients: [\n`;
  r.ingredients.forEach(ing => {
    const qty = ing.baseQuantity === null ? 'null' : ing.baseQuantity;
    code += `      { id: '${ing.id}', baseQuantity: ${qty}, unit: '${ing.unit.replace(/'/g, "\\'")}', name: '${(ing.name || '').replace(/'/g, "\\'")}' },\n`;
  });
  code += `    ],\n`;
  code += `    steps: [\n`;
  r.steps.forEach(s => {
    code += `      '${s.replace(/'/g, "\\'")}',\n`;
  });
  code += `    ],\n`;
  code += `    nutrition: null,\n`;
  code += `  },\n`;
});

fs.writeFileSync('all-new-recipes.js', code);
console.log(`\nWrote all-new-recipes.js (${code.length} chars)`);
