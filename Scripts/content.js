let old_url = document.URL;
let new_url;

const bannedLists = {
  chargeurs: ["chargeur", "usb", "cable", "cargador", "charger"],
  coque: ["coque", "funda", "case", "carcasa", "capa", "cover", "burga", "étui", "pochette", "handyhülle"],
  video_games: ["jeu", "god of war", "game", "mario", "splatoon",
     "call of duty", "tetris", "fifa", "fc", "sonic", "gta", "grand theft auto", 
     "tomb raider", "far Cry", "farcry", "final fantasy"],
  game_controller: ["manette", "controller", "dualshock"],
};

const norm = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

let enabledLists = {};

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
        if (enabledLists[category] === false) continue;
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

    if (totalHidden) {
      console.log(`Hidden ${totalHidden} items total.`);
      for (const [cat, count] of Object.entries(hiddenByCategory)) {
        console.log(`  - ${count} hidden from list: ${cat}`);
      }
    }
  }, 300);
}

clean();

setInterval(() => {
  new_url = document.URL;
  if (new_url !== old_url) {
    console.log("URL changed:", new_url);
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
