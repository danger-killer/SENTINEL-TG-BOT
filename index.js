// index.js — v2.0 Clean
const { spawn } = require("child_process");
const fs = require('fs');
const path = require('path');
const Logger = require('./logger/logs');
const log = new Logger('Asia/Dhaka');

if (!fs.existsSync(path.join(__dirname, 'BADOL-TG-BOT.js'))) {
  console.error(`⛔ BADOL-TG-BOT.js not found!`);
  process.exit(1);
}

function startProject() {
  const child = spawn("node", ["BADOL-TG-BOT.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true
  });
  child.on("close", (code) => {
    if (code === 2) startProject();
    else if (code !== 0) setTimeout(() => startProject(), 3000);
  });
}

log.info("🚀 Starting BADOL-TG-BOT v2.0...");
startProject();