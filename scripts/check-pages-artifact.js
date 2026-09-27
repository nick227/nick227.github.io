import { readFile, readdir } from 'node:fs/promises';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const script = html.match(/<script type="module"[^>]*src="([^"]+)"/);

if (!script) {
  throw new Error('dist/index.html has no module script. GitHub Pages would publish an empty shell.');
}

const src = script[1];

if (!src.startsWith('/assets/') && !src.startsWith('./assets/')) {
  throw new Error(`Pages bundle src "${src}" is not rooted at /assets/. The live site would not load it.`);
}

const assetsDir = new URL('../dist/assets/', import.meta.url);
const assets = await readdir(assetsDir);
const bundleName = assets.find(name => name.endsWith('.js'));

if (!bundleName) {
  throw new Error('dist/assets has no JavaScript bundle.');
}

const bundle = await readFile(new URL(bundleName, assetsDir), 'utf8');

if (!bundle.includes('home-title')) {
  throw new Error('Built bundle is missing the home title. Pages would deploy without the intro.');
}
