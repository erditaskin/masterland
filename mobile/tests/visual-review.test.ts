import { test } from "node:test";
import assert from "node:assert/strict";
import { visualReviewCity } from "../src/ui/visualReview";

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
