const lists = {
  chargeurs: "Chargers",
  coque: "Phone cases",
  video_games: "Video games (not the hardware)",
  game_controller: "Game Controller",
};

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("filters");
  const stored = await chrome.storage.local.get("enabledLists");
  const enabled = stored.enabledLists || {};

  for (const [key, label] of Object.entries(lists)) {
    const wrapper = document.createElement("label");
    wrapper.textContent = label;

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = enabled[key] !== false; // activé par défaut
    input.addEventListener("change", async () => {
      enabled[key] = input.checked;
      await chrome.storage.local.set({ enabledLists: enabled });
      console.log("Preferences updated:", enabled);
    });

    wrapper.appendChild(input);
    container.appendChild(wrapper);
  }
});
