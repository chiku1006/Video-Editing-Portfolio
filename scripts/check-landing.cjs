const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const [width, height] of [
    [1920, 1080],
    [1440, 900],
    [1366, 768],
    [768, 1024],
    [390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("http://localhost:3100");
    await page.waitForTimeout(1900);
    const geometry = await page.evaluate(() => {
      const name = document.querySelector("h1").getBoundingClientRect();
      const actions = document
        .querySelector(".hero-actions")
        .getBoundingClientRect();
      const scroll = document
        .querySelector(".scroll-indicator")
        .getBoundingClientRect();
      return {
        overflow: document.documentElement.scrollWidth > innerWidth,
        nameLeft: name.left,
        nameRight: name.right,
        actionsBottom: actions.bottom,
        scrollTop: scroll.top,
      };
    });
    assert.equal(geometry.overflow, false, `${width}: horizontal overflow`);
    assert.ok(
      geometry.nameLeft >= 0 && geometry.nameRight <= width,
      `${width}: name clips`,
    );
    assert.ok(
      geometry.actionsBottom < geometry.scrollTop,
      `${width}: scroll overlaps actions`,
    );
    await page.screenshot({ path: `preview-${width}.png` });
    console.log(`PASS ${width} × ${height}`);
  }
  await page.getByRole("button", { name: "Open menu" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "My Work" })
    .click();
  await page.waitForTimeout(700);
  assert.ok(page.url().endsWith("#work"));
  assert.equal(
    await page
      .getByRole("button", { name: "Open menu" })
      .getAttribute("aria-expanded"),
    "false",
  );
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.keyboard.press("Escape");
  assert.equal(
    await page
      .getByRole("button", { name: "Open menu" })
      .getAttribute("aria-expanded"),
    "false",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("http://localhost:3100");
  assert.equal(
    await page.locator("h1").evaluate((el) => getComputedStyle(el).opacity),
    "1",
  );
  assert.equal(
    await page
      .locator(".scroll-track")
      .evaluate((el) => getComputedStyle(el, "::after").animationName),
    "none",
  );
  for (const [name, hash] of [
    ["Catalogue", "#work"],
    ["Connect", "#contact"],
  ]) {
    await page.getByRole("link", { name, exact: false }).click();
    assert.ok(page.url().endsWith(hash));
    await page
      .getByRole("link", { name: "Soumen Mandal — back to top" })
      .click();
    assert.equal(await page.evaluate(() => scrollY), 0);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:3100");
  for (const [name, hash] of [
    ["My Work", "#work"],
    ["About", "#about"],
    ["Hire Me ↗", "#contact"],
  ]) {
    await page
      .getByRole("navigation", { name: "Main navigation", exact: true })
      .getByRole("link", { name, exact: true })
      .click();
    assert.ok(page.url().endsWith(hash));
  }
  assert.deepEqual(errors, []);
  console.log(
    "PASS anchors, mobile menu, Escape, reduced motion, and browser errors",
  );
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
