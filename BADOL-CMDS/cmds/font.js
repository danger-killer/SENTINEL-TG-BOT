const fs = require('fs');
const path = require('path');

const fontPath = path.join(__dirname, 'BADOL', 'font.json');

function loadFonts() {
  try {
    const dir = path.dirname(fontPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log("✅ BADOL folder auto created");
    }
    if (!fs.existsSync(fontPath)) return {};
    return JSON.parse(fs.readFileSync(fontPath, 'utf8'));
  } catch (e) {
    console.log("Font load error:", e.message);
    return {};
  }
}

const FONT_MAPS = loadFonts();

function styleText(text, styleId) {
  const data = FONT_MAPS[styleId];
  if (!data ||!data.map) return text;
  return [...text].map(ch => data.map[ch] || ch).join("");
}

function createList(page = 1) {
  const ids = Object.keys(FONT_MAPS);
  const perPage = 10;
  const totalPage = Math.ceil(ids.length / perPage);
  const start = (page - 1) * perPage;
  const slice = ids.slice(start, start + perPage);
  let msg = `╭━─━─━❮ 𝐁𝐀𝐃𝐎𝐋 𝐁𝐎𝐓 ❯━─━─━╮\n├‣ Total: ${ids.length} | Page ${page}/${totalPage}\n╰━──━─━─━━──━─━─━─━❍\n╭━─━❮✿ 𝐅𝐨𝐧𝐭 𝐋𝐢𝐬𝐭 ✿❯━─━╮\n`;
  slice.forEach(id => {
    const f = FONT_MAPS[id];
    msg += `├‣ ${id}️⃣ ${f.name}\n│ ${f.example}\n`;
  });
  msg += `╰━──━─━─━━──━─━─━─━❍\n💡 /font 1 Badol`;
  return { msg, totalPage };
}

module.exports = {
  config: {
    name: "font",
    aliases: ["fonts", "fancy"],
    author: "MOHAMMAD BADOL",
    version: "10.1-AUTO-FOLDER",
    cooldown: 2,
    role: 0,
    description: "20 fancy fonts",
    category: "utility",
    usePrefix: true
  },
  BADOL: async function ({ event, api, args, message, chatId }) {
    const total = Object.keys(FONT_MAPS).length;
    if (total === 0) {
      return message.reply(
        `⚠️ BADOL/font.json পাওয়া যায়নি!\n\n` +
        `✅ BADOL ফোল্ডার অটো তৈরি হয়েছে: \n${path.dirname(fontPath)}\n\n` +
        `এখন তুমি ওই ফোল্ডারের ভিতরে তোমার fonts.json ফাইলটা রাখো, তারপর /font list দাও।`
      );
    }
    if (!args[0] || args[0].toLowerCase() === "list") {
      const { msg, totalPage } = createList(1);
      const buttons = [];
      for (let i = 1; i <= Math.min(total, 10); i++) buttons.push(message.Markup.button.callback(`${i}️⃣`, `font_try_${i}_${chatId}`));
      const row1 = buttons.slice(0, 5);
      const row2 = buttons.slice(5, 10);
      const nav = totalPage > 1? [message.Markup.button.callback('Next ➡️', `font_page_2_${chatId}`)] : [];
      const keyboard = message.Markup.inlineKeyboard([row1, row2, nav].filter(r => r.length > 0));
      try {
        for (let i = 1; i <= 20; i++) {
          global.badol.onCallback.set(`font_try_${i}_${chatId}`, { commandName: 'font' });
        }
        global.badol.onCallback.set(`font_page_2_${chatId}`, { commandName: 'font' });
        global.badol.onCallback.set(`font_list_1_${chatId}`, { commandName: 'font' });
      } catch {}
      return message.reply(msg, keyboard);
    }
    const styleId = args[0];
    const textToStyle = args.slice(1).join(" ");
    if (!FONT_MAPS[styleId]) return message.reply(`❌ ভুল ID! 1 থেকে ${total} পর্যন্ত।`);
    if (!textToStyle) return message.reply(`❌ টেক্সট দাও! যেমন: /font ${styleId} Badol`);
    const styled = styleText(textToStyle, styleId);
    const keyboard = message.Markup.inlineKeyboard([[message.Markup.button.callback('🔄 List', `font_list_1_${chatId}`)]]);
    try { global.badol.onCallback.set(`font_list_1_${chatId}`, { commandName: 'font' }); } catch {}
    return message.reply(`✨ **${FONT_MAPS[styleId].name}**\n\n${styled}`, keyboard);
  },
  onCallback: async function ({ event, api, message, ctx }) {
    const data = event.data;
    const m = data.match(/_(-?\d+)$/);
    if (!m) return;
    const chatId = m[1];
    const msgId = ctx.callbackQuery.message.message_id;
    const chatIdNum = ctx.callbackQuery.message.chat.id;
    const edit = async (txt, kb) => {
      try { await ctx.telegram.editMessageText(chatIdNum, msgId, undefined, txt, { reply_markup: kb.reply_markup }); } catch {}
    };
    if (data.startsWith('font_try_')) {
      const id = data.split('_')[2];
      if (!FONT_MAPS[id]) return ctx.answerCbQuery('Not found');
      const sample = styleText("Mohammad Badol", id);
      const kb = message.Markup.inlineKeyboard([[message.Markup.button.callback('« List', `font_list_1_${chatId}`)]]);
      await edit(`🎨 **${id}️⃣ ${FONT_MAPS[id].name}**\n\nEx: ${FONT_MAPS[id].example}\n\nPreview: ${sample}\n\n💡 /font ${id} তোমার নাম`, kb);
      return ctx.answerCbQuery(`${FONT_MAPS[id].name}`);
    }
    if (data.startsWith('font_page_')) {
      const page = Number(data.split('_')[2]) || 1;
      const { msg, totalPage } = createList(page);
      const start = (page - 1) * 10 + 1;
      const end = Math.min(start + 9, Object.keys(FONT_MAPS).length);
      const buttons = [];
      for (let i = start; i <= end; i++) buttons.push(message.Markup.button.callback(`${i}️⃣`, `font_try_${i}_${chatId}`));
      const row1 = buttons.slice(0, 5);
      const row2 = buttons.slice(5, 10);
      const nav = [];
      if (page > 1) nav.push(message.Markup.button.callback('⬅️ Prev', `font_page_${page - 1}_${chatId}`));
      if (page < totalPage) nav.push(message.Markup.button.callback('Next ➡️', `font_page_${page + 1}_${chatId}`));
      const kb = message.Markup.inlineKeyboard([row1, row2, nav].filter(r => r.length > 0));
      await edit(msg, kb);
      return ctx.answerCbQuery(`Page ${page}`);
    }
    if (data.startsWith('font_list_')) {
      const { msg, totalPage } = createList(1);
      const buttons = [];
      for (let i = 1; i <= 10; i++) buttons.push(message.Markup.button.callback(`${i}️⃣`, `font_try_${i}_${chatId}`));
      const row1 = buttons.slice(0, 5);
      const row2 = buttons.slice(5, 10);
      const nav = totalPage > 1? [message.Markup.button.callback('Next ➡️', `font_page_2_${chatId}`)] : [];
      const kb = message.Markup.inlineKeyboard([row1, row2, nav].filter(r => r.length > 0));
      await edit(msg, kb);
      return ctx.answerCbQuery('List');
    }
  }
};