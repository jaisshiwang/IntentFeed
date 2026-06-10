importScripts("shared/core.js");

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.local.get(["schedule", "analytics"]);
  const updates = {};
  if (!Array.isArray(existing.schedule)) updates.schedule = IntentFeedCore.DEFAULT_SCHEDULE;
  if (!existing.analytics) updates.analytics = IntentFeedCore.EMPTY_ANALYTICS;
  if (Object.keys(updates).length) await chrome.storage.local.set(updates);
});

chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage());
