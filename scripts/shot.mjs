// Quick screenshot helper: node scripts/shot.mjs <url> <out.png> <width> <height> [dark] [fullPage]
import { chromium } from 'playwright';
const [url, out, w, h, theme, full] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +w, height: +h }, colorScheme: theme === 'dark' ? 'dark' : 'light' });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(url);
await page.waitForTimeout(600);
await page.screenshot({ path: out, fullPage: full === 'full' });
if (errors.length) console.log('ERRORS:', errors);
await browser.close();
