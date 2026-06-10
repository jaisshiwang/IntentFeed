(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.IntentFeedCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const DEFAULT_SCHEDULE = [
    {
      id: "morning-learning",
      start: "09:00",
      end: "11:00",
      activity: "Learn one practical JavaScript concept",
      keywords: ["javascript", "focus", "web development"],
      links: [
        { title: "JavaScript.info: read one chapter", url: "https://javascript.info/" },
        { title: "MDN JavaScript guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide" },
        { title: "Search YouTube with intention", url: "https://www.youtube.com/results?search_query=javascript+tutorial" }
      ]
    },
    {
      id: "evening-fitness",
      start: "18:00",
      end: "20:00",
      activity: "Move your body and reset",
      keywords: ["fitness", "energy", "consistency"],
      links: [
        { title: "Start a 10-minute mobility session", url: "https://www.youtube.com/results?search_query=10+minute+mobility+routine" },
        { title: "Take a screen-free walk", url: "https://www.google.com/search?q=10+minute+walking+route+near+me" },
        { title: "Try a short bodyweight workout", url: "https://www.youtube.com/results?search_query=10+minute+bodyweight+workout" }
      ]
    }
  ];

  const EMPTY_ANALYTICS = { shown: 0, started: 0, ignored: 0 };

  function timeToMinutes(value) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value || "")) return null;
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
  }

  function isTimeInBlock(nowMinutes, startMinutes, endMinutes) {
    if ([nowMinutes, startMinutes, endMinutes].some((value) => value === null)) return false;
    if (startMinutes === endMinutes) return true;
    if (startMinutes < endMinutes) return nowMinutes >= startMinutes && nowMinutes < endMinutes;
    return nowMinutes >= startMinutes || nowMinutes < endMinutes;
  }

  function getActiveBlock(schedule, date = new Date()) {
    const nowMinutes = date.getHours() * 60 + date.getMinutes();
    return (Array.isArray(schedule) ? schedule : []).find((block) =>
      isTimeInBlock(nowMinutes, timeToMinutes(block.start), timeToMinutes(block.end))
    ) || null;
  }

  function normalizeUrl(value) {
    try {
      const url = new URL(String(value || "https://www.youtube.com/"));
      return ["http:", "https:"].includes(url.protocol) ? url.href : "https://www.youtube.com/";
    } catch {
      return "https://www.youtube.com/";
    }
  }

  function normalizeBlock(block, index = 0) {
    const links = Array.isArray(block.links) ? block.links : [];
    return {
      id: String(block.id || `block-${Date.now()}-${index}`),
      start: String(block.start || "09:00"),
      end: String(block.end || "10:00"),
      activity: String(block.activity || "Focus on what matters").trim(),
      keywords: (Array.isArray(block.keywords) ? block.keywords : String(block.keywords || "").split(","))
        .map((keyword) => String(keyword).trim()).filter(Boolean),
      links: links.slice(0, 3).map((link, linkIndex) => ({
        title: String(link.title || `Suggested link ${linkIndex + 1}`).trim(),
        url: normalizeUrl(link.url)
      }))
    };
  }

  function normalizeSchedule(schedule) {
    return (Array.isArray(schedule) ? schedule : []).map(normalizeBlock);
  }

  function formatTimeRange(block) {
    return `${block.start}–${block.end}`;
  }

  return { DEFAULT_SCHEDULE, EMPTY_ANALYTICS, timeToMinutes, normalizeUrl, isTimeInBlock, getActiveBlock, normalizeBlock, normalizeSchedule, formatTimeRange };
});
