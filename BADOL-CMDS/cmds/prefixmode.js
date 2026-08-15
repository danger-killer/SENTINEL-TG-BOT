const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "prefixmode",
    version: "1.0",
    author: "BADOL",
    role: 1, // only admin
    category: "admin",
    description: "Toggle all commands to no-prefix mode",
    usePrefix: true,
    cooldown: 3
  },

  BADOL: async function({ event, api, args, message }) {
    const dataPath = path.join(__dirname, "../../data/prefixmode.json");

    // data folder না থাকলে বানাও
    if (!fs.existsSync(path.dirname(dataPath))) {
      fs.mkdirSync(path.dirname(dataPath), { recursive: true });
    }

    let data = { enabled: false };
    if (fs.existsSync(dataPath)) {
      try { data = JSON.parse(fs.readFileSync(dataPath, "utf8")); } catch {}
    }

    const action = args[0]?.toLowerCase();

    if (!action ||!["on","off","status"].includes(action)) {
      return message.reply(
        `⚙️ PrefixMode System\n\n`+
        `📌 Current: ${data.enabled? "ON (All No-Prefix)" : "OFF (Normal)"}\n\n`+
        `• ${global.config.prefix}prefixmode on - সব কমান্ড No Prefix\n`+
        `• ${global.config.prefix}prefixmode off - আগের মতো Prefix/NoPrefix\n`+
        `• ${global.config.prefix}prefixmode status - স্ট্যাটাস দেখো`
      );
    }

    if (action === "status") {
      return message.reply(`📌 PrefixMode: ${data.enabled? "ON ✅" : "OFF ❌"}\n${data.enabled? "এখন সব কমান্ড Prefix ছাড়াই কাজ করবে।" : "এখন config অনুযায়ী Prefix/NoPrefix কাজ করবে।"}`);
    }

    if (action === "on") {
      data.enabled = true;
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
      global.config.prefixModeEnabled = true;
      return message.reply(`✅ PrefixMode ON\nএখন থেকে সব কমান্ড Prefix ছাড়া কাজ করবে।\nBot restart / loadall দিলেও ON থাকবে।\nOff করতে: ${global.config.prefix}prefixmode off`);
    }

    if (action === "off") {
      data.enabled = false;
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
      global.config.prefixModeEnabled = false;
      return message.reply(`❌ PrefixMode OFF\n\nএখন আগের মতো usePrefix true/false অনুযায়ী কাজ করবে।`);
    }
  }
};