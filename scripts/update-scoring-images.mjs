import { readFile, writeFile } from 'node:fs/promises';

const rulesPath = 'src/assets/scoring/rules.json';
const imagesPath = 'src/assets/scoring/ligaonepiece-images.json';
const libraryPath = 'src/assets/library/library.json';

const [rules, images, library] = await Promise.all([
  readFile(rulesPath, 'utf8').then(JSON.parse),
  readFile(imagesPath, 'utf8').then(JSON.parse),
  readFile(libraryPath, 'utf8').then(JSON.parse),
]);

const localCodes = new Set(
  (library.backgrounds ?? [])
    .map(({ fileName }) => fileName.match(/^([A-Z]{1,5}\d{2,3}-\d{3})\s+-\s+/)?.[1])
    .filter(Boolean),
);

const missing = [...new Set([...Object.keys(rules.leaders), ...Object.keys(rules.cards)])]
  .filter((code) => !localCodes.has(code) && !images[code]);

for (const code of missing) {
  try {
    const searchUrl = `https://www.ligaonepiece.com.br/?view=cards%2Fsearch&card=${encodeURIComponent(code)}&tipo=1`;
    const response = await fetch(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TaigasCupImageIndex/1.0)' },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    const matches = html.matchAll(/<a\b(?=[^>]*class=["'][^"']*\bmain-link-card\b)[^>]*>[\s\S]*?<\/a>/g);
    for (const match of matches) {
      if (!new RegExp(`(?:&amp;|&)num=${code}(?:&amp;|&|["'])`).test(match[0])) continue;
      const source = match[0].match(/<img\b[^>]*\bsrc=["']([^"']+)["']/)?.[1];
      if (!source) continue;
      const imageUrl = new URL(source, searchUrl);
      if (imageUrl.hostname !== 'repositorio.sbrauble.com') continue;
      images[code] = imageUrl.href;
      console.log(`Imagem encontrada: ${code}`);
      break;
    }
    if (!images[code]) console.warn(`Imagem não encontrada: ${code}`);
  } catch (error) {
    console.warn(`Falha ao buscar ${code}: ${error.message}`);
  }
  if (missing.length > 1) await new Promise((resolve) => setTimeout(resolve, 2000));
}

await writeFile(imagesPath, `${JSON.stringify(images, null, 2)}\n`, 'utf8');
console.log(`Referências de imagens: ${Object.keys(images).length} cartas.`);
