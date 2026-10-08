# A digital adaptation of the game Jacynth

This is an implementation of the card game [Jacynth](http://wiki.decktet.com/game:jacynth) from the [Decktet](https://www.decktet.com/).

You can play the game [here](https://dylan-cairns.github.io/jacynth/)!

This is a simplified version of the original project, modified to be hosted on github. The code for the original project, which is no longer hosted online, can be found [here](https://github.com/Dylan-Cairns/Jacynth-legacy).

## Development

Install the locked dependencies with `npm ci`. Then:

- `npm run typecheck` checks the TypeScript source without changing files.
- `npm run build` compiles `src/` into the tracked JavaScript in `dist/`.
- `npm start` serves the game at <http://localhost:3000/singleplayer>.

CSS, images, and Pug templates currently live under `dist/`; the TypeScript
build preserves them. `npm run dev` restarts the server when files change,
but does not compile TypeScript automatically. Run `npm run build` after
editing TypeScript.

## Static export

Run `npm run build:static` to compile the source and generate a standalone site
in the ignored `site/` folder. This uses the existing `pug` dependency directly;
`pug-pack` is no longer needed. The export includes the game as `index.html`,
the history/profile pages, and their assets. Serve `site/` with a static HTTP
server to preview it; opening the HTML directly with `file://` does not support
the game's module loading.

The relative links support hosting under a path such as `/jacynth/`. Publish
the contents of `site/` for GitHub Pages rather than the repository root on
`main`. The historical `gh-pages` branch contains an older, separately generated
export; building locally does not update or publish that branch.
