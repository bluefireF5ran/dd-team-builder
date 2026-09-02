import fs from 'fs';
import path from 'path';

// tailwind.config.js reads like a v3 leftover: the theme tokens in it are
// duplicated by the @theme block in index.css, and they are indeed dead. Its
// `content` array is not. @tailwindcss/postcss still reads this file, and it is
// the only thing telling Tailwind where to look for classes.
//
// Deleting it does not fail the build. It emits a stylesheet with no utilities
// at all, so every `hidden` element renders visible and the layout collapses,
// while `npm run build` still reports success. This test is the alarm.
const ROOT = path.join(__dirname, '..', '..');

describe('tailwind.config.js', () => {
  it('exists — deleting it silently strips every utility from the build', () => {
    expect(fs.existsSync(path.join(ROOT, 'tailwind.config.js'))).toBe(true);
  });

  it('still tells Tailwind to scan src', () => {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const config = require(path.join(ROOT, 'tailwind.config.js'));
    expect(Array.isArray(config.content)).toBe(true);
    expect(config.content.some((glob) => glob.includes('src'))).toBe(true);
  });

  it('has no screens key, so `xs:` is not a breakpoint', () => {
    // Six button labels were written as `hidden xs:inline` and were invisible
    // at every width because of this. If a breakpoint is ever wanted it goes in
    // @theme as --breakpoint-*, and this test should be updated deliberately.
    const config = require(path.join(ROOT, 'tailwind.config.js'));
    expect(config.theme?.screens).toBeUndefined();
    expect(config.theme?.extend?.screens).toBeUndefined();
  });
});
