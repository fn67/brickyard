// End-to-end checks with Playwright. Run `npm run build` first, then `npm run verify:ui`.
// Starts `vite preview`, clicks through the main flows, saves screenshots to docs/screenshots/,
// and exits non-zero on any failed check or console error.
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';

const PORT = 4318;
const URL = `http://localhost:${PORT}/`;
const OUT = 'docs/screenshots';
const only = process.argv[2]; // optional section name

mkdirSync(OUT, { recursive: true });

const failures = [];
const consoleErrors = [];
let passed = 0;

function check(cond, message) {
  if (cond) passed++;
  else {
    failures.push(message);
    console.log('  FAIL ' + message);
  }
}

async function startServer() {
  const proc = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'pipe' });
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(URL);
      if (res.ok) return proc;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  proc.kill();
  throw new Error('vite preview did not start');
}

async function newPage(browser, { width, height, scheme = 'light', storage, touch = false } = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    colorScheme: scheme,
    acceptDownloads: true,
    hasTouch: touch,
    isMobile: touch,
    deviceScaleFactor: 1,
  });
  if (storage) {
    await context.addInitScript((s) => {
      for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v);
    }, storage);
  }
  const page = await context.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(`[${width}x${height}] ${m.text()}`);
  });
  page.on('pageerror', (e) => consoleErrors.push(`[${width}x${height}] ${e}`));
  await page.goto(URL);
  await page.waitForSelector('#name');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  return { page, context };
}

async function shot(page, name, opts = {}) {
  await page.waitForTimeout(opts.wait ?? 150);
  await page.screenshot({ path: join(OUT, name + '.png'), fullPage: !!opts.full });
}

/** Reads the PNG header of a download: width, height and colour type (6 = RGBA). */
function pngInfo(path) {
  const b = readFileSync(path);
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20), colorType: b[25], bytes: b };
}

const sections = {};

sections.desktop = async (browser) => {
  console.log('Desktop flows');
  for (const scheme of ['light', 'dark']) {
    const { page, context } = await newPage(browser, { width: 1440, height: 900, scheme });
    check((await page.inputValue('#name')) === 'hello-world', 'name field opens with hello-world');
    check((await page.getAttribute('#name', 'placeholder')) === 'Username, name…', 'placeholder text');
    check((await page.getAttribute('#name', 'maxlength')) === '40', 'max 40 characters');
    check(await page.getByText('Enter anything to see your avatar').isVisible(), 'field label');
    check(await page.getByText('Pixel avatars for people who hate profile pictures.').isVisible(), 'tagline');
    const text = await page.locator('body').innerText();
    check(!/seed/i.test(text), 'the word "seed" never appears in the interface');
    check((await page.locator('.style-tile').count()) === 10, 'ten style cards');
    check((await page.locator('.badge-3d').count()) === 1, 'one 3D badge');
    check((await page.locator('.style-tile', { hasText: 'Critter' }).locator('.badge-3d').count()) === 1, '3D badge on Critter');
    check((await page.locator('.variation-tile').count()) === 6, 'six variations');
    check(await page.getByText('3D is available for Critter.').isVisible(), '3D note visible for Classic');
    check(await page.getByRole('button', { name: '3D', exact: true }).isDisabled(), '3D switch disabled for Classic');
    await shot(page, `desktop-1440-${scheme}`, { full: true });
    await context.close();
  }

  const { page, context } = await newPage(browser, { width: 1440, height: 900 });
  const alt = () => page.locator('.preview-stage [role="img"]').getAttribute('aria-label');
  check((await alt()) === 'Avatar for hello-world in the Classic style', 'preview text alternative');

  // Typing updates everything.
  await page.fill('#name', 'octocat');
  check((await alt()) === 'Avatar for octocat in the Classic style', 'typing updates the preview');
  check((await page.locator('.facts dd.mono').innerText()) === 'octocat', 'facts show the name');
  await page.fill('#name', '');
  check((await alt()) === 'Avatar for hello-world in the Classic style', 'empty name uses hello-world');
  await page.fill('#name', '  spaced  ');
  check((await alt()) === 'Avatar for spaced in the Classic style', 'leading and trailing spaces ignored');
  await page.fill('#name', 'x'.repeat(50));
  check((await page.inputValue('#name')).length <= 40, 'field limited to 40 characters');
  await page.fill('#name', '山田太郎');
  check((await alt()) === 'Avatar for 山田太郎 in the Classic style', 'non-English name');

  // Shuffle gives a git-flavoured two-word name.
  await page.getByRole('button', { name: 'Shuffle' }).click();
  check(/^[a-z]+-[a-z]+$/.test(await page.inputValue('#name')), 'Shuffle fills a two-word name');

  // Styles.
  await page.fill('#name', 'hello-world');
  await page.locator('.style-tile', { hasText: 'Kaleido' }).click();
  check((await alt()) === 'Avatar for hello-world in the Kaleido style', 'picking a style updates the preview');
  check((await page.locator('.facts dd').first().innerText()) === 'Kaleido', 'facts show the style');
  check((await page.locator('.facts dd').nth(1).innerText()) === '6×6', 'facts show the grid');

  // Variations.
  await page.locator('.variation-tile').nth(3).click();
  check((await page.inputValue('#name')) === 'hello-world:3', 'variation puts name:3 in the field');
  check(await page.getByText('Using variation 3').isVisible(), 'Using variation 3 note');
  const varNames = await page.locator('.variation-tile').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')));
  check(varNames[0].endsWith('hello-world') && varNames[5].endsWith('hello-world:5'), 'variations drop an existing :number suffix');
  await page.getByRole('button', { name: 'Use original' }).click();
  check((await page.inputValue('#name')) === 'hello-world', 'Use original returns to the name');

  // Try it selects Critter.
  await page.getByRole('button', { name: 'Try it' }).click();
  check((await alt()) === null || (await page.locator('.style-tile[aria-pressed="true"]').innerText()).includes('Critter'), 'Try it selects Critter');
  check(!(await page.getByRole('button', { name: '3D', exact: true }).isDisabled()), '3D switch enabled for Critter');
  await page.locator('.style-tile', { hasText: 'Classic' }).click();
  check((await page.getByRole('button', { name: '2D', exact: true }).getAttribute('aria-pressed')) === 'true', 'another style returns to 2D');

  // App appearance toggle: immediate, remembered, independent of the avatar.
  const before = await page.locator('.preview-stage canvas').evaluate((c) => c.toDataURL());
  const toggle = page.getByRole('button', { name: 'Switch app to dark mode' });
  check(await toggle.isVisible(), 'dark mode toggle visible with the light-mode label');
  await toggle.click();
  check((await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark', 'toggle switches to dark');
  check(await page.getByRole('button', { name: 'Switch app to light mode' }).isVisible(), 'toggle label flips');
  const after = await page.locator('.preview-stage canvas').evaluate((c) => c.toDataURL());
  check(before === after, 'app appearance never changes the avatar');
  await page.reload();
  await page.waitForSelector('#name');
  check((await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark', 'choice survives a reload');
  await context.close();

  // No flash: the saved theme is on <html> before the app script runs.
  {
    const ctx = await browser.newContext({ viewport: { width: 800, height: 600 }, colorScheme: 'light' });
    await ctx.addInitScript(() => localStorage.setItem('brickyard-appearance', 'dark'));
    const p = await ctx.newPage();
    await p.route('**/assets/*.js', async (route) => {
      // Hold the app bundle back so the page is painted with only index.html.
      await new Promise((r) => setTimeout(r, 800));
      await route.continue();
    });
    await p.goto(URL, { waitUntil: 'commit' });
    await p.waitForFunction(() => !!document.body && !!document.getElementById('root'));
    const early = await p.evaluate(() => ({
      theme: document.documentElement.dataset.theme,
      bg: getComputedStyle(document.body).backgroundColor,
      appMounted: !!document.querySelector('#root')?.children.length,
    }));
    check(early.theme === 'dark' && !early.appMounted, 'dark theme applied before the app script runs');
    check(early.bg === 'rgb(14, 14, 16)', 'page background is dark before first app paint (got ' + early.bg + ')');
    await ctx.close();
  }

  // First visit follows the system.
  {
    const { page: p, context: c } = await newPage(browser, { width: 800, height: 600, scheme: 'dark' });
    check(await p.getByRole('button', { name: 'Switch app to light mode' }).isVisible(), 'first visit follows a dark system');
    await c.close();
  }
};

sections.keyboard = async (browser) => {
  console.log('Keyboard');
  const { page, context } = await newPage(browser, { width: 1440, height: 900 });
  const seen = new Set();
  let noOutline = [];
  await page.locator('body').click({ position: { x: 5, y: 5 } });
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      return {
        label: el.getAttribute('aria-label') || el.textContent?.trim() || el.id,
        outline: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2,
      };
    });
    if (!info) continue;
    seen.add(info.label);
    if (!info.outline) noOutline.push(info.label);
  }
  for (const want of ['Switch app to dark mode', 'name', 'Shuffle', '2D', 'Light', 'Dark', 'Transparent', 'Copy PNG', 'Download', 'Auto, colour from the name', 'Critter style, 9×9, 3D available', 'Try it']) {
    check([...seen].some((s) => s === want || s.startsWith(want)), 'reachable by keyboard: ' + want);
  }
  check(noOutline.length === 0, 'visible focus on every control (missing: ' + noOutline.join(', ') + ')');
  // Space/Enter activate a style card.
  await page.locator('.style-tile', { hasText: 'Dither' }).focus();
  await page.keyboard.press('Enter');
  check((await page.locator('.style-tile[aria-pressed="true"]').innerText()).includes('Dither'), 'Enter picks a style card');
  await page.locator('.style-tile', { hasText: 'Dither' }).focus();
  await shot(page, 'desktop-focus-visible');
  await context.close();
};

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const server = await startServer();
try {
  for (const [name, run] of Object.entries(sections)) {
    if (only && name !== only) continue;
    await run(browser);
  }
} finally {
  await browser.close();
  server.kill();
}

check(consoleErrors.length === 0, 'no console errors: ' + consoleErrors.join(' | '));
console.log(`\n${passed} checks passed, ${failures.length} failed.`);
if (failures.length) process.exit(1);
