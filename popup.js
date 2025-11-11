const lists = {
  chargeurs: "Chargers",
  tempered_glass: "Tempered glass",
  coque: "Phone cases",
  video_games: "Video games (not the hardware)",
  game_controller: "Game Controller",
  clothings: "Clothings"
};

// 🧹 Bouton de reset
async function clean() {
  await chrome.storage.local.clear();
  console.log("🧹 Tous les paramètres et filtres ont été effacés !");
  alert("Tous les filtres ont été réinitialisés !");
  location.reload();
}

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("filters");
  const stored = await chrome.storage.local.get("enabledLists");
  const enabled = stored.enabledLists || {};

  for (const [key, label] of Object.entries(lists)) {
    const wrapper = document.createElement("label");
    wrapper.textContent = label;

    const input = document.createElement("input");
    input.type = "checkbox";
    // ✅ décoché par défaut
    input.checked = enabled[key] === true;

    input.addEventListener("change", async () => {
      enabled[key] = input.checked; // enregistre true / false explicite
      await chrome.storage.local.set({ enabledLists: enabled });
      console.log("Preferences updated:", enabled);
    });

    wrapper.appendChild(input);
    container.appendChild(wrapper);
  }
});
