const { chromium, expect } = require("@playwright/test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { PNG } = require(
  path.join(
    path.dirname(require.resolve("playwright-core")),
    "lib/utilsBundle.js",
  ),
);

const baseURL = process.env.CURSOR_TEST_URL ?? "http://localhost:3100";

async function checkContrast(page, cursor) {
  for (const background of ["#fff", "#10110f"]) {
    await page.evaluate((color) => {
      document.querySelector("#cursor-contrast-fixture")?.remove();
      const link = document.createElement("a");
      link.id = "cursor-contrast-fixture";
      link.href = "#main";
      link.style.cssText =
        `position:fixed;left:55px;top:175px;width:50px;height:50px;background:${color}`;
      document.body.append(link);
    }, background);
    await page.mouse.move(80, 200);
    await expect(cursor).toHaveAttribute("data-state", "link");
    const clip = { x: 60, y: 180, width: 40, height: 40 };
    await expect.poll(async () => {
      const { data } = PNG.sync.read(await page.screenshot({ clip }));
      let greenPixels = 0;
      let darkPixels = 0;
      for (let i = 0; i < data.length; i += 4) {
        const [red, green, blue] = data.subarray(i, i + 3);
        if (green > 175 && green - blue > 55) greenPixels++;
        if (Math.max(red, green, blue) < 155) darkPixels++;
      }
      return greenPixels > 8 && (background !== "#fff" || darkPixels === 0);
    }).toBe(true);
  }
  await page.evaluate(() =>
    document.querySelector("#cursor-contrast-fixture").remove(),
  );
}

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    const page = await browser.newPage({
      baseURL,
      viewport: { width: 1440, height: 900 },
    });
    const errors = [];
    page.setDefaultTimeout(8000);
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    const cursor = page.locator(".studio-cursor");
    const label = cursor.locator(".studio-cursor-core > span");
    const show = async (state) => {
      await expect(cursor).toHaveCSS("opacity", "1");
      await expect(cursor).toHaveAttribute("data-state", state);
    };
    const hide = () => expect(cursor).toHaveCSS("opacity", "0");

    await hide();
    await expect(cursor).toHaveCSS("pointer-events", "none");
    await page.locator("h1").hover();
    await show("dot");
    await page.locator(".studio-hero-description").hover();
    await show("dot");
    const logo = page.locator(".logo");
    await logo.hover();
    await show("link");
    await expect(logo).toHaveCSS("cursor", "none");
    await page.locator(".nav-link").first().hover();
    await show("link");
    await page.getByRole("link", { name: "Explore work" }).hover();
    await show("link");
    await logo.hover();
    await page.mouse.down();
    await page.mouse.up();
    await show("link");

    const heading = await page.locator("h1").boundingBox();
    const headingX = heading.x + heading.width / 2;
    const headingY = heading.y + heading.height / 2;
    await page.mouse.move(headingX, headingY);
    await show("dot");
    await page.mouse.down();
    await page.mouse.move(headingX + 20, headingY);
    await hide();
    await page.mouse.up();
    await show("dot");

    const jump = await page.evaluate(async () => {
      function move(x, y) {
        document.elementFromPoint(x, y).dispatchEvent(
          new PointerEvent("pointermove", {
            bubbles: true,
            clientX: x,
            clientY: y,
            pointerType: "mouse",
          }),
        );
      }
      move(20, 220);
      move(720, 140);
      move(1320, 220);
      await new Promise(requestAnimationFrame);
      const { left, top } = document
        .querySelector(".studio-cursor")
        .getBoundingClientRect();
      return { left, top };
    });
    assert.deepEqual(jump, { left: 1320, top: 220 });

    await page.mouse.move(25, 220);
    await show("dot");
    await page.mouse.move(-1, 220);
    await hide();
    await page.mouse.move(25, 220);
    await show("dot");
    assert.deepEqual(
      await cursor.evaluate((element) => {
        const { left, top } = element.getBoundingClientRect();
        return { left, top };
      }),
      { left: 25, top: 220 },
    );
    await page.keyboard.press("Tab");
    await hide();
    await expect(logo).not.toHaveCSS("cursor", "none");

    await checkContrast(page, cursor);

    const card = page
      .locator(".featured-work .motion-card[data-cursor='PLAY']")
      .first();
    await card.hover();
    await show("PLAY");
    await expect(label).toHaveText("PLAY");
    await expect(label).toHaveCSS("opacity", "1");
    const depthX = () => card.evaluate((element) =>
      element.style.getPropertyValue("--depth-x"),
    );
    assert.ok(await depthX());
    await page.evaluate(() => window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "instant",
    }));
    await expect.poll(depthX).toBe("");
    await expect(label).toHaveCSS("opacity", "0");

    await card.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await hide();
    const close = dialog.getByRole("button", { name: "Close video" });
    await close.hover();
    await expect(close).toHaveCSS("cursor", "pointer");
    await hide();
    await page.mouse.move(5, 5);
    await expect(dialog).not.toHaveCSS("cursor", "none");
    await hide();
    await close.click();
    await expect(dialog).toHaveCount(0);
    await card.hover();
    await show("PLAY");

    await page.goto("/hire");
    const field = page.locator("input[name='name']");
    const submit = page.getByRole("button", { name: "Send Message" });
    await submit.hover();
    await show("link");
    await field.hover();
    await hide();
    await expect(field).toHaveCSS("cursor", "text");
    await page.locator("select").hover();
    await hide();
    await submit.hover();
    await show("link");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(cursor).toBeHidden();
    await expect(submit).not.toHaveCSS("cursor", "none");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(cursor).toHaveCSS("display", "block");
    await page.mouse.move(25, 220);
    await show("dot");

    const touch = await browser.newPage({
      baseURL,
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    await touch.goto("/");
    await expect(touch.locator(".studio-cursor")).toBeHidden();
    await touch.getByRole("button", { name: "Open menu" }).tap();
    await expect(touch.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
    await expect(touch.locator("html")).not.toHaveClass(/custom-cursor-active/);
    assert.deepEqual(errors, []);
    console.log("PASS cursor contrast, hover states, first-frame tracking, viewport exit and re-entry, scrolling, click-through, native controls, keyboard, reduced motion, and touch");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
