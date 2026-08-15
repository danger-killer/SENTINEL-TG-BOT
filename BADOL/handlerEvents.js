const { MessageUtils } = require('./util');
const fs = require("fs");
const path = require("path");
const notices = require("./notices");

const ALWAYS_EMOJIS = ["👍","❤️","😆","🔥","✨","🥰","😍","🤩","😎","🥳","😂","🤣","🥺","😘","🫶","💖","🎉","😮"];
const ADMINONLY_FILE = path.join(__dirname, "../data/adminonly.json");

// ✅ AUTO LOAD ON STARTUP - Restart Safe Core Fix
(function loadAdminOnlyOnStartup(){
  try {
    if (fs.existsSync(ADMINONLY_FILE)) {
      const data = JSON.parse(fs.readFileSync(ADMINONLY_FILE, 'utf8'));
      if (!global.config) global.config = {};
      if (!global.config.settings) global.config.settings = {};
      global.config.settings.adminOnlyMode = data.enabled? true : false;
      global.config.settings.onlyAdmin = data.enabled? true : false;
      console.log(`[BADOL TG BOT] AdminOnly Loaded: ${data.enabled? "ON 🔒" : "OFF 🔓"}`);
    }
  } catch (e) {}
})();

function getConfig(key, defaultValue = null) {
  const cfg = global.config;
  if (!cfg) return defaultValue;
  if (key === 'botName') return cfg.botInfo?.name || cfg.botName || defaultValue;
  if (key === 'prefix') return cfg.botInfo?.prefix || cfg.prefix || '/';
  if (key === 'timezone') return cfg.botInfo?.timezone || cfg.settings?.timezone || cfg.timezone || 'Asia/Dhaka';
  if (key === 'ownerName') return cfg.ownerInfo?.mainOwner?.name || cfg.ownerName || defaultValue;
  if (key === 'adminUID') return cfg.ownerInfo?.botAdmins || cfg.adminUID || [];
  return cfg[key]?? defaultValue;
}

function getSettings() {
  const cfg = global.config || {};
  const st = cfg.settings || {};

  // ✅ FIXED: 100% Config.json Direct Support + Restart Safe
  let adminOnlyMode = false;
  try {
    if (fs.existsSync(ADMINONLY_FILE)) {
      const data = JSON.parse(fs.readFileSync(ADMINONLY_FILE, 'utf8'));
      adminOnlyMode = data.enabled === true;
    } else {
      // Config.json Direct - 2 Format
      if (st.adminOnlyMode!== undefined) adminOnlyMode = st.adminOnlyMode === true;
      else if (st.onlyAdmin!== undefined) adminOnlyMode = st.onlyAdmin === true;
    }
  } catch {
    adminOnlyMode = st.adminOnlyMode === true || st.onlyAdmin === true;
  }

  // Group Approval - Config Direct
  let groupApprovalEnabled = true;
  if (st.groupApprovalEnabled!== undefined) groupApprovalEnabled = st.groupApprovalEnabled!== false;
  else if (st.groupApproval && typeof st.groupApproval.enabled!== 'undefined') groupApprovalEnabled = st.groupApproval.enabled!== false;

  // DM Approval - Config Direct
  let dmApprovalEnabled = false;
  if (st.dmApprovalEnabled!== undefined) dmApprovalEnabled = st.dmApprovalEnabled === true;
  else if (st.dmApproval && typeof st.dmApproval.enabled!== 'undefined') dmApprovalEnabled = st.dmApproval.enabled === true;

  // Maintenance - Config Direct
  let maintenanceEnabled = false;
  if (st.maintenanceEnabled!== undefined) maintenanceEnabled = st.maintenanceEnabled === true;
  else if (st.maintenance && typeof st.maintenance.enabled!== 'undefined') maintenanceEnabled = st.maintenance.enabled === true;

  // Cooldown - Config Direct
  let cooldownEnabled = true;
  if (st.cooldownEnabled!== undefined) cooldownEnabled = st.cooldownEnabled!== false;
  else if (st.cooldown && typeof st.cooldown.enabled!== 'undefined') cooldownEnabled = st.cooldown.enabled!== false;

  return {
    prefixMode: st.prefixModeEnabled || cfg.prefixModeEnabled || false,
    maintenance: maintenanceEnabled,
    groupApproval: groupApprovalEnabled,
    dmApproval: dmApprovalEnabled,
    adminOnly: adminOnlyMode,
    banSystem: st.banSystemEnabled!== false && st.banSystem?.enabled!== false,
    cooldown: cooldownEnabled,
    autoReact: st.autoReactionEnabled!== false && st.autoReaction?.enabled!== false,
    alwaysEmoji: st.alwaysEmojiEnabled!== false && st.alwaysEmoji?.enabled!== false,
    welcome: st.welcomeMessageEnabled!== false && st.welcome?.enabled!== false,
    leave: st.leaveMessageEnabled!== false && st.leave?.enabled!== false,
    adminUnsend: st.adminReactionUnsend?.enabled || cfg.adminReactionUnsend?.enabled || false,
    adminUnsendEmoji: st.adminReactionUnsend?.emoji || cfg.adminReactionUnsend?.emoji || '👍',
    ignoreOld: st.ignoreOldMessages?.enabled || cfg.ignoreOldMessages?.enabled || false,
    antiSpam: st.antiSpamEnabled || false,
  };
}

async function sendBotStartNotification(api) {
  try {
    const moment = require('moment-timezone');
    const timezone = getConfig('timezone', 'Asia/Dhaka');
    const startTime = moment().tz(timezone).format('DD MMM YYYY | hh:mm:ss A');
    let totalUsers = 0; let totalGroups = 0;
    try {
      const allUsers = await global.db.getAllUsers();
      const allThreads = await global.db.getAllThreads();
      totalUsers = allUsers.length;
      totalGroups = allThreads.filter(t => String(t.id||t.threadID||"").startsWith("-")).length;
    } catch (_) {}
    const cmdCount = global.badol.commands? [...new Map([...global.badol.commands].map(([_, v]) => [v.config.name, v])).values()].length : 0;
    const evtCount = global.badol.events? global.badol.events.size : 0;
    const line = '━━━━━━━━━━━━━━━━━━━━━━━━';
    const botName = getConfig('botName', 'BADOL-TG-BOT');
    const ownerName = getConfig('ownerName', 'MOHAMMAD BADOL');
    const msg = `🚀 ${botName} চালু হয়েছে!\n${line}\n✅ স্ট্যাটাস : Online\n⏰ সময় : ${startTime}\n${line}\n📦 কমান্ড : ${cmdCount} টি\n📡 ইভেন্ট : ${evtCount} টি\n👥 ইউজার : ${totalUsers} জন\n💬 গ্রুপ : ${totalGroups} টি\n${line}\n👑 ওনার : ${ownerName}`;
    const adminUID = getConfig('adminUID', []);
    if (adminUID?.length > 0) {
      for (const adminId of adminUID) {
        try { await api.sendMessage(adminId, msg); } catch {}
      }
    }
  } catch (e) {}
}

async function fetchChatAdmins(ctx, chatId) {
  try {
    if (global.badol.threadAdmins.has(chatId)) {
      const cached = global.badol.threadAdmins.get(chatId);
      if (cached.timestamp && Date.now() - cached.timestamp < 300000) return cached.admins;
    }
    const admins = await ctx.telegram.getChatAdministrators(chatId);
    const adminIds = admins.map(a => a.user.id);
    global.badol.threadAdmins.set(chatId, { admins: adminIds, timestamp: Date.now() });
    return adminIds;
  } catch { return []; }
}

async function handleMessage(ctx) {
  try {
    const msg = ctx.message || ctx.editedMessage;
    if (!msg) return;
    const st = getSettings();
    const hasContent = msg.text || msg.caption || msg.photo || msg.video || msg.audio || msg.voice || msg.document || msg.sticker || msg.new_chat_members || msg.left_chat_member;
    if (!hasContent) return;
    if (st.ignoreOld && global.botStartTime) {
      if (msg.date < global.botStartTime) return;
    }
    global.bot = ctx.telegram;
    const chatId = msg.chat.id;
    const userId = msg.from?.id;
    const messageText = (msg.text || msg.caption || '').trim();

    // ── ADMIN ONLY - 100% RESTART SAFE - SILENT - CONFIG.JSON DIRECT ──
    let noticeCheck;
    noticeCheck = notices.checkAdminOnly(userId);
    if (noticeCheck.blocked) {
      if (!noticeCheck.silent && noticeCheck.msg) await ctx.reply(noticeCheck.msg).catch(()=>{});
      return;
    }

    noticeCheck = notices.checkMaintenance(userId);
    if (noticeCheck.blocked) {
      if (!noticeCheck.silent && noticeCheck.msg) await ctx.reply(noticeCheck.msg).catch(()=>{});
      return;
    }

    if (st.autoReact && st.alwaysEmoji) {
      (async () => {
        try {
          const emoji = ALWAYS_EMOJIS[Math.floor(Math.random()*ALWAYS_EMOJIS.length)];
          if (ctx.react) {
            await ctx.react(emoji).catch(()=>{});
          } else {
            await ctx.telegram.setMessageReaction(chatId, msg.message_id, [{ type: "emoji", emoji }]).catch(()=>{});
          }
        } catch {}
      })();
    }

    if (st.antiSpam) {
      if (!global.spamMap) global.spamMap = new Map();
      const now = Date.now();
      const key = String(userId);
      const data = global.spamMap.get(key) || { count: 0, firstTime: now };
      if (now - data.firstTime < 4000) {
        data.count++;
        if (data.count > 6) return;
      } else {
        data.count = 1;
        data.firstTime = now;
      }
      global.spamMap.set(key, data);
    }

    let prefix = getConfig('prefix', '/');
    try {
      const pmPath = path.join(__dirname, "../data/prefixmode.json");
      if (fs.existsSync(pmPath)) {
        const pmData = JSON.parse(fs.readFileSync(pmPath, "utf8"));
        if (!global.config.settings) global.config.settings = {};
        global.config.settings.prefixModeEnabled = pmData.enabled? true : false;
      }
      const allowCustom = global.config.settings?.allowCustomPrefix || global.config.allowCustomPrefix;
      if (allowCustom && chatId) {
        const thread = await global.db.getThread(String(chatId));
        if (thread?.customPrefix) prefix = thread.customPrefix;
      }
    } catch {}

    const _rawCmd = (messageText.trim().split(' ')[0] || '').toLowerCase().replace('/','').split('@')[0];
    const _isRequestCmd = ["request","req","appeal"].includes(_rawCmd);

    if (st.banSystem) {
      if (!_isRequestCmd && global.isGlobalBanned && global.isGlobalBanned(userId, chatId)) {
        return ctx.reply(global.getBanNotice? global.getBanNotice() : "⛔ Globally Banned!").catch(()=>{});
      }
      const banCheck = await notices.checkBan({
        api: ctx.telegram, chatId, userId, text: messageText, prefix, event: msg
      });
      if (banCheck.blocked &&!_isRequestCmd) return;
    }

    if (global.badol.events) {
      const message = new MessageUtils(ctx);
      const detectedEventType = detectEventType(ctx);
      for (const [_, event] of global.badol.events) {
        if (detectedEventType === 'new_member' &&!st.welcome) continue;
        if (detectedEventType === 'left_member' &&!st.leave) continue;
        const eventTypeMatches = event.config.eventType === detectedEventType || (event.config.eventType === 'message' && detectedEventType === 'message') || event.config.eventType === 'all';
        if (eventTypeMatches && event.BADOL) {
          try { await event.BADOL.call(event, { event: msg, api: ctx.telegram, message, ctx, eventType: detectedEventType }); } catch (err) {}
        }
      }
    }

    if (global.badol.commands) {
      const messageUtil = new MessageUtils(ctx);
      const seen = new Set();
      for (const [_, cmd] of global.badol.commands) {
        if (!cmd.config || seen.has(cmd.config.name)) continue;
        seen.add(cmd.config.name);
        if (typeof cmd.onChat === 'function') {
          try {
            await cmd.onChat.call(cmd, {
              bot: ctx.telegram, api: ctx.telegram, message: messageUtil, msg, chatId, userId,
              args: messageText.split(' '), db: global.db, ctx, event: msg
            });
          } catch {}
        }
      }
    }

    if (!msg.from) return;
    if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') await fetchChatAdmins(ctx, chatId);

    if (msg.reply_to_message && msg.reply_to_message.from.is_bot) {
      const replyData = global.badol.onReply.get(msg.reply_to_message.message_id);
      if (replyData) {
        const command = global.badol.commands.get(replyData.commandName);
        if (command?.onReply) { try { await command.onReply.call(command, { event: msg, api: ctx.telegram, Reply: replyData, args: messageText.split(' '), message: new MessageUtils(ctx), ctx }); } catch {} return; }
      }
    }

    const message = new MessageUtils(ctx);
    global.message = message;

    let commandName = ''; let args = []; let isCommand = false; let isCommandAttempt = false;
    const isPrefixModeOn = global.config.settings?.prefixModeEnabled === true || global.config.prefixModeEnabled === true;

    if (isPrefixModeOn) {
      const rawParts = messageText.trim().split(' ');
      let potentialCommand = rawParts[0].toLowerCase().split('@')[0];
      let isWithPrefix = false;
      if (potentialCommand.startsWith(prefix)) {
        isWithPrefix = true;
        potentialCommand = potentialCommand.slice(prefix.length).toLowerCase().split('@')[0];
      }
      const command = global.badol.commands.get(potentialCommand);
      if (command) {
        commandName = potentialCommand;
        args = rawParts.slice(1);
        if (isWithPrefix) {
          const pParts = messageText.slice(prefix.length).trim().split(' ');
          args = pParts.slice(1);
        }
        isCommand = true;
        isCommandAttempt = true;
      } else if (isWithPrefix && potentialCommand) {
        commandName = potentialCommand;
        isCommandAttempt = true;
      }
    } else {
      if (messageText.startsWith(prefix)) {
        const parts = messageText.slice(prefix.length).trim().split(' ');
        let potentialCommand = parts[0].toLowerCase().split('@')[0];
        commandName = potentialCommand;
        args = parts.slice(1);
        isCommandAttempt = true;
        const command = global.badol.commands.get(commandName);
        if (command) {
          const usePrefix = command.config.usePrefix!== undefined? command.config.usePrefix : (global.config.botInfo?.usePrefix?? global.config.usePrefix);
          if (usePrefix) isCommand = true;
        }
      }
      if (!isCommand && messageText &&!messageText.startsWith(prefix)) {
        const parts = messageText.trim().split(' ');
        let potentialCommand = parts[0].toLowerCase().split('@')[0];
        const command = global.badol.commands.get(potentialCommand);
        if (command) {
          const usePrefix = command.config.usePrefix!== undefined? command.config.usePrefix : (global.config.botInfo?.usePrefix?? global.config.usePrefix);
          if (!usePrefix) {
            commandName = potentialCommand;
            args = parts.slice(1);
            isCommand = true;
          }
        }
      }
    }

    if (commandName &&!isCommand) {
      const command = global.badol.commands.get(commandName);
      if (!command && isCommandAttempt) {
        await message.reply(notices.getNotFoundNotice(commandName, prefix));
        return;
      }
    }

    if (commandName) {
      const command = global.badol.commands.get(commandName);
      if (command) {
        noticeCheck = notices.checkGroupApproval(chatId, commandName, msg.chat?.title);
        if (noticeCheck.blocked) {
          if (noticeCheck.keyboard) {
            await ctx.telegram.sendMessage(chatId, noticeCheck.msg, { reply_markup: noticeCheck.keyboard }).catch(()=>{});
          } else if (!noticeCheck.silent && noticeCheck.msg) {
            await ctx.reply(noticeCheck.msg).catch(()=>{});
          }
          return;
        }

        noticeCheck = notices.checkDMApproval(userId, msg.chat.type, commandName);
        if (noticeCheck.blocked) {
          if (!noticeCheck.silent && noticeCheck.msg) await ctx.reply(noticeCheck.msg).catch(()=>{});
          return;
        }

        const perm = notices.checkPermission({ command, userId, chatId });
        if (perm.blocked) {
          if (perm.silent) return;
          return message.reply(perm.msg);
        }

        const cd = notices.checkCooldown({ command, userId });
        if (cd.blocked) return message.reply(cd.msg);

        try {
          if (command.BADOL) {
            await command.BADOL.call(command, { event: msg, api: ctx.telegram, args, message, chatId, userId, ctx, db: global.db, telegram: ctx.telegram, bot: ctx.telegram });
            global.log.commandExecution(msg.from, msg.chat, commandName, true);
          }
        } catch (error) {
          global.log.commandExecution(msg.from, msg.chat, commandName, false, error.message);
          message.reply(`❌ Error: ${error.message}`);
        }
        return;
      }
    }
  } catch (error) { global.log.error('Error in handleMessage:', error); }
}

function detectEventType(ctx) {
  const msg = ctx.message || ctx.editedMessage || ctx.update;
  if (ctx.editedMessage) return 'message_edit'; if (ctx.channelPost) return 'channel_post'; if (ctx.messageReaction) return 'reaction'; if (ctx.callbackQuery) return 'callback_query'; if (msg?.new_chat_members || ctx.new_chat_members) return 'new_member'; if (msg?.left_chat_member || ctx.left_chat_member) return 'left_member'; return 'message';
}

async function handleCallback(ctx) {
  try {
    const query = ctx.callbackQuery;
    const data = query.data;
    if (!data) return;

    if (data.startsWith('request_approve_') || data.startsWith('request_reject_') || data.startsWith('approve_unban_') || data.startsWith('reject_unban_') || data.startsWith('approve_group_') || data.startsWith('reject_group_') || data.startsWith('approve_dm_') || data.startsWith('reject_dm_')) {
      if (data.startsWith('request_approve_') || data.startsWith('request_reject_') || data.startsWith('approve_unban_') || data.startsWith('reject_unban_')) {
        let requestId, action;
        if(data.startsWith('request_')){ const p = data.split('_'); action = p[1]; requestId = p.slice(2).join('_'); }
        else { const p = data.split('_'); action = p[0]; requestId = p.slice(2).join('_'); }
        try{
          const approvalFile = path.join(__dirname, "../data/approvals.json");
          let all = {}; if(fs.existsSync(approvalFile)){ try{ all = JSON.parse(fs.readFileSync(approvalFile, "utf8")); }catch{} }
          let request = all[requestId] || await global.db.getApproval?.(requestId).catch(()=>null);
          if (!request) { await ctx.answerCbQuery('❌ Request not found!').catch(()=>{}); return; }
          if (action === 'approve') {
            await global.db.unbanUser(String(request.userId)).catch(()=>{});
            try{ if(fs.existsSync(approvalFile)){ let cur = JSON.parse(fs.readFileSync(approvalFile, "utf8")); if(cur[requestId]){ delete cur[requestId]; fs.writeFileSync(approvalFile, JSON.stringify(cur, null, 2)); } } }catch{}
            try{ await global.db.removeApproval(requestId); }catch{}
            await ctx.editMessageText(`✅ Unban Approved!\n👤 ${request.name}\n🆔 ${request.userId}`).catch(()=>{});
            await ctx.answerCbQuery('✅ Approved & Unbanned!').catch(()=>{});
          } else {
            try{ await global.db.removeApproval(requestId); }catch{}
            try{ if(fs.existsSync(approvalFile)){ let cur = JSON.parse(fs.readFileSync(approvalFile, "utf8")); if(cur[requestId]){ delete cur[requestId]; fs.writeFileSync(approvalFile, JSON.stringify(cur, null, 2)); } } }catch{}
            await ctx.editMessageText(`❌ Request Rejected!\n👤 ${request.name}`).catch(()=>{});
            await ctx.answerCbQuery('❌ Rejected!').catch(()=>{});
          }
          return;
        }catch(e){ console.error("Unban callback error:", e); }
      }
      if (data.startsWith('approve_group_') || data.startsWith('reject_group_')) {
        const parts = data.split('_'); const action = parts[0]; const approvalId = parts.slice(2).join('_'); const approval = await global.db.getApproval(approvalId); if (!approval) { await ctx.answerCbQuery('❌ Not found'); return; }
        if (action === 'approve') { await global.db.updateThread(approval.chatId, { approved: true }); await global.db.removeApproval(approvalId); await ctx.editMessageText(`✅ Group Approved!`); await ctx.answerCbQuery('✅ Approved!'); } else { await global.db.removeApproval(approvalId); await ctx.editMessageText(`❌ Rejected`); await ctx.answerCbQuery('❌ Rejected'); } return;
      }
      if (data.startsWith('approve_dm_') || data.startsWith('reject_dm_')) {
        const parts = data.split('_'); const action = parts[0]; const approvalId = parts.slice(2).join('_'); const approval = await global.db.getApproval(approvalId); if (!approval) { await ctx.answerCbQuery('❌ Not found'); return; }
        if (action === 'approve') { await global.db.updateUser(approval.userId, { dmApproved: true }); await global.db.removeApproval(approvalId); await ctx.editMessageText(`✅ DM Approved!`); await ctx.answerCbQuery('✅ Approved!'); } else { await global.db.banUser(approval.userId, 'rejected', String(query.from.id)); await global.db.removeApproval(approvalId); await ctx.editMessageText(`❌ Rejected & Banned`); await ctx.answerCbQuery('❌ Rejected'); } return;
      }
    }

    if (data.startsWith('spain_again_')) { const c = global.badol.commands.get('spain'); if (c?.onCallback) { await c.onCallback.call(c, { event: query, api: ctx.telegram, message: new MessageUtils(ctx), ctx }); return; } }
    if (data.startsWith('mj_btn_') || data.startsWith('niji_btn_')) { const n = data.startsWith('mj_btn_')? 'mj' : 'niji'; const c = global.badol.commands.get(n); if (c?.onCallback) { await c.onCallback.call(c, { event: query, api: ctx.telegram, message: new MessageUtils(ctx), ctx }); return; } }

    try {
      const allCmdNames = [...global.badol.commands.keys()];
      allCmdNames.sort((a,b) => b.length - a.length);
      for (const cmdName of allCmdNames) {
        if((cmdName === 'approve' || cmdName === 'request') && (data.startsWith('approve_unban_') || data.startsWith('reject_unban_') || data.startsWith('request_approve_') || data.startsWith('request_reject_'))) continue;
        if (data === cmdName || data.startsWith(cmdName + "_") || data.startsWith(cmdName + "-")) {
          const cmd = global.badol.commands.get(cmdName);
          if (cmd?.onCallback) { await cmd.onCallback.call(cmd, { event: query, api: ctx.telegram, message: new MessageUtils(ctx), ctx }); return; }
        }
      }
      for (const [_, cmd] of global.badol.commands) {
        if (cmd.config.aliases) {
          for (const alias of cmd.config.aliases) {
            if (data === alias || data.startsWith(alias + "_") || data.startsWith(alias + "-")) {
              if (cmd?.onCallback) { await cmd.onCallback.call(cmd, { event: query, api: ctx.telegram, message: new MessageUtils(ctx), ctx }); return; }
            }
          }
        }
      }
    } catch {}

    const messageId = query.message?.message_id;
    if (messageId && global.badol.onCallback.has(messageId)) { const cbData = global.badol.onCallback.get(messageId); const command = global.badol.commands.get(cbData.commandName); if (command?.onCallback) { await command.onCallback.call(command, { event: query, api: ctx.telegram, message: new MessageUtils(ctx), ctx }); return; } }
    if (global.badol.onCallback.has(data)) { const cbData = global.badol.onCallback.get(data); let command = null; if (cbData.commandName) command = global.badol.commands.get(cbData.commandName); else if (cbData.path) command = global.badol.commands.get('fm'); if (command?.onCallback) { await command.onCallback.call(command, { event: query, api: ctx.telegram, message: new MessageUtils(ctx), callbackData: cbData, ctx }); return; } }
    await ctx.answerCbQuery().catch(() => {});
  } catch (error) { console.error('Callback Error:', error); }
}

async function handleNewMember(ctx) {
  try {
    const st = getSettings();
    if (!st.welcome) return;
    const msg = ctx.message || ctx.update?.message || ctx.update; const newMembers = msg?.new_chat_members || ctx.new_chat_members; if (!newMembers?.length) return;
    const message = new MessageUtils(ctx);
    if (global.badol.events) { for (const [_, event] of global.badol.events) { if (event.config.eventType === 'new_member' && event.BADOL) { try { await event.BADOL.call(event, { event: msg, api: ctx.telegram, message, newMembers, ctx }); } catch {} } } }
  } catch (e) {}
}

async function handleLeftMember(ctx) {
  try {
    const st = getSettings();
    if (!st.leave) return;
    const update = ctx.update || {}; const msg = ctx.message || update.message || update.edited_message || {}; let leftMember = msg.left_chat_member || ctx.left_chat_member;
    if (!leftMember && update.chat_member) { const oldStatus = update.chat_member.old_chat_member?.status; const newStatus = update.chat_member.new_chat_member?.status; if (['left', 'kicked'].includes(newStatus) && ['member', 'administrator', 'restricted'].includes(oldStatus)) leftMember = update.chat_member.new_chat_member.user; }
    if (!leftMember) return;
    const message = new MessageUtils(ctx);
    if (global.badol.events) { for (const [_, event] of global.badol.events) { if (event.config.eventType === 'left_member' && event.BADOL) { try { await event.BADOL.call(event, { event: Object.keys(msg).length > 0? msg : update.chat_member || ctx, api: ctx.telegram, message, leftMember, ctx }); } catch {} } } }
  } catch (e) {}
}

async function handleReaction(ctx) {
  try {
    const reaction = ctx.messageReaction; if (!reaction) return;
    const st = getSettings();
    const messageId = reaction.message_id; const chatId = reaction.chat.id; const userId = reaction.user.id;
    if (st.adminUnsend) {
      const adminUID = getConfig('adminUID', []);
      const isAdmin = adminUID.includes(String(userId));
      if (isAdmin && reaction.new_reaction?.length > 0) {
        const reactionEmojis = reaction.new_reaction.filter(r => r.type === 'emoji').map(r => r.emoji);
        if (reactionEmojis.includes(st.adminUnsendEmoji)) {
          try { await ctx.telegram.deleteMessage(chatId, messageId); return; } catch {}
        }
      }
    }
    if (global.badol.events) { for (const [_, event] of global.badol.events) { if (event.config.eventType === 'reaction' && event.BADOL) { try { await event.BADOL.call(event, { event: reaction, api: ctx.telegram, ctx }); } catch {} } } }
  } catch (error) {}
}

module.exports = { handleMessage, handleCallback, handleNewMember, handleLeftMember, handleReaction, sendBotStartNotification };