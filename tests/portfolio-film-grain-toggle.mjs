import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const css = readFileSync(join(root, 'assets/portfolio-nav.css'), 'utf8');

const pages = [
  {
    label: 'Home film mode',
    file: 'index.html',
    storagePrefix: 'boyi-portfolio-grain',
    expectedButtonClass: 'portfolio-grain-toggle-home',
  },
  {
    label: 'Done Before',
    file: 'DoneBefore.html',
    storagePrefix: 'boyi-portfolio-grain',
    expectedButtonClass: 'portfolio-grain-toggle-case',
  },
  {
    label: 'Who Is at the Helm',
    file: 'who-is-at-the-helm/index.html',
    storagePrefix: 'boyi-portfolio-grain',
    expectedButtonClass: 'portfolio-grain-toggle-helm',
  },
];

assert.match(
  css,
  /\[data-film-grain\]\s*\{[\s\S]*display:\s*none\s*!important/,
  'Decorative grain overlays should be hidden by default when JS does not run.'
);

assert.match(
  css,
  /html\[data-grain=["']on["']\]\s+\[data-film-grain\]\s*\{[\s\S]*display:\s*block\s*!important/,
  'Document grain state should opt decorative grain overlays back in.'
);

assert.match(
  css,
  /\.portfolio-grain-toggle\b[\s\S]*position:\s*fixed/,
  'Shared CSS should define a fixed, out-of-primary-nav grain toggle.'
);

assert.match(
  css,
  /\.portfolio-grain-toggle:focus-visible\s*\{[\s\S]*outline:\s*2px solid var\(--portfolio-film-accent\)\s*!important/,
  'Grain toggle should have a visible keyboard focus state.'
);

assert.match(
  css,
  /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*\[data-film-grain\][\s\S]*animation:\s*none\s*!important/,
  'Reduced motion should disable animated grain movement.'
);

for (const { label, file, storagePrefix, expectedButtonClass } of pages) {
  const html = readFileSync(join(root, file), 'utf8');

  assert.match(
    html,
    /data-film-grain[^>]*aria-hidden=["']true["']|aria-hidden=["']true["'][^>]*data-film-grain/,
    `${label} should mark the decorative grain overlay as aria-hidden data-film-grain.`
  );

  assert.match(
    html,
    new RegExp(`<button[^>]+class=["'][^"']*portfolio-grain-toggle[^"']*${expectedButtonClass}[^"']*["'][^>]+data-grain-toggle[\\s\\S]*?</button>`, 'i'),
    `${label} should render a compact grain toggle button outside primary navigation.`
  );

  assert.match(
    html,
    /aria-pressed=["']\{\{\s*grainPressed\s*\}\}["']/,
    `${label} grain toggle should expose aria-pressed state.`
  );

  assert.match(
    html,
    /onClick=["']\{\{\s*toggleGrain\s*\}\}["']/,
    `${label} grain toggle should update immediately without reload.`
  );

  assert.match(
    html,
    new RegExp(storagePrefix),
    `${label} should persist the grain preference with the shared localStorage key.`
  );

  assert.match(
    html,
    /prefers-reduced-motion:\s*reduce/,
    `${label} should default to reduced/no grain when reduced motion is requested.`
  );

  assert.match(
    html,
    /grainPressed:\s*this\.state\.grain\s*\?\s*"true"\s*:\s*"false"/,
    `${label} render values should expose an aria-pressed string.`
  );

  assert.doesNotMatch(
    html,
    /href=["'](?:\.\/|\.\.\/)?Resume\.html["']/,
    `${label} should not introduce Resume.html into live navigation.`
  );
}
