const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../src/shared/core.js");

test("timeToMinutes parses valid times and rejects invalid times", () => {
  assert.equal(core.timeToMinutes("09:30"), 570);
  assert.equal(core.timeToMinutes("23:59"), 1439);
  assert.equal(core.timeToMinutes("24:00"), null);
});

test("isTimeInBlock handles normal and overnight blocks", () => {
  assert.equal(core.isTimeInBlock(600, 540, 660), true);
  assert.equal(core.isTimeInBlock(700, 540, 660), false);
  assert.equal(core.isTimeInBlock(30, 1380, 120), true);
  assert.equal(core.isTimeInBlock(720, 1380, 120), false);
});

test("getActiveBlock returns the matching scheduled activity", () => {
  const schedule = [{ id: "one", start: "09:00", end: "11:00" }, { id: "two", start: "12:00", end: "13:00" }];
  assert.equal(core.getActiveBlock(schedule, new Date(2026, 0, 1, 9, 30)).id, "one");
  assert.equal(core.getActiveBlock(schedule, new Date(2026, 0, 1, 11, 30)), null);
});

test("normalizeBlock cleans keywords and limits suggestions to three", () => {
  const block = core.normalizeBlock({ keywords: " focus, build, , ship ", links: [{}, {}, {}, {}] });
  assert.deepEqual(block.keywords, ["focus", "build", "ship"]);
  assert.equal(block.links.length, 3);
});


test("normalizeUrl allows web links and rejects executable protocols", () => {
  assert.equal(core.normalizeUrl("https://example.com/task"), "https://example.com/task");
  assert.equal(core.normalizeUrl("javascript:alert(1)"), "https://www.youtube.com/");
});
