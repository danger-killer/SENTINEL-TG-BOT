// BADOL-CMDS/cmds/botabout.js - PREMIUM POWERFUL - DEV: MOHAMMAD BADOL
const os = require('os');

function formatUptime(sec){
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

module.exports = {
  config: {
    name: "botinfo",
    aliases: ["about", "botabout"],
    author: "MOHAMMAD BADOL",
    version: "1.0 PREMIUM",
    role: 0,
    cooldown: 5,
    description: "Premium Bot Information",
    category: "info",
    usePrefix: true
  },

  BADOL: async function({ event, api, chatId }) {
    const cfg = global.config || {};
    const botName = cfg.botInfo?.name || "BADOL-TG-BOT";
    const botUser = cfg.botInfo?.username || "B4D9LBOT";
    const version = cfg.botInfo?.version || "6.2";
    const ownerName = cfg.ownerInfo?.mainOwner?.name || "MOHAMMAD BADOL";
    const ownerId = cfg.ownerInfo?.mainOwner?.id || "6954597258";

    const uptime = formatUptime(process.uptime());
    const totalCmds = new Set([...(global.badol?.commands?.values() || [])].map(c=>c.config.name)).size || 0;
    let totalUsers = 0, totalGroups = 0;
    try { totalUsers = (await global.db?.getAllUsers())?.length || 0; } catch {}
    try { totalGroups = (await global.db?.getAllThreads())?.length || 0; } catch {}

    const memUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const platform = os.platform();

    const text = `╔══════════════════════════╗
║ 🕌 ﷽ - ${botName} - ﷽ 🕌 ║
╚══════════════════════════╝

┏━━━━━〔 🤖 BOT INFO 〕━━━━━┓
┃ 🤖 Name: ${botName}
┃ 🔰 Username: @${botUser}
┃ 🧩 Version: ${version} PREMIUM
┃ 📦 Total Features: ${totalCmds}+
┃ ⏰ Uptime: ${uptime}
┃ 💾 Memory: ${memUsed} MB
┃ 🖥️ Platform: ${platform}
┣━━━━━〔 📊 NETWORK 〕━━━━━┫
┃ 👥 Connected Users: ${totalUsers}+
┃ 👨‍👩‍👧‍👦 Active Groups: ${totalGroups}+
┃ 🚀 Speed: Ultra Fast ⚡
┃ 🟢 Status: Online 24/7
┣━━━━━〔 👑 DEVELOPER 〕━━━━━┫
┃ 👑 Name: ${ownerName}
┃ 🆔 ID: ${ownerId}
┃ 📩 Telegram: @B4D9L_007
┃ 📢 Support: @BADOLBOTGC
┣━━━━━〔 💎 WHY BEST? 〕━━━━━┫
┃ 🔥 All-in-One Multipurpose Bot
┃ 🛡️ Advanced Group Management
┃ ⚡ Lightning Fast & Secure
┃ 🧠 Smart AI Powered System
┃ 🕌 100% Islamic Friendly
┃ 💎 Premium Premium Features
┃ 🔄 24/7 Auto Active & Stable
┃ 🚀 Built for Big Communities
┃ 💖 Trusted by Thousands Users
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

✨ A Powerful Telegram Bot that can
   handle everything you need!
💎 No Limits, Only Power! 🚀

🕌 আলহামদুলিল্লাহ - Allahu Akbar 🕌
💖 Made with Love by ${ownerName}`;

    return api.sendMessage(chatId, text, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "👑 Owner", url: "https://t.me/B4D9L_007" }, { text: "📢 Support GC", url: "https://t.me/BADOLBOTGC" }],
          [{ text: "🚀 Add Bot to Group", url: `https://t.me/${botUser}?startgroup=true` }, { text: "📜 Help Menu", callback_data: "botabout_help" }],
          [{ text: "🔄 Refresh Info", callback_data: "botabout_refresh" }]
        ]
      }
    });
  },

  onCallback: async function({ event, api, ctx }) {
    const data = event.data || event.callback_query?.data;
    if (data === "botabout_refresh") {
      const cmd = global.badol.commands.get("botabout");
      if(cmd) return cmd.BADOL({ event, api, chatId: event.message.chat.id, userId: event.from.id });
    }
    if (data === "botabout_help") {
      try { await ctx.editMessageText(`📜 WELCOME TO HELP!\n\n🚀 This is Most Powerful Multipurpose Bot!\n\n💎 Features:\n• Group Management\n• Fun & Entertainment\n• Islamic Tools\n• Utility & AI\n• And 100+ More!\n\nJust type /help to explore! ✨`, {
        reply_markup: { inline_keyboard: [[{ text: "⬅️ Back to About", callback_data: "botabout_main" }]] }
      }); } catch {}
    }
    if (data === "botabout_main") {
      const cmd = global.badol.commands.get("botabout");
      if(cmd) return cmd.BADOL({ event, api, chatId: event.message.chat.id, userId: event.from.id });
    }
    try { await ctx.answerCbQuery(); } catch {}
  }
};