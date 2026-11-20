const { chromium, expect } = require("@playwright/test");
const assert = require("node:assert/strict");

// Start the production server on port 3100 before running this script.
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("http://localhost:3100");
    const first = page.locator("video").nth(0);
    const second = page.locator("video").nth(1);
    const firstTitle = await first.getAttribute("aria-label");
    assert.equal(
      await second.getAttribute("src"),
      null,
      "Far-offscreen video must not load",
    );
    await first.scrollIntoViewIfNeeded();
    await expect
      .poll(() => first.evaluate((v) => !v.paused && v.currentTime > 0))
      .toBe(true);
    assert.equal(
      await first.evaluate((v) => v.muted && v.loop && v.playsInline),
      true,
    );
    await page
      .getByRole("button", { name: `Pause ${firstTitle}`, exact: true })
      .click();
    await expect.poll(() => first.evaluate((v) => v.paused)).toBe(true);
    await page
      .getByRole("link", { name: "Soumen Mandal — back to top" })
      .click();
    await first.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    assert.equal(
      await first.evaluate((v) => v.paused),
      true,
      "Manual pause survives re-entry",
    );

    const seek = page.getByRole("slider", {
      name: `Seek ${firstTitle}`,
      exact: true,
    });
    await seek.fill("2");
    await page
      .getByRole("button", {
        name: `Seek forward 5 seconds in ${firstTitle}`,
        exact: true,
      })
      .click();
    await expect
      .poll(() => first.evaluate((v) => Math.round(v.currentTime)))
      .toBe(7);
    await page
      .getByRole("button", {
        name: `Seek backward 5 seconds in ${firstTitle}`,
        exact: true,
      })
      .click();
    await expect
      .poll(() => first.evaluate((v) => Math.round(v.currentTime)))
      .toBe(2);
    await page
      .getByRole("button", {
        name: `Seek backward 5 seconds in ${firstTitle}`,
        exact: true,
      })
      .click();
    await expect.poll(() => first.evaluate((v) => v.currentTime)).toBe(0);
    await seek.fill(String(await first.evaluate((v) => v.duration - 1)));
    await page
      .getByRole("button", {
        name: `Seek forward 5 seconds in ${firstTitle}`,
        exact: true,
      })
      .click();
    assert.ok(
      await first.evaluate((v) => Math.abs(v.currentTime - v.duration) < 0.1),
      "Forward seek clamps to duration",
    );
    await seek.fill("2");
    await seek.focus();
    await page.keyboard.press("ArrowRight");
    await expect
      .poll(() => first.evaluate((v) => v.currentTime))
      .toBeGreaterThan(2);
    const track = await seek.boundingBox();
    await page.mouse.move(
      track.x + track.width * 0.13,
      track.y + track.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      track.x + track.width * 0.6,
      track.y + track.height / 2,
      { steps: 10 },
    );
    await page.mouse.up();
    assert.ok(
      await first.evaluate((v) => v.currentTime > v.duration * 0.5),
      "Pointer scrubbing seeks",
    );
    await page
      .getByRole("button", { name: `Unmute ${firstTitle}`, exact: true })
      .click();
    assert.equal(await first.evaluate((v) => v.muted), false);
    await page
      .getByRole("button", { name: `Mute ${firstTitle}`, exact: true })
      .click();
    await page
      .getByRole("button", { name: `Play ${firstTitle}`, exact: true })
      .click();
    await expect.poll(() => first.evaluate((v) => !v.paused)).toBe(true);

    await second.scrollIntoViewIfNeeded();
    await expect
      .poll(() => second.evaluate((v) => !v.paused && v.currentTime > 0))
      .toBe(true);
    assert.equal(
      await first.evaluate((v) => v.paused),
      true,
      "Offscreen playback pauses",
    );
    await first.scrollIntoViewIfNeeded();
    await expect.poll(() => first.evaluate((v) => !v.paused)).toBe(true);
    await seek.fill(String(await first.evaluate((v) => v.duration - 0.3)));
    await expect
      .poll(() => first.evaluate((v) => v.currentTime < 3), { timeout: 5000 })
      .toBe(true);
    console.log(
      "PASS autoplay, offscreen pause/resume, manual pause, seeking, dragging, audio, looping",
    );

    // At this height both independently observed players are visible together.
    await page.setViewportSize({ width: 1440, height: 2400 });
    await page
      .locator("#work")
      .evaluate((e) =>
        window.scrollTo({ top: e.offsetTop, behavior: "instant" }),
      );
    await expect
      .poll(() =>
        page
          .locator("video")
          .evaluateAll((vs) => vs.every((v) => !v.paused && v.muted)),
      )
      .toBe(true);
    console.log("PASS simultaneous muted playback");

    for (const [width, height] of [
      [1920, 1080],
      [1440, 900],
      [1366, 768],
      [768, 1024],
      [390, 844],
    ]) {
      await page.setViewportSize({ width, height });
      await first.scrollIntoViewIfNeeded();
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        `${width}: no overflow`,
      );
      const buttons = page.locator(".work-player").first().getByRole("button");
      const layouts = await page.locator("video").evaluateAll((videos) =>
        videos.map((video) => {
          const rect = video.getBoundingClientRect();
          const wrapper = video.parentElement.getBoundingClientRect();
          const card = video.closest(".work-player").getBoundingClientRect();
          return {
            fullWidth: Math.abs(wrapper.width - (card.width - 2)) < 1,
            equalSides:
              Math.abs(rect.left - card.left - (card.right - rect.right)) < 1,
            centeredVertically:
              Math.abs(
                rect.top - wrapper.top - (wrapper.bottom - rect.bottom),
              ) < 1,
            originalRatio:
              Math.abs(
                rect.width / rect.height - video.videoWidth / video.videoHeight,
              ) < 0.01,
          };
        }),
      );
      for (const layout of layouts) {
        assert.ok(
          Object.values(layout).every(Boolean),
          `${width}: full-width wrapper, centered video, preserved aspect ratio`,
        );
      }
      for (const button of await buttons.all()) {
        const bounds = await button.boundingBox();
        assert.ok(
          bounds.width >= 40 && bounds.height >= 40,
          "Controls remain usable",
        );
      }
    }
    console.log(
      "PASS five responsive sizes, full-width wrappers, equal video side spacing, aspect ratios, touch controls",
    );

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await first.scrollIntoViewIfNeeded();
    await expect
      .poll(() => first.evaluate((v) => v.readyState >= 1))
      .toBe(true);
    assert.equal(await first.evaluate((v) => v.paused), true);
    await page
      .getByRole("button", { name: `Play ${firstTitle}`, exact: true })
      .click();
    await expect.poll(() => first.evaluate((v) => !v.paused)).toBe(true);
    console.log(
      "PASS reduced motion disables automatic playback and permits manual play",
    );

    const unavailable = await browser.newPage();
    await unavailable.route("**/videos/motion-01.mp4", (route) =>
      route.fulfill({ status: 404, body: "" }),
    );
    await unavailable.goto("http://localhost:3100");
    await unavailable.locator(".work-player").first().scrollIntoViewIfNeeded();
    await expect(
      unavailable.getByText("Preview unavailable", { exact: true }),
    ).toBeVisible();
    assert.equal(
      await unavailable
        .locator(".work-player")
        .first()
        .getByRole("button")
        .count(),
      0,
    );
    await unavailable.close();

    const blocked = await browser.newPage();
    blocked.on("pageerror", (error) => errors.push(error.message));
    await blocked.addInitScript(() => {
      HTMLMediaElement.prototype.play = function () {
        return Promise.reject(new DOMException("Blocked", "NotAllowedError"));
      };
    });
    await blocked.goto("http://localhost:3100");
    await blocked.locator("video").first().scrollIntoViewIfNeeded();
    await expect(
      blocked.getByRole("button", {
        name: `Play ${firstTitle}`,
        exact: true,
      }),
    ).toBeEnabled();
    await blocked
      .getByRole("button", { name: `Play ${firstTitle}`, exact: true })
      .click();
    await expect(
      blocked.getByText("Press play to preview.", { exact: true }),
    ).toBeVisible();
    await blocked.close();
    assert.deepEqual(errors, []);
    console.log(
      "PASS missing-media fallback, autoplay rejection handling, no browser exceptions",
    );
    await page.close();
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
