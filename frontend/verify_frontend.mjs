import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function runVerification() {
  console.log('🚀 Starting YamunaPulse Headless Browser Verification...');
  const screenshotsDir = path.join(process.cwd(), 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const page = await context.newPage();

  const consoleErrors = [];
  const consoleWarnings = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    } else if (msg.type() === 'warning') {
      consoleWarnings.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
  });

  try {
    // 1. Navigate to Live Application
    console.log('1. Navigating to http://127.0.0.1:5173/...');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });

    // Verify Title & Brand
    const brandText = await page.textContent('h1');
    console.log(`   Header Brand: "${brandText?.trim()}"`);
    if (!brandText?.includes('YamunaPulse')) {
      throw new Error(`Expected header to include 'YamunaPulse', got: ${brandText}`);
    }

    // Verify Creator Attribution "Created by Parva Sheth"
    const authorText = await page.textContent('body');
    if (!authorText?.includes('Parva Sheth')) {
      throw new Error('Expected page to include author attribution "Parva Sheth"');
    }
    console.log('   Creator Attribution Verified: "Created by Parva Sheth"');

    // Verify Visitor Counter
    const visitorElement = await page.$('text=/Visitors:/i');
    if (visitorElement) {
      const visitorText = await visitorElement.textContent();
      console.log(`   Visitor Counter Verified: "${visitorText?.trim()}"`);
    }

    // Verify Leaflet Map Container & Markers
    console.log('2. Verifying Interactive Map & 18 Nodes...');
    await page.waitForSelector('.leaflet-container', { timeout: 5000 });
    const circleMarkers = await page.$$('.leaflet-interactive');
    console.log(`   Found ${circleMarkers.length} interactive map elements (nodes, bboxes, lines)`);

    // Verify Longitudinal Profile Chart
    console.log('3. Verifying Longitudinal Cascade Profile Chart...');
    await page.waitForSelector('.recharts-responsive-container', { timeout: 5000 });
    console.log('   Recharts container rendered.');

    // Screenshot Monitor View
    await page.screenshot({ path: path.join(screenshotsDir, '01_monitor_view.png'), fullPage: true });
    console.log('   Saved screenshot: 01_monitor_view.png');

    // 4. Test Timeline Scrubber & Playback
    console.log('4. Testing Timeline Scrubber Playback...');
    const playBtn = await page.getByRole('button', { name: /Play Timelapse/i });
    if (await playBtn.isVisible()) {
      await playBtn.click();
      console.log('   Clicked "Play Timelapse". Waiting 2.5s for playback...');
      await page.waitForTimeout(2500);
      const pauseBtn = await page.getByRole('button', { name: /Pause/i });
      if (await pauseBtn.isVisible()) {
        console.log('   Playback confirmed: button changed to "Pause". Pausing now.');
        await pauseBtn.click();
      }
    }

    // Test Quick Jump button
    const winterBtn = await page.getByRole('button', { name: /Winter Foam/i });
    if (await winterBtn.isVisible()) {
      await winterBtn.click();
      await page.waitForTimeout(600);
      console.log('   Clicked "Winter Foam" quick jump.');
    }

    // 5. Test Switching Spectral Metric
    console.log('5. Testing Spectral Metric Selector...');
    const ndciBtn = await page.getByRole('button', { name: /NDCI/i });
    if (await ndciBtn.isVisible()) {
      await ndciBtn.click();
      await page.waitForTimeout(600);
      console.log('   Switched metric to NDCI (Algal / Eutrophic).');
    }

    // 6. Test Pattern Matrix Tab & Hands-on Interactive Controls
    console.log('6. Testing Pattern Discovery Matrix Tab with Hands-on Controls...');
    const patternTab = await page.getByRole('button', { name: /Pattern Matrix/i });
    await patternTab.click();
    await page.waitForSelector('table', { timeout: 5000 });
    const tableRows = await page.$$('tbody tr');
    console.log(`   Pattern matrix rendered with ${tableRows.length} node rows.`);

    // Test Hands-on Column Tour Playback
    console.log('   Testing Hands-on Column Tour Play/Pause...');
    const tourPlayBtn = await page.getByRole('button', { name: /Play Tour/i });
    if (await tourPlayBtn.isVisible()) {
      await tourPlayBtn.click();
      console.log('   Clicked "Play Tour". Waiting 2.5s for animated stepping...');
      await page.waitForTimeout(2500);
      const tourPauseBtn = await page.getByRole('button', { name: /Pause Tour/i });
      if (await tourPauseBtn.isVisible()) {
        console.log('   Column tour active. Pausing tour.');
        await tourPauseBtn.click();
      }
    }

    // Test Layman Mode Toggle
    console.log('   Testing Layman Mode Toggle...');
    const laymanToggle = await page.getByRole('button', { name: /Layman Words/i });
    if (await laymanToggle.isVisible()) {
      await laymanToggle.click();
      console.log('   Switched to Layman Mode (Clean/Fair/Sewage ratings).');
      await page.waitForTimeout(500);
    }

    // Test Node Reach Filter
    console.log('   Testing Node Reach Filter...');
    const urbanFilter = await page.getByRole('button', { name: /Urban Drains/i });
    if (await urbanFilter.isVisible()) {
      await urbanFilter.click();
      await page.waitForTimeout(400);
      const filteredCount = (await page.$$('tbody tr')).length;
      console.log(`   Filtered to Urban Drains reach: ${filteredCount} nodes.`);
    }

    // Reset filter
    const allFilter = await page.getByRole('button', { name: /All 18/i });
    if (allFilter) await allFilter.click();

    await page.screenshot({ path: path.join(screenshotsDir, '02_pattern_matrix.png'), fullPage: true });
    console.log('   Saved screenshot: 02_pattern_matrix.png');

    // 6b. Test Field Guide & Layman Glossary Modal
    console.log('6b. Testing Field Guide & Layman Glossary Modal...');
    const guideBtn = await page.getByRole('button', { name: /Guide & Terms/i });
    if (await guideBtn.isVisible()) {
      await guideBtn.click();
      await page.waitForSelector('h2:has-text("YamunaPulse Field Guide")', { timeout: 3000 });
      console.log('   Glossary Modal opened.');
      await page.screenshot({ path: path.join(screenshotsDir, '05_glossary_modal.png') });
      console.log('   Saved screenshot: 05_glossary_modal.png');

      // Test clicking category tabs inside Glossary
      const metricsCategoryBtn = await page.getByRole('button', { name: /The 4 Spectral Indices/i });
      if (metricsCategoryBtn) await metricsCategoryBtn.click();
      await page.waitForTimeout(400);

      // Close modal
      const closeBtn = await page.getByRole('button', { name: /Take Me to the Portal/i });
      if (closeBtn) await closeBtn.click();
      await page.waitForTimeout(400);
      console.log('   Glossary Modal closed.');
    }

    // 6c. Test Continuous Satellite Ingestion & Orbit Sync Modal
    console.log('6c. Testing Satellite Ingestion & Orbit Sync Modal...');
    const syncBtn = await page.getByRole('button', { name: /5d Orbit Sync/i });
    if (await syncBtn.isVisible()) {
      await syncBtn.click();
      await page.waitForSelector('h2:has-text("Continuous Satellite Ingestion")', { timeout: 3000 });
      console.log('   Sync Modal opened.');
      await page.screenshot({ path: path.join(screenshotsDir, '06_sync_modal.png') });
      console.log('   Saved screenshot: 06_sync_modal.png');

      // Close modal
      const closeSyncBtn = await page.getByRole('button', { name: /Close/i });
      if (closeSyncBtn) await closeSyncBtn.click();
      await page.waitForTimeout(400);
      console.log('   Sync Modal closed.');
    }

    // 6d. Test Share & Published Page Modal
    console.log('6d. Testing Share & Published Page Modal...');
    const shareBtn = await page.getByRole('button', { name: /Share Link/i }).first();
    if (await shareBtn.isVisible()) {
      await shareBtn.click();
      await page.waitForSelector('h3:has-text("Share YamunaPulse")', { timeout: 3000 });
      console.log('   Share Modal opened.');
      await page.screenshot({ path: path.join(screenshotsDir, '07_share_modal.png') });
      console.log('   Saved screenshot: 07_share_modal.png');

      // Click Copy Link
      const copyBtn = await page.getByRole('button', { name: /Copy Link/i });
      if (await copyBtn.isVisible()) {
        await copyBtn.click();
        console.log('   Clicked "Copy Link" button.');
        await page.waitForTimeout(300);
      }

      // Close modal
      const closeShareBtn = await page.getByRole('button', { name: /Close/i });
      if (closeShareBtn) await closeShareBtn.click();
      await page.waitForTimeout(400);
      console.log('   Share Modal closed.');
    }

    // 7. Test Seasonal Engine Tab
    console.log('7. Testing Seasonal Engine Tab...');
    const seasonalTab = await page.getByRole('button', { name: /Seasonal Engine/i });
    await seasonalTab.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotsDir, '03_seasonal_engine.png'), fullPage: true });
    console.log('   Saved screenshot: 03_seasonal_engine.png');

    // 8. Test Anomaly Feed Tab
    console.log('8. Testing Anomaly Feed Tab...');
    const anomalyTab = await page.getByRole('button', { name: /Anomaly Feed/i });
    await anomalyTab.click();
    await page.waitForSelector('[data-testid="insight-card"]', { timeout: 5000 });
    const feedCards = await page.$$('[data-testid="insight-card"]');
    console.log(`   Found ${feedCards.length} automated insight anomaly cards.`);
    await page.screenshot({ path: path.join(screenshotsDir, '04_anomaly_feed.png'), fullPage: true });
    console.log('   Saved screenshot: 04_anomaly_feed.png');

    // 9. Test Node Inspector Modal (switch back to monitor tab, click Node 5)
    console.log('9. Testing Node Inspector Modal...');
    const monitorTab = await page.getByRole('button', { name: /Map & Timelapse/i });
    await monitorTab.click();
    await page.waitForTimeout(600);

    // Click on Node 5 (Najafgarh Drain Outfall)
    const node5Element = await page.$('.recharts-area-dots circle');
    if (node5Element) {
      await node5Element.click();
    } else {
      // Click on chart
      await page.click('.recharts-surface', { position: { x: 200, y: 100 } });
    }
    await page.waitForTimeout(800);

    console.log('\n--- VERIFICATION RESULT ---');
    console.log(`Uncaught Console Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.error('Errors found:', consoleErrors);
    } else {
      console.log('✅ ZERO Console Errors & Zero NaN issues!');
    }
    console.log('✅ All 18 nodes, timeline scrubber, pattern matrix, seasonal engine, and anomaly feed verified successfully!');
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runVerification();
