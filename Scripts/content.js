let old_url = document.URL;
let new_url;
let bannedLists = {};
let enabledLists = {};

const norm = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

async function loadBannedLists() {
  const url = chrome.runtime.getURL("Data/bannedWords.json");
  const res = await fetch(url);
  bannedLists = await res.json();
  console.log("✅ bannedWords.json loaded:", Object.keys(bannedLists));
}

async function loadPreferences() {
  const stored = await chrome.storage.local.get("enabledLists");
  enabledLists = stored.enabledLists || {};
}

async function clean() {
  await loadPreferences();
  setTimeout(() => {
    const items = document.querySelectorAll('a.new-item-box__overlay[title]');
    let totalHidden = 0;
    let hiddenByCategory = {};

    items.forEach((a) => {
      const title = norm(a.getAttribute("title"));
      for (const [category, words] of Object.entries(bannedLists)) {
        if (!enabledLists[category]) continue;
        const match = words.some((w) => title.includes(norm(w)));
        if (match) {
          const gridItem = a.closest('[data-testid="grid-item"], .feed-grid__item');
          if (gridItem) {
            gridItem.style.display = "none";
            gridItem.style.pointerEvents = "none";
            gridItem.style.visibility = "hidden";
            totalHidden++;
            hiddenByCategory[category] = (hiddenByCategory[category] || 0) + 1;
          }
          break;
        }
      }
    });

    if (totalHidden > 0) {
      console.log(`🔒 Hidden ${totalHidden} items total.`);
      for (const [cat, count] of Object.entries(hiddenByCategory)) {
        console.log(`  - ${count} hidden from list: ${cat}`);
      }
    }
  }, 300);
}

(async () => {
  await loadBannedLists();
  await loadPreferences();
  clean();
})();

setInterval(() => {
  new_url = document.URL;
  if (new_url !== old_url) {
    console.log("🌐 URL changed:", new_url);
    old_url = new_url;
    clean();
  }
}, 2000);

const observer = new MutationObserver((mutations) => {
  for (const m of mutations) {
    if (m.addedNodes && m.addedNodes.length) {
      clean();
      break;
    }
  }
});
observer.observe(document.body, { childList: true, subtree: true });
