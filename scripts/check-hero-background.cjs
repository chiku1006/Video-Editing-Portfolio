const { chromium, expect } = require("@playwright/test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { PNG } = require(
  path.join(
    path.dirname(require.resolve("playwright-core")),
    "lib/utilsBundle.js",
  ),
);

function mean(png, left, top, width, height) {
  let total = 0;
  for (let y = top; y < top + height; y++) {
    for (let x = left; x < left + width; x++)
      total += png.data[(y * png.width + x) * 4];
  }
  return total / (width * height);
}

function assertBlack(png, left, top, width, height, label) {
  for (let y = top; y < top + height; y++) {
    for (let x = left; x < left + width; x++) {
      const offset = (y * png.width + x) * 4;
      assert.ok(
        png.data[offset] === 0 &&
          png.data[offset + 1] === 0 &&
          png.data[offset + 2] === 0,
        `${label}: non-black background pixel at ${x}, ${y}`,
      );
    }
  }
}

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    fs.mkdirSync("artifacts/hero-fade", { recursive: true });
    for (const [width, height] of [
      [1920, 1080],
      [1440, 900],
      [1366, 768],
      [768, 1024],
      [390, 844],
    ]) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto("http://localhost:3100");
      await page.waitForTimeout(2200);
      const background = page.locator(".swiss-hero-background");
      await expect(background).toHaveCount(1);
      assert.equal(await page.locator(".swiss-site-background").count(), 0);
      assert.equal(await page.locator("#home .hero-grid-pattern").count(), 1);
      assert.equal(await page.locator(".hero-grid-pattern").count(), 1);
      assert.equal(
        await background.evaluate((e) => getComputedStyle(e).position),
        "absolute",
      );
      assert.equal(
        await page
          .locator(".noise-overlay")
          .evaluate((e) => getComputedStyle(e).position),
        "absolute",
      );
      assert.equal(
        await page
          .locator(".noise-overlay")
          .evaluate((e) => !!e.closest("#home")),
        true,
      );
      const grain = page.locator(".animate-noise");
      assert.equal(
        await grain.evaluate((e) => getComputedStyle(e).animationName),
        "grain-shake",
      );
      assert.equal(
        await grain.evaluate((e) => getComputedStyle(e).animationDuration),
        "0.8s",
      );
      const start = await grain.evaluate(
        (e) => getComputedStyle(e).backgroundPosition,
      );
      await expect
        .poll(() =>
          grain.evaluate((e) => getComputedStyle(e).backgroundPosition),
        )
        .not.toBe(start);
      // Freeze only background effects for repeatable pixel measurements, after verifying motion.
      await background.evaluate((e) =>
        e.getAnimations({ subtree: true }).forEach((animation) => {
          animation.pause();
          animation.currentTime = 0;
        }),
      );
      const top = PNG.sync.read(
        await page.screenshot(
          width === 1440 ? { path: "artifacts/hero-fade/hero.png" } : {},
        ),
      );
      if (width === 1440) {
        const bands = [600, 700, 800].map((y) =>
          mean(top, 460, y + 10, 40, 20),
        );
        assert.ok(
          bands[0] > bands[1] && bands[1] > bands[2],
          `Expected progressive fade: ${bands}`,
        );
        console.log("Fade luminance bands:", bands);
      }
      const heroBottom = await page
        .locator("#home")
        .evaluate((e) => e.getBoundingClientRect().bottom + scrollY);
      await page.evaluate(
        (bottom) => window.scrollTo({ top: bottom - 350, behavior: "instant" }),
        heroBottom,
      );
      const boundary = await page
        .locator("#home")
        .evaluate((e) => Math.round(e.getBoundingClientRect().bottom));
      const transition = PNG.sync.read(
        await page.screenshot(
          [1440, 390].includes(width)
            ? { path: `artifacts/hero-fade/transition-${width}.png` }
            : {},
        ),
      );
      assertBlack(
        transition,
        32,
        boundary - 2,
        width - 64,
        5,
        `${width}: hero/work boundary`,
      );
      await page
        .locator("#work")
        .evaluate((e) =>
          window.scrollTo({
            top: e.getBoundingClientRect().top + scrollY,
            behavior: "instant",
          }),
        );
      const work = PNG.sync.read(
        await page.screenshot(
          width === 1440 ? { path: "artifacts/hero-fade/work.png" } : {},
        ),
      );
      assertBlack(work, 4, 120, 12, height - 150, `${width}: Work background`);
      assert.equal(
        await page
          .locator("#work")
          .evaluate((e) => getComputedStyle(e).backgroundColor),
        "rgb(0, 0, 0)",
      );
      await page.evaluate(() =>
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "instant",
        }),
      );
      const lower = PNG.sync.read(await page.screenshot());
      assertBlack(
        lower,
        4,
        120,
        12,
        height - 150,
        `${width}: About/Contact background`,
      );
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      assert.deepEqual(errors, []);
      console.log(
        `PASS ${width}: animated hero grain, fading grid, pure-black boundary, clean Work/About/Contact, no overflow`,
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
