import { test } from "node:test";
import assert from "node:assert/strict";
import { visualReviewCity, presentationReview } from "../src/ui/visualReview";

test("theme-only inspection cannot escape the explicit local test channel", () => {
  const url = "masterland://city-theme-review/city5";
  for (const channel of [undefined, "production", "testflight", "local"]) {
    assert.equal(visualReviewCity(url, false, channel), null);
    assert.equal(
      visualReviewCity(url, true, channel),
      channel === "local" ? "city5" : null,
    );
  }
  for (const malformed of [
    "masterland://city-theme-review/city6",
    "https://city-theme-review/city1",
    url + "?city=city1",
    url + "/extra",
    "masterland://auth/city1",
  ]) {
    assert.equal(visualReviewCity(malformed, true, "local"), null);
  }
});

test("presentation fixtures are local only and reject ambiguous deep links", () => {
  for (const view of [
    "board",
    "storage",
    "account-registered",
    "cloud-choice",
    "account-deletion",
  ]) {
    const url = `masterland://presentation-review/${view}`;
    assert.equal(presentationReview(url, true, "local"), view);
    for (const channel of [undefined, "testflight", "production"])
      assert.equal(presentationReview(url, true, channel), null);
    assert.equal(presentationReview(url, false, "local"), null);
    for (const malformed of [
      url + "?test=1",
      url + "/extra",
      url + "#ready",
      url.replace("masterland:", "https:"),
    ])
      assert.equal(presentationReview(malformed, true, "local"), null);
  }
  assert.equal(
    presentationReview(
      "masterland://presentation-review/unknown",
      true,
      "local",
    ),
    null,
  );
});
