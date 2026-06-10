(function () {
  "use strict";
  const blocksElement = document.getElementById("blocks");
  const form = document.getElementById("schedule-form");
  const template = document.getElementById("block-template");
  const status = document.getElementById("status");

  function addBlock(block = {}) {
    blocksElement.querySelector(".empty")?.remove();
    const normalized = IntentFeedCore.normalizeBlock(block, blocksElement.children.length);
    const fragment = template.content.cloneNode(true);
    const card = fragment.querySelector(".block-card");
    card.dataset.id = normalized.id;
    card.querySelector('[name="start"]').value = normalized.start;
    card.querySelector('[name="end"]').value = normalized.end;
    card.querySelector('[name="activity"]').value = normalized.activity;
    card.querySelector('[name="keywords"]').value = normalized.keywords.join(", ");
    const links = card.querySelector(".links");
    for (let index = 0; index < 3; index += 1) {
      const link = normalized.links[index] || {};
      const row = document.createElement("div");
      row.className = "link-row";
      row.innerHTML = `<input name="link-title-${index}" type="text" placeholder="Link ${index + 1} title" value="${escapeAttribute(link.title || "")}"><input name="link-url-${index}" type="url" placeholder="https://…" value="${escapeAttribute(link.url || "")}">`;
      links.appendChild(row);
    }
    card.querySelector(".remove").addEventListener("click", () => { card.remove(); renumber(); });
    blocksElement.appendChild(fragment);
    renumber();
  }

  function escapeAttribute(value) {
    return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function renumber() {
    [...blocksElement.querySelectorAll(".block-card")].forEach((card, index) => { card.querySelector(".block-number").textContent = String(index + 1).padStart(2, "0"); });
    if (!blocksElement.querySelector(".block-card")) blocksElement.innerHTML = '<div class="empty">No focus blocks yet. Add one to redirect your feed.</div>';
    else blocksElement.querySelector(".empty")?.remove();
  }

  function readCard(card, index) {
    const links = [0, 1, 2].map((linkIndex) => ({ title: card.querySelector(`[name="link-title-${linkIndex}"]`).value, url: card.querySelector(`[name="link-url-${linkIndex}"]`).value })).filter((link) => link.title && link.url);
    return IntentFeedCore.normalizeBlock({ id: card.dataset.id || `block-${Date.now()}-${index}`, start: card.querySelector('[name="start"]').value, end: card.querySelector('[name="end"]').value, activity: card.querySelector('[name="activity"]').value, keywords: card.querySelector('[name="keywords"]').value, links }, index);
  }

  async function init() {
    const { schedule = IntentFeedCore.DEFAULT_SCHEDULE, analytics = IntentFeedCore.EMPTY_ANALYTICS } = await chrome.storage.local.get(["schedule", "analytics"]);
    schedule.forEach(addBlock);
    renumber();
    ["shown", "started", "ignored"].forEach((key) => { document.getElementById(`stat-${key}`).textContent = analytics[key] || 0; });
  }

  document.getElementById("add-block").addEventListener("click", () => addBlock({ id: `block-${Date.now()}`, activity: "", links: [] }));
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const cards = [...blocksElement.querySelectorAll(".block-card")];
    await chrome.storage.local.set({ schedule: cards.map(readCard) });
    status.textContent = "Schedule saved";
    setTimeout(() => { status.textContent = ""; }, 2500);
  });
  init();
})();
