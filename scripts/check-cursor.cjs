const { chromium, expect } = require("@playwright/test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { PNG } = require(
  path.join(
    path.dirname(require.resolve("playwright-core")),
    "lib/utilsBundle.js",
  ),
);

function pixel(png, x, y) {
  const offset = (Math.floor(y) * png.width + Math.floor(x)) * 4;
  return Array.from(png.data.subarray(offset, offset + 3));
}

function findWhite(png, bounds) {
  for (let y = Math.ceil(bounds.y + 3); y < bounds.y + bounds.height - 3; y++) {
    for (
      let x = Math.ceil(bounds.x + 3);
      x < bounds.x + Math.min(bounds.width, 100) - 3;
      x++
    ) {
      if (pixel(png, x, y).every((channel) => channel >= 240)) return { x, y };
    }
  }
  throw new Error("No white text pixel found in the expected bounds");
}

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("http://localhost:3100");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(2200);
    const cursor = page.locator(".swiss-custom-cursor");
    const dot = cursor.locator(".swiss-cursor-dot");
    assert.equal(await page.locator(".hero-spotlight").count(), 0);
    assert.equal(await cursor.evaluate((e) => e.parentElement.tagName), "BODY");
    assert.equal(
      await cursor.evaluate((e) => getComputedStyle(e).mixBlendMode),
      "difference",
    );
    assert.equal(
      await page
        .locator(".hero")
        .evaluate((e) => getComputedStyle(e).backgroundImage),
      "none",
    );
    const grid = await page
      .locator(".hero-grid-pattern")
      .evaluate((e) => getComputedStyle(e).backgroundSize);
    assert.equal(grid, "100px 100px, 100px 100px, 20px 20px, 20px 20px");
    assert.equal(
      await page
        .locator(".hero")
        .evaluate((e) => getComputedStyle(e, "::after").content),
      "none",
    );
    assert.equal(await page.locator("#smallGrid").getAttribute("width"), "40");
    assert.equal(await page.locator("#largeGrid").getAttribute("width"), "200");
    assert.equal(
      await page
        .locator(".animate-grid-pulse")
        .evaluate((e) => getComputedStyle(e).animationDuration),
      "8s",
    );
    assert.equal(
      await page
        .locator(".animate-grid-pulse-delayed")
        .evaluate((e) => getComputedStyle(e).animationDelay),
      "4s",
    );
    assert.equal(
      await page
        .locator(".animate-grid-intersect")
        .evaluate((e) => getComputedStyle(e).animationDuration),
      "6s",
    );
    assert.equal(
      await page
        .locator(".animate-noise")
        .evaluate((e) => getComputedStyle(e).animationDuration),
      "0.8s",
    );

    const baseline = PNG.sync.read(await page.screenshot());
    const locations = [
      { name: "background", x: 85, y: 165 },
      {
        name: "heading",
        ...findWhite(baseline, await page.locator("h1").boundingBox()),
      },
      {
        name: "navbar",
        ...findWhite(baseline, await page.locator(".logo").boundingBox()),
      },
    ];
    for (const location of locations) {
      await page.mouse.move(location.x, location.y);
      await expect
        .poll(() => cursor.evaluate((e) => getComputedStyle(e).opacity))
        .toBe("1");
      await page.waitForTimeout(950);
      const bounds = await dot.boundingBox();
      assert.ok(Math.abs(bounds.x + bounds.width / 2 - location.x) < 1);
      assert.ok(Math.abs(bounds.y + bounds.height / 2 - location.y) < 1);
      const rendered = PNG.sync.read(
        await page.screenshot({ path: `cursor-${location.name}.png` }),
      );
      const before = pixel(baseline, location.x, location.y);
      const after = pixel(rendered, location.x, location.y);
      for (let channel = 0; channel < 3; channel++) {
        assert.ok(
          Math.abs(after[channel] - (255 - before[channel])) <= 5,
          `${location.name}: actual pixel inversion expected; ${before} -> ${after}`,
        );
      }
      console.log(
        `PASS ${location.name}: actual RGB inversion ${before} -> ${after}`,
      );
    }
    assert.ok(
      Math.abs((await dot.boundingBox()).width - 48) < 1,
      "Interactive hover subtly enlarges cursor",
    );
    assert.equal(
      await page.locator(".logo").evaluate((e) => getComputedStyle(e).cursor),
      "none",
    );
    await page.keyboard.press("Tab");
    assert.equal(
      await page
        .locator("html")
        .evaluate((e) => e.classList.contains("custom-cursor-active")),
      false,
    );
    await page.mouse.move(400, 180);
    await expect
      .poll(() => cursor.evaluate((e) => getComputedStyle(e).opacity))
      .toBe("1");
    await page.waitForTimeout(250);
    assert.ok(Math.abs((await dot.boundingBox()).width - 12) < 1);
    await page.getByRole("link", { name: "Catalogue", exact: true }).click();
    assert.ok(page.url().endsWith("#work"));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(cursor).toHaveCount(0);
    await expect
      .poll(() =>
        page
          .locator("html")
          .evaluate((e) => e.classList.contains("custom-cursor-active")),
      )
      .toBe(false);

    const touch = await browser.newPage({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    await touch.goto("http://localhost:3100");
    await expect(touch.locator(".swiss-custom-cursor")).toHaveCount(0);
    assert.equal(
      await touch.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS portal blending, cursor precision, hover scale, keyboard/native fallback, click-through, reduced motion, touch, preserved grid",
    );
    await touch.close();
    await page.close();
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
