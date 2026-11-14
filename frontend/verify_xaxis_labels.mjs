import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function runXAxisVerification() {
  console.log('📊 Verifying X-Axis Location Name Labels for Yamuna and Ganga...');
  const screenshotsDir = path.join(process.cwd(), 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const errors = [];

  // Helper function to extract X-Axis tick texts
  const getXAxisLabels = async (page) => {
    return await page.evaluate(() => {
      const texts = Array.from(document.querySelectorAll('.recharts-xAxis-tick-labels text'));
      return texts.map((el) => el.textContent.trim()).filter(Boolean);
    });
  };

  // =========================================================================
  // 1. DESKTOP VIEWPORT TEST (1280 x 850)
  // =========================================================================
  console.log('\n--- 1. DESKTOP WORKBENCH X-AXIS VERIFICATION ---');
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 850 },
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
    await desktopPage.waitForTimeout(3000);
    console.log('✓ Desktop page loaded successfully');

    // 1.1 Check Yamuna LongitudinalProfileChart X-Axis
    console.log('Checking Yamuna Monitor Tab X-Axis labels...');
    const yamunaProfileLabels = await getXAxisLabels(desktopPage);
    console.log('Yamuna Profile X-Axis Labels (count ' + yamunaProfileLabels.length + '):', yamunaProfileLabels.slice(0, 5));

    if (!yamunaProfileLabels.includes('Najafgarh (16.5km)')) {
      throw new Error(`Yamuna Profile X-Axis missing 'Najafgarh (16.5km)', found: ${yamunaProfileLabels.join(', ')}`);
    }
    if (!yamunaProfileLabels.includes('Palla (0km)')) {
      throw new Error(`Yamuna Profile X-Axis missing 'Palla (0km)', found: ${yamunaProfileLabels.join(', ')}`);
    }
    if (!yamunaProfileLabels.includes('Barapullah (30.5km)')) {
      throw new Error(`Yamuna Profile X-Axis missing 'Barapullah (30.5km)'`);
    }
    console.log('✓ Yamuna Longitudinal Profile X-Axis verified with station names & km!');
    await desktopPage.screenshot({ path: path.join(screenshotsDir, 'desktop_01_yamuna_profile_xaxis.png') });

    // 1.2 Check Yamuna SeasonalComparator X-Axis
    console.log('\nNavigating to Yamuna Seasonal Tab...');
    const seasonalTabBtn = desktopPage.locator('nav button:has-text("Seasonal")');
    await seasonalTabBtn.click();
    await desktopPage.waitForTimeout(1500);

    const yamunaSeasonalLabels = await getXAxisLabels(desktopPage);
    console.log('Yamuna Seasonal X-Axis Labels (count ' + yamunaSeasonalLabels.length + '):', yamunaSeasonalLabels.slice(0, 5));

    if (!yamunaSeasonalLabels.includes('Najafgarh (16.5km)')) {
      throw new Error(`Yamuna Seasonal X-Axis missing 'Najafgarh (16.5km)', found: ${yamunaSeasonalLabels.join(', ')}`);
    }
    if (!yamunaSeasonalLabels.includes('Palla (0km)')) {
      throw new Error(`Yamuna Seasonal X-Axis missing 'Palla (0km)'`);
    }
    console.log('✓ Yamuna Seasonal Comparator X-Axis verified!');
    await desktopPage.screenshot({ path: path.join(screenshotsDir, 'desktop_02_yamuna_seasonal_xaxis.png') });

    // 1.3 Switch River to Ganga
    console.log('\nSwitching River to Ganga...');
    const gangaToggle = desktopPage.locator('button[role="tab"]:has-text("Ganga")').first();
    await gangaToggle.click();
    await desktopPage.waitForTimeout(2000);

    // 1.4 Check Ganga SeasonalComparator X-Axis
    const gangaSeasonalLabels = await getXAxisLabels(desktopPage);
    console.log('Ganga Seasonal X-Axis Labels (count ' + gangaSeasonalLabels.length + '):', gangaSeasonalLabels.slice(0, 6));

    if (!gangaSeasonalLabels.includes('Har Ki Pauri (5.4km)')) {
      throw new Error(`Ganga Seasonal X-Axis missing 'Har Ki Pauri (5.4km)', found: ${gangaSeasonalLabels.join(', ')}`);
    }
    if (!gangaSeasonalLabels.includes('Jagjeetpur STP (14.2km)')) {
      throw new Error(`Ganga Seasonal X-Axis missing 'Jagjeetpur STP (14.2km)'`);
    }
    if (!gangaSeasonalLabels.includes('Raiwala (0km)')) {
      throw new Error(`Ganga Seasonal X-Axis missing 'Raiwala (0km)'`);
    }
    console.log('✓ Ganga Seasonal Comparator X-Axis verified with Har Ki Pauri and Jagjeetpur STP!');
    await desktopPage.screenshot({ path: path.join(screenshotsDir, 'desktop_03_ganga_seasonal_xaxis.png') });

    // 1.5 Switch back to Monitor Tab for Ganga
    console.log('\nNavigating to Ganga Map & Timelapse Tab...');
    const monitorTabBtn = desktopPage.locator('nav button:has-text("Map & Timelapse")');
    await monitorTabBtn.click();
    await desktopPage.waitForTimeout(1500);

    const gangaProfileLabels = await getXAxisLabels(desktopPage);
    console.log('Ganga Profile X-Axis Labels (count ' + gangaProfileLabels.length + '):', gangaProfileLabels.slice(0, 6));

    if (!gangaProfileLabels.includes('Har Ki Pauri (5.4km)')) {
      throw new Error(`Ganga Profile X-Axis missing 'Har Ki Pauri (5.4km)', found: ${gangaProfileLabels.join(', ')}`);
    }
    if (!gangaProfileLabels.includes('Raiwala (0km)')) {
      throw new Error(`Ganga Profile X-Axis missing 'Raiwala (0km)'`);
    }
    if (!gangaProfileLabels.includes('SIIDCUL (19.2km)')) {
      throw new Error(`Ganga Profile X-Axis missing 'SIIDCUL (19.2km)'`);
    }
    console.log('✓ Ganga Longitudinal Profile X-Axis verified!');
    await desktopPage.screenshot({ path: path.join(screenshotsDir, 'desktop_04_ganga_profile_xaxis.png') });

    await desktopContext.close();

    // =========================================================================
    // 2. MOBILE VIEWPORT TEST (390 x 844)
    // =========================================================================
    console.log('\n--- 2. MOBILE APP VIEWPORT X-AXIS VERIFICATION ---');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
    });
    const mobilePage = await mobileContext.newPage();

    mobilePage.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('Mobile Console Error:', msg.text());
        errors.push(`Mobile: ${msg.text()}`);
      }
    });
    mobilePage.on('pageerror', (err) => errors.push(`Mobile PageError: ${err.message}`));

    await mobilePage.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await mobilePage.waitForTimeout(2000);
    console.log('✓ Mobile view loaded');

    // 2.1 Check Yamuna Mobile Profile Page
    console.log('Navigating to Mobile Profile Page...');
    const mobileProfileTab = mobilePage.locator('button[data-testid="mobile-tab-profile"]');
    await mobileProfileTab.click();
    await mobilePage.waitForTimeout(1500);

    const mobileYamunaProfileLabels = await getXAxisLabels(mobilePage);
    console.log('Mobile Yamuna Profile Labels (count ' + mobileYamunaProfileLabels.length + '):', mobileYamunaProfileLabels.slice(0, 5));

    if (!mobileYamunaProfileLabels.includes('Najafgarh (16.5km)')) {
      throw new Error(`Mobile Yamuna Profile X-Axis missing 'Najafgarh (16.5km)'`);
    }
    console.log('✓ Mobile Yamuna Profile X-Axis shows location names!');
    await mobilePage.screenshot({ path: path.join(screenshotsDir, 'mobile_01_yamuna_profile_xaxis.png') });

    // 2.2 Switch Mobile River to Ganga
    console.log('\nSwitching Mobile River to Ganga...');
    const mobileGangaBtn = mobilePage.locator('header button:has-text("Ganga")').first();
    await mobileGangaBtn.click();
    await mobilePage.waitForTimeout(2000);

    const mobileGangaProfileLabels = await getXAxisLabels(mobilePage);
    console.log('Mobile Ganga Profile Labels (count ' + mobileGangaProfileLabels.length + '):', mobileGangaProfileLabels.slice(0, 6));

    if (!mobileGangaProfileLabels.includes('Har Ki Pauri (5.4km)')) {
      throw new Error(`Mobile Ganga Profile X-Axis missing 'Har Ki Pauri (5.4km)'`);
    }
    console.log('✓ Mobile Ganga Profile X-Axis shows Har Ki Pauri!');
    await mobilePage.screenshot({ path: path.join(screenshotsDir, 'mobile_02_ganga_profile_xaxis.png') });

    // 2.3 Check Mobile Ganga Seasonal Page
    console.log('\nNavigating to Mobile Seasonal Page for Ganga...');
    const mobileSeasonalTab = mobilePage.locator('button[data-testid="mobile-tab-seasonal"]');
    await mobileSeasonalTab.click();
    await mobilePage.waitForTimeout(1500);

    const mobileGangaSeasonalLabels = await getXAxisLabels(mobilePage);
    console.log('Mobile Ganga Seasonal Labels (count ' + mobileGangaSeasonalLabels.length + '):', mobileGangaSeasonalLabels.slice(0, 6));

    if (!mobileGangaSeasonalLabels.includes('Har Ki Pauri (5.4km)')) {
      throw new Error(`Mobile Ganga Seasonal X-Axis missing 'Har Ki Pauri (5.4km)'`);
    }
    console.log('✓ Mobile Ganga Seasonal X-Axis verified!');
    await mobilePage.screenshot({ path: path.join(screenshotsDir, 'mobile_03_ganga_seasonal_xaxis.png') });

    await mobileContext.close();

    console.log('\n============================================================');
    console.log('🎉 SUCCESS: ALL X-AXIS LOCATION LABELS VERIFIED PERFECTLY!');
    console.log(`Total console errors: ${errors.length}`);
    if (errors.length > 0) {
      console.warn('Console errors encountered:', errors);
      process.exit(1);
    }
    console.log('============================================================\n');

  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runXAxisVerification();
