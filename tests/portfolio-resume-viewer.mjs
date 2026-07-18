import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const resumePdf = 'Boyi_Tan_UX_Designer_Resume.pdf';
const publicHtmlFiles = [
  'index.html',
  'About.html',
  'ArtFac.html',
  'LinkLog.html',
  'KindnessQuest.html',
  'DoneBefore.html',
  'who-is-at-the-helm/index.html',
  'who-is-at-the-helm/interactive-demo.html',
];

const caseNavFiles = [
  ['ArtFac.html', 'SCENE 01'],
  ['LinkLog.html', 'SCENE 02'],
  ['KindnessQuest.html', 'SCENE 03'],
  ['DoneBefore.html', 'REEL 01'],
  ['who-is-at-the-helm/index.html', 'REEL 02'],
];

assert.equal(
  existsSync(join(root, resumePdf)),
  true,
  'The tracked resume PDF must exist before public pages can link to it.'
);

for (const file of publicHtmlFiles) {
  const html = readFileSync(join(root, file), 'utf8');
  const expectedTarget = file.startsWith('who-is-at-the-helm/')
    ? `../${resumePdf}`
    : `./${resumePdf}`;

  assert.doesNotMatch(
    html,
    /href=["'](?:\.\/|\.\.\/)?Resume\.html["']/,
    `${file} should not link to Resume.html in the deployed navigation.`
  );

  if (/\bResume\b/i.test(html)) {
    const resumeLinks = [...html.matchAll(/<a\b[^>]*>\s*Resume\s*<\/a>/gi)]
      .map((match) => match[0]);

    assert.ok(resumeLinks.length > 0, `${file} should expose at least one Resume link.`);

    for (const link of resumeLinks) {
      assert.match(
        link,
        new RegExp(`href=["']${expectedTarget.replace('.', '\\.')}["']`),
        `${file} should point Resume links to ${expectedTarget}.`
      );
      assert.match(link, /\btarget=["']_blank["']/i, `${file} Resume links should open the PDF in a new tab.`);
      assert.match(link, /\brel=["'][^"']*\bnoopener\b[^"']*["']/i, `${file} Resume links should use rel="noopener".`);
    }
  }
}

for (const [file, expectedMeta] of caseNavFiles) {
  const html = readFileSync(join(root, file), 'utf8');
  const navRightStart = html.search(/class=["'][^"']*(?:portfolio-nav-right|film-nav-right)[^"']*["']/);
  const chapterStart = html.search(/class=["'][^"']*(?:portfolio-nav-chapters|film-chapters)[^"']*["']/);

  assert.ok(navRightStart >= 0, `${file} should contain a primary nav link group.`);
  assert.ok(chapterStart > navRightStart, `${file} should place chapter navigation after the primary nav.`);

  const primaryNavSlice = html.slice(navRightStart, chapterStart);
  assert.doesNotMatch(
    primaryNavSlice,
    /\b(?:SCENE\s+0[123]|REEL\s+0[12]|TC|00:00(?::00)?)\b/,
    `${file} should not keep SCENE / REEL / TC metadata in the top primary nav.`
  );

  assert.match(
    html,
    /class=["'][^"']*portfolio-nav-meta[^"']*["'][\s\S]{0,240}(?:SCENE|REEL)[\s\S]{0,80}\bTC\b/,
    `${file} should relocate ${expectedMeta} metadata into a subtle chapter-area label.`
  );

  const chapterButtonMarkup = [...html.matchAll(/<button\b[^>]*(?:data-ch|class=["'][^"']*chapter-btn)[^>]*>[\s\S]*?<\/button>/gi)]
    .map((match) => match[0])
    .join('\n');
  assert.doesNotMatch(
    chapterButtonMarkup,
    /\b(?:SCENE\s+0[123]|REEL\s+0[12]|TC|00:00(?::00)?)\b/,
    `${file} should not squeeze metadata into chapter buttons.`
  );
}
