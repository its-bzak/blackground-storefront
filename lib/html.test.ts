import assert from "node:assert/strict";
import { test } from "node:test";

import { hasContent } from "./html.ts";

test("hasContent is false for empty or whitespace-only markup", () => {
  for (const empty of [null, undefined, "", "   ", "<p></p>", "<p><br></p>\n<div>&nbsp;</div>"]) {
    assert.equal(hasContent(empty), false);
  }
});

test("hasContent is true for text, and for media with no text", () => {
  assert.equal(hasContent("<p>At Blackground, we're not just about looking good.</p>"), true);
  assert.equal(hasContent('<p><img src="https://cdn.shopify.com/a.jpg" alt=""></p>'), true);
  assert.equal(hasContent('<iframe src="https://example.com"></iframe>'), true);
});
