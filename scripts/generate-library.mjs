import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const libraryRoot = path.join(projectRoot, 'src', 'assets', 'library');
const categories = ['wheels', 'backgrounds'];
const allowedExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp']);

async function ensureDirectory(directory) { await fs.mkdir(directory, { recursive: true }); }
async function walk(directory) {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) files.push(...await walk(absolutePath));
      else if (entry.isFile() && allowedExtensions.has(path.extname(entry.name).toLowerCase())) files.push(absolutePath);
    }
    return files;
  } catch { return []; }
}
function toDisplayName(fileName) {
  return fileName.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
    .replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase('pt-BR'));
}
function toAssetPath(category, relativeFile) {
  return `assets/library/${category}/${relativeFile.split(path.sep).map(encodeURIComponent).join('/')}`;
}
async function generateCategory(category) {
  const categoryRoot = path.join(libraryRoot, category);
  await ensureDirectory(categoryRoot);
  return (await walk(categoryRoot)).map((absoluteFile) => {
    const relativeFile = path.relative(categoryRoot, absoluteFile);
    const pathParts = relativeFile.split(path.sep);
    const fileName = pathParts.at(-1) ?? relativeFile;
    return { name: toDisplayName(fileName), fileName, collection: pathParts.length > 1 ? pathParts[0] : 'Geral', path: toAssetPath(category, relativeFile), category };
  }).sort((a, b) => a.collection.localeCompare(b.collection, 'pt-BR', { numeric: true }) || a.name.localeCompare(b.name, 'pt-BR', { numeric: true }));
}
async function generateCards() {
  const root = path.join(libraryRoot, 'Cards');
  const files = await walk(root);
  const byCode = new Map();
  for (const absoluteFile of files) {
    const fileName = path.basename(absoluteFile);
    const match = fileName.match(/^([A-Z]{1,5}\d{0,2}-\d{3})(?!_)/i);
    if (!match) continue;
    const code = match[1].toUpperCase();
    const relative = path.relative(root, absoluteFile);
    const existing = byCode.get(code);
    const small = /_small\./i.test(fileName);
    const assetPath = toAssetPath('Cards', relative);
    if (!existing) byCode.set(code, { code, name: code, image: small ? '' : assetPath, thumbnail: small ? assetPath : '' });
    else if (small) existing.thumbnail ||= assetPath;
    else existing.image ||= assetPath;
  }
  let names = {};
  try { names = JSON.parse(await fs.readFile(path.join(libraryRoot, 'card-names.json'), 'utf8')); } catch {}
  if (!byCode.size) {
    try { return JSON.parse(await fs.readFile(path.join(libraryRoot, 'cards.json'), 'utf8')); } catch { return []; }
  }
  return [...byCode.values()].map((card) => ({ ...card, name: names[card.code] ?? card.code, image: card.image || card.thumbnail, thumbnail: card.thumbnail || card.image }))
    .sort((a, b) => a.code.localeCompare(b.code, 'pt-BR', { numeric: true }));
}

await ensureDirectory(libraryRoot);
const [wheels, backgrounds, cards] = await Promise.all([...categories.map(generateCategory), generateCards()]);
await fs.writeFile(path.join(libraryRoot, 'library.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), wheels, backgrounds }, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(libraryRoot, 'cards.json'), `${JSON.stringify(cards)}\n`, 'utf8');
console.log(`Biblioteca atualizada: ${wheels.length} rodas, ${backgrounds.length} backgrounds e ${cards.length} cartas.`);
