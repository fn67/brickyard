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
  check((await page.locator('.style-tile[aria-pressed="true"]').innerText()).includes('Critter'), 'Try it selects Critter');
  check((await page.getByRole('button', { name: '3D', exact: true }).getAttribute('aria-pressed')) === 'true', 'Try it switches to 3D');
  check(!(await page.getByRole('button', { name: '3D', exact: true }).isDisabled()), '3D switch enabled for Critter');
  await page.locator('.style-tile', { hasText: 'Classic' }).click();
  check((await page.getByRole('button', { name: '2D', exact: true }).getAttribute('aria-pressed')) === 'true', 'another style returns to 2D');

  // App appearance toggle: immediate, remembered, independent of the avatar.
  // The preview canvas was just re-mounted (back from 3D); let it size itself before sampling.
  await page.waitForTimeout(400);
  const before = await page.locator('.preview-stage canvas').evaluate((c) => c.toDataURL());
  const toggle = page.getByRole('button', { name: 'Switch app to dark mode' });
  check(await toggle.isVisible(), 'dark mode toggle visible with the light-mode label');
  await toggle.click();
  check((await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark', 'toggle switches to dark');
  check(await page.getByRole('button', { name: 'Switch app to light mode' }).isVisible(), 'toggle label flips');
  await page.waitForTimeout(400);
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
  let lightAppPng = null;
  for (const size of [512, 2048]) {
    const d = await downloadVia(page, size);
    const info = pngInfo(d.path);
    check(info.width === size && info.height === size, `PNG ${size} is ${size} px`);
    check((await pngPixel(page, d.path, 2, 2)).join() === '240,240,240,255', `PNG ${size} matches the Light preview`);
    if (size === 512) lightAppPng = info.bytes;
    rmSync(d.path);
  }
  await page.getByRole('button', { name: 'Switch app to dark mode' }).click();
  const darkApp = await downloadVia(page, 512);
  check(pngInfo(darkApp.path).bytes.equals(lightAppPng), 'app dark mode never changes the exported PNG');
  check((await page.getByRole('button', { name: 'Light', exact: true }).getAttribute('aria-pressed')) === 'true', 'app dark mode never changes the avatar Background setting');
  rmSync(darkApp.path);
  await page.getByRole('button', { name: 'Switch app to light mode' }).click();

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

/** Bounding box and centroid of pixels that differ from the corner, in the 3D canvas (fractions of its size). */
async function sceneStats(page) {
  return page.locator('.scene3d canvas').evaluate((c) => {
    const tmp = document.createElement('canvas');
    tmp.width = 200;
    tmp.height = 200;
    const ctx = tmp.getContext('2d');
    ctx.drawImage(c, 0, 0, 200, 200);
    const d = ctx.getImageData(0, 0, 200, 200).data;
    const corner = [d[0], d[1], d[2], d[3]];
    let n = 0, sx = 0, sy = 0, minX = 200, minY = 200, maxX = 0, maxY = 0;
    for (let y = 0; y < 200; y++) {
      for (let x = 0; x < 200; x++) {
        const i = (y * 200 + x) * 4;
        if (Math.abs(d[i] - corner[0]) + Math.abs(d[i + 1] - corner[1]) + Math.abs(d[i + 2] - corner[2]) + Math.abs(d[i + 3] - corner[3]) > 40) {
          n++; sx += x; sy += y;
          minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        }
      }
    }
    return { n, cx: sx / n / 200, cy: sy / n / 200, w: (maxX - minX) / 200, h: (maxY - minY) / 200, corner, url: tmp.toDataURL() };
  });
}

async function settle(page) {
  await page.waitForTimeout(250);
}

sections.three = async (browser) => {
  console.log('3D view');
  const { page, context } = await newPage(browser, { width: 1440, height: 900 });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: URL });
  await page.locator('.style-tile', { hasText: 'Critter' }).click();
  await page.getByRole('button', { name: '3D', exact: true }).click();
  await page.waitForSelector('.scene3d canvas');
  await page.waitForTimeout(1200);
  check(await page.getByText('Drag to rotate, scroll to zoom').isVisible(), '3D hint text');
  check(!(await page.getByText('3D is available for Critter.').isVisible().catch(() => false)), 'no 3D note while Critter is selected');
  const presetBtn = (label) => page.getByRole('group', { name: 'Viewing angle' }).getByRole('button', { name: label, exact: true });
  check((await presetBtn('Three-quarter').getAttribute('aria-pressed')) === 'true', 'opens at the 3/4 preset');

  const start = await sceneStats(page);
  check(start.n > 500, '3D scene draws the critter');
  check(Math.abs(start.cx - 0.5) < 0.12 && Math.abs(start.cy - 0.5) < 0.15, 'critter is centred');

  // Presets, in each background.
  const urls = {};
  for (const bg of ['Light', 'Dark', 'Transparent']) {
    await page.getByRole('button', { name: bg, exact: true }).click();
    await page.waitForTimeout(400);
    for (const [label, file] of [['Front', 'front'], ['Three-quarter', 'three-quarter'], ['Top', 'top'], ['Side', 'side']]) {
      await presetBtn(label).click();
      await settle(page);
      check((await presetBtn(label).getAttribute('aria-pressed')) === 'true', `${label} preset pressed`);
      const st = await sceneStats(page);
      urls[bg + label] = st.url;
      if (bg === 'Transparent') check(st.corner[3] === 0, `no backdrop in Transparent (${label})`);
      else check(st.corner[3] === 255, `scene background drawn in ${bg} (${label})`);
      await page.locator('.preview-panel').screenshot({ path: join(OUT, `critter-3d-${bg.toLowerCase()}-${file}.png`) });
    }
  }
  check(new Set(['Front', 'Three-quarter', 'Top', 'Side'].map((l) => urls['Light' + l])).size === 4, 'all four presets give different views');
  check(await page.locator('.preview-stage.stage-checker').isVisible(), 'checkerboard behind the 3D view when Transparent');

  // Drag rotates, wheel zooms, no pan.
  await page.getByRole('button', { name: 'Light', exact: true }).click();
  await page.getByRole('button', { name: 'Reset view' }).click();
  await settle(page);
  const reset1 = await sceneStats(page);
  const box = await page.locator('.scene3d').boundingBox();
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + 120, cy + 10, { steps: 8 });
  await page.mouse.up();
  await settle(page);
  const dragged = await sceneStats(page);
  check(dragged.url !== reset1.url, 'dragging rotates the view');
  check((await presetBtn('Three-quarter').getAttribute('aria-pressed')) === 'false', 'dragging leaves the preset');
  await page.mouse.move(cx, cy);
  for (let i = 0; i < 4; i++) {
    await page.mouse.wheel(0, -400);
    await page.waitForTimeout(60);
  }
  await settle(page);
  const zoomed = await sceneStats(page);
  check(zoomed.n > dragged.n * 1.15, 'wheel zooms in (covered pixels ' + dragged.n + ' -> ' + zoomed.n + ')');
  // Try to pan: right-drag and shift-drag. The critter must stay centred.
  for (const mod of [{ button: 'right' }, { button: 'left', key: 'Shift' }, { button: 'left', key: 'Control' }]) {
    if (mod.key) await page.keyboard.down(mod.key);
    await page.mouse.move(cx, cy);
    await page.mouse.down({ button: mod.button });
    await page.mouse.move(cx + 150, cy + 120, { steps: 8 });
    await page.mouse.up({ button: mod.button });
    if (mod.key) await page.keyboard.up(mod.key);
  }
  await page.getByRole('button', { name: 'Front', exact: true }).click();
  await settle(page);
  const afterPan = await sceneStats(page);
  check(Math.abs(afterPan.cx - 0.5) < 0.06, 'no panning: the critter stays centred (cx ' + afterPan.cx.toFixed(3) + ')');
  await page.getByRole('button', { name: 'Reset view' }).click();
  await settle(page);
  const reset2 = await sceneStats(page);
  check(reset2.url === reset1.url, 'Reset view returns to the default angle and zoom');

  // Keyboard on the focused scene.
  await page.locator('.scene3d').focus();
  await page.keyboard.press('ArrowLeft');
  await settle(page);
  const keyRot = await sceneStats(page);
  check(keyRot.url !== reset2.url, 'arrow keys rotate');
  await page.keyboard.press('+');
  await page.keyboard.press('+');
  await settle(page);
  const keyZoom = await sceneStats(page);
  check(keyZoom.h > keyRot.h * 1.08, 'plus zooms in');
  await page.keyboard.press('-');
  await page.keyboard.press('-');
  await page.keyboard.press('-');
  await settle(page);
  check((await sceneStats(page)).h < keyZoom.h, 'minus zooms out');
  await page.getByRole('button', { name: 'Zoom in' }).click();
  await page.getByRole('button', { name: 'Zoom out' }).click();
  check(true, 'zoom buttons work without errors');

  // Copy and download use the current angle.
  await presetBtn('Front').click();
  await settle(page);
  const front = await downloadVia(page, 1024);
  await presetBtn('Side').click();
  await settle(page);
  const side = await downloadVia(page, 1024);
  check(pngInfo(front.path).width === 1024 && pngInfo(side.path).height === 1024, '3D PNG download is 1024 px');
  check(!pngInfo(front.path).bytes.equals(pngInfo(side.path).bytes), 'download follows the camera angle');
  const frontCentre = await pngPixel(page, front.path, 512, 512);
  check(frontCentre[3] === 255, '3D download has content in the middle');
  rmSync(front.path);
  rmSync(side.path);
  await page.getByRole('button', { name: 'Transparent' }).click();
  await page.waitForTimeout(300);
  const tr = await downloadVia(page, 512);
  check((await pngPixel(page, tr.path, 3, 3))[3] === 0, 'Transparent 3D download has a transparent background');
  check(pngInfo(tr.path).width === 512, '3D PNG 512 is 512 px');
  rmSync(tr.path);
  await page.getByRole('button', { name: 'Copy PNG' }).click();
  await page.getByText('Copied to clipboard').waitFor({ timeout: 3000 });
  const clip = await page.evaluate(async () => {
    const items = await navigator.clipboard.read();
    const bmp = await createImageBitmap(await items[0].getType('image/png'));
    return [bmp.width, bmp.height];
  });
  check(clip[0] === 460 && clip[1] === 460, '3D Copy PNG is 460 px');

  // The app appearance never changes the 3D scene.
  await page.getByRole('button', { name: 'Light', exact: true }).click();
  await presetBtn('Front').click();
  await page.waitForTimeout(400);
  const sceneLightApp = await sceneStats(page);
  await page.getByRole('button', { name: 'Switch app to dark mode' }).click();
  await page.waitForTimeout(400);
  const sceneDarkApp = await sceneStats(page);
  check(sceneDarkApp.url === sceneLightApp.url, 'app dark mode never changes the 3D scene or its background');
  await page.getByRole('button', { name: 'Switch app to light mode' }).click();

  // Leaving Critter returns to 2D.
  await page.locator('.style-tile', { hasText: 'Invader' }).click();
  check((await page.locator('.scene3d').count()) === 0, 'another style returns to 2D');
  check(await page.getByRole('button', { name: '3D', exact: true }).isDisabled(), '3D disabled again');
  await context.close();

  // No WebGL: stays in 2D with a short message.
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => {
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      if (String(type).startsWith('webgl')) return null;
      return orig.call(this, type, ...rest);
    };
  });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => consoleErrors.push(String(e)));
  await p.goto(URL);
  await p.locator('.style-tile', { hasText: 'Critter' }).click();
  check(await p.getByRole('button', { name: '3D', exact: true }).isDisabled(), 'no WebGL: 3D switch disabled');
  check(await p.getByText('3D is not available on this device.').isVisible(), 'no WebGL: message next to the switch');
  await ctx.close();
};

async function noPageScroll(page) {
  return page.evaluate(() => {
    const el = document.scrollingElement;
    return { v: el.scrollHeight <= window.innerHeight + 1, h: el.scrollWidth <= window.innerWidth + 1, sh: el.scrollHeight, ih: window.innerHeight };
  });
}

async function dockTop(page) {
  return page.evaluate(() => Math.round(document.querySelector('.dock').getBoundingClientRect().top));
}

sections.phone = async (browser) => {
  console.log('Phone');
  for (const [w, h] of [[390, 650], [360, 600]]) {
    for (const scheme of ['light', 'dark']) {
      const tag = `${w}x${h}-${scheme}`;
      const { page, context } = await newPage(browser, { width: w, height: h, scheme, touch: true });
      check(await page.locator('.phone').isVisible(), `${tag}: phone editor shown`);
      check(await page.getByRole('button', { name: scheme === 'dark' ? 'Switch app to light mode' : 'Switch app to dark mode' }).isVisible(), `${tag}: app dark mode toggle in the header`);
      check((await page.locator('.ladder, .facts').count()) === 0, `${tag}: size previews and facts hidden`);
      const tops = [];
      for (const [tab, label] of [['style', 'Style'], ['variations', 'Variations'], ['colour', 'Colour']]) {
        await page.getByRole('tab', { name: label }).click();
        check((await page.getByRole('tab', { name: label }).getAttribute('aria-selected')) === 'true', `${tag}: ${label} tab selected`);
        tops.push(await dockTop(page));
        const sc = await noPageScroll(page);
        check(sc.v && sc.h, `${tag} ${label}: no vertical or horizontal page scroll (${sc.sh}/${sc.ih})`);
        await shot(page, `phone-${tag}-${tab}`);
      }
      check(new Set(tops).size === 1, `${tag}: area above the tab bar keeps one height on every tab (${tops})`);

      // Download sheet.
      await page.getByRole('button', { name: 'Download' }).click();
      const sheet = page.getByRole('dialog', { name: 'Download' });
      check(await sheet.isVisible(), `${tag}: Download opens a bottom sheet`);
      for (const label of ['Download as SVG', 'Download as STL']) {
        const b = sheet.getByRole('button', { name: label });
        check((await b.isDisabled()) && (await b.innerText()).includes('Soon'), `${tag}: ${label} disabled with Soon`);
      }
      await shot(page, `phone-${tag}-download-sheet`);
      if (w === 390 && scheme === 'light') {
        const [dl] = await Promise.all([page.waitForEvent('download'), sheet.getByRole('button', { name: /PNG 512/ }).click()]);
        check(dl.suggestedFilename() === 'hello-world-classic-512.png', 'phone: sheet downloads a PNG');
        check(!(await sheet.isVisible().catch(() => false)), 'phone: sheet closes after picking');
      } else {
        await page.keyboard.press('Escape');
        check(!(await sheet.isVisible().catch(() => false)), `${tag}: Escape closes the sheet`);
      }

      // 3D chips on the preview.
      await page.getByRole('tab', { name: 'Style' }).click();
      await page.getByRole('button', { name: 'Try it' }).click();
      await page.waitForSelector('.scene3d canvas');
      await page.waitForTimeout(900);
      const chips = page.getByRole('group', { name: 'Viewing angle' });
      check((await chips.getByRole('button').count()) === 5, `${tag}: angle chips and Reset view on the preview`);
      check(await page.getByText('Drag to rotate, pinch to zoom').isVisible(), `${tag}: touch hint`);
      await chips.getByRole('button', { name: 'Front' }).click();
      await page.waitForTimeout(250);
      const sc3 = await noPageScroll(page);
      check(sc3.v && sc3.h, `${tag} 3D: no page scroll`);
      await shot(page, `phone-${tag}-3d`);
      await page.getByRole('button', { name: '2D', exact: true }).click();

      // Keyboard open: the panel and actions step aside so the field and preview stay visible.
      await page.locator('#name').focus();
      await page.setViewportSize({ width: w, height: 380 });
      await page.waitForTimeout(200);
      check(!(await page.locator('.dock-panel').isVisible().catch(() => false)), `${tag}: tab panel hidden while typing`);
      check(await page.locator('#name').isVisible(), `${tag}: name field visible while typing`);
      const kb = await noPageScroll(page);
      check(kb.v && kb.h, `${tag} keyboard open: no page scroll`);
      await page.keyboard.type('-2');
      check((await page.locator('.phone-stage [role="img"]').getAttribute('aria-label')).includes('hello-world-2'), `${tag}: preview updates while typing`);
      await shot(page, `phone-${w}-keyboard-${scheme}`);
      await context.close();
    }
  }

  // Flows on the phone.
  const { page, context } = await newPage(browser, { width: 390, height: 650, touch: true });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: URL });
  await page.locator('.style-tile', { hasText: 'Frame' }).click();
  check((await page.locator('.phone-stage [role="img"]').getAttribute('aria-label')).includes('Frame'), 'phone: pick a style');
  await page.getByRole('tab', { name: 'Variations' }).click();
  await page.locator('.variation-tile').nth(2).click();
  check((await page.inputValue('#name')) === 'hello-world:2', 'phone: pick a variation');
  check(await page.getByText('Using variation 2').isVisible(), 'phone: variation note');
  await page.getByRole('tab', { name: 'Colour' }).click();
  await page.getByRole('button', { name: 'Teal, hue 190°' }).click();
  await page.getByRole('button', { name: 'Dark', exact: true }).click();
  check((await page.getByRole('button', { name: 'Dark', exact: true }).getAttribute('aria-pressed')) === 'true', 'phone: background control in the Colour tab');
  await page.getByRole('button', { name: 'Copy PNG' }).click();
  await page.getByText('Copied to clipboard').waitFor({ timeout: 3000 });
  check(true, 'phone: Copied message on the preview');
  await shot(page, 'phone-390x650-light-colour-copied');
  // Tabs work with arrow keys.
  await page.getByRole('tab', { name: 'Colour' }).focus();
  await page.keyboard.press('ArrowLeft');
  check((await page.getByRole('tab', { name: 'Variations' }).getAttribute('aria-selected')) === 'true', 'phone: arrow keys move between tabs');
  await context.close();

  // 400 px wide (REQUIREMENTS 5): no horizontal scroll.
  const w400 = await newPage(browser, { width: 400, height: 760 });
  const s400 = await noPageScroll(w400.page);
  check(s400.h && s400.v, '400 px wide: no page scroll');
  await w400.context.close();
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

sections.a11y = async (browser) => {
  console.log('Accessibility');
  for (const [w, h, touch] of [[1440, 900, false], [390, 650, true]]) {
    const { page, context } = await newPage(browser, { width: w, height: h, touch });
    const tag = w + 'px';
    const canv = await page.locator('canvas').evaluateAll((cs) =>
      cs.map((c) => ({ role: c.getAttribute('role'), label: c.getAttribute('aria-label'), hidden: c.getAttribute('aria-hidden') })),
    );
    check(canv.every((c) => (c.role === 'img' && c.label) || c.hidden === 'true'), `${tag}: every avatar has a text alternative or is marked decorative`);
    check(canv.filter((c) => c.role === 'img').length === 1, `${tag}: one labelled preview image`);
    check((await page.locator('main').count()) === 1, `${tag}: one main landmark`);
    check((await page.locator('h1').innerText()) === 'Brickyard', `${tag}: h1 is Brickyard`);
    check((await page.locator('#name').evaluate((el) => el.labels?.[0]?.textContent?.trim())) === 'Enter anything to see your avatar', `${tag}: name field has its label`);
    const unnamed = await page.locator('button').evaluateAll((bs) =>
      bs.filter((b) => !(b.getAttribute('aria-label') || b.textContent?.trim())).map((b) => b.outerHTML.slice(0, 80)),
    );
    check(unnamed.length === 0, `${tag}: every button has an accessible name ${unnamed.join(' ')}`);
    // "Try it" moves focus to the 3D view instead of dropping it.
    await page.getByRole('button', { name: 'Try it' }).focus();
    await page.keyboard.press('Enter');
    await page.waitForSelector('.scene3d canvas');
    await page.waitForTimeout(300);
    const focused = await page.evaluate(() => document.activeElement?.className ?? '');
    check(String(focused).includes('scene3d'), `${tag}: Try it moves focus to the 3D view (got ${focused})`);
    await context.close();
  }

  // Reduced motion: no transitions, and nothing animates.
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(URL);
  await page.waitForSelector('#name');
  const durations = await page.locator('.btn, .tile, .seg, .swatch').evaluateAll((els) =>
    els.map((e) => getComputedStyle(e).transitionDuration).filter((d) => d !== '0s'),
  );
  check(durations.length === 0, 'reduced motion: no transitions');
  check((await page.evaluate(() => document.getAnimations().length)) === 0, 'reduced motion: no running animations');
  await ctx.close();

  // Phone: every control reachable with the keyboard.
  const { page: pp, context: pc } = await newPage(browser, { width: 390, height: 650 });
  const seen = new Set();
  for (let i = 0; i < 30; i++) {
    await pp.keyboard.press('Tab');
    seen.add(await pp.evaluate(() => document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent?.trim() || document.activeElement?.id));
  }
  for (const want of ['Switch app to dark mode', 'name', 'Shuffle', 'Try it', '2D', 'Copy PNG', 'Download', 'Classic style, 5×5', 'Style']) {
    check([...seen].some((x) => x && x.startsWith(want)), 'phone keyboard reaches: ' + want);
  }
  await pc.close();
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
