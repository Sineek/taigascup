import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const libraryRoot = path.join(projectRoot, 'src', 'assets', 'library');
const categories = ['wheels', 'backgrounds'];
const allowedExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp']);

async function ensureDirectory(directory) {
  await fs.mkdir(directory, { recursive: true });
}

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walk(absolutePath)));
      continue;
    }

    if (entry.isFile() && allowedExtensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(absolutePath);
    }
  }

  return files;
}

function toDisplayName(fileName) {
  const withoutExtension = fileName.replace(/\.[^.]+$/, '');
  return withoutExtension
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase('pt-BR'));
}

function toAssetPath(category, relativeFile) {
  return `assets/library/${category}/${relativeFile.split(path.sep).map(encodeURIComponent).join('/')}`;
}

async function generateCategory(category) {
  const categoryRoot = path.join(libraryRoot, category);
  await ensureDirectory(categoryRoot);

  const files = await walk(categoryRoot);

  return files
    .map((absoluteFile) => {
      const relativeFile = path.relative(categoryRoot, absoluteFile);
      const pathParts = relativeFile.split(path.sep);
      const fileName = pathParts.at(-1) ?? relativeFile;
      const collection = pathParts.length > 1 ? pathParts[0] : 'Geral';

      return {
        name: toDisplayName(fileName),
        fileName,
        collection,
        path: toAssetPath(category, relativeFile),
        category,
      };
    })
    .sort((a, b) => {
      const collectionComparison = a.collection.localeCompare(b.collection, 'pt-BR', {
        numeric: true,
      });
      return collectionComparison || a.name.localeCompare(b.name, 'pt-BR', { numeric: true });
    });
}

await ensureDirectory(libraryRoot);

const [wheels, backgrounds] = await Promise.all(
  categories.map((category) => generateCategory(category)),
);

const manifest = {
  generatedAt: new Date().toISOString(),
  wheels,
  backgrounds,
};

await fs.writeFile(
  path.join(libraryRoot, 'library.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8',
);

console.log(`Biblioteca atualizada: ${wheels.length} rodas e ${backgrounds.length} backgrounds.`);
