import fs from 'fs';
import path from 'path';

const mode = process.argv[2] || 'postbuild';
const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const docsDir = path.join(rootDir, 'docs');
const staticBundleDir = path.join(rootDir, 'public', 'static-bundle');

if (mode === 'prebuild') {
  fs.rmSync(staticBundleDir, { recursive: true, force: true });
  process.exit(0);
}

const assetsDir = path.join(distDir, 'assets');
if (!fs.existsSync(assetsDir)) {
  process.exit(0);
}

// 1. Sync static-bundle in public/ so raw branch-based GitHub Pages ("/ (root)") works without a build step
fs.rmSync(staticBundleDir, { recursive: true, force: true });
fs.mkdirSync(staticBundleDir, { recursive: true });

const assetFiles = fs.readdirSync(assetsDir);
const jsFile = assetFiles.find((f) => f.endsWith('.js'));
const cssFile = assetFiles.find((f) => f.endsWith('.css'));

if (jsFile) {
  fs.copyFileSync(path.join(assetsDir, jsFile), path.join(staticBundleDir, 'app.js'));
}
if (cssFile) {
  fs.copyFileSync(path.join(assetsDir, cssFile), path.join(staticBundleDir, 'app.css'));
}

// 2. Sync docs/ folder so GitHub Pages ("Deploy from branch -> /docs") also works out of the box
fs.rmSync(docsDir, { recursive: true, force: true });
fs.cpSync(distDir, docsDir, { recursive: true });
fs.copyFileSync(path.join(distDir, 'index.html'), path.join(docsDir, '404.html'));
fs.writeFileSync(path.join(docsDir, '.nojekyll'), '', 'utf-8');
