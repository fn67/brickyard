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

/** Which grid cells of the preview canvas differ from its corner pixel (or are opaque when transparent). */
async function previewMask(page, cells) {
  return page.locator('.preview-stage canvas').evaluate((c, n) => {
    const ctx = c.getContext('2d');
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    const at = (x, y) => {
      const i = (Math.floor(y) * c.width + Math.floor(x)) * 4;
      return [d[i], d[i + 1], d[i + 2], d[i + 3]];
    };
    const corner = at(1, 1);
    const u = c.width / n;
    let mask = '';
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const p = at((x + 0.5) * u, (y + 0.5) * u);
        const filled = corner[3] === 0 ? p[3] > 0 : p.some((v, i) => Math.abs(v - corner[i]) > 2);
        mask += filled ? '#' : '.';
      }
    }
    return { mask, corner };
  }, cells);
}

async function pngPixel(page, path, x, y) {
  const b64 = readFileSync(path).toString('base64');
  return page.evaluate(
    async ({ b64, x, y }) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + b64;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      return Array.from(ctx.getImageData(x, y, 1, 1).data);
    },
    { b64, x, y },
  );
}

async function downloadVia(page, size) {
  await page.getByRole('button', { name: 'Download' }).click();
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('menuitem', { name: 'PNG ' + size }).click()]);
  const path = join(tmpdir(), 'brickyard-' + Date.now() + '-' + dl.suggestedFilename());
  await dl.saveAs(path);
  return { path, name: dl.suggestedFilename() };
}

sections.export = async (browser) => {
  console.log('Colour, Background, copy and download');
  const { page, context } = await newPage(browser, { width: 1440, height: 900 });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: URL });

  // Classic: 5x5 grid with one cell of padding = 7 units.
  const base = await previewMask(page, 7);
  check(base.mask.includes('#'), 'preview has filled cells');
  check(base.corner.join() === '240,240,240,255', 'Light background is drawn (got ' + base.corner + ')');

  await page.getByRole('button', { name: 'Blue, hue 215°' }).click();
  check((await page.getByRole('button', { name: 'Blue, hue 215°' }).getAttribute('aria-pressed')) === 'true', 'swatch pressed');
  const blue = await previewMask(page, 7);
  check(blue.mask === base.mask, 'changing colour leaves the pattern unchanged');

  await page.getByRole('button', { name: 'Dark', exact: true }).click();
  const dark = await previewMask(page, 7);
  check(dark.mask === base.mask, 'changing background leaves the pattern unchanged');
  check(dark.corner.join() === '13,17,23,255', 'Dark background is #0d1117 (got ' + dark.corner + ')');
  const tileCorners = await page.locator('.style-tile canvas').evaluateAll((cs) =>
    cs.map((c) => Array.from(c.getContext('2d').getImageData(1, 1, 1, 1).data).join()),
  );
  check(tileCorners.filter((c) => c !== '13,17,23,255').length <= 3, 'cards follow the Dark background (Quilt, Invader, Aurora differ)');
  await shot(page, 'desktop-bg-dark-blue', { full: true });

  await page.getByRole('button', { name: 'Transparent' }).click();
  const clear = await previewMask(page, 7);
  check(clear.mask === base.mask, 'Transparent leaves the pattern unchanged');
  check(clear.corner[3] === 0, 'Transparent draws no background');
  check(await page.locator('.preview-stage.stage-checker').isVisible(), 'checkerboard behind the preview when Transparent');
  await shot(page, 'desktop-bg-transparent', { full: true });

  // Download menu.
  await page.getByRole('button', { name: 'Download' }).click();
  check(await page.getByRole('menu', { name: 'Download options' }).isVisible(), 'Download opens a menu');
  for (const label of ['Download as SVG', 'Download as STL']) {
    const item = page.getByRole('menuitem', { name: label });
    check((await item.isVisible()) && (await item.isDisabled()) && (await item.innerText()).includes('Soon'), label + ' disabled with Soon');
  }
  await shot(page, 'desktop-download-menu');
  await page.keyboard.press('Escape');
  check(!(await page.getByRole('menu').isVisible().catch(() => false)), 'Escape closes the menu');

  const t = await downloadVia(page, 1024);
  const ti = pngInfo(t.path);
  check(t.name === 'hello-world-classic-1024.png', 'file name uses name, style and size (got ' + t.name + ')');
  check(ti.width === 1024 && ti.height === 1024, 'PNG 1024 is 1024 px');
  check(ti.colorType === 6, 'PNG has an alpha channel');
  check((await pngPixel(page, t.path, 2, 2))[3] === 0, 'Transparent PNG corner is transparent');
  rmSync(t.path);

  await page.getByRole('button', { name: 'Light', exact: true }).click();
  await page.getByRole('button', { name: 'Auto, colour from the name' }).click();
  for (const size of [512, 2048]) {
    const d = await downloadVia(page, size);
    const info = pngInfo(d.path);
    check(info.width === size && info.height === size, `PNG ${size} is ${size} px`);
    check((await pngPixel(page, d.path, 2, 2)).join() === '240,240,240,255', `PNG ${size} matches the Light preview`);
    rmSync(d.path);
  }

  // Copy PNG.
  await page.getByRole('button', { name: 'Copy PNG' }).click();
  await page.getByText('Copied to clipboard').waitFor({ timeout: 3000 });
  check(true, 'Copied message');
  const clip = await page.evaluate(async () => {
    const items = await navigator.clipboard.read();
    const blob = await items[0].getType('image/png');
    const bmp = await createImageBitmap(blob);
    return [bmp.width, bmp.height];
  });
  check(clip[0] === 460 && clip[1] === 460, 'Copy PNG is a 460 px square (got ' + clip + ')');
  await shot(page, 'desktop-copied');
  await context.close();

  // Clipboard blocked.
  const blocked = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await blocked.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { write: () => Promise.reject(new Error('blocked')) } });
  });
  const bp = await blocked.newPage();
  bp.on('pageerror', (e) => consoleErrors.push(String(e)));
  await bp.goto(URL);
  await bp.getByRole('button', { name: 'Copy PNG' }).click();
  await bp.getByText('Clipboard blocked. Use Download instead.').waitFor({ timeout: 3000 });
  check(true, 'Clipboard blocked message');
  await bp.screenshot({ path: join(OUT, 'desktop-clipboard-blocked.png') });
  await blocked.close();
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
