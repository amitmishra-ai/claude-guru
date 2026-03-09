import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = 'http://localhost:3001';
const DIR = './screenshots';
mkdirSync(DIR, { recursive: true });

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function clickTab(page, value) {
  // Use evaluate to click directly (avoids overlay interception issues)
  await page.evaluate((val) => {
    const tabs = document.querySelectorAll(`[role="tab"][id*="trigger-${val}"]`);
    if (tabs.length > 0) tabs[0].dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    if (tabs.length > 0) tabs[0].dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    if (tabs.length > 0) tabs[0].click();
  }, value);
  await wait(500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(300);
}

async function clickButton(page, text) {
  const found = await page.evaluate((txt) => {
    const btns = document.querySelectorAll('button');
    for (const b of btns) {
      if (b.textContent && b.textContent.trim().includes(txt)) {
        b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        b.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
        b.click();
        return true;
      }
    }
    return false;
  }, text);
  await wait(500);
  return found;
}

async function toggleDarkMode(page) {
  await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const b of btns) {
      const t = b.textContent && b.textContent.trim();
      if (t && (t.includes('Dark mode') || t.includes('Light mode'))) {
        b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        b.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
        b.click();
        return;
      }
    }
  });
  await wait(500);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(2000);

  // Dismiss the "Update your availability" popup modal if present
  try {
    const maybeLater = page.locator('button:has-text("Maybe later")');
    if (await maybeLater.isVisible({ timeout: 2000 })) {
      await maybeLater.click();
      await wait(500);
      console.log('✓ Dismissed availability popup');
    }
  } catch (_) {
    // No popup, continue
  }

  // Also close any dialog overlay that might be blocking
  try {
    const closeBtn = page.locator('[role="dialog"] button:has-text("×"), [role="dialog"] button[aria-label="Close"]');
    if (await closeBtn.first().isVisible({ timeout: 1000 })) {
      await closeBtn.first().click();
      await wait(500);
    }
  } catch (_) {}

  let n = 1;
  const shot = async (name) => {
    const filename = `${DIR}/${String(n).padStart(2, '0')}-${name}.png`;
    await page.screenshot({ path: filename, fullPage: false });
    console.log(`✓ ${filename}`);
    n++;
  };

  // ── LIGHT MODE ──

  // 1. Home
  await clickTab(page, 'home');
  await shot('home-light');

  // 2. Home scrolled
  await page.evaluate(() => window.scrollTo(0, 600));
  await wait(300);
  await shot('home-scrolled-light');

  // 3. Home - Completed sessions
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(200);
  await clickButton(page, 'Completed');
  await shot('home-completed-light');

  // 4. Courses
  await clickTab(page, 'courses');
  await shot('courses-light');

  // 5. Calendar - Week
  await clickTab(page, 'calendar');
  await clickButton(page, 'Week');
  await wait(300);
  await shot('calendar-week-light');

  // 6. Calendar - Month
  await clickButton(page, 'Month');
  await wait(300);
  await shot('calendar-month-light');

  // 7. Notifications
  await clickTab(page, 'notifications');
  await shot('notifications-light');

  // 8. Profile
  await clickTab(page, 'profile');
  await shot('profile-light');

  // 9. Profile scrolled (chart area)
  await page.evaluate(() => window.scrollTo(0, 500));
  await wait(300);
  await shot('profile-performance-light');

  // 10. Preferences
  await clickTab(page, 'preferences');
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(200);
  await shot('preferences-light');

  // ── MODALS (Light) ──

  // 11. Availability modal
  await clickTab(page, 'calendar');
  await clickButton(page, 'Add availability');
  await wait(500);
  await shot('modal-availability-light');
  await clickButton(page, 'Cancel');
  await wait(300);

  // 12. Leave modal
  await clickButton(page, 'Mark leave');
  await wait(500);
  await shot('modal-leave-light');
  await clickButton(page, 'Cancel');
  await wait(300);

  // 13. Full matrix modal
  await clickTab(page, 'profile');
  await page.evaluate(() => window.scrollTo(0, 800));
  await wait(500);
  await clickButton(page, 'View full');
  await wait(500);
  await shot('modal-matrix-light');
  await clickButton(page, 'Close');
  await wait(300);

  // ── DARK MODE ──
  await toggleDarkMode(page);
  await wait(500);

  // 14. Home dark
  await clickTab(page, 'home');
  await shot('home-dark');

  // 15. Home scrolled dark
  await page.evaluate(() => window.scrollTo(0, 600));
  await wait(300);
  await shot('home-scrolled-dark');

  // 16. Courses dark
  await clickTab(page, 'courses');
  await shot('courses-dark');

  // 17. Calendar week dark
  await clickTab(page, 'calendar');
  await clickButton(page, 'Week');
  await wait(300);
  await shot('calendar-week-dark');

  // 18. Calendar month dark
  await clickButton(page, 'Month');
  await wait(300);
  await shot('calendar-month-dark');

  // 19. Notifications dark
  await clickTab(page, 'notifications');
  await shot('notifications-dark');

  // 20. Profile dark
  await clickTab(page, 'profile');
  await shot('profile-dark');

  // 21. Preferences dark
  await clickTab(page, 'preferences');
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(200);
  await shot('preferences-dark');

  // ── MODALS (Dark) ──

  // 22. Availability modal dark
  await clickTab(page, 'calendar');
  await clickButton(page, 'Add availability');
  await wait(500);
  await shot('modal-availability-dark');
  await clickButton(page, 'Cancel');
  await wait(300);

  // 23. Leave modal dark
  await clickButton(page, 'Mark leave');
  await wait(500);
  await shot('modal-leave-dark');
  await clickButton(page, 'Cancel');
  await wait(300);

  // 24. Full matrix modal dark
  await clickTab(page, 'profile');
  await page.evaluate(() => window.scrollTo(0, 800));
  await wait(500);
  await clickButton(page, 'View full');
  await wait(500);
  await shot('modal-matrix-dark');

  await browser.close();
  console.log(`\n✅ Done! ${n - 1} screenshots saved to ${DIR}/`);
})();
