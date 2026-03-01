// Phase 2: Clean broken titles, fuzzy deduplicate, cross-reference with app
import fs from 'fs';

const catalogue = JSON.parse(fs.readFileSync('batch-cooking-catalogue-clean.json', 'utf8'));
const appTsx = fs.readFileSync('App.tsx', 'utf8');
const existingTitles = [...appTsx.matchAll(/title: '([^']+)'/g)].map(m => m[1]);
const existingLower = existingTitles.map(t => t.toLowerCase().replace(/\s+/g, ' '));

// Step 1: Fix broken titles from older posts where titles got split across lines
// Pattern: a fragment followed by another fragment that continues it
// E.g. "Patatas y Huevos en" + "Salsa Verde" should be "Patatas y Huevos en Salsa Verde"
function fixBrokenTitles(recipes) {
  const fixed = [];
  let i = 0;
  while (i < recipes.length) {
    let current = recipes[i];
    // Check if current looks like a fragment (ends with preposition/article, or next starts lowercase-ish)
    const endsWithConnector = /\b(de|del|con|en|y|a|al|la|las|los|el|un|una|por|para|que|sin|o|e)\s*$/i.test(current);
    const tooShort = current.split(' ').length <= 2 && current.length < 20;
    
    if (i + 1 < recipes.length) {
      const next = recipes[i + 1];
      const nextLooksLikeFragment = /^[a-záéíóúñü]/.test(next) || next.split(' ').length <= 2;
      
      if (endsWithConnector || (tooShort && nextLooksLikeFragment)) {
        // Merge with next
        current = current + ' ' + next;
        i += 2;
        // Check if we need to merge more
        while (i < recipes.length) {
          const n = recipes[i];
          const prevEndsConnector = /\b(de|del|con|en|y|a|al|la|las|los|el|un|una|por|para|que|sin|o|e)\s*$/i.test(current);
          const nLooksFragment = /^[a-záéíóúñü]/.test(n) || (n.split(' ').length <= 2 && n.length < 15);
          if (prevEndsConnector || nLooksFragment) {
            current = current + ' ' + n;
            i++;
          } else break;
        }
        fixed.push(toTitleCase(current));
        continue;
      }
    }
    fixed.push(current);
    i++;
  }
  return fixed;
}

function toTitleCase(str) {
  const lower = str.toLowerCase().replace(/\s+/g, ' ').trim();
  const small = ['de', 'del', 'con', 'en', 'y', 'a', 'al', 'la', 'las', 'los', 'el', 'un', 'una', 'por', 'para', 'que', 'sin', 'o', 'e'];
  return lower.split(' ').map((word, i) => {
    if (i === 0 || !small.includes(word)) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    return word;
  }).join(' ');
}

// More noise to filter
const moreNoise = [
  /^receta de/i, /^receta$/i, /^snack de huevo$/i, /^huevos cocidos$/i,
  /^huevos y arroz cocido$/i, /^arroz cocido$/i, /^brócoli al vapor$/i,
  /^nachos$/i, /^escalivada$/i, /^cocido$/i, /^gazpacho$/i, /^salmorejo$/i,
  /^bizcocho$/i, /^pimientos al microondas$/i, /^ajos asados$/i,
  /^huevos hervidos$/i, /^bombones de plátano$/i, /^batido de avena/i,
  /^pesto de/i, /^salsa de/i, /^vinagreta/i, /^mezcla cajún$/i,
  /^extras de esta semana$/i, /^sesión de batchcooking/i,
  /^acompañamiento/i, /^extra:/i,
  /^ingreidentes/i, /^ingrediente$/i,
  /^para \d/i,
];

// Step 2: Process all posts
let allRecipes = new Map();

catalogue.forEach(post => {
  let recipes = fixBrokenTitles(post.recipes);
  
  // Additional noise filter
  recipes = recipes.filter(r => {
    const lower = r.toLowerCase().trim();
    if (moreNoise.some(p => p.test(lower))) return false;
    if (lower.length < 5) return false;
    return true;
  });
  
  // Clean up names
  recipes = recipes.map(r => {
    let clean = r
      .replace(/&nbsp;/g, '')
      .replace(/&#\d+;/g, '')
      .replace(/\s+/g, ' ')
      .replace(/\(ración doble\)/i, '')
      .replace(/\(\d+ personas\)/i, '')
      .replace(/\(\d+ raciones\)/i, '')
      .replace(/\(\d+ unidades\)/i, '')
      .replace(/^\d+\.\s*/, '')
      .trim();
    return toTitleCase(clean);
  });
  
  recipes.forEach(r => {
    const key = r.toLowerCase().replace(/\s+/g, ' ').trim();
    if (!allRecipes.has(key)) {
      allRecipes.set(key, { name: r, sources: [] });
    }
    allRecipes.get(key).sources.push(post.postUrl);
  });
});

// Step 3: Fuzzy deduplication
function similarity(a, b) {
  const sa = a.toLowerCase().replace(/\s+/g, ' ');
  const sb = b.toLowerCase().replace(/\s+/g, ' ');
  if (sa === sb) return 1;
  
  const wordsA = sa.split(' ');
  const wordsB = sb.split(' ');
  const common = wordsA.filter(w => wordsB.includes(w));
  return (2 * common.length) / (wordsA.length + wordsB.length);
}

const recipes = [...allRecipes.values()];

// Find fuzzy duplicates (similarity > 0.7)
const fuzzyGroups = [];
const assigned = new Set();

for (let i = 0; i < recipes.length; i++) {
  if (assigned.has(i)) continue;
  const group = [i];
  for (let j = i + 1; j < recipes.length; j++) {
    if (assigned.has(j)) continue;
    if (similarity(recipes[i].name, recipes[j].name) > 0.7) {
      group.push(j);
      assigned.add(j);
    }
  }
  if (group.length > 1) {
    fuzzyGroups.push(group.map(idx => recipes[idx].name));
    assigned.add(i);
  }
}

// Step 4: Cross-reference with existing
const newRecipes = [];
const skipped = [];

recipes.forEach(r => {
  const lower = r.name.toLowerCase().replace(/\s+/g, ' ');
  // Exact match
  if (existingLower.includes(lower)) {
    skipped.push({ name: r.name, reason: 'exact match in app' });
    return;
  }
  // Fuzzy match with existing
  const fuzzyMatch = existingTitles.find(e => similarity(e.toLowerCase(), lower) > 0.75);
  if (fuzzyMatch) {
    skipped.push({ name: r.name, reason: `similar to "${fuzzyMatch}" in app` });
    return;
  }
  newRecipes.push(r);
});

// Output results
console.log(`=== Phase 2 Results ===`);
console.log(`Total unique after fixing: ${recipes.length}`);
console.log(`Skipped (in app already): ${skipped.length}`);
console.log(`New recipes: ${newRecipes.length}`);
console.log(`Fuzzy duplicate groups: ${fuzzyGroups.length}`);

// Save everything
fs.writeFileSync('phase2-new-recipes.json', JSON.stringify(newRecipes.map(r => ({
  name: r.name,
  sourceCount: r.sources.length,
  sources: r.sources
})), null, 2));

fs.writeFileSync('phase2-skipped.json', JSON.stringify(skipped, null, 2));
fs.writeFileSync('phase2-fuzzy-groups.json', JSON.stringify(fuzzyGroups, null, 2));

// Print new recipes sorted alphabetically for review
console.log(`\n=== NEW RECIPES (for Tony's review) ===\n`);
newRecipes
  .sort((a, b) => a.name.localeCompare(b.name, 'es'))
  .forEach((r, i) => {
    const srcCount = r.sources.length > 1 ? ` (${r.sources.length} sources)` : '';
    console.log(`${String(i+1).padStart(3)}. ${r.name}${srcCount}`);
  });

console.log(`\n=== FUZZY DUPLICATE GROUPS (may need manual review) ===\n`);
fuzzyGroups.forEach((group, i) => {
  console.log(`Group ${i+1}: ${group.join(' | ')}`);
});
