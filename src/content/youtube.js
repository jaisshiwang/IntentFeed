(function () {
  "use strict";

  const PANEL_ID = "intentfeed-intervention";
  const STYLE_CLASS = "intentfeed-active";
  let ignoredBlockId = null;
  let lastShownKey = null;
  let timerId = null;

  const isHomepage = () => location.pathname === "/" || location.pathname === "";

  async function increment(metric) {
    const { analytics = IntentFeedCore.EMPTY_ANALYTICS } = await chrome.storage.local.get("analytics");
    await chrome.storage.local.set({ analytics: { ...IntentFeedCore.EMPTY_ANALYTICS, ...analytics, [metric]: (analytics[metric] || 0) + 1 } });
  }

  function removeIntervention() {
    document.getElementById(PANEL_ID)?.remove();
    document.documentElement.classList.remove(STYLE_CLASS);
    if (timerId) clearInterval(timerId);
    timerId = null;
  }

  function openLink(url) {
    if (url) window.location.assign(url);
  }

  function createPanel(block) {
    const panel = document.createElement("section");
    panel.id = PANEL_ID;
    panel.setAttribute("aria-label", "IntentFeed focus reminder");
    const links = [...block.links];
    const prompts = block.keywords.length ? block.keywords : [block.activity];
    while (links.length < 3) {
      const prompt = prompts[links.length % prompts.length];
      links.push({ title: `Explore ${prompt} with intention`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(prompt)}` });
    }

    panel.innerHTML = `
      <div class="intentfeed-card">
        <div class="intentfeed-eyebrow"><span></span> Intentional time · ${IntentFeedCore.formatTimeRange(block)}</div>
        <h1>Before you scroll, remember your intention.</h1>
        <p class="intentfeed-activity">${escapeHtml(block.activity)}</p>
        <div class="intentfeed-keywords">${block.keywords.map((keyword) => `<span>${escapeHtml(keyword)}</span>`).join("")}</div>
        <div class="intentfeed-suggestions">
          <h2>Choose your next step</h2>
          ${links.slice(0, 3).map((link, index) => `<button class="intentfeed-link" data-url="${escapeAttribute(link.url)}"><b>0${index + 1}</b><span>${escapeHtml(link.title)}</span><i>↗</i></button>`).join("")}
        </div>
        <div class="intentfeed-actions">
          <button class="intentfeed-primary" data-action="start">Start 10 min</button>
          <button class="intentfeed-secondary" data-action="open">Open task</button>
          <button class="intentfeed-ignore" data-action="ignore">Ignore for now</button>
        </div>
        <p class="intentfeed-note">IntentFeed replaced recommendations during this focus block.</p>
      </div>`;

    panel.querySelectorAll(".intentfeed-link").forEach((button) => button.addEventListener("click", () => openLink(button.dataset.url)));
    panel.querySelector('[data-action="open"]').addEventListener("click", () => openLink(links[0]?.url));
    panel.querySelector('[data-action="ignore"]').addEventListener("click", async () => {
      ignoredBlockId = block.id;
      await increment("ignored");
      removeIntervention();
    });
    panel.querySelector('[data-action="start"]').addEventListener("click", async (event) => {
      await increment("started");
      let seconds = 600;
      event.currentTarget.disabled = true;
      timerId = setInterval(() => {
        seconds -= 1;
        const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
        const remainder = String(seconds % 60).padStart(2, "0");
        event.currentTarget.textContent = `Focused ${minutes}:${remainder}`;
        if (seconds <= 0) clearInterval(timerId);
      }, 1000);
    });
    return panel;
  }

  function escapeHtml(value) {
    const element = document.createElement("span");
    element.textContent = value;
    return element.innerHTML;
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/`/g, "&#96;");
  }

  async function evaluate() {
    if (!isHomepage()) {
      ignoredBlockId = null;
      lastShownKey = null;
      removeIntervention();
      return;
    }
    const { schedule = IntentFeedCore.DEFAULT_SCHEDULE } = await chrome.storage.local.get("schedule");
    const block = IntentFeedCore.getActiveBlock(schedule);
    if (!block || ignoredBlockId === block.id) {
      removeIntervention();
      return;
    }
    document.documentElement.classList.add(STYLE_CLASS);
    if (!document.getElementById(PANEL_ID)) {
      const app = document.querySelector("ytd-app") || document.body;
      app.appendChild(createPanel(IntentFeedCore.normalizeBlock(block)));
    }
    const shownKey = `${block.id}-${new Date().toDateString()}`;
    if (lastShownKey !== shownKey) {
      lastShownKey = shownKey;
      await increment("shown");
    }
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.schedule) evaluate();
  });
  window.addEventListener("yt-navigate-finish", evaluate);
  new MutationObserver(() => {
    if (isHomepage() && !document.getElementById(PANEL_ID)) evaluate();
  }).observe(document.documentElement, { childList: true, subtree: true });
  evaluate();
})();
