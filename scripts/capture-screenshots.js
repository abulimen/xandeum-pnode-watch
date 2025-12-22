
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '../public/screenshots');

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const PAGES = [
    { path: '/', name: 'dashboard' },
    { path: '/map', name: 'map' },
    { path: '/analytics', name: 'analytics' },
    { path: '/leaderboard', name: 'leaderboard' },
    { path: '/nodes/123', name: 'node-details' }
];

async function capture() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set viewport to desktop size
    await page.setViewport({ width: 1440, height: 900 });

    for (const { path: pagePath, name } of PAGES) {
        console.log(`Navigating to ${pagePath}...`);
        try {
            await page.goto(`${BASE_URL}${pagePath}`, { waitUntil: 'networkidle0', timeout: 30000 });

            // Wait a bit for animations/maps to load
            await new Promise(r => setTimeout(r, 2000));

            // Take Light Mode Screenshot
            console.log(`Capturing ${name}-light.png`);
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${name}-light.png`), fullPage: false });

            // Toggle Dark Mode
            // 1. Click the trigger button (look for span with "Toggle theme")
            const toggleBtn = await page.$('button span.sr-only');
            if (toggleBtn) {
                // Click the parent button
                const parentBtn = await toggleBtn.evaluateHandle(el => el.closest('button'));
                await parentBtn.click();

                // 2. Wait for dropdown and click "Dark"
                // Dropdown items usually have text "Dark"
                // We use a selector that looks for the menu item
                try {
                    const darkItem = await page.waitForSelector('div[role="menuitem"]', { timeout: 2000 });
                    // Iterate to find the one with text "Dark"
                    const items = await page.$$('div[role="menuitem"]');
                    for (const item of items) {
                        const text = await item.evaluate(el => el.textContent);
                        if (text.includes('Dark')) {
                            await item.click();
                            await new Promise(r => setTimeout(r, 1000)); // Wait for transition
                            break;
                        }
                    }
                } catch (e) {
                    console.log('Could not find Dark menu item, trying fallback...');
                }
            } else {
                // Fallback: Force dark mode via JS
                await page.evaluate(() => document.documentElement.classList.add('dark'));
            }

            // Take Dark Mode Screenshot
            console.log(`Capturing ${name}-dark.png`);
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${name}-dark.png`), fullPage: false });

            // Reset to light mode for next page
            await page.evaluate(() => {
                document.documentElement.classList.remove('dark');
                // Also try to reset via UI if possible, but JS reset is safer for next iteration
            });
            // Close dropdown if open (click body)
            await page.mouse.click(0, 0);

        } catch (e) {
            console.error(`Error capturing ${name}:`, e.message);
        }
    }

    await browser.close();
    console.log('Done!');
}

capture();
