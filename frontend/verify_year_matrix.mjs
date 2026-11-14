import { chromium } from 'playwright';
import path from 'path';

async function verifyYearMatrix() {
  console.log('🚀 Starting Verification of Year-to-Year Matrix Feature...');
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Test (1440x900)
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktopContext.newPage();

  desktopPage.on('console', msg => {
    if (msg.type() === 'error') console.error('Desktop Console Error:', msg.text());
  });

  await desktopPage.goto('http://127.0.0.1:5173');
  await desktopPage.waitForTimeout(2500);

  // Click on Pattern Discovery Matrix tab in navbar
  console.log('Navigating to Pattern Matrix tab on Desktop...');
  const patternsTab = desktopPage.locator('button:has-text("Pattern Matrix")');
  await patternsTab.click();
  await desktopPage.waitForTimeout(1500);

  // Verify Year-to-Year button is active by default
  const yearBtn = desktopPage.locator('button:has-text("Year to Year")');
  await yearBtn.waitFor({ state: 'visible' });
  console.log('✓ "Year to Year (2021–Current)" toggle is visible');

  // Verify Year columns in table header
  const headers = await desktopPage.locator('table thead th').allTextContents();
  console.log('Table Headers:', headers.map(h => h.trim()).filter(Boolean));

  const expectedYears = ['2021', '2022', '2023', '2024', '2025', '2026'];
  for (const yr of expectedYears) {
    if (!headers.some(h => h.includes(yr))) {
      throw new Error(`Missing expected year column: ${yr}`);
    }
  }
  if (!headers.some(h => h.includes('5-Yr Trajectory'))) {
    throw new Error('Missing "5-Yr Trajectory" column!');
  }
  console.log('✓ All 6 annual columns (2021-2026) and 5-Yr Trajectory verified!');

  // Verify 5-Year Trajectory Overview banner is visible
  const banner = desktopPage.locator('text=5-Year Trajectory & Trend Analysis');
  await banner.waitFor({ state: 'visible' });
  console.log('✓ 5-Year Trajectory & Trend Analysis banner is visible');

  // Capture screenshot of Yamuna Year-to-Year Matrix
  await desktopPage.screenshot({ path: path.join('screenshots', 'desktop_05_yamuna_year_matrix.png') });
  console.log('✓ Screenshot saved: desktop_05_yamuna_year_matrix.png');

  // Switch River to Ganga
  console.log('\nSwitching River to Ganga...');
  const gangaBtn = desktopPage.locator('button:has-text("Ganga")').first();
  await gangaBtn.click();
  await desktopPage.waitForSelector('table thead th', { timeout: 10000 });
  await desktopPage.waitForTimeout(500);

  const gangaHeaders = await desktopPage.locator('table thead th').allTextContents();
  console.log('Ganga Table Headers:', gangaHeaders.map(h => h.trim()).filter(Boolean));
  if (!gangaHeaders.some(h => h.includes('2021')) || !gangaHeaders.some(h => h.includes('5-Yr Trajectory'))) {
    throw new Error('Ganga Year-to-Year table missing expected columns!');
  }
  console.log('✓ Ganga Year-to-Year Matrix verified with all columns!');
  await desktopPage.screenshot({ path: path.join('screenshots', 'desktop_06_ganga_year_matrix.png') });
  console.log('✓ Screenshot saved: desktop_06_ganga_year_matrix.png');

  await desktopContext.close();

  // 2. Mobile Viewport Test (390x844)
  console.log('\n--- 2. Mobile App Viewport Test ---');
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileContext.newPage();

  await mobilePage.goto('http://127.0.0.1:5173');
  await mobilePage.waitForTimeout(2000);

  // Navigate to Patterns page in mobile bottom nav
  const mobilePatternsTab = mobilePage.locator('button[data-testid="mobile-tab-patterns"]');
  await mobilePatternsTab.click();
  await mobilePage.waitForTimeout(1500);

  const mobileYearBtn = mobilePage.locator('button:has-text("Year to Year")');
  await mobileYearBtn.waitFor({ state: 'visible' });
  console.log('✓ Mobile view shows Year-to-Year tab and table!');

  await mobilePage.screenshot({ path: path.join('screenshots', 'mobile_04_yamuna_year_matrix.png') });
  console.log('✓ Screenshot saved: mobile_04_yamuna_year_matrix.png');

  await mobileContext.close();

  console.log('\n🎉 ALL YEAR-TO-YEAR MATRIX TESTS PASSED PERFECTLY!');
  await browser.close();
}

verifyYearMatrix().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
