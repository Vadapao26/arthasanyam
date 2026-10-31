import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const assetsDir = path.join(distDir, 'assets');

const files = fs.readdirSync(assetsDir);
const cssFile = files.find((f) => f.endsWith('.css'));
const jsFile = files.find((f) => f.endsWith('.js'));

if (!cssFile || !jsFile) {
  console.error('Could not find built CSS or JS in dist/assets');
  process.exit(1);
}

const cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');
const jsContent = fs.readFileSync(path.join(assetsDir, jsFile), 'utf8');

const portableHtml = `<!doctype html>
<html lang="mr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="theme-color" content="#9E3B24" />
    <title>अर्थसंयम (Arthasanyam) — 100% Portable Offline Vault</title>
    <style>${cssContent}</style>
  </head>
  <body class="bg-[#FBF8F5] text-[#241916] antialiased selection:bg-[#9E3B24] selection:text-[#FBF8F5]">
    <div id="root"></div>
    <script type="module">${jsContent.replace(/<\/script>/g, '<\\/script>')}</script>
  </body>
</html>`;

const outDistPath = path.join(distDir, 'arthasanyam-portable-offline.html');
const outRootPath = path.join(rootDir, 'arthasanyam-portable-offline.html');

fs.writeFileSync(outDistPath, portableHtml, 'utf8');
fs.writeFileSync(outRootPath, portableHtml, 'utf8');

console.log('✓ Created standalone portable offline bundle:', outRootPath);
