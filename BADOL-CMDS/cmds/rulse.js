// ✅ BADOL TG BOT - RULES - CONVERTED V2.6

module.exports = {
  config: {
    name: "rules",
    version: "2.6.0-TG",
    author: "MOHAMMAD BADOL",
    cooldown: 5,
    role: 0,
    prefix: true,
    aliases: ["rulse", "rule", "niyom", "ruleslist"],
    description: "বট ব্যবহারের নিয়মাবলী",
    category: "info",
    usage: "/rules"
  },

  BADOL: async function({ api, chatId, message, userId }) {
    const chatTitle = message?.chat?.title || "Private Chat";
    const senderName = message?.from?.first_name || "User";

    const rulesMessage = `
╔════════════════════════╗
     🛡️ BADOL-BOT RULES 🛡️
╚════════════════════════╝

👋 হ্যালো, ${senderName}!
বটটি সঠিকভাবে ব্যবহারের জন্য নিচের গাইডলাইনগুলো মেনে চলুন।

✨ গ্রুপ: ${chatTitle}
📅 তারিখ: ${new Date().toLocaleDateString('bn-BD')}

━━━━━━━━━━━━━━━━━━━━━━━━━━
📜 সাধারন নিয়মাবলী (Rules)
━━━━━━━━━━━━━━━━━━━━━━━━━━
❶ No Spamming: কমান্ড দিয়ে ফ্লাডিং করবেন না। প্রতি কমান্ডের মাঝে ৫ সেকেন্ড বিরতি দিন।
❷ No Bad Words: কোনো প্রকার গালিগালাজ বা অশালীন ভাষা ব্যবহার করা কঠোরভাবে নিষিদ্ধ।
❸ Anti-Link: অনুমতি ছাড়া গ্রুপে কোনো প্রকার লিংক শেয়ার করা যাবে না।
❹ Respect: বোটের ওনার এবং মেম্বারদের সাথে সম্মানজনক আচরণ করুন।

━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ বট ইনফরমেশন (Bot Info)
━━━━━━━━━━━━━━━━━━━━━━━━━━
🔹 Prefix: [/]
🔹 Commands: /help
🔹 Owner: MOHAMMAD BADOL
🔹 Version: ২.৬.০ (Stable)

━━━━━━━━━━━━━━━━━━━━━━━━━━
📢 চ্যানেল ও সাপোর্ট গ্রুপ (Links)
━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Main Channel: @SB_MODS_APK
💬 Support Group: @mcssupport
👥 Bot GC: @BADOLBOTGC
🎨 Editor Zone: @mreditorzone

━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ শাস্তি (Warning System)
━━━━━━━━━━━━━━━━━━━━━━━━━━
🛑 নিয়ম ভাঙলে প্রথমে Warning দেওয়া হবে।
🛑 ২য় বার নিয়ম ভাঙলে সরাসরি Mute করা হবে।
🛑 ৩য় বার বা গুরুতর অপরাধে স্থায়ী Ban করা হবে।

"সুন্দর পরিবেশ বজায় রাখতে আমাদের সহযোগিতা করুন।"
━━━━━━━━━━━━━━━━━━━━━━━━━━
© 2026 BADOL TG BOT | Powered by BADOL`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: "👨‍💻 Contact Owner", url: "tg://user?id=6954597258" },
          { text: "📢 SB MODS APK", url: "https://t.me/SB_MODS_APK" }
        ],
        [
          { text: "💬 Support", url: "https://t.me/mcssupport" },
          { text: "👥 Bot GC", url: "https://t.me/BADOLBOTGC" }
        ],
        [
          { text: "🎨 Editor Zone", url: "https://t.me/mreditorzone" }
        ]
      ]
    };

    return await api.sendMessage(chatId, rulesMessage, {
      reply_to_message_id: message?.message_id,
      reply_markup: keyboard
    });
  }
};