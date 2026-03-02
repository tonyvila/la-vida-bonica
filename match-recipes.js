const fs = require('fs');
const https = require('https');

// Helper to fetch URL and return text
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Helper to sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Normalize a recipe title to a URL slug
function titleToSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Extract image from HTML
function extractImageFromHtml(html) {
  // Try to find og:image meta tag first
  const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
  if (ogImageMatch) return ogImageMatch[1];
  
  // Try to find first image in article/main content
  const articleImgMatch = html.match(/<article[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/i);
  if (articleImgMatch) return articleImgMatch[1];
  
  // Try any img tag
  const imgMatch = html.match(/<img[^>]+src="([^"]+)"/i);
  if (imgMatch) return imgMatch[1];
  
  return null;
}

async function main() {
  console.log('Starting recipe image matching...');
  
  // Read recipe titles
  const recipeText = fs.readFileSync('/tmp/shared_recipes.txt', 'utf-8');
  const recipes = recipeText.trim().split('\n').map(r => r.trim()).filter(r => r);
  console.log(`Loaded ${recipes.length} recipes`);
  
  // Fetch sitemaps
  console.log('Fetching sitemaps...');
  const sitemaps = [
    'https://lavidabonica.com/post-sitemap1.xml',
    'https://lavidabonica.com/post-sitemap2.xml',
    'https://lavidabonica.com/post-sitemap3.xml'
  ];
  
  let allUrls = [];
  for (const sitemap of sitemaps) {
    console.log(`Fetching ${sitemap}...`);
    const xml = await fetchUrl(sitemap);
    // Extract URLs from XML
    const urlMatches = xml.matchAll(/<loc>(https:\/\/lavidabonica\.com\/[^<]+)<\/loc>/g);
    for (const match of urlMatches) {
      const url = match[1];
      // Skip batch-cooking and sesion URLs
      if (!url.includes('batch-cooking') && !url.includes('sesion')) {
        allUrls.push(url);
      }
    }
    await sleep(1000); // Be nice to the server
  }
  
  console.log(`Found ${allUrls.length} blog article URLs (excluding batch-cooking/sesion)`);
  
  // Build slug to URL map
  const slugMap = new Map();
  for (const url of allUrls) {
    const slug = url.split('/').filter(p => p).pop();
    slugMap.set(slug, url);
  }
  
  // Match recipes
  const matched = [];
  const unmatched = [];
  
  console.log('\nMatching recipes to blog articles...');
  for (const recipe of recipes) {
    const slug = titleToSlug(recipe);
    
    // Try exact match first
    let matchedUrl = slugMap.get(slug);
    
    // Try partial matches if no exact match
    if (!matchedUrl) {
      const slugParts = slug.split('-');
      for (const [candidateSlug, url] of slugMap.entries()) {
        // Check if candidate contains most of the words from our slug
        const candidateParts = candidateSlug.split('-');
        const matchCount = slugParts.filter(p => candidateParts.includes(p)).length;
        if (matchCount >= Math.min(3, slugParts.length - 1)) {
          matchedUrl = url;
          console.log(`  Fuzzy match: "${recipe}" -> ${candidateSlug}`);
          break;
        }
      }
    }
    
    if (matchedUrl) {
      matched.push({ recipe, url: matchedUrl });
    } else {
      unmatched.push(recipe);
      console.log(`  No match: "${recipe}" (slug: ${slug})`);
    }
  }
  
  console.log(`\nMatched: ${matched.length}, Unmatched: ${unmatched.length}`);
  
  // Fetch images for matched recipes
  console.log('\nFetching images for matched recipes (with 3-second delays)...');
  const results = {
    matched: [],
    unmatched: unmatched
  };
  
  for (let i = 0; i < matched.length; i++) {
    const { recipe, url } = matched[i];
    console.log(`[${i+1}/${matched.length}] Fetching: ${recipe}`);
    
    try {
      const html = await fetchUrl(url);
      const imageUrl = extractImageFromHtml(html);
      
      if (imageUrl) {
        results.matched.push({
          title: recipe,
          blogUrl: url,
          imageUrl: imageUrl
        });
        console.log(`  ✓ Found image: ${imageUrl.substring(0, 60)}...`);
      } else {
        console.log(`  ✗ No image found`);
        results.unmatched.push(recipe);
      }
    } catch (err) {
      console.log(`  ✗ Error: ${err.message}`);
      results.unmatched.push(recipe);
    }
    
    // 3-second delay between requests
    if (i < matched.length - 1) {
      await sleep(3000);
    }
  }
  
  // Save results
  const outputPath = '/Users/bryanzillmann/.openclaw/workspace/la-vida-bonica/image-matches.json';
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log(`\n=== COMPLETE ===`);
  console.log(`Matched with images: ${results.matched.length}`);
  console.log(`Unmatched: ${results.unmatched.length}`);
  console.log(`Results saved to: ${outputPath}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
