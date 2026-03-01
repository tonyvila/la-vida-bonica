// Phase 1: Scrape all batch cooking posts and extract recipe titles
import https from 'https';
import http from 'http';
import fs from 'fs';

function fetch(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
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

// Step 1: Get all post URLs from archive pages
async function getPostUrls() {
  const urls = [];
  for (let page = 1; page <= 7; page++) {
    const url = page === 1 
      ? 'https://lavidabonica.com/batch-cooking/'
      : `https://lavidabonica.com/batch-cooking/page/${page}/`;
    console.log(`Fetching archive page ${page}...`);
    const html = await fetch(url);
    // Extract post URLs from h4 > a tags
    const matches = [...html.matchAll(/<h4[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>/gi)];
    // Also try article links
    const matches2 = [...html.matchAll(/<a[^>]*href="(https:\/\/lavidabonica\.com\/[^"]*\/)"[^>]*class="[^"]*post-thumbnail/gi)];
    const allMatches = [...html.matchAll(/href="(https:\/\/lavidabonica\.com\/(?:sesion|batch-cooking|comida|primera-sesion|el-poder|como-congelar|6-consejos)[^"]*\/)"/gi)];
    
    for (const m of allMatches) {
      if (!urls.includes(m[1])) urls.push(m[1]);
    }
    await sleep(300);
  }
  // Filter out non-recipe posts
  const skip = [
    'https://lavidabonica.com/6-consejos-batch-cooking-sencillas/',
    'https://lavidabonica.com/como-congelar-correctamente-los-alimentos/',
    'https://lavidabonica.com/el-poder-de-las-especias/',
  ];
  return urls.filter(u => !skip.includes(u));
}

// Step 2: Extract recipe titles from a post
function extractRecipeTitles(html) {
  const titles = [];
  
  // Pattern 1: Text in ALL CAPS that looks like recipe titles (after stripping HTML)
  // Look for standalone uppercase lines that are recipe names
  // They appear as headers in the blog posts, often in <strong>, <h2>, <h3>, or plain uppercase
  
  // Remove script/style tags
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Method 1: Find h2/h3 headers
  const headerMatches = [...text.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi)];
  for (const m of headerMatches) {
    let title = m[1].replace(/<[^>]+>/g, '').trim();
    if (title.length > 3 && title.length < 150) {
      titles.push(title);
    }
  }
  
  // Method 2: Find strong/b tags that are standalone (recipe headers)
  const strongMatches = [...text.matchAll(/<(?:strong|b)>((?:(?!<(?:strong|b)>).)*?)<\/(?:strong|b)>/gi)];
  for (const m of strongMatches) {
    let title = m[1].replace(/<[^>]+>/g, '').trim();
    // Must be mostly uppercase or a recipe-like title
    const upper = title.replace(/[^A-ZÁÉÍÓÚÑÜ]/g, '');
    const lower = title.replace(/[^a-záéíóúñü]/g, '');
    if (title.length > 5 && title.length < 150 && upper.length > lower.length * 2) {
      titles.push(title);
    }
  }
  
  // Method 3: Plain text lines that are ALL CAPS (common blog pattern)
  const lines = text.replace(/<[^>]+>/g, '\n').split('\n');
  for (const line of lines) {
    const t = line.trim();
    if (t.length < 5 || t.length > 150) continue;
    const letters = t.replace(/[^a-zA-ZáéíóúñüÁÉÍÓÚÑÜ]/g, '');
    if (letters.length < 4) continue;
    const upper = t.replace(/[^A-ZÁÉÍÓÚÑÜ]/g, '');
    const lower = t.replace(/[^a-záéíóúñü]/g, '');
    if (upper.length > 3 && lower.length === 0) {
      // All uppercase line - likely a recipe title
      // Skip common non-recipe headers
      const skipWords = ['INGREDIENTES', 'PREPARACIÓN', 'PREPARACION', 'ELABORACIÓN', 'ELABORACION', 
        'CONSERVACIÓN', 'NOTAS', 'NOTA', 'HOJA DE RUTA', 'MENÚ', 'MENU', 'DISTRIBUCIÓN',
        'MIS NOTAS', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO',
        'SEMANA', 'COMPRA', 'LISTA DE LA COMPRA', 'BATCH COOKING', 'THE REAL BATCH COOKING',
        'COMPARTIR', 'AOVE', 'READ MORE', 'LEER MÁS'];
      if (!skipWords.includes(t)) {
        titles.push(t);
      }
    }
  }
  
  // Deduplicate (case insensitive)
  const seen = new Set();
  const unique = [];
  for (const t of titles) {
    const key = t.toLowerCase().replace(/\s+/g, ' ');
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(t);
    }
  }
  
  return unique;
}

function toTitleCase(str) {
  const lower = str.toLowerCase();
  const small = ['de', 'del', 'con', 'en', 'y', 'a', 'al', 'la', 'las', 'los', 'el', 'un', 'una', 'por', 'para', 'que', 'sin'];
  return lower.split(' ').map((word, i) => {
    if (i === 0 || !small.includes(word)) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    return word;
  }).join(' ');
}

async function main() {
  console.log('=== Phase 1: Scraping Batch Cooking Posts ===\n');
  
  const postUrls = await getPostUrls();
  console.log(`\nFound ${postUrls.length} batch cooking posts\n`);
  
  const catalogue = [];
  let totalRecipes = 0;
  const issues = [];
  
  for (let i = 0; i < postUrls.length; i++) {
    const url = postUrls[i];
    console.log(`[${i+1}/${postUrls.length}] ${url}`);
    try {
      const html = await fetch(url);
      
      // Get post title
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
      const postTitle = titleMatch ? titleMatch[1].replace(/ - La Vida Bonica.*/, '').replace(/ - The Real Batch Cooking.*/, '').trim() : url;
      
      const rawTitles = extractRecipeTitles(html);
      const recipes = rawTitles.map(t => toTitleCase(t));
      
      if (recipes.length === 0) {
        issues.push({ url, issue: 'No recipes found' });
        console.log(`  ⚠️  No recipes found`);
      } else {
        console.log(`  ✅ ${recipes.length} recipes: ${recipes.join(', ')}`);
      }
      
      catalogue.push({ postUrl: url, postTitle, recipes });
      totalRecipes += recipes.length;
      
      await sleep(400);
    } catch (e) {
      console.log(`  ❌ Error: ${e.message}`);
      issues.push({ url, issue: e.message });
    }
  }
  
  // Save catalogue
  fs.writeFileSync(
    '/Users/bryanzillmann/.openclaw/workspace/la-vida-bonica/batch-cooking-catalogue.json',
    JSON.stringify(catalogue, null, 2)
  );
  
  // Summary
  const summary = {
    totalPosts: catalogue.length,
    totalRecipesRaw: totalRecipes,
    postsWithNoRecipes: issues.filter(i => i.issue === 'No recipes found').length,
    issues
  };
  
  fs.writeFileSync(
    '/Users/bryanzillmann/.openclaw/workspace/la-vida-bonica/batch-cooking-summary.json',
    JSON.stringify(summary, null, 2)
  );
  
  console.log(`\n=== Summary ===`);
  console.log(`Posts scraped: ${catalogue.length}`);
  console.log(`Total recipes found: ${totalRecipes}`);
  console.log(`Posts with issues: ${issues.length}`);
  if (issues.length > 0) {
    console.log(`Issues:`);
    issues.forEach(i => console.log(`  - ${i.url}: ${i.issue}`));
  }
}

main().catch(console.error);
