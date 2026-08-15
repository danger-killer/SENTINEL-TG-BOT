const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "admin",
    aliases: ["botadmin", "admins"],
    author: "MOHAMMAD BADOL",
    version: "2.4 FIXED",
    description: "Bot Admin Management - Permanent Save",
    category: "owner",
    usePrefix: true,
    cooldown: 3,
    role: 1,
    guide: "{pn}admin [add/remove/list] [@mention / reply / UID]"
  },

  BADOL: async function ({ event, api, message, args, chatId, userId }) {
    function safeName(str, len = 28) {
      try {
        if (!str) return "Unknown User";
        str = String(str).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
        if (!str) return "Unknown User";
        const arr = Array.from(str);
        if (arr.length > len) return arr.slice(0, len).join("") + "…";
        return arr.join("");
      } catch { return "Unknown User"; }
    }

    function saveConfig() {
      try {
        const configPath = path.join(__dirname, '../../config.json');
        // IMPORTANT: Also update global.config.adminUID adapter
        if (global.config.ownerInfo?.botAdmins) {
          global.config.adminUID = global.config.ownerInfo.botAdmins;
        }
        fs.writeFileSync(configPath, JSON.stringify(global.config, null, 2), 'utf8');
        return true;
      } catch (e) {
        console.error("Admin Save Error:", e);
        return false;
      }
    }

    const action = (args[0] || "").toLowerCase();
    const botName = safeName(global.config?.botInfo?.name || "BADOL-TG-BOT", 18);

    // 1. LIST
    if (action === "list") {
      const botAdmins = global.config?.ownerInfo?.botAdmins || [];
      if (botAdmins.length === 0) {
        return await message.reply(`╭─❖─〔 ${botName} 〕─❖─╮\n│ ❌ No bot admins found!\n╰─❖─〔 𝐁𝐀𝐃𝐎𝐋-𝐓𝐆-𝐁𝐎𝐓 〕─❖─╯`);
      }
      let listText = `╭─❖─〔 ${botName} 〕─❖─╮\n│ 🛡️ Bot Admin List (${botAdmins.length})\n├──────────────────────┤`;
      for (let i = 0; i < botAdmins.length; i++) {
        const admId = botAdmins[i];
        let admName = "Admin User";
        let admUsername = "None";
        try {
          const chat = await api.getChat(admId);
          admName = safeName(chat.first_name || chat.title || "Admin", 16);
          admUsername = chat.username? `@${chat.username}` : "None";
        } catch {
          try {
            const dbUser = await global.db.getUser(String(admId));
            if (dbUser?.name) admName = safeName(dbUser.name, 16);
          } catch {}
        }
        listText += `\n│\n│ 📌 Admin #${i + 1}\n│ ├ Name: ${admName}\n│ ├ Username: ${admUsername}\n│ └ ID: ${admId}`;
      }
      listText += `\n├──────────────────────┤\n│ 👑 DEV: MOHAMMAD BADOL\n╰─❖─〔 𝐁𝐀𝐃𝐎𝐋-𝐓𝐆-𝐁𝐎𝐓 〕─❖─╯`;
      return await message.reply(listText);
    }

    // Target ID detection
    let targetId = null;
    if (event.reply_to_message) {
      targetId = event.reply_to_message.from.id;
    } else if (args[1]) {
      const query = args[1].replace("@", "").trim();
      if (!isNaN(query)) {
        targetId = query; // Keep as String for consistency
      } else {
        try {
          const chatMember = await api.getChat(`@${query}`);
          if (chatMember?.id) targetId = String(chatMember.id);
        } catch {}
      }
    } else if (event.entities) {
      for (const entity of event.entities) {
        if (entity.type === 'text_mention') {
          targetId = String(entity.user.id);
          break;
        }
      }
    }

    if (!targetId && (action === "add" || action === "remove")) {
      return await message.reply(`╭─❖─〔 ${botName} 〕─❖─╮\n│ ⚠️ Usage:\n│ /admin add @mention/reply/uid\n│ /admin remove @mention/reply/uid\n╰─❖─〔 𝐁𝐀𝐃𝐎𝐋-𝐓𝐆-𝐁𝐎𝐓 〕─❖─╯`);
    }

    if (!global.config.ownerInfo) global.config.ownerInfo = {};
    if (!global.config.ownerInfo.botAdmins) global.config.ownerInfo.botAdmins = [];

    // Ensure all IDs are String - IMPORTANT FOR COMPARISON
    global.config.ownerInfo.botAdmins = global.config.ownerInfo.botAdmins.map(id => String(id));

    // 2. ADD
    if (action === "add") {
      targetId = String(targetId);
      if (global.config.ownerInfo.botAdmins.includes(targetId)) {
        return await message.reply(`╭─❖─〔 ${botName} 〕─❖─╮\n│ ⚠️ Already Admin!\n│ 🆔 ${targetId}\n╰─❖─〔 𝐁𝐀𝐃𝐎𝐋-𝐓𝐆-𝐁𝐎𝐓 〕─❖─╯`);
      }
      global.config.ownerInfo.botAdmins.push(targetId);

      // FIX: SAVE TO FILE - THIS WAS MISSING!
      const saved = saveConfig();

      if (saved) {
        return await message.reply(`╭─❖─〔 ${botName} 〕─❖─╮\n│ ✅ Admin Added & Saved Permanently!\n│ 🆔 ID: ${targetId}\n│ 💾 Saved to config.json\n│ 🔄 Restart Safe!\n╰─❖─〔 𝐁𝐀𝐃𝐎𝐋-𝐓𝐆-𝐁𝐎𝐓 〕─❖─╯`);
      } else {
        return await message.reply(`╭─❖─〔 ${botName} 〕─❖─╮\n│ ⚠️ Added to RAM but Save Failed!\n│ Check file permission!\n╰─❖─〔 𝐁𝐀𝐃𝐎𝐋-𝐓𝐆-𝐁𝐎𝐓 〕─❖─╯`);
      }
    }

    // 3. REMOVE
    if (action === "remove") {
      targetId = String(targetId);

      // MAIN OWNER PROTECTION
      if (targetId === "6954597258") {
        return await message.reply(`╭─❖─〔 ${botName} 〕─❖─╮\n│ ❌ Cannot remove Main Owner!\n│ 👑 MOHAMMAD BADOL\n╰─❖─〔 𝐁𝐀𝐃𝐎𝐋-𝐓𝐆-𝐁𝐎𝐓 〕─❖─╯`);
      }

      const index = global.config.ownerInfo.botAdmins.indexOf(targetId);
      if (index === -1) {
        return await message.reply(`╭─❖─〔 ${botName} 〕─❖─╮\n│ ❌ Not in Admin List!\n│ 🆔 ${targetId}\n╰─❖─〔 𝐁𝐀𝐃𝐎𝐋-𝐓𝐆-𝐁𝐎𝐓 〕─❖─╯`);
      }

      global.config.ownerInfo.botAdmins.splice(index, 1);

      // FIX: SAVE TO FILE
      const saved = saveConfig();

      if (saved) {
        return await message.reply(`╭─❖─〔 ${botName} 〕─❖─╮\n│ ✅ Admin Removed & Saved!\n│ 🆔 ${targetId}\n│ 💾 Permanent!\n╰─❖─〔 𝐁𝐀𝐃𝐎𝐋-𝐓𝐆-𝐁𝐎𝐓 〕─❖─╯`);
      } else {
        return await message.reply(`╭─❖─〔 ${botName} 〕─❖─╮\n│ ⚠️ Removed from RAM but Save Failed!\n╰─❖─〔 𝐁𝐀𝐃𝐎𝐋-𝐓𝐆-𝐁𝐎𝐓 〕─❖─╯`);
      }
    }

    return await message.reply(`╭─❖─〔 ${botName} 〕─❖─╮\n│ ⚠️ Usage: /admin [add/remove/list]\n╰─❖─〔 𝐁𝐀𝐃𝐎𝐋-𝐓𝐆-𝐁𝐎𝐓 〕─❖─╯`);
  }
};