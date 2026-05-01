const Chatbot = require('../models/Chatbot');

exports.serveWidget = async (req, res, next) => {
  try {
    const chatbot = await Chatbot.findOne({ embedId: req.params.botId, isPublic: true })
      .select('widget settings.fallbackMessage');

    if (!chatbot) return res.status(404).send('// Bot not found');

    const { widget } = chatbot;
    const API = process.env.CLIENT_ORIGIN || 'https://api.embediq.com';

    // Ultra-light vanilla JS embed script
    const script = `
(function() {
  var BOT_ID = "${req.params.botId}";
  var API    = "${API}";
  var CFG    = ${JSON.stringify(widget)};
  var SESSION= "sess_" + Math.random().toString(36).slice(2);
  var history= [];

  // Inject styles
  var style = document.createElement("style");
  style.textContent = [
    "#eiq-btn{position:fixed;${widget.position === 'bottom-left' ? 'left:24px' : 'right:24px'};bottom:24px;width:56px;height:56px;border-radius:50%;background:" + CFG.primaryColor + ";border:none;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.2);z-index:99999;display:flex;align-items:center;justify-content:center;}",
    "#eiq-box{position:fixed;${widget.position === 'bottom-left' ? 'left:24px' : 'right:24px'};bottom:96px;width:360px;max-height:520px;background:" + CFG.backgroundColor + ";border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,.15);z-index:99998;display:none;flex-direction:column;font-family:system-ui,sans-serif;overflow:hidden;}",
    "#eiq-header{background:" + CFG.primaryColor + ";color:#fff;padding:14px 16px;font-weight:600;font-size:15px;}",
    "#eiq-msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;max-height:340px;}",
    ".eiq-msg{max-width:80%;padding:10px 14px;border-radius:12px;font-size:14px;line-height:1.5;}",
    ".eiq-user{background:" + CFG.primaryColor + ";color:#fff;align-self:flex-end;border-bottom-right-radius:4px;}",
    ".eiq-bot{background:#f3f4f6;color:#111;align-self:flex-start;border-bottom-left-radius:4px;}",
    "#eiq-input-row{display:flex;padding:10px;border-top:1px solid #e5e7eb;gap:8px;}",
    "#eiq-input{flex:1;border:1px solid #e5e7eb;border-radius:8px;padding:8px 12px;font-size:14px;outline:none;}",
    "#eiq-send{background:" + CFG.primaryColor + ";color:#fff;border:none;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:14px;}",
  ].join("");
  document.head.appendChild(style);

  // Widget HTML
  var box = document.createElement("div"); box.id = "eiq-box";
  box.innerHTML = '<div id="eiq-header">' + CFG.botName + '</div><div id="eiq-msgs"></div><div id="eiq-input-row"><input id="eiq-input" placeholder="' + CFG.placeholder + '"/><button id="eiq-send">Send</button></div>';
  document.body.appendChild(box);

  var btn = document.createElement("button"); btn.id = "eiq-btn";
  btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>';
  document.body.appendChild(btn);

  // Toggle
  btn.onclick = function() { box.style.display = box.style.display === "flex" ? "none" : "flex"; };

  // Add welcome message
  addMsg("bot", CFG.welcomeMessage);

  // Send message
  document.getElementById("eiq-send").onclick = sendMsg;
  document.getElementById("eiq-input").onkeypress = function(e) { if (e.key === "Enter") sendMsg(); };

  function addMsg(role, text) {
    var msgs = document.getElementById("eiq-msgs");
    var div = document.createElement("div");
    div.className = "eiq-msg eiq-" + role;
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  async function sendMsg() {
    var input = document.getElementById("eiq-input");
    var msg = input.value.trim();
    if (!msg) return;
    input.value = "";
    addMsg("user", msg);
    var botDiv = addMsg("bot", "...");
    history.push({ role: "user", content: msg });

    try {
      var res = await fetch(API + "/api/chat/" + BOT_ID, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, sessionId: SESSION, history: history.slice(-6) }),
      });
      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var full = "";
      botDiv.textContent = "";
      while (true) {
        var chunk = await reader.read();
        if (chunk.done) break;
        var lines = decoder.decode(chunk.value).split("\\n");
        for (var line of lines) {
          if (!line.startsWith("data:")) continue;
          var data = JSON.parse(line.slice(5).trim());
          if (data.delta) { full += data.delta; botDiv.textContent = full; }
        }
      }
      history.push({ role: "assistant", content: full });
    } catch(e) {
      botDiv.textContent = "Something went wrong. Please try again.";
    }
  }
})();
`;

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.send(script);
  } catch (err) { next(err); }
};
