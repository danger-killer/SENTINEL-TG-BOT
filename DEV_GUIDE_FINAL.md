# 📖 BADOL-TG-BOT v2.0 — Ultimate Developer Guide FINAL V4.0
### লেখক: MOHAMMAD BADOL | ID: 6954597258 | সব কমান্ড, ইভেন্ট, হ্যান্ডলার ও অটোলোড সিস্টেমের সম্পূর্ণ গাইড

## 📌 সূচিপত্র
 1. বট আর্কিটেকচার ও ফোল্ডার স্ট্রাকচার
 2. Author Lock System - MUST KNOW
 3. কমান্ড ফাইলের গঠন (BADOL-CMDS/cmds)
 4. ইভেন্ট ফাইলের গঠন (BADOL-CMDS/events)
 5. সব প্যারামিটার তালিকা (BADOL v2.0)
 6. message অবজেক্টের সব ফাংশন (util.js v3.0)
 7. api ও ctx অবজেক্টের সব ফাংশন
 8. 🔥 AUTO BUTTON ROUTER - File Name Based (MOST IMPORTANT)
 9. 🛡️ safeName() - Box Break Fix (MUST USE)
 10. 📦 Box Design Rule
 11. বাটন / Inline & Reply Keyboard
 12. onReply — রিপ্লাই সিস্টেম
 13. onCallback — বাটন ক্লিক সিস্টেম
 14. onChat — সব মেসেজ শোনার সিস্টেম
 15. onLoad — বট স্টার্টে একবার চলে
 16. ডেটাবেস (global.db) ও গ্লোবাল ম্যাপ
 17. রোল / পারমিশন, GBAN, Group Approval & Request Bypass
 18. ইভেন্ট টাইপ তালিকা
 19. সম্পূর্ণ কমান্ড উদাহরণ
 20. AI Prompt

## 1. বট আর্কিটেকচার ও ফোল্ডার স্ট্রাকচার

BADOL-TG-BOT v2.0 মেইন কোড, অটোলোড সিস্টেম এবং কাস্টম পাথ সাপোর্ট করে।

BADOL-TG-BOT/
├── BADOL-TG-BOT.js         # মেইন কোর (GBAN, Owner Lock, DB Init, Login)
├── config.json             # কনফিগারেশন (New botInfo/ownerInfo + Old Adapter)
├── BADOL/
│   ├── handlerEvents.js    # v8.3 - মেসেজ, ইভেন্ট, কলব্যাক, রিঅ্যাকশন, Group Approval, Request Bypass, Auto Reaction
│   ├── autoload.js         # v2.0 - অটো কমান্ড/ইভেন্ট লোডার, NPM Auto-Installer, Author Enforcer
│   ├── notices.js          # পারমিশন, ব্যান, কুলডাউন চেকার
│   ├── util.js             # v3.0 - MessageUtils Class, CACHE_DIR, Helper Functions
│   ├── login.js            # Telegraf Login
│   └── logger/             # banner, logs, color
└── BADOL-CMDS/
    ├── cmds/               # সকল কমান্ড .js (Custom Path)
    ├── events/             # সকল ইভেন্ট .js (Custom Path)
    └── cache/              # Auto Created Cache Folder

FLOW:
BADOL-TG-BOT.js -> checkAuthorIntegrity() -> initDatabase() -> autoload.loadCommands() -> autoload.loadEvents() -> login() -> bot.on('message') GBAN Middleware -> handlerEvents.handleMessage() -> notices.checkBan/Permission/Cooldown -> Command BADOL()

## 2. Author Lock System - MUST KNOW - LOAD FAIL IF NOT MOHAMMAD BADOL

BADOL-TG-BOT.js:
const AUTHOR_NAME = "MOHAMMAD BADOL";
const AUTHOR_ID = "6954597258";
function checkAuthorIntegrity() {
  if (configOwnerName !== AUTHOR_NAME || configOwnerId !== AUTHOR_ID) process.exit(1);
}

autoload.js:
const REQUIRED_AUTHOR = "MOHAMMAD BADOL";
- config.author না থাকলে auto MOHAMMAD BADOL বসিয়ে দেয়
- config.author অন্য নাম থাকলে force overwrite করে MOHAMMAD BADOL করে দেয়
- installCommandFile() & installEventFile() ও force করে

RULE: সব Command/Event এ author: "MOHAMMAD BADOL" বাধ্যতামূলক! না হলে লোড হবে না বা Overwrite হয়ে যাবে!

## 3. কমান্ড ফাইলের গঠন (BADOL-CMDS/cmds)

ফাইল রাখতে হবে: BADOL-CMDS/cmds/আপনারকমান্ড.js (File Name = config.name হতে হবে Auto Button Router এর জন্য)

module.exports = {
  config: {
    name: "কমান্ডনাম",         // মূল নাম (আবশ্যক) - ফাইল নামের সাথে মিলতে হবে
    aliases: ["alias1", "a2"],  // বিকল্প নাম (ঐচ্ছিক) - Auto Router এও কাজ করে
    author: "MOHAMMAD BADOL",   // আবশ্যক - না হলে Force হবে
    version: "2.0",
    description: "কী করে",
    category: "general",
    usePrefix: true,            // true = /cmd লাগবে, false = প্রিফিক্স ছাড়া কাজ করবে
    cooldown: 3,                // সেকেন্ড
    role: 0,                    // 0=সবাই, 1=গ্রুপ অ্যাডমিন+বট অ্যাডমিন, 2=বট অ্যাডমিন
    guide: "{pn}cmd <args>"
  },

  onLoad: async function ({ api, bot }) {
    // বট স্টার্টে একবার চলে
  },

  BADOL: async function ({ event, api, message, args, chatId, userId, ctx, db, bot, telegram }) {
    // মূল কোড - নাম অবশ্যই BADOL হতে হবে, run/execute নয়
  },

  onReply: async function ({ event, api, message, Reply, args, ctx }) {
    // Reply.data, Reply.author
  },

  onCallback: async function ({ event, api, message, ctx, callbackData }) {
    await ctx.answerCbQuery(); // আবশ্যক
  },

  onChat: async function ({ event, api, message, chatId, userId, args, ctx, db, bot }) {
    // সব মেসেজে চলে (Prefix চেকের আগে)
  }
};

## 4. ইভেন্ট ফাইলের গঠন (BADOL-CMDS/events)

ফাইল রাখতে হবে: BADOL-CMDS/events/আপনারইভেন্ট.js

module.exports = {
  config: {
    name: "ইভেন্টনাম",
    author: "MOHAMMAD BADOL",   // আবশ্যক
    version: "2.0",
    description: "ইভেন্ট বিবরণ",
    eventType: "new_member",       // new_member, left_member, message, all, reaction, message_edit, callback_query, channel_post
  },

  BADOL: async function ({ event, api, message, ctx, eventType, newMembers, leftMember }) {
    // newMembers = new_member এর জন্য array, leftMember = left_member এর জন্য object
  }
};

## 5. সব প্যারামিটার তালিকা (BADOL v2.0)

### BADOL() — কমান্ড হ্যান্ডলারে যা পাবেন
| প্যারামিটার | টাইপ | বিবরণ |
|---|---|---|
| event | Object | টেলিগ্রামের র ম্যাসেজ অবজেক্ট (msg) |
| api | Object | ctx.telegram — টেলিগ্রাম এপিআই |
| message | Object | MessageUtils Instance (সহজ হেল্পার) |
| args | Array | কমান্ডের পরের আর্গুমেন্টসমূহ |
| chatId | Number | বর্তমান চ্যাট আইডি |
| userId | Number | ইউজার আইডি |
| ctx | Object | Telegraf Full Context |
| db | Object | global.db Instance |
| bot | Object | global.bot Instance |
| telegram | Object | same as api |

## 6. message অবজেক্টের সব ফাংশন (util.js v3.0) - CORRECTED

// রিপ্লাই
await message.reply("হ্যালো!", { parse_mode: 'Markdown' });

// নির্দিষ্ট চ্যাটে পাঠানো
await message.send("টেক্সট", chatId, options);

// ডিলিট
await message.unsend(messageId, chatId);

// রিঅ্যাকশন
await message.react("👍", messageId, isBig);

// এটাচমেন্ট পাঠানো - CORRECT FORMAT v3.0
await message.sendAttachment({ body: "Caption", attachment: filePathOrURLOrStream, chatId, replyTo: messageId });
// Array ও সাপোর্ট করে:
await message.sendAttachment({ body: "Caption", attachment: [path1, path2] });

// রিপ্লাই মেসেজ থেকে এটাচমেন্ট নেওয়া
const att = message.getAttachment('photo'); // photo, video, document, voice, sticker, animation, any

// ডাউনলোড
const filePath = await message.downloadAttachment(att, './tmp/img.jpg');

// প্রোপার্টি
message.chatId, message.chatType, message.isGroup, message.isPrivate, message.senderID, message.senderName, message.senderUsername, message.messageText, message.messageId, message.hasPhoto, hasVideo, hasAudio, hasDocument, hasSticker etc.
message.api, message.db, message.Markup
CACHE_DIR = BADOL-CMDS/cache/

## 7. api ও ctx অবজেক্টের সব ফাংশন

await api.sendMessage(chatId, "টেক্সট", options);
await api.sendPhoto(chatId, photoUrl, { caption: "ছবি" });
await api.sendVideo, sendDocument, sendAudio, sendSticker etc.
await api.deleteMessage(chatId, messageId);
await api.getChatMember(chatId, userId);
await api.getChatAdministrators(chatId);
await api.banChatMember, unbanChatMember etc.

await ctx.answerCbQuery("নোটিফিকেশন");
await ctx.react("🔥");
await ctx.telegram.setMessageReaction etc.

Note: util.js auto bind করে সব Telegraf method message object এ, তাই message.sendMessage, message.sendPhoto etc. ও কাজ করে!

## 8. 🔥 AUTO BUTTON ROUTER - FILE NAME BASED - NO HARDCODE NEEDED

Location: BADOL/handlerEvents.js -> handleCallback()

CODE LOGIC:
const allCmdNames = [...global.badol.commands.keys()];
allCmdNames.sort((a,b) => b.length - a.length); // বড় নাম আগে
for (const cmdName of allCmdNames) {
  if (data === cmdName || data.startsWith(cmdName + "_") || data.startsWith(cmdName + "-")) {
    const cmd = global.badol.commands.get(cmdName);
    if (cmd?.onCallback) { await cmd.onCallback.call(cmd, { event: query, api: ctx.telegram, message: new MessageUtils(ctx), ctx }); return; }
  }
}
// Alias Support
for (const [_, cmd] of global.badol.commands) {
  if (cmd.config.aliases) {
    for (const alias of cmd.config.aliases) {
      if (data === alias || data.startsWith(alias + "_") || data.startsWith(alias + "-")) { auto route }
    }
  }
}

MEANING:
- File: BADOL-CMDS/cmds/help.js, config.name: help
- Button callback_data: help, help_next_2, help-prev-1, help_info সব Auto help.js এর onCallback এ যাবে!
- Alias: aliases: ["h"] থাকলে h_page_3 ও Auto help.js এ যাবে!
- কোনো Hardcode লাগে না handlerEvents.js এ!
- Exception: request_approve_, approve_unban_, approve_group_ etc আগে আলাদা Handle হয়, Auto Router Skip করে

RULES FOR AI:
1. File Name MUST = config.name (e.g., mycommand.js = mycommand)
2. Button callback_data MUST start with config.name + "_" or "-" or exact name
3. Alias also works
4. No hardcode needed

## 9. 🛡️ safeName() - FANCY NAME BOX BREAK FIX - MUST USE

তোমার বটে Fancy Font যেমন ⑅⃝❥»͓̽MB_EDITOR_ZONE এর মতো নামে Box ভেঙে যায়! তাই এই Function বাধ্যতামূলক:

function safeName(str, len=28){
  try{
    if(!str) return "Unknown";
    str=String(str).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
    if(!str) return "Unknown";
    const arr=Array.from(str);
    if(arr.length>len) return arr.slice(0,len).join("")+"…";
    return arr.join("");
  }catch{ return "Group"; }
}

সব userName, groupTitle, chatTitle এটা দিয়ে Filter করতে হবে Box পাঠানোর আগে!
Example: const userName = safeName(event.from.first_name, 16);
         const gName = safeName(msg.chat.title, 28);

## 10. 📦 Box Design Rule

তোমার বটের সব Premium Box এর Footer MUST BE:
╰─❖─〔 𝐁𝐀𝐃𝐎𝐋-𝐓𝐆-𝐁𝐎𝐓 〕─❖─╯

Example:
╭─❖─〔 BADOL-TG-BOT 〕─❖─╮
│ Content
├──────────────────────┤
│ 👑 DEV: MOHAMMAD BADOL
╰─❖─〔 𝐁𝐀𝐃𝐎𝐋-𝐓𝐆-𝐁𝐎𝐓 〕─❖─╯

## 11. বাটন / Inline & Reply Keyboard

Inline:
await api.sendMessage(chatId, "বেছে নিন:", {
  reply_markup: {
    inline_keyboard: [
      [{ text: "✅ হ্যাঁ", callback_data: "mycommand_yes" }, { text: "❌ না", callback_data: "mycommand_no" }],
      [{ text: "🔗 Owner", url: "https://t.me/B4D9L_007" }]
    ]
  }
});

Reply Keyboard:
await api.sendMessage(chatId, "মেনু:", {
  reply_markup: { keyboard: [["🔴 অপশন ১", "🟢 অপশন ২"]], resize_keyboard: true, one_time_keyboard: true }
});

## 12. onReply — রিপ্লাই সিস্টেম

BADOL: async function ({ message, chatId, userId }) {
  const sent = await message.reply("আপনার নাম লিখুন:");
  global.badol.onReply.set(sent.message_id, {
    commandName: "mycommand", // MUST
    author: userId, // Only this user can reply
    data: { step: 1 } // custom data
  });
},

onReply: async function ({ event, api, message, Reply, args }) {
  const { data, author } = Reply;
  if(author != event.from.id) return;
  await message.reply(`স্বাগতম, ${event.text}!`);
  global.badol.onReply.delete(event.reply_to_message.message_id);
}

## 13. onCallback — বাটন ক্লিক সিস্টেম

BADOL: async function ({ api, chatId }) {
  const sent = await api.sendMessage(chatId, "বেছে নিন:", {
    reply_markup: { inline_keyboard: [[{ text: "🔴 লাল", callback_data: "colorcmd_red" }]] }
  });
  // Option A: by message_id (old way)
  global.badol.onCallback.set(sent.message_id, { commandName: "colorcmd" });
  // Option B: Auto Router (new way) - callback_data starts with command name, no need to set Map!
},

onCallback: async function ({ event, api, ctx, message }) {
  await ctx.answerCbQuery(); // MUST
  const data = event.data;
  await api.editMessageText(ctx.chat.id, event.message.message_id, null, `✅ বেছেছেন: ${data}`);
}

## 14. onChat — সব মেসেজ শোনার সিস্টেম

onChat: async function ({ event, api, message, chatId, userId, args, ctx, db, bot }) {
  const text = (event.text || "").toLowerCase();
  if(text.includes("hello")) await message.reply("Hi!");
  // Runs on EVERY MESSAGE before prefix check
  // No false return logic - all commands onChat run
}

## 15. onLoad — বট স্টার্টে একবার চলে

onLoad: async function ({ api, bot }) {
  console.log("Command loaded");
  // Background task, schedule etc.
}

## 16. ডেটাবেস (global.db) ও গ্লোবাল ম্যাপ

const user = await global.db.getUser(String(userId));
await global.db.updateUser(String(userId), { money: 1000 });
const thread = await global.db.getThread(String(chatId));
await global.db.updateThread(String(chatId), { customPrefix: "!" });
await global.db.getAllUsers();
await global.db.getAllThreads();
await global.db.banUser, unbanUser, isUserBanned, addWarning, getWarnings, clearWarnings, getApproval, addApproval, removeApproval etc.

Global Maps:
global.badol.commands - Map of all commands + aliases
global.badol.events - Map of all events
global.badol.onReply - Map
global.badol.onCallback - Map
global.badol.cooldowns - Map
global.badol.threadAdmins - Map (5min cache)

CACHE_DIR = path.join(__dirname, '..', 'BADOL-CMDS', 'cache') - Auto created

## 17. রোল / পারমিশন, GBAN, Group Approval & Request Bypass

Role:
- Role 0: সবাই
- Role 1: গ্রুপ অ্যাডমিন (getChatAdministrators cache) + বট অ্যাডমিন
- Role 2: শুধু বট অ্যাডমিন (ownerInfo.botAdmins)

Strict Owner Lock: MOHAMMAD BADOL (ID: 6954597258) চেঞ্জ করলে process.exit(1)

GBAN System: GitHub Raw URL থেকে bannedList চেক, ব্যান হলে GBAN ALERT Box পাঠায়, Author ID 6954597258 Bypass পায়

Request Bypass: request, req, appeal কমান্ড ব্যান ইউজারের জন্যও Allow (Unban Appeal এর জন্য)

Group Approval: data/approvedGroups.json - Group Approve না হলে NOT APPROVED Box + Contact Owner & Support Group Button - শুধু approve, setting, group, gclist, gcapprove, gapprove কমান্ড Allow

Other Systems: Auto Reaction ALWAYS_EMOJIS random, AntiSpam 6 msg/4 sec block, Ignore Old Messages, Admin Reaction Unsend, Custom Prefix per Thread

## 18. ইভেন্ট টাইপ তালিকা (eventType)

| eventType | কখন কাজ করে |
|---|---|
| message | সাধারণ মেসেজ |
| message_edit | মেসেজ এডিট হলে |
| new_member | গ্রুপে নতুন মেম্বার (newMembers array সহ) |
| left_member | গ্রুপ ছাড়লে (leftMember সহ) |
| reaction | রিঅ্যাকশন দিলে |
| callback_query | বাটন ক্লিক (তবে handleCallback আলাদা) |
| channel_post | চ্যানেল পোস্ট |
| all | সব ইভেন্টে |

## 19. সম্পূর্ণ কমান্ড উদাহরণ - 100% FIXED

module.exports = {
  config: {
    name: "myinfo",
    aliases: ["info"],
    author: "MOHAMMAD BADOL",
    version: "2.0",
    description: "আপনার তথ্য দেখায়",
    category: "general",
    usePrefix: true,
    cooldown: 3,
    role: 0,
    guide: "{pn}myinfo"
  },

  BADOL: async function ({ event, message, userId, api, chatId }) {
    function safeName(str, len=28){
      try{
        if(!str) return "Unknown";
        str=String(str).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
        if(!str) return "Unknown";
        const arr=Array.from(str);
        if(arr.length>len) return arr.slice(0,len).join("")+"…";
        return arr.join("");
      }catch{ return "Unknown"; }
    }

    const user = await global.db.getUser(String(userId));
    const name = safeName(event.from.first_name, 20);
    const username = event.from.username ? `@${event.from.username}` : 'নেই';
    const botName = global.config.botInfo?.name || "BADOL-TG-BOT";

    const msg = `╭─❖─〔 ${botName} 〕─❖─╮
│ 👤 প্রোফাইল
├──────────────────────┤
│ • নাম: ${name}
│ • ইউজার: ${username}
│ • আইডি: ${userId}
│ • ব্যালেন্স: ${user?.money || 0}
├──────────────────────┤
│ 👑 DEV: MOHAMMAD BADOL
╰─❖─〔 𝐁𝐀𝐃𝐎𝐋-𝐓𝐆-𝐁𝐎𝐓 〕─❖─╯`;

    await api.sendMessage(chatId, msg, {
      reply_markup: {
        inline_keyboard: [[{ text: "🔄 Refresh", callback_data: "myinfo_refresh" }]]
      }
    });
  },

  onCallback: async function({ event, api, ctx }) {
    await ctx.answerCbQuery();
    await ctx.answerCbQuery("Refreshed!");
  }
};

## 20. AI PROMPT TO GENERATE ANY COMMAND/EVENT - COPY PASTE TO ANY AI

"You are BADOL-TG-BOT v2.0 developer. Create a command file for this bot.

RULES:
- File path: BADOL-CMDS/cmds/{name}.js
- File name MUST = config.name (for Auto Button Router)
- config MUST have: name (same as file name), aliases array, author: 'MOHAMMAD BADOL' (MANDATORY else won't load / force overwritten), version, role 0/1/2, category, description, usePrefix boolean, cooldown number, guide
- Main function MUST be named BADOL: async function({event, api, args, message, chatId, userId, ctx, db, bot, telegram})
- MUST include safeName(str, len) function to sanitize all user/group names: function safeName(str, len=28){ try{ if(!str) return 'Unknown'; str=String(str).replace(/[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F]/g,'').trim(); if(!str) return 'Unknown'; const arr=Array.from(str); if(arr.length>len) return arr.slice(0,len).join('')+'…'; return arr.join(''); }catch{ return 'Unknown'; } }
- Box design footer MUST be ╰─❖─〔 𝐁𝐀𝐃𝐎𝐋-𝐓𝐆-𝐁𝐎𝐓 〕─❖─╯ and use premium box style with MOHAMMAD BADOL
- For buttons, callback_data MUST start with config.name + '_' like 'mycommand_action_id' so Auto Button Router in handlerEvents.js auto routes it to this command's onCallback without hardcode. Alias also works like 'mc_action'
- For reply system: global.badol.onReply.set(sent.message_id, {commandName: this.config.name, author: userId, data: {...}})
- For callback by message_id: global.badol.onCallback.set(sent.message_id, {commandName: this.config.name})
- Use message.reply, api.sendMessage, message.sendAttachment({body, attachment, chatId, replyTo})
- onReply: async function({event, api, Reply, args, message, ctx}) and onCallback: async function({event, api, message, ctx}) { await ctx.answerCbQuery() }
- CACHE_DIR = path.join(__dirname, '..', 'BADOL-CMDS', 'cache')
- Author lock enforced, owner ID 6954597258, GBAN system, Group Approval system exists"

END OF GUIDE - 100% FIXED - COPY PASTE READY FOR ANY AI & DEVELOPER
