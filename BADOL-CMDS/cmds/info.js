module.exports = {
  config: {
    name: "info",
    aliases: ["whois", "userinfo", "profile"],
    author: "MOHAMMAD BADOL",
    version: "10.0",
    cooldown: 5,
    role: 0,
    description: "Ultimate info fixed caption",
    category: "utility",
    usePrefix: true
  },

  BADOL: async function ({ event, api, message }) {
    try {
      let targetUser = null, userId = null;

      if (event.reply_to_message) {
        targetUser = event.reply_to_message.from;
        userId = targetUser.id;
      } else if (event.entities?.some(e => e.type === 'text_mention')) {
        const m = event.entities.find(e => e.type === 'text_mention');
        targetUser = m.user; userId = m.user.id;
      } else if (event.text?.match(/@(\w+)/)) {
        try {
          const chat = await api.getChat(`@${event.text.match(/@(\w+)/)[1]}`);
          targetUser = chat; userId = chat.id;
        } catch {}
      } else {
        targetUser = event.from; userId = targetUser.id;
      }

      if (!userId) return message.reply('❌ ইউজার পাওয়া যায়নি');

      let userChat = null, photos = null, chatMember = null, dbUser = null;
      try { userChat = await api.getChat(userId); } catch {}
      try { photos = await api.getUserProfilePhotos(userId, { limit: 1 }); } catch {}
      try { chatMember = await api.getChatMember(event.chat.id, userId); } catch {}
      try { dbUser = await global.db.getUser(String(userId)); } catch {}

      const firstName = targetUser.first_name || userChat?.first_name || "None";
      const lastName = targetUser.last_name || userChat?.last_name || "None";
      const fullName = `${firstName} ${lastName!== "None"? lastName : ""}`.trim();
      const username = targetUser.username || userChat?.username? `@${targetUser.username || userChat.username}` : "None";
      const usernameRaw = targetUser.username || userChat?.username || "None";
      const bio = (userChat?.bio || "No bio").slice(0, 120);

      // SHORT CAPTION FOR PHOTO (1024 এর কম)
      const shortCaption = `👑 ${fullName} | 🆔 ${userId} | ${username}`;

      // FULL INFO - আলাদা মেসেজে যাবে
      const fullInfo =
`┏━━━━━━━━━━━━━━━━━━━┓
┃ 👑 ULTIMATE INFO 👑 ┃
┣━━━━━━━━━━━━━━━━━━━┫
┃ 👤 ${fullName}
┃ 🔹 First: ${firstName}
┃ 🔹 Last: ${lastName}
┃ 🔹 User: ${username}
┃ 🆔 ID: ${userId}
┣━━━━━━━━━━━━━━━━━━━┫
┃ 🔍 TG
┃ • Bot: ${targetUser.is_bot? "Yes 🤖" : "No 👤"}
┃ • Premium: ${userChat?.is_premium? "Yes ✨" : "No"}
┃ • Verified: ${userChat?.is_verified? "Yes ✅" : "No"}
┃ • Scam: ${userChat?.is_scam? "Yes ⚠️" : "No"}
┃ • Fake: ${userChat?.is_fake? "Yes ⚠️" : "No"}
┃ • Lang: ${targetUser.language_code?.toUpperCase() || "N/A"}
┃ • Photos: ${photos?.total_count || 0}
┣━━━━━━━━━━━━━━━━━━━┫
┃ 🏷️ STATUS
┃ • Status: ${chatMember?.status || "Unknown"}
┃ • Title: ${chatMember?.custom_title || "None"}
┃ • Birth: ${userChat?.birthdate? `${userChat.birthdate.day}/${userChat.birthdate.month}` : "Not set"}
┃ • Channel: ${userChat?.personal_chat? "Yes" : "None"}
┣━━━━━━━━━━━━━━━━━━━┫
┃ 📝 BIO: ${bio}
┣━━━━━━━━━━━━━━━━━━━┫
┃ 📊 BOT
┃ • Banned: ${dbUser?.isBanned? "Yes 🚫" : "No ✅"}
┃ • Joined: ${dbUser?.joinedAt? new Date(dbUser.joinedAt).toLocaleDateString() : "Unknown"}
┣━━━━━━━━━━━━━━━━━━━┫
┃ 🔗 https://t.me/${usernameRaw!== "None"? usernameRaw : userId}
┃ tg://user?id=${userId}
┣━━━━━━━━━━━━━━━━━━━┫
┃ 🤖 BADOL-TG-BOT
┗━━━━━━━━━━━━━━━━━━━┛`;

      if (photos?.photos?.length > 0) {
        const photo = photos.photos[0][photos.photos[0].length - 1];
        // 1. ফটো + ছোট ক্যাপশন
        await api.sendPhoto(event.chat.id, photo.file_id, {
          caption: shortCaption,
          reply_to_message_id: event.message_id
        });
        // 2. ফুল ইনফো আলাদা
        await api.sendMessage(event.chat.id, fullInfo, {
          reply_to_message_id: event.message_id,
          disable_web_page_preview: true
        });
      } else {
        await api.sendMessage(event.chat.id, fullInfo + `\n\n⚠️ No profile picture`, {
          reply_to_message_id: event.message_id
        });
      }

    } catch (e) {
      message.reply(`❌ Error: ${e.message}`);
    }
  }
};