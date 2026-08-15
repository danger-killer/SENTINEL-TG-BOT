const axios = require("axios");
const BADOL_IMG = "https://drive.google.com/uc?export=download&id=1iZFD58V1J4rdmn_fB451t23GDEQbos9I";

function box(title, content) {
    return `╭━❮ ✨ ${title} ✨ ❯━╮\n${content}\n├━─━─━━──━─━─━\n├‣ BADOL-BOT-V5\n├‣ DEV: MOHAMMAD BADOL\n╰━──━─━─━━─━─━❍`;
}

module.exports = {
  config: {
    name: "getlink",
    aliases: ["link", "gl", "geturl"],
    version: "1.0.3 BADOL TG",
    author: "MOHAMMAD BADOL",
    role: 0,
    prefix: true,
    description: "Get direct download link of replied media",
    category: "Tool",
    usePrefix: true
  },

  BADOL: async function ({ event, api, message, chatId }) {

    if (!event.reply_to_message) {
      const content = `│ ❌ Reply দাও\n│\n│ একটা audio, video বা\n│ ছবিতে reply দিয়ে\n│ 'getlink' লিখো\n│\n│ Example: /getlink`;
      try {
        const imgRes = await axios.get(BADOL_IMG, { responseType: "arraybuffer" });
        const tempPath = require("path").join(__dirname, `badol_${Date.now()}.jpg`);
        require("fs").writeFileSync(tempPath, Buffer.from(imgRes.data));
        await api.sendPhoto(chatId, { source: tempPath }, { caption: box("GET LINK", content), reply_to_message_id: event.message_id });
        require("fs").unlinkSync(tempPath);
      } catch {
        return await message.reply(box("GET LINK", content));
      }
      return;
    }

    const reply = event.reply_to_message;

    try {
      let fileId = null;
      let fileType = "file";
      let fileName = "unknown";

      // Photo
      if (reply.photo) {
        const p = reply.photo;
        fileId = p[p.length - 1].file_id;
        fileType = "photo";
        fileName = "photo.jpg";
      }
      // Video
      else if (reply.video) {
        fileId = reply.video.file_id;
        fileType = "video";
        fileName = reply.video.file_name || "video.mp4";
      }
      // Audio
      else if (reply.audio) {
        fileId = reply.audio.file_id;
        fileType = "audio";
        fileName = reply.audio.file_name || "audio.mp3";
      }
      // Voice
      else if (reply.voice) {
        fileId = reply.voice.file_id;
        fileType = "voice";
        fileName = "voice.ogg";
      }
      // Document
      else if (reply.document) {
        fileId = reply.document.file_id;
        fileType = "document";
        fileName = reply.document.file_name || "file";
      }
      // Sticker
      else if (reply.sticker) {
        fileId = reply.sticker.file_id;
        fileType = "sticker";
        fileName = "sticker.webp";
      }

      if (!fileId) {
        const content = `│ ❌ কোনো ফাইল নাই\n│\n│ Reply করা মেসেজে\n│ কোনো মিডিয়া পাওয়া যায়নি`;
        return await message.reply(box("ERROR", content));
      }

      // Direct link via getFileLink - info.js logic
      const fileLink = await api.getFileLink(fileId);
      const url = fileLink.href;

      // Multiple? Telegram একসাথে একটাই থাকে
      let content = `│ 📁 Type: ${fileType.toUpperCase()}\n`;
      content += `│ 📄 Name: ${fileName.slice(0,25)}\n`;
      content += `│\n`;
      content += `│ 🔗 Link:\n`;
      content += `│ ${url}`;

      try {
        const imgRes = await axios.get(BADOL_IMG, { responseType: "arraybuffer" });
        const tempPath = require("path").join(__dirname, `badol_${Date.now()}.jpg`);
        require("fs").writeFileSync(tempPath, Buffer.from(imgRes.data));
        await api.sendPhoto(chatId, { source: tempPath }, { caption: box("LINK FOUND", content), reply_to_message_id: event.message_id });
        require("fs").unlinkSync(tempPath);
      } catch {
        return await message.reply(box("LINK FOUND", content));
      }

    } catch (e) {
      return await message.reply(box("ERROR", `│ ❌ ${e.message}`));
    }
  }
};