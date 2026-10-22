import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '../dist');

// Itens estáticos a serem copiados da raiz para dist
const itemsToCopy = [
  'index.html',
  'style.css',
  'theme.js',
  'robots.txt',
  'sitemap.xml',
  'logo.png',
  'logo.svg',
  'logo.ico',
  'LOGO.ico',
  'PLM_SIMBOLO_BRANCO.png',
  'PLM_SIMBOLO_PRETO.png',
  'PLM_SIMBOLO_REDUZIDO_BRANCO.png',
  'PLM_SIMBOLO_REDUZIDO_PRETO.png',
  'bora',
  'talk',
  'briefing',
  'admin',
  'ads',
  'login',
  'blog',
  'Curriculum',
  'assets',
  'avatar',
  'shared',
  'en',
  'legacy',
  'penumbra',
  'site-content.json',
  'design-tokens.json',
  'media_manifest.json'
];

function deleteFolderRecursive(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

let fileCount = 0;

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
    fileCount++;
  }
}

const startTime = Date.now();
console.log('⚡ Pelimotion Studio — Build de Produção (Zero-Bandwidth Edge)');
console.log('─────────────────────────────────────────────────────────────');

// Limpar dist anterior
deleteFolderRecursive(DIST_DIR);
fs.mkdirSync(DIST_DIR, { recursive: true });

// Copiar arquivos selecionados
itemsToCopy.forEach((item) => {
  const srcPath = path.join(__dirname, '..', item);
  const destPath = path.join(DIST_DIR, item);
  
  if (fs.existsSync(srcPath)) {
    console.log(`  ✓ Empacotado: ${item}`);
    copyRecursiveSync(srcPath, destPath);
  }
});

const duration = Date.now() - startTime;
console.log('─────────────────────────────────────────────────────────────');
console.log(`✨ Build estática concluída com sucesso! (${fileCount} arquivos em ${duration}ms)`);
