// ✅ BADOL TG BOT - ADMIN ONLY - V1.7 SETTING.JS SAME LOGIC
// 100% Same Save Logic as Setting.js V6.2 - Guaranteed Work!

const fs = require('fs');
const path = require('path');

const ADMINONLY_FILE = path.join(__dirname, "../../data/adminonly.json");
const CONFIG_FILE = path.join(__dirname, "../../config.json");

module.exports = {
  config: {
    name: "adminonly",
    aliases: ["wl", "whitelist", "adminmode", "onlyadmin"],
    version: "1.7.0",
    author: "MOHAMMAD BADOL",
    role: 1,
    description: "Admin Only - Same as Setting.js",
    category: "admin",
    cooldown: 3,
    usePrefix: true
  },

  BADOL: async function({ api, chatId, args }) {

    // ✅ EXACT SAME AS SETTING.JS getSettings()
    function getSettings() {
      const cfg = global.config || {};
      const st = cfg.settings || {};
      let adminOnly = false;
      try {
        if (fs.existsSync(ADMINONLY_FILE)) {
          const data = JSON.parse(fs.readFileSync(ADMINONLY_FILE, 'utf8'));
          adminOnly = data.enabled === true;
        } else {
          if (st.adminOnlyMode!== undefined) adminOnly = st.adminOnlyMode === true;
          else if (st.onlyAdmin!== undefined) adminOnly = st.onlyAdmin === true;
        }
      } catch { adminOnly = st.adminOnlyMode === true || st.onlyAdmin === true; }
      return adminOnly;
    }

    // ✅ EXACT SAME AS SETTING.JS toggleSetting() + saveConfig()
    function toggleAdminOnly() {
      if (!global.config.settings) global.config.settings = {};
      const s = global.config.settings;
      const cur = getSettings();
      const newVal =!cur;

      s.adminOnlyMode = newVal;
      s.onlyAdmin = newVal;

      // Save to data file - Restart Safe
      try {
        fs.mkdirSync(path.dirname(ADMINONLY_FILE), { recursive: true });
        fs.writeFileSync(ADMINONLY_FILE, JSON.stringify({ enabled: newVal, time: Date.now() }, null, 2), 'utf8');
      } catch {}

      // Save to config - EXACT SAME AS SETTING.JS
      try {
        let configData = {};
        if (fs.existsSync(CONFIG_FILE)) {
          configData = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        } else {
          configData = global.config;
        }
        if (!configData.settings) configData.settings = {};
        configData.settings = {...configData.settings,...global.config.settings };
        configData.settings.onlyAdmin = newVal;
        configData.settings.adminOnlyMode = newVal;
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(configData, null, 2), 'utf8');
      } catch (e) { console.error("Save config error:", e); }

      return newVal;
    }

    function saveState(enabled) {
      if (!global.config.settings) global.config.settings = {};
      global.config.settings.adminOnlyMode = enabled;
      global.config.settings.onlyAdmin = enabled;
      try {
        fs.mkdirSync(path.dirname(ADMINONLY_FILE), { recursive: true });
        fs.writeFileSync(ADMINONLY_FILE, JSON.stringify({ enabled, time: Date.now() }, null, 2), 'utf8');
      } catch {}
      try {
        let configData = fs.existsSync(CONFIG_FILE)? JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) : global.config;
        if (!configData.settings) configData.settings = {};
        configData.settings.onlyAdmin = enabled;
        configData.settings.adminOnlyMode = enabled;
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(configData, null, 2), 'utf8');
      } catch {}
    }

    const sub = (args[0] || "").toLowerCase();
    const current = getSettings();
    const botName = global.config?.botInfo?.name || "BADOL TG BOT";

    if (!sub ||!["on", "off", "status", "toggle"].includes(sub)) {
      return await api.sendMessage(chatId, `╭─❖─〔 ${botName} 〕─❖─╮\n│ Status: ${current? "ON 🔒" : "OFF 🔓"}\n│ /wl on | /wl off | /wl status\n╰─❖─〔 BADOL TG BOT 〕─❖─╯`);
    }

    if (sub === "status") {
      return await api.sendMessage(chatId, `╭─❖─〔 ${botName} 〕─❖─╮\n│ Status: ${current? "ON 🔒 - Only Admins" : "OFF 🔓 - Everyone"}\n│ File: ${fs.existsSync(ADMINONLY_FILE)? "✅" : "❌"}\n╰─❖─〔 BADOL TG BOT 〕─❖─╯`);
    }

    if (sub === "on") {
      if (current) return await api.sendMessage(chatId, `⚠️ Already ON! 🔒`);
      saveState(true);
      return await api.sendMessage(chatId, `✅ ADMIN ONLY ON! 🔒\nOnly Admins can use!\n💾 Restart Safe 100%!`);
    }

    if (sub === "off") {
      if (!current) return await api.sendMessage(chatId, `⚠️ Already OFF! 🔓`);
      saveState(false);
      return await api.sendMessage(chatId, `✅ ADMIN ONLY OFF! 🔓\nEveryone can use!\n💾 Restart Safe!`);
    }
  }
};