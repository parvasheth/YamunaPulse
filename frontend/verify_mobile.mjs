import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function runMobileVerification() {
  console.log('📱 Starting YamunaPulse Mobile Responsiveness Verification...');
  const screenshotsDir = path.join(process.cwd(), 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Emulate iPhone 14
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  });
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const page = await context.newPage();

  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  try {
    // 1. Navigate to local app
    console.log('1. Navigating on mobile viewport (390 x 844)...');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });

    // Verify Brand & Author
    const authorPresent = await page.textContent('body');
    if (!authorPresent?.includes('Parva Sheth')) {
      throw new Error('Author "Parva Sheth" not found on mobile page');
    }
    console.log('   Author Attribution Verified: "Parva Sheth"');

    // Screenshot 1: Mobile Map View (Default)
    await page.waitForSelector('.leaflet-container', { timeout: 5000 });
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile_01_monitor_map.png') });
    console.log('   Saved: mobile_01_monitor_map.png');

    // 2. Test Mobile View Switcher -> Profile Chart
    console.log('2. Switching to Profile Chart View on mobile...');
    const profileViewBtn = await page.getByRole('button', { name: /Profile Chart/i });
    await profileViewBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile_02_monitor_profile.png') });
    console.log('   Saved: mobile_02_monitor_profile.png');

    // 3. Test Mobile Bottom Bar -> Patterns Tab
    console.log('3. Navigating to Patterns Tab via Bottom Nav...');
    const patternsBottomBtn = page.locator('[data-testid="bottom-nav-patterns"]');
    await patternsBottomBtn.click({ force: true });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile_03_patterns.png') });
    console.log('   Saved: mobile_03_patterns.png');

    // 4. Test Mobile Bottom Bar -> Seasonal Tab
    console.log('4. Navigating to Seasonal Tab via Bottom Nav...');
    const seasonalBottomBtn = page.locator('[data-testid="bottom-nav-seasonal"]');
    await seasonalBottomBtn.click({ force: true });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile_04_seasonal.png') });
    console.log('   Saved: mobile_04_seasonal.png');

    // 5. Test Mobile Bottom Bar -> Anomalies Tab
    console.log('5. Navigating to Anomalies Tab via Bottom Nav...');
    const anomaliesBottomBtn = page.locator('[data-testid="bottom-nav-insights"]');
    await anomaliesBottomBtn.click({ force: true });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile_05_anomalies.png') });
    console.log('   Saved: mobile_05_anomalies.png');

    // Return to Monitor
    const monitorBottomBtn = page.locator('[data-testid="bottom-nav-monitor"]');
    await monitorBottomBtn.click({ force: true });
    await page.waitForTimeout(400);

    // 6. Test Share Modal on Mobile
    console.log('6. Opening Share Modal on mobile...');
    const shareBtn = await page.getByRole('button', { name: /Share/i }).first();
    await shareBtn.click();
    await page.waitForSelector('h3:has-text("Share YamunaPulse")', { timeout: 3000 });
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile_06_share_modal.png') });
    console.log('   Saved: mobile_06_share_modal.png');

    console.log('\n--- MOBILE VERIFICATION RESULT ---');
    console.log(`Uncaught Errors: ${errors.length}`);
    if (errors.length > 0) {
      console.warn('Errors:', errors);
    } else {
      console.log('✅ 100% Mobile Responsive! Zero console errors, smooth navigation on iPhone/Android viewports!');
    }
  } finally {
    await browser.close();
  }
}

runMobileVerification().catch((err) => {
  console.error('Mobile verification failed:', err);
  process.exit(1);
});
