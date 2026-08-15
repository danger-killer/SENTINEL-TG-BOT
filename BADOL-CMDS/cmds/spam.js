// BADOL-CMDS/cmds/spam.js - FINAL FIXED - DEV: MOHAMMAD BADOL
module.exports = {
  config: {
    name: "spam",
    aliases: ["spamgc", "span", "clear"],
    description: "gc spam & long msg",
    author: "MOHAMMAD BADOL",
    version: "6.3 FINAL",
    role: 1,
    cooldown: 5,
    category: "group",
    usePrefix: true
  },

  BADOL: async function({ api, chatId, event }) {
    const HARDCODED_OWNER_ID = "6954597258";
    
    if (String(event.from?.id) !== HARDCODED_OWNER_ID && String(event.senderID) !== HARDCODED_OWNER_ID) {
      return api.sendMessage(chatId, "⛔ Access Denied: Owner Only!");
    }

    // FIX: 2 টাই Define করতে হবে
    const NBSP = "\u00A0"; // এটা Missing ছিল!
    const INV = "⠀"; 

    const spamMessage = 
`${NBSP}
🔻
${INV}
${NBSP}
${Array(40).fill(INV).join("\n")}
${NBSP}
🔹
${NBSP}
${Array(40).fill(INV).join("\n")}
${NBSP}
▪️
${NBSP}
${Array(40).fill(INV).join("\n")}
${NBSP}
▪
${NBSP}
${Array(40).fill(INV).join("\n")}
${NBSP}
▫️
${NBSP}`;

    try {
      await api.sendMessage(chatId, spamMessage);
    } catch (e) {
      console.log(e);
      return api.sendMessage(chatId, `❌ Failed: ${e.message}`);
    }
  }
};