// Extract recipes from blog posts and save as structured data
// Usage: node extract-recipes.mjs <batch-number> <start> <count>
import https from 'https';
import fs from 'fs';

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function toKebab(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&#8211;/g, '–').replace(/&#8230;/g, '…').replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'").replace(/\s+/g, ' ').trim();
}

function getOgImage(html) {
  const m = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)
    || html.match(/<meta\s+content="([^"]+)"\s+property="og:image"/i);
  return m ? m[1] : '';
}

function assignCategory(title) {
  const t = title.toLowerCase();
  if (/sopa|crema|puré|caldo/.test(t)) return 'Sopa';
  if (/ensalad/.test(t)) return 'Verdura';
  if (/bizcocho|tarta|galleta|cookie|magdalena|helado|mousse|muffin/.test(t)) return 'Postres';
  if (/lentejas|garbanzos|alubias|habas/.test(t)) return 'Legumbres';
  if (/pollo|pavo|cerdo|ternera|carne|solomillo|costill|carrillera|ragú|contramuslo|kebab|brocheta|fiambre/.test(t)) return 'Carne';
  if (/merluza|salmón|bacalao|atún|pescado|lubina|dorada|trucha|caballa|mújol|cazuela|gambas|guisantes con gambas|bacoreta/.test(t)) return 'Pescado';
  if (/pasta|arroz|lasaña|espagueti|macarron/.test(t)) return 'Hidratos';
  if (/pan |regañá|grisine/.test(t)) return 'Pan';
  if (/hamburguesa|albóndiga|falafel|nugget|croqueta/.test(t)) return 'Entrantes';
  if (/tortill|huev|revuelto|frittata|shakshuka/.test(t)) return 'Entrantes';
  return 'Verdura';
}

function extractRecipeFromHtml(html, recipeName) {
  // Remove scripts/styles
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Find the recipe section by name (case insensitive)
  const nameUpper = recipeName.toUpperCase();
  const nameVariants = [
    nameUpper,
    recipeName,
    recipeName.toUpperCase().replace(/\s+/g, '\\s+'),
  ];
  
  // Try to find recipe header and extract until next recipe header
  const lines = text.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<\/li>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n').replace(/<[^>]+>/g, '').split('\n')
    .map(l => l.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#8211;/g, '–')
    .replace(/&#8230;/g, '…').replace(/&quot;/g, '"').replace(/&#8217;/g, "'").trim())
    .filter(l => l.length > 0);
  
  // Find the recipe start
  let startIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toUpperCase().replace(/\s+/g, ' ');
    if (line.includes(nameUpper) || line.includes(nameUpper.replace(/\s+/g, ' '))) {
      startIdx = i;
      break;
    }
  }
  
  if (startIdx === -1) {
    // Try fuzzy match
    const nameWords = nameUpper.split(' ').filter(w => w.length > 3);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toUpperCase();
      const matches = nameWords.filter(w => line.includes(w));
      if (matches.length >= nameWords.length * 0.7 && matches.length >= 2) {
        startIdx = i;
        break;
      }
    }
  }
  
  if (startIdx === -1) return null;
  
  // Find ingredients section
  let ingStart = -1, ingEnd = -1, prepStart = -1, prepEnd = -1;
  
  for (let i = startIdx + 1; i < Math.min(startIdx + 80, lines.length); i++) {
    const upper = lines[i].toUpperCase().trim();
    if (upper === 'INGREDIENTES' || upper === 'INGREDIENTES:' || upper.startsWith('INGREDIENTES ')) {
      ingStart = i + 1;
    }
    if ((upper === 'PREPARACIÓN' || upper === 'PREPARACION' || upper === 'PREPARACIÓN:' || 
         upper === 'ELABORACIÓN' || upper === 'ELABORACIÓN:' || upper === 'ELABORACION') && ingStart > 0) {
      ingEnd = i;
      prepStart = i + 1;
    }
    // Next recipe header (all caps, > 10 chars, not ingredient/prep header)
    if (i > prepStart && prepStart > 0 && upper.length > 10 && upper === lines[i].trim() &&
        !upper.startsWith('INGREDIENTES') && !upper.startsWith('PREPARACIÓN') && 
        !upper.startsWith('ELABORACIÓN') && !upper.startsWith('NOTA') &&
        !/^\d/.test(upper) && !/^–/.test(upper)) {
      prepEnd = i;
      break;
    }
  }
  
  if (ingStart === -1) return null;
  if (ingEnd === -1) ingEnd = ingStart + 20; // guess
  if (prepStart === -1) prepStart = ingEnd + 1;
  if (prepEnd === -1) prepEnd = Math.min(prepStart + 30, lines.length);
  
  const rawIngredients = lines.slice(ingStart, ingEnd).filter(l => l.length > 1 && !l.toUpperCase().startsWith('PREPARACIÓN'));
  const rawSteps = lines.slice(prepStart, prepEnd).filter(l => l.length > 5);
  
  return { rawIngredients, rawSteps };
}

function parseIngredient(text, idx) {
  let clean = text.replace(/^[-–•·]\s*/, '').trim();
  
  // Pattern: "200 gr de ingrediente"
  let m = clean.match(/^(\d+(?:[.,]\d+)?)\s*(gr?|kg|ml|litro[s]?|cucharada[s]?|cucharadita[s]?|diente[s]?|rebanada[s]?|lata[s]?|bote[s]?|sobre[s]?|pizca[s]?|puñado[s]?|rama[s]?|hoja[s]?|rodaja[s]?|unidad(?:es)?)\s*(?:de\s+)?(.*)/i);
  if (m) {
    return { id: String(idx), baseQuantity: parseFloat(m[1].replace(',', '.')), unit: m[2] + ' de', name: m[3] || clean };
  }
  
  // Pattern: "2 huevos" / "1 cebolla"
  m = clean.match(/^(\d+(?:[.,]\d+)?)\s+(.+)/);
  if (m) {
    const qty = parseFloat(m[1].replace(',', '.'));
    const rest = m[2];
    // Check if it starts with a unit
    const unitMatch = rest.match(/^(gr?|kg|ml|litro[s]?|cucharada[s]?|cucharadita[s]?|diente[s]?)\s+(?:de\s+)?(.*)/i);
    if (unitMatch) {
      return { id: String(idx), baseQuantity: qty, unit: unitMatch[1] + ' de', name: unitMatch[2] };
    }
    return { id: String(idx), baseQuantity: qty, unit: '', name: rest };
  }
  
  // Pattern: "½ cucharadita de comino"
  m = clean.match(/^([½¼¾⅓⅔])\s*(cucharada[s]?|cucharadita[s]?)\s*(?:de\s+)?(.*)/i);
  if (m) {
    const fracs = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 0.33, '⅔': 0.67 };
    return { id: String(idx), baseQuantity: fracs[m[1]] || 0.5, unit: m[2] + ' de', name: m[3] };
  }
  
  // No quantity
  return { id: String(idx), baseQuantity: null, unit: '', name: clean };
}

function parseSteps(rawSteps) {
  // Join short fragments, split on sentence boundaries
  let joined = rawSteps.join(' ').replace(/\s+/g, ' ');
  // Remove step numbers
  joined = joined.replace(/^(\d+[\.\)]\s*)/gm, '');
  
  // Split into reasonable steps
  const sentences = joined.split(/(?<=[.!])\s+(?=[A-ZÁÉÍÓÚÑ])/);
  const steps = [];
  let current = '';
  
  for (const s of sentences) {
    if (current.length + s.length > 300 && current.length > 50) {
      steps.push(current.trim());
      current = s;
    } else {
      current += (current ? ' ' : '') + s;
    }
  }
  if (current.trim().length > 10) steps.push(current.trim());
  
  return steps.length > 0 ? steps : ['Preparar según las instrucciones del blog.'];
}

async function main() {
  const batchNum = parseInt(process.argv[2]) || 1;
  const start = parseInt(process.argv[3]) || 0;
  const count = parseInt(process.argv[4]) || 20;
  
  const allRecipes = JSON.parse(fs.readFileSync('phase2-final-filtered.json', 'utf8'));
  const batch = allRecipes.slice(start, start + count);
  
  console.log(`=== Batch ${batchNum}: Extracting ${batch.length} recipes (${start}-${start + count - 1}) ===\n`);
  
  const recipes = [];
  const failed = [];
  
  for (let i = 0; i < batch.length; i++) {
    const r = batch[i];
    const url = r.sources[0];
    console.log(`[${i + 1}/${batch.length}] ${r.name}`);
    console.log(`  URL: ${url}`);
    
    try {
      const html = await fetch(url);
      const ogImage = getOgImage(html);
      const extracted = extractRecipeFromHtml(html, r.name);
      
      if (!extracted || extracted.rawIngredients.length === 0) {
        console.log(`  ⚠️ Could not extract recipe`);
        failed.push({ name: r.name, url, reason: 'Recipe not found in HTML' });
        continue;
      }
      
      const ingredients = extracted.rawIngredients.map((ing, idx) => parseIngredient(ing, idx + 1));
      const steps = parseSteps(extracted.rawSteps);
      
      const recipe = {
        id: toKebab(r.name),
        title: r.name,
        category: assignCategory(r.name),
        summary: r.name + ' al estilo La Vida Bonica.',
        image: ogImage,
        defaultServings: 4,
        ingredients,
        steps,
        nutrition: null,
      };
      
      recipes.push(recipe);
      console.log(`  ✅ ${ingredients.length} ingredients, ${steps.length} steps`);
      
      await sleep(300);
    } catch (e) {
      console.log(`  ❌ Error: ${e.message}`);
      failed.push({ name: r.name, url, reason: e.message });
    }
  }
  
  // Write output
  const varName = `BATCH_${batchNum}_RECIPES`;
  let output = `const ${varName} = [\n`;
  recipes.forEach(r => {
    output += JSON.stringify(r, null, 2) + ',\n';
  });
  output += `];\nmodule.exports = ${varName};\n`;
  
  const outFile = `batch-${batchNum}-recipes.js`;
  fs.writeFileSync(outFile, output);
  
  console.log(`\n=== Results ===`);
  console.log(`Extracted: ${recipes.length}/${batch.length}`);
  console.log(`Failed: ${failed.length}`);
  if (failed.length > 0) {
    fs.writeFileSync(`batch-${batchNum}-failed.json`, JSON.stringify(failed, null, 2));
    console.log('Failed recipes:');
    failed.forEach(f => console.log(`  - ${f.name}: ${f.reason}`));
  }
  console.log(`Output: ${outFile}`);
}

main().catch(console.error);
