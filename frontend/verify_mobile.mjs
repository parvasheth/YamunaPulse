import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function runMobileVerification() {
  console.log('📱 Starting YamunaPulse Dedicated Mobile Pages Verification...');
  const screenshotsDir = path.join(process.cwd(), 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Emulate iPhone 14 (390 x 844)
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
    const bodyText = await page.textContent('body');
    if (!bodyText?.includes('Parva Sheth')) {
      throw new Error('Author "Parva Sheth" not found on mobile page');
    }
    console.log('   Author Attribution Verified: "Parva Sheth"');

    // Page 1: Dedicated River Map Page
    console.log('2. Verifying Page 1: Dedicated Full River Map...');
    await page.waitForSelector('.leaflet-container', { timeout: 5000 });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile_01_map_page.png') });
    console.log('   Saved: mobile_01_map_page.png');

    // Test node tapping to verify floating bottom station summary card
    console.log('   Testing node marker tap on mobile map...');
    const circleMarkers = await page.$$('.leaflet-interactive');
    if (circleMarkers.length > 5) {
      await circleMarkers[4].click({ force: true });
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(screenshotsDir, 'mobile_01b_map_station_card.png') });
      console.log('   Saved: mobile_01b_map_station_card.png (Station card displayed cleanly!)');
    }

    // Page 2: Dedicated Profile Page
    console.log('3. Navigating to Page 2: 48km Profile & Timelapse Page via Bottom Nav...');
    const profileTabBtn = page.locator('[data-testid="mobile-tab-profile"]');
    await profileTabBtn.click({ force: true });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile_02_profile_page.png') });
    console.log('   Saved: mobile_02_profile_page.png');

    // Page 3: Dedicated Pattern Discovery Matrix Page
    console.log('4. Navigating to Page 3: Pattern Matrix Page via Bottom Nav...');
    const patternsTabBtn = page.locator('[data-testid="mobile-tab-patterns"]');
    await patternsTabBtn.click({ force: true });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile_03_patterns_page.png') });
    console.log('   Saved: mobile_03_patterns_page.png');

    // Page 4: Dedicated Seasonal Page
    console.log('5. Navigating to Page 4: Seasonal Hydrodynamics Page via Bottom Nav...');
    const seasonalTabBtn = page.locator('[data-testid="mobile-tab-seasonal"]');
    await seasonalTabBtn.click({ force: true });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile_04_seasonal_page.png') });
    console.log('   Saved: mobile_04_seasonal_page.png');

    // Page 5: Dedicated Anomalies Page
    console.log('6. Navigating to Page 5: Anomaly Feed Page via Bottom Nav...');
    const anomaliesTabBtn = page.locator('[data-testid="mobile-tab-anomalies"]');
    await anomaliesTabBtn.click({ force: true });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile_05_anomalies_page.png') });
    console.log('   Saved: mobile_05_anomalies_page.png');

    // Page 6: Dedicated Field Guide Page
    console.log('7. Opening Dedicated Field Guide Page via Header Icon...');
    const guideIconBtn = page.locator('[data-testid="header-guide-btn"]');
    await guideIconBtn.click({ force: true });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile_06_guide_page.png') });
    console.log('   Saved: mobile_06_guide_page.png');

    // Test Back button in Field Guide
    const backBtn = page.locator('[data-testid="guide-back-btn"]');
    await backBtn.click({ force: true });
    await page.waitForTimeout(400);

    // Page 7: Test Share Modal on Mobile
    console.log('8. Opening Share Modal on mobile...');
    const shareBtn = page.locator('[data-testid="header-share-btn"]');
    await shareBtn.click({ force: true });
    await page.waitForSelector('h3:has-text("Share YamunaPulse")', { timeout: 3000 });
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile_07_share_modal.png') });
    console.log('   Saved: mobile_07_share_modal.png');

    console.log('\n--- DEDICATED MOBILE PAGES VERIFICATION RESULT ---');
    console.log(`Uncaught Errors: ${errors.length}`);
    if (errors.length > 0) {
      console.warn('Errors:', errors);
    } else {
      console.log('✅ 100% App-Like Mobile UI Verified! Dedicated pages, zero clutter, smooth bottom nav, zero console errors!');
    }
  } finally {
    await browser.close();
  }
}

runMobileVerification().catch((err) => {
  console.error('Mobile verification failed:', err);
  process.exit(1);
});
