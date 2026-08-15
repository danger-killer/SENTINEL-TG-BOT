module.exports = {
  config: {
    name: "setgcpic",
    aliases: ["changegcpic", "gcpic", "gcphoto"],
    author: "MOHAMMAD BADOL",
    version: "1.0",
    cooldown: 10,
    role: 1,
    description: "Change group photo with confirmation",
    category: "admin",
    usePrefix: true
  },

  BADOL: async function ({ event, api, args, message, chatId, userId, ctx }) {
    if (!message.isGroup) {
      return message.reply('❌ This command can only be used in groups.');
    }

    const adminList = await api.getChatAdministrators(chatId);
    const isAdmin = adminList.some(admin => admin.user.id === userId);
    const isBotAdmin = global.config.adminUID.includes(String(userId));

    if (!isAdmin && !isBotAdmin) {
      return message.reply('⚠️ Only group admins can use this command.');
    }

    const botMember = adminList.find(admin => admin.user.id === ctx.botInfo?.id);
    const botIsAdmin = !!botMember;

    if (!botIsAdmin) {
      return message.reply('❌ Bot needs admin rights to change group photo.');
    }

    const msg = event.reply_to_message || event;
    let photoFileId = null;

    if (msg.photo && msg.photo.length > 0) {
      photoFileId = msg.photo[msg.photo.length - 1].file_id;
    } else if (event.reply_to_message?.photo && event.reply_to_message.photo.length > 0) {
      photoFileId = event.reply_to_message.photo[event.reply_to_message.photo.length - 1].file_id;
    }

    if (!photoFileId) {
      return message.reply(
        `❌ Please send or reply to a photo to set as group picture.\n\n` +
        `💡 Usage:\n` +
        `1. Reply to a photo with ${global.config.prefix}setgcpic\n` +
        `2. Send ${global.config.prefix}setgcpic with a photo`
      );
    }

    const chat = await api.getChat(chatId);

    const confirmText = `🖼️ Change Group Photo?\n\n` +
      `📂 Group: ${chat.title}\n\n` +
      `⚠️ This will change the group photo for all members.\n` +
      `Click the button below to confirm.`;

    const keyboard = message.Markup.inlineKeyboard([
      [
        message.Markup.button.callback('✅ Confirm', `confirm_gcpic_${chatId}`),
        message.Markup.button.callback('❌ Cancel', `cancel_gcpic_${chatId}`)
      ]
    ]);

    global.badol.onCallback.set(`confirm_gcpic_${chatId}`, {
      commandName: 'setgcpic',
      photoFileId: photoFileId,
      userId: userId,
      chatId: chatId
    });

    global.badol.onCallback.set(`cancel_gcpic_${chatId}`, {
      commandName: 'setgcpic',
      userId: userId,
      chatId: chatId
    });

    return message.reply(confirmText, keyboard);
  },

  onCallback: async function ({ event, api, message, ctx }) {
    const data = event.data;
    const userId = event.from.id;

    const chatIdMatch = data.match(/_(-?\d+)$/);
    if (!chatIdMatch) return;
    
    const chatId = chatIdMatch[1];

    const callbackData = global.badol.onCallback.get(data);
    
    if (!callbackData) {
      return ctx.answerCbQuery('❌ This action has expired!', { show_alert: true });
    }

    if (callbackData.userId !== userId) {
      return ctx.answerCbQuery('⚠️ Only the person who initiated this can confirm!', { show_alert: true });
    }

    if (data.startsWith('confirm_gcpic_')) {
      try {
        const adminList = await api.getChatAdministrators(chatId);
        const botMember = adminList.find(admin => admin.user.id === ctx.botInfo?.id);
        
        if (!botMember) {
          global.badol.onCallback.delete(data);
          await ctx.editMessageText('❌ Bot lost admin rights! Cannot change group photo.');
          return ctx.answerCbQuery('❌ Bot needs admin rights!', { show_alert: true });
        }

        const file = await api.getFile(callbackData.photoFileId);
        const photoUrl = `https://api.telegram.org/file/bot${global.config.token}/${file.file_path}`;

        const axios = require('axios');
        const response = await axios({
          method: 'GET',
          url: photoUrl,
          responseType: 'stream'
        });

        await api.setChatPhoto(chatId, { source: response.data });
        
        await message.db.updateThread(chatId, { photoUrl: photoUrl });

        global.badol.onCallback.delete(data);
        global.badol.onCallback.delete(`cancel_gcpic_${chatId}`);

        await ctx.editMessageText(
          `✅ Group Photo Changed!\n\n` +
          `📂 Group: ${(await api.getChat(chatId)).title}\n` +
          `👤 Changed by: ${event.from.first_name}`
        );

        await ctx.answerCbQuery('✅ Group photo changed successfully!');
      } catch (error) {
        global.badol.onCallback.delete(data);
        await ctx.editMessageText(`❌ Error changing group photo: ${error.message}`);
        await ctx.answerCbQuery('❌ Failed to change photo!', { show_alert: true });
      }
    }

    if (data.startsWith('cancel_gcpic_')) {
      global.badol.onCallback.delete(`confirm_gcpic_${chatId}`);
      global.badol.onCallback.delete(data);

      await ctx.editMessageText('❌ Group photo change cancelled.');
      await ctx.answerCbQuery('❌ Cancelled!');
    }
  }
};
