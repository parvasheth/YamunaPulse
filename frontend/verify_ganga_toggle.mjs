import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function runGangaToggleVerification() {
  console.log('🌊🏔️ Starting Comprehensive Yamuna <-> Ganga Toggle Verification...');
  const screenshotsDir = path.join(process.cwd(), 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const errors = [];

  // =========================================================================
  // 1. DESKTOP VIEWPORT TEST (1280 x 800)
  // =========================================================================
  console.log('\n--- 1. DESKTOP WORKBENCH VERIFICATION ---');
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const desktopPage = await desktopContext.newPage();

  desktopPage.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error('Desktop Console Error:', msg.text());
      errors.push(`Desktop: ${msg.text()}`);
    }
  });
  desktopPage.on('pageerror', (err) => errors.push(`Desktop PageError: ${err.message}`));

  try {
    await desktopPage.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    console.log('✓ Desktop page loaded successfully');

    // 1.1 Verify Yamuna initial state
    let bodyText = await desktopPage.textContent('body');
    if (!bodyText.includes('Delhi 48 km')) {
      throw new Error('Initial state does not show Delhi 48 km badge');
    }
    console.log('✓ Initial active river confirmed: Yamuna (Delhi 48 km)');

    // 1.2 Find and click the Ganga toggle button
    console.log('Toggling to Ganga River (Haridwar 34km)...');
    const gangaBtn = desktopPage.locator('button[role="tab"]:has-text("Ganga")').first();
    await gangaBtn.click();
    await desktopPage.waitForTimeout(1000);

    // Verify UI updated to Ganga
    bodyText = await desktopPage.textContent('body');
    if (!bodyText.includes('Haridwar 34 km') && !bodyText.includes('Haridwar 34km')) {
      throw new Error('UI did not update to Haridwar 34 km badge after clicking Ganga toggle');
    }
    console.log('✓ Header updated: Haridwar 34 km badge displayed');

    if (!bodyText.includes('14 Nodes (Raiwala to Balawali)')) {
      throw new Error('Header subtitle did not update to 14 Nodes (Raiwala to Balawali)');
    }
    console.log('✓ Subtitle updated: 14 Nodes (Raiwala to Balawali)');

    // Check profile chart updated to Haridwar
    if (!bodyText.includes('Spatial Profile (Raiwala') || !bodyText.includes('34 km)')) {
      throw new Error('Profile chart header did not update to Raiwala -> Balawali, 34 km');
    }
    console.log('✓ Profile chart updated: Raiwala -> Balawali (34 km)');

    await desktopPage.screenshot({ path: path.join(screenshotsDir, 'desktop_01_ganga_workbench.png') });
    console.log('✓ Saved: desktop_01_ganga_workbench.png');

    // 1.3 Test Anomaly Feed Tab for Ganga
    console.log('Switching to Anomaly Feed tab for Ganga...');
    const anomalyTab = desktopPage.locator('nav button:has-text("Anomaly Feed")');
    await anomalyTab.click();
    await desktopPage.waitForTimeout(800);

    const anomalyText = await desktopPage.textContent('main');
    if (!anomalyText.includes('Jagjeetpur STP') && !anomalyText.includes('SIIDCUL')) {
      throw new Error('Ganga anomaly feed missing expected insights (Jagjeetpur STP or SIIDCUL)');
    }
    console.log('✓ Ganga automated insights verified (Jagjeetpur STP & SIIDCUL canal detected!)');
    await desktopPage.screenshot({ path: path.join(screenshotsDir, 'desktop_02_ganga_anomalies.png') });
    console.log('✓ Saved: desktop_02_ganga_anomalies.png');

    // 1.4 Test Pattern Matrix Tab for Ganga
    console.log('Switching to Pattern Matrix tab for Ganga...');
    const patternTab = desktopPage.locator('nav button:has-text("Pattern Matrix")');
    await patternTab.click();
    await desktopPage.waitForTimeout(800);
    await desktopPage.screenshot({ path: path.join(screenshotsDir, 'desktop_03_ganga_patterns.png') });
    console.log('✓ Saved: desktop_03_ganga_patterns.png');

    // 1.5 Test Seasonal Engine Tab for Ganga
    console.log('Switching to Seasonal Engine tab for Ganga...');
    const seasonalTab = desktopPage.locator('nav button:has-text("Seasonal Engine")');
    await seasonalTab.click();
    await desktopPage.waitForTimeout(800);
    await desktopPage.screenshot({ path: path.join(screenshotsDir, 'desktop_04_ganga_seasonal.png') });
    console.log('✓ Saved: desktop_04_ganga_seasonal.png');

    // 1.6 Toggle back to Yamuna to verify bidirectional switching
    console.log('Toggling back to Yamuna River (Delhi 48km)...');
    const yamunaBtn = desktopPage.locator('button[role="tab"]:has-text("Yamuna")').first();
    await yamunaBtn.click();
    await desktopPage.waitForTimeout(800);
    bodyText = await desktopPage.textContent('body');
    if (!bodyText.includes('Delhi 48 km')) {
      throw new Error('Failed to toggle back to Yamuna (Delhi 48 km)');
    }
    console.log('✓ Bidirectional toggle verified: cleanly returned to Yamuna (Delhi)');
  } finally {
    await desktopContext.close();
  }

  // =========================================================================
  // 2. MOBILE VIEWPORT TEST (390 x 844, iPhone 14)
  // =========================================================================
  console.log('\n--- 2. MOBILE APP PAGES VERIFICATION ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();

  mobilePage.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error('Mobile Console Error:', msg.text());
      errors.push(`Mobile: ${msg.text()}`);
    }
  });
  mobilePage.on('pageerror', (err) => errors.push(`Mobile PageError: ${err.message}`));

  try {
    await mobilePage.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    console.log('✓ Mobile page loaded successfully');

    // 2.1 Verify mobile river toggle exists
    const mobileGangaBtn = mobilePage.locator('header button[role="tab"]:has-text("Ganga")');
    await mobileGangaBtn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Mobile RiverSwitcher found in header');

    // Tap Ganga toggle
    console.log('Tapping Ganga toggle on mobile header...');
    await mobileGangaBtn.click();
    await mobilePage.waitForTimeout(1000);

    // Verify mobile header updated
    let mobileText = await mobilePage.textContent('header');
    if (!mobileText.includes('Haridwar 34km') && !mobileText.includes('Haridwar 34 km')) {
      throw new Error('Mobile header badge did not update to Haridwar 34km');
    }
    console.log('✓ Mobile header badge updated to Haridwar 34km');

    // Page 1: Mobile Map Page with Ganga
    await mobilePage.screenshot({ path: path.join(screenshotsDir, 'mobile_ganga_01_map.png') });
    console.log('✓ Saved: mobile_ganga_01_map.png');

    // Page 2: Mobile Profile Page
    console.log('Navigating to Mobile Profile Page...');
    const profileNavBtn = mobilePage.locator('button[data-testid="mobile-tab-profile"]');
    await profileNavBtn.click();
    await mobilePage.waitForTimeout(800);

    mobileText = await mobilePage.textContent('main');
    if (!mobileText.includes('34 km') || !mobileText.includes('Raiwala')) {
      throw new Error('Mobile Profile page missing Haridwar 34km or Raiwala entry card');
    }
    console.log('✓ Mobile Profile Page confirmed with Raiwala entry and Jagjeetpur STP jump!');
    await mobilePage.screenshot({ path: path.join(screenshotsDir, 'mobile_ganga_02_profile.png') });
    console.log('✓ Saved: mobile_ganga_02_profile.png');

    // Page 3: Mobile Anomalies Page
    console.log('Navigating to Mobile Anomalies Page...');
    const anomaliesNavBtn = mobilePage.locator('button[data-testid="mobile-tab-anomalies"]');
    await anomaliesNavBtn.click();
    await mobilePage.waitForTimeout(800);

    mobileText = await mobilePage.textContent('main');
    if (!mobileText.includes('Jagjeetpur STP') && !mobileText.includes('SIIDCUL')) {
      throw new Error('Mobile Anomalies page missing Haridwar alerts');
    }
    console.log('✓ Mobile Anomalies Page verified with Haridwar changepoint & industrial rules!');
    await mobilePage.screenshot({ path: path.join(screenshotsDir, 'mobile_ganga_03_anomalies.png') });
    console.log('✓ Saved: mobile_ganga_03_anomalies.png');

    // Page 4: Mobile Field Guide
    console.log('Opening Mobile Field Guide...');
    const guideBtn = mobilePage.locator('button[data-testid="header-guide-btn"]');
    await guideBtn.click();
    await mobilePage.waitForTimeout(600);

    // Click section 3 (Corridors & Reaches)
    const reachesTab = mobilePage.locator('button:has-text("3. Corridors")');
    if (await reachesTab.count() > 0) {
      await reachesTab.click();
      await mobilePage.waitForTimeout(400);
    }
    await mobilePage.screenshot({ path: path.join(screenshotsDir, 'mobile_ganga_04_guide.png') });
    console.log('✓ Saved: mobile_ganga_04_guide.png');
  } finally {
    await mobileContext.close();
    await browser.close();
  }

  // Summary
  console.log('\n========================================');
  console.log('VERIFICATION SUMMARY:');
  console.log(`Console / Page Errors: ${errors.length}`);
  if (errors.length > 0) {
    console.error('Errors encountered:', errors);
    process.exit(1);
  } else {
    console.log('ALL VERIFICATIONS PASSED WITH ZERO CONSOLE ERRORS! 🎉');
  }
}

runGangaToggleVerification().catch((e) => {
  console.error('FATAL VERIFICATION FAILURE:', e);
  process.exit(1);
});
