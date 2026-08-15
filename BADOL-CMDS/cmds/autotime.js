const moment = require("moment-timezone");
const fs = require("fs");
const path = require("path");

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const BN_DAYS = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
const BN_MONTHS = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

const SAVE_FILE = path.join(process.cwd(), "data", "autotime.json");

function getStatus(){
  try{
    if(fs.existsSync(SAVE_FILE)){
      const data = JSON.parse(fs.readFileSync(SAVE_FILE,'utf8'));
      return data.enabled;
    }
  }catch{}
  return true;
}
function saveStatus(enabled){
  try{
    const dir = path.dirname(SAVE_FILE);
    if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true});
    fs.writeFileSync(SAVE_FILE, JSON.stringify({enabled}, null, 2));
  }catch{}
}

function toBanglaNum(n) { return String(n).replace(/[0-9]/g, d => BN_DIGITS[+d]); }

function buildMessage() {
  const now = moment.tz("Asia/Dhaka");
  const hour = now.format("hh"); const minute = now.format("mm"); const second = now.format("ss");
  const ampm = now.format("A"); const bnDay = BN_DAYS[now.day()];
  const day = toBanglaNum(now.format("DD")); const month = BN_MONTHS[now.month()]; const year = toBanglaNum(now.format("YYYY"));
  const hourNum = parseInt(now.format("H"));
  let greeting = "", emoji = "";
  if (hourNum >= 5 && hourNum < 12) { greeting = "শুভ সকাল"; emoji = "🌅"; }
  else if (hourNum >= 12 && hourNum < 15) { greeting = "শুভ দুপুর"; emoji = "☀️"; }
  else if (hourNum >= 15 && hourNum < 18) { greeting = "শুভ বিকেল"; emoji = "🌤️"; }
  else if (hourNum >= 18 && hourNum < 21) { greeting = "শুভ সন্ধ্যা"; emoji = "🌆"; }
  else { greeting = "শুভ রাত"; emoji = "🌙"; }

  return `╔══════════════════╗
║ 🕰️ TIME UPDATE 🕰️ ║
╚══════════════════╝

        ${emoji} ${greeting}! ${emoji}
━━━━━━━━━━━━━━━━━━━━
⏰ এখন সময়: ${hour}:${minute}:${second} ${ampm}
📅 তারিখ: ${day} ${month} ${year}
📆 বার: ${bnDay}
━━━━━━━━━━━━━━━━━━━━

✨ আপনার দিনটি সুন্দর কাটুক ✨

═════════════════════
🤖 Auto Time System 🤖
═════════════════════\n\n🤖 BADOL-TG-BOT🟢\n\n🔰 DEV: MOHAMMAD BADOL 🔰\n\n═════════════════════`;
}

async function getAllGroups() {
  try {
    if (global.db && global.db.getAllThreads) {
      const threads = await global.db.getAllThreads();
      return threads.filter(t => t.type === 'group' || t.type === 'supergroup' || String(t.id).startsWith('-')).map(t => t.id);
    }
    if (global.data?.allThreadID) return global.data.allThreadID;
    return [];
  } catch { return []; }
}

async function sendToAll() {
  if (!getStatus()) return;
  const api = global.bot || global.api;
  if (!api) return;
  const msg = buildMessage();
  const threads = await getAllGroups();
  if (!threads.length) return;
  for (const tid of threads) {
    try { await api.sendMessage(tid, msg); await new Promise(r => setTimeout(r, 1500)); } catch {}
  }
}

function startAutoTime() {
  if (global.autoTimeInterval) clearInterval(global.autoTimeInterval);
  if (global.autoTimeTimeout) clearTimeout(global.autoTimeTimeout);
  if (!getStatus()) return;

  const now = moment.tz("Asia/Dhaka");
  const msUntilNextHour = (60 - now.minutes()) * 60 * 1000 - now.seconds() * 1000 - now.milliseconds();

  global.autoTimeTimeout = setTimeout(() => {
    sendToAll();
    global.autoTimeInterval = setInterval(sendToAll, 3600000);
  }, msUntilNextHour);
}

function stopAutoTime(){
  if (global.autoTimeInterval) clearInterval(global.autoTimeInterval);
  if (global.autoTimeTimeout) clearTimeout(global.autoTimeTimeout);
  global.autoTimeInterval = null;
  global.autoTimeTimeout = null;
}

if (!global.autoTimeStarted) {
  global.autoTimeStarted = true;
  const waitBot = () => {
    if (global.bot || global.api) {
      if (getStatus()) startAutoTime();
    } else {
      setTimeout(waitBot, 3000);
    }
  };
  waitBot();
}

module.exports = {
  config: {
    name: "autotime",
    aliases: ["atime"],
    author: "MOHAMMAD BADOL",
    version: "4.1 ON/OFF",
    role: 2,
    cooldown: 5,
    description: "Auto ON/OFF system",
    category: "system",
    usePrefix: false
  },

  BADOL: async function ({ event, api, args }) {
    const chatId = event.chat.id;
    const action = args[0]?.toLowerCase();

    if (action === "off") {
      saveStatus(false);
      stopAutoTime();
      return api.sendMessage(chatId,
`╔══════════════════╗
║ ❌ সিস্টেম OFF ❌ ║
╚══════════════════╝

❌ AutoTime OFF করা হয়েছে
এখন আর গ্রুপে যাবে না
রিস্টার্ট দিলেও OFF থাকবে

💡 চালু করতে: autotime on`);
    }

    if (action === "on") {
      saveStatus(true);
      startAutoTime();
      return api.sendMessage(chatId,
`╔══════════════════╗
║ ✅ সিস্টেম ON ✅ ║
╚══════════════════╝

🚀 AutoTime ON করা হয়েছে
প্রতি ঘন্টায় যাবে
রিস্টার্ট দিলেও ON থাকবে

💡 বন্ধ করতে: autotime off`);
    }

    const status = getStatus() ? "✅ ON" : "❌ OFF";
    return api.sendMessage(chatId, buildMessage() + `\n\n📊 স্ট্যাটাস: ${status}\n💡 autotime on / off`);
  }
};