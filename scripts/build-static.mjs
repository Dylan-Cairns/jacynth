import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pug from 'pug';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'site');
mkdirSync(output, { recursive: true });
cpSync(path.join(root, 'dist/public'), output, { recursive: true });

// Relative links let the export run both at / and at /jacynth/ on GitHub Pages.
const pageLinks = {
  '/': 'index.html',
  '/singleplayer': 'index.html',
  '/highscores': 'highscores.html',
  '/profile': 'profile.html'
};
const pages = {
  'index.html': 'game',
  'highscores.html': 'highscores',
  'profile.html': 'profile'
};

for (const [filename, view] of Object.entries(pages)) {
  const html = pug.renderFile(path.join(root, 'dist/views', `${view}.pug`), {
    gameType: 'singleplayer',
    userID: 'guest',
    hasNick: false,
    isAuthenticated: false
  });
  const staticHtml = html.replace(
    /\b(src|href)="([^"]*)"/g,
    (attribute, name, value) => {
      const relative =
        pageLinks[value] ??
        value
          .replace(/^\/javascript\//, 'javascript/')
          .replace(/^(?:\.\/|\.\.\/)?assets\//, 'assets/');
      return `${name}="${relative}"`;
    }
  );
  writeFileSync(path.join(output, filename), staticHtml);
}

// The legacy image preloader uses document-relative paths. With index.html
// at the export root, its images live in assets/ rather than ../assets/.
const viewScript = path.join(output, 'javascript/view/view.js');
writeFileSync(
  viewScript,
  readFileSync(viewScript, 'utf8').replace(/'\.\.\/assets\//g, "'assets/")
);

console.log('Static site built in site/');
