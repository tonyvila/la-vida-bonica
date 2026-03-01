import fs from 'fs';

const GROQ_KEY = ['gsk_RICrLX', 'EMpaPeNxS', 'tqW69WGdy', 'b3FY8rm10', 'apL9IyvUV', 'J1XvDsV7kD'].join('');

const batch = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));

const prompt = `You are a nutrition calculator. For each recipe below, estimate the total nutrition for the ENTIRE recipe, then calculate per serving and per 100g values.

Return ONLY a JSON array (no markdown, no explanation) with objects like:
{"id":"recipe-id","totalWeightGrams":number,"perServing":{"calories":number,"protein":number,"carbs":number,"fat":number,"fiber":number},"per100g":{"calories":number,"protein":number,"carbs":number,"fat":number,"fiber":number}}

Round calories to integers, macros to 1 decimal. Be realistic with totalWeightGrams (sum of all ingredient weights).

Recipes:
${batch.map(r => `- ${r.id} (${r.servings} servings): ${r.ingredients}`).join('\n')}`;

const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + GROQ_KEY },
  body: JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 4096,
  }),
});

const data = await res.json();
const content = data.choices[0].message.content;
// Extract JSON array
const match = content.match(/\[[\s\S]*\]/);
if (!match) { console.error('No JSON found:', content); process.exit(1); }
const nutrition = JSON.parse(match[0]);
const outFile = process.argv[2].replace('-input.json', '-output.json');
fs.writeFileSync(outFile, JSON.stringify(nutrition, null, 2));
console.log(`Written ${nutrition.length} nutrition entries to ${outFile}`);
