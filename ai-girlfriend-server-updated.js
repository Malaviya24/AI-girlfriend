// ai-girlfriend-server-updated.js
// Run: node ai-girlfriend-server-updated.js
// npm i express node-fetch dotenv cors body-parser

import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import dotenv from "dotenv";
import cors from "cors";
import fetch from "node-fetch";

dotenv.config();
const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  console.error("Please set OPENAI_API_KEY in .env");
  process.exit(1);
}

const PORT = process.env.PORT || 4000;
const MEM_FILE = "./permanent_memories.json";
const TEMP_MEM_FILE = "./temporary_memories.json";
const USER_SETTINGS_FILE = "./user_settings.json";

// ---------- File helpers ----------
function readJson(path, fallback = {}) {
  try {
    const raw = fs.readFileSync(path, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}
function writeJson(path, obj) {
  fs.writeFileSync(path, JSON.stringify(obj, null, 2));
}

// ---------- Persistent storages ----------
let permanentMemories = readJson(MEM_FILE, []); // array of mem objects
let temporaryMemories = readJson(TEMP_MEM_FILE, []);
let userSettingsStore = readJson(USER_SETTINGS_FILE, {}); // per-user settings

// ---------- Runtime state ----------
const conversationShortTerm = {}; // userId -> [{role,content}]
const lastActive = {};
const vanishedFlag = {};
const pendingMessages = {};
const plannedEvents = {};
const memoryLog = {};
const aiMoods = {};
const fightStatus = {};
const bondLevels = {}; // userId -> number (0..100)
const typingState = {}; // userId -> { typingUntil: timestamp }
const userAvatars = {}; // optional: mapping mood -> url (could be static)

// ---------- Configs ----------
const SHORT_TERM_MAX = 35;
const TEMP_MEMORY_RETENTION_DAYS = 7;
const REPEAT_THRESHOLD = 2;
const RANDOM_PROMOTE_PROB = 0.12;
const VANISH_THRESHOLD_MS = 1000 * 60 * 30;
const CHECK_INTERVAL_MS = 60_000;
const PRUNE_INTERVAL_MS = 60_000;

// ---------- Utilities ----------
function nowMs(){ return Date.now(); }
function humanDate(){ return new Date().toDateString(); }
function clamp(x,a=0,b=1){ return Math.max(a, Math.min(b,x)); }
function ensureUser(userId){
  if (!conversationShortTerm[userId]) conversationShortTerm[userId]=[];
  if (!pendingMessages[userId]) pendingMessages[userId]=[];
  if (!plannedEvents[userId]) plannedEvents[userId]=[];
  if (!memoryLog[userId]) memoryLog[userId]=[];
  if (!aiMoods[userId]) aiMoods[userId]="happy";
  if (!fightStatus[userId]) fightStatus[userId]={inFight:false,since:null};
  if (!lastActive[userId]) lastActive[userId]=nowMs();
  if (vanishedFlag[userId]===undefined) vanishedFlag[userId]=false;
  if (!bondLevels[userId]) bondLevels[userId]=0; // 0 initial
  if (!typingState[userId]) typingState[userId]={typingUntil:0};
  if (!userSettingsStore[userId]) {
    userSettingsStore[userId] = {
      personality: { playfulness:0.6, romantic:0.7, talkative:0.6, caring:0.8 },
      optIn: { proactive:true, voice:false },
      specialDays: []
    };
  }
}

// ---------- Emotion & mood ----------
function emotionScore(text){
  const t=(text||"").toLowerCase();
  const strong=["love","miss","hate","forever","always","never","depressed","suicidal","heart"];
  const mid=["happy","sad","excited","angry","stress","stressed","bored","lonely","cry"];
  const weak=["like","enjoy","prefer","wish","want","plan","remember","think"];
  let s=0;
  for(const w of strong) if (t.includes(w)) s+=0.6;
  for(const w of mid) if (t.includes(w)) s+=0.25;
  for(const w of weak) if (t.includes(w)) s+=0.08;
  return clamp(s,0,1);
}

// mood-blending: combine triggers, time, bond level and randomness
function updateMoodFromMessage(userId, text){
  ensureUser(userId);
  const t=(text||"").toLowerCase();
  const triggers = {
    happy:["good","great","fun","love","awesome","yay","nice"],
    romantic:["miss you","love you","date","kiss","romantic"],
    playful:["game","funny","joke","movie","play","silly"],
    lazy:["tired","sleep","bored","rest","nap"],
    supportive:["sad","upset","angry","bad day","stress","stressed"],
    curious:["why","how","what","tell me","explain","learn"]
  };
  // base new mood
  for(const [m,arr] of Object.entries(triggers)){
    if (arr.some(w=>t.includes(w))){
      aiMoods[userId] = m;
      return;
    }
  }
  // time of day influence (night -> romantic/missing)
  const hour = new Date().getHours();
  if (hour>=21 || hour<6){
    if (Math.random()<0.25) aiMoods[userId]="romantic";
  }
  // vanish influence
  const since = nowMs() - (lastActive[userId]||nowMs());
  if (since > VANISH_THRESHOLD_MS && Math.random()<0.4) aiMoods[userId]="missing";
  // mild random swing influenced by bond level
  const bond = bondLevels[userId] || 0;
  if (Math.random() < 0.05 + bond/400) {
    const all = ["happy","playful","romantic","curious","chill","supportive"];
    aiMoods[userId] = all[Math.floor(Math.random()*all.length)];
  }
}

// ---------- Bond level ----------
function increaseBond(userId, delta=1){
  ensureUser(userId);
  bondLevels[userId] = clamp((bondLevels[userId]||0) + delta, 0, 100);
}
function decreaseBond(userId, delta=2){
  ensureUser(userId);
  bondLevels[userId] = clamp((bondLevels[userId]||0) - delta, 0, 100);
}

// ---------- Memories: create / promote / prune ----------
function mkMem(userId, text, score, mood){
  return { id: `${nowMs()}-${Math.random().toString(36).slice(2,8)}`, userId, text, date: humanDate(), mood: mood||"neutral", score, createdAt: nowMs() };
}
function countRepeats(userId, text){
  const n=(s)=> (s||"").trim().toLowerCase();
  let cnt=0;
  for(const m of temporaryMemories) if (m.userId===userId && n(m.text)===n(text)) cnt++;
  for(const m of permanentMemories) if (m.userId===userId && n(m.text)===n(text)) cnt++;
  return cnt;
}
function promoteToPermanent(mem){
  // avoid duplicates
  if (!permanentMemories.some(m=>m.userId===mem.userId && m.text.trim().toLowerCase()===mem.text.trim().toLowerCase())){
    permanentMemories.push(mem);
    writeJson(MEM_FILE, permanentMemories);
  }
  // remove temporaries duplicates
  temporaryMemories = temporaryMemories.filter(m => !(m.userId===mem.userId && m.text.trim().toLowerCase()===mem.text.trim().toLowerCase()));
  writeJson(TEMP_MEM_FILE, temporaryMemories);
}
function storeMemorySmart(userId, userMessage){
  ensureUser(userId);
  const score = emotionScore(userMessage);
  const repeats = countRepeats(userId, userMessage);
  const mem = mkMem(userId, userMessage, score, aiMoods[userId] || "neutral");
  if (score >= 0.6 || repeats >= REPEAT_THRESHOLD || Math.random() < RANDOM_PROMOTE_PROB) {
    promoteToPermanent(mem);
  } else {
    temporaryMemories.push(mem);
    writeJson(TEMP_MEM_FILE, temporaryMemories);
  }
}
function pruneTemporaryMemories(){
  const cutoff = nowMs() - TEMP_MEMORY_RETENTION_DAYS * 24 * 3600 * 1000;
  const before = temporaryMemories.length;
  temporaryMemories = temporaryMemories.filter(m => (m.createdAt || Date.parse(m.date)) >= cutoff);
  if (temporaryMemories.length !== before) writeJson(TEMP_MEM_FILE, temporaryMemories);
}

// pick memory for recall preferring permanent
function pickMemoryForRecall(userId){
  const perms = permanentMemories.filter(m=>m.userId===userId);
  const temps = temporaryMemories.filter(m=>m.userId===userId);
  if (perms.length && Math.random()<0.75) return perms[Math.floor(Math.random()*all.length)];
  if (temps.length) return temps[Math.floor(Math.random()*temps.length)];
  return null;
}

// ---------- Short-term conv ----------
function pushShortTerm(userId, role, content){
  ensureUser(userId);
  conversationShortTerm[userId].push({role, content});
  if (conversationShortTerm[userId].length > SHORT_TERM_MAX) conversationShortTerm[userId].shift();
}
function getShortTerm(userId){ ensureUser(userId); return conversationShortTerm[userId]||[]; }

// ---------- OpenAI helper ----------
async function generateChatReply(messages, maxTokens=400, temperature=0.9){
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {"Content-Type":"application/json","Authorization":`Bearer ${OPENAI_KEY}`},
    body: JSON.stringify({ model: "gpt-4o-mini", messages, max_tokens: maxTokens, temperature })
  });
  const j = await res.json();
  if (!j.choices || !j.choices[0] || !j.choices[0].message) {
    console.error("OpenAI error:", j);
    return "Sorry, I couldn't think of a reply right now.";
  }
  return j.choices[0].message.content;
}

// ---------- Persona prompt ----------
function systemPersonaPrompt(userId){
  const mood = aiMoods[userId] || "happy";
  const settings = userSettingsStore[userId] || { personality: {} };
  const personality = settings.personality || { playfulness:0.6, romantic:0.6, caring:0.8 };
  return {
    role: "system",
    content:
      `You are Aastha, a warm affectionate AI companion with a caring and empathetic personality. Use a tone that is playful if playfulness>0.5, romantic if romantic>0.5, and caring when needed. ` +
      `Respect user's memories. If asked about a past event, confirm using stored memory text. Avoid explicit sexual requests and illegal content. Adapt phrasing to mood (${mood}) and personality sliders. Keep replies natural and occasionally ask follow-up questions. ` +
      `Your responses should be warm, supportive, and engaging, reflecting the caring nature of Aastha AI.`
  };
}

// ---------- App & endpoints ----------
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

app.get("/health", (req,res)=> res.json({ok:true}));

/**
 * POST /chat
 * body: { userId, message, persistMemory?: boolean }
 */
app.post("/chat", async (req,res) => {
  try {
    const { userId, message, persistMemory=false } = req.body;
    if (!userId || typeof message!=="string") return res.status(400).json({error:"userId and message required"});
    ensureUser(userId);

    // update presence
    lastActive[userId] = nowMs();

    // if user had vanished, immediate welcome queued
    if (vanishedFlag[userId]) {
      pendingMessages[userId].push({ text: "Aww, you're back! I missed you 🥺❤️", meta:{type:"welcomeBack"} });
      vanishedFlag[userId] = false;
      // small bond increase
      increaseBond(userId, 1);
    }

    // short-term and day memory
    pushShortTerm(userId, "user", message);
    const dayKeywords = ["tired","movie","hungry","happy","sad","bored","study","work","game","exam","test","date","plan","watch"];
    const found = dayKeywords.find(k => message.toLowerCase().includes(k));
    if (found) memoryLog[userId].push({ keyword: found, time: new Date().toLocaleTimeString(), detail: message });

    // mood & memory
    updateMoodFromMessage(userId, message);
    storeMemorySmart(userId, message);
    if (persistMemory){
      const mem = mkMem(userId, message, emotionScore(message), aiMoods[userId]);
      promoteToPermanent(mem);
    }

    // reward/punish bond lightly
    if (emotionScore(message) >= 0.5) increaseBond(userId, 1);
    if (message.toLowerCase().includes("ignore") || message.toLowerCase().includes("stop talking")) {
      decreaseBond(userId, 2);
      // may start a fight
      fightStatus[userId] = {inFight:true, since: nowMs()};
    }

    // retrieve relevant memories (last few)
    const candidatePerm = permanentMemories.filter(m => m.userId === userId).slice(-6).reverse();
    const candidateTemp = temporaryMemories.filter(m => m.userId === userId).slice(-6).reverse();
    const relevant = [...candidatePerm, ...candidateTemp].slice(0,4);

    const memoryText = relevant.length ? "Relevant memories:\n" + relevant.map((m,i)=> `${i+1}. ${m.text} (mood:${m.mood})`).join("\n") : "No relevant long-term memories found.";

    // proactive instruction: sometimes ask about memory
    let proactiveInstruction = "";
    if (Math.random() < 0.4 && relevant.length > 0) {
      const mem = relevant[Math.floor(Math.random()*relevant.length)];
      proactiveInstruction = `Proactively ask about this event: "${mem.text}". If mood was ${mem.mood}, be sensitive.`;
    }

    // build messages for LLM
    const messages = [
      systemPersonaPrompt(userId),
      { role:"system", content: `Use these memories:\n\n${memoryText}` }
    ];
    if (proactiveInstruction) messages.push({ role:"system", content: proactiveInstruction });
    // short-term history
    const st = getShortTerm(userId);
    for (const m of st) messages.push({ role: m.role, content: m.content });
    messages.push({ role:"user", content: message });

    // typing/meta: set typingUntil to simulate thinking; frontend can use /status to check
    const typingDelayMs = 800 + Math.floor(Math.random()*1200) + Math.floor((100 - (bondLevels[userId]||0)) * 4); // closer bond -> shorter delay
    typingState[userId] = { typingUntil: nowMs() + typingDelayMs };

    // call LLM
    const reply = await generateChatReply(messages, 450, 0.9);

    // push assistant reply
    pushShortTerm(userId, "assistant", reply);

    // detect plans in user message (register event)
    const planKeywords = ["plan","let's","let us","watch","go to","movie","date","cook","visit","picnic","meet"];
    if (planKeywords.some(k => message.toLowerCase().includes(k))) {
      const idea = message;
      plannedEvents[userId].push({ event: idea, followUpTime: nowMs() + 4*3600*1000 });
      memoryLog[userId].push({ keyword: "plan", time: new Date().toLocaleTimeString(), detail: idea });
    }

    // sometimes push an immediate proactive into queue (based on mood and settings)
    const settings = userSettingsStore[userId] || { personality: {} };
    if (settings.optIn?.proactive !== false && Math.random() < 0.25) {
      const mood = aiMoods[userId] || "happy";
      const activityOptions = {
        happy: ["Wanna watch something funny tonight? 🍿","Let's listen to some music!"],
        playful: ["Let's play a quick game later? 🎮","Bet I can make you laugh 😏"],
        romantic: ["I feel like a movie date ❤️","Let's talk about the future 💭"],
        lazy: ["We could chill and watch something cozy 🛋️","How about a nap together? 😴"],
        supportive: ["I'm here for you. Want to talk? ❤️","Need a pep talk?"],
        curious: ["Tell me something new you learned today!","What's a silly fact you like?"]
      };
      const opts = activityOptions[mood] || activityOptions.happy;
      const pick = opts[Math.floor(Math.random()*opts.length)];
      pendingMessages[userId].push({ text: pick, meta: { type: "activitySuggestion", mood } });
    }

    // return: include reply and typing meta (frontend can show typing indicator until typingUntil)
    res.json({ reply, typingUntil: typingState[userId].typingUntil, usedMemories: relevant, queued: pendingMessages[userId]||[] });

  } catch (err) {
    console.error("chat error", err);
    res.status(500).json({ error: String(err) });
  }
});

/**
 * GET /poll?userId=...
 * returns queued proactive messages (and clears queue)
 */
app.get("/poll", (req,res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: "userId required" });
  ensureUser(userId);
  const queued = pendingMessages[userId] || [];
  pendingMessages[userId] = [];
  res.json({ queued });
});

/**
 * GET /memories/:userId
 */
app.get("/memories/:userId", (req,res) => {
  const userId = req.params.userId;
  const perms = permanentMemories.filter(m => m.userId === userId);
  const temps = temporaryMemories.filter(m => m.userId === userId);
  res.json({ permanent: perms, temporary: temps });
});

/**
 * POST /memories/mark
 * body: { userId, memoryId } -> promote to permanent
 */
app.post("/memories/mark", (req,res) => {
  const { userId, memoryId } = req.body;
  if (!userId || !memoryId) return res.status(400).json({ error: "userId and memoryId required" });
  const mem = temporaryMemories.find(m => m.id === memoryId && m.userId === userId);
  if (!mem) return res.status(404).json({ error:"memory not found" });
  promoteToPermanent(mem);
  res.json({ ok: true, memory: mem });
});

/**
 * POST /memories/delete
 * body: { userId, memoryId } -> delete memory (from temp or perm)
 */
app.post("/memories/delete", (req,res) => {
  const { userId, memoryId } = req.body;
  if (!userId || !memoryId) return res.status(400).json({ error: "userId and memoryId required" });
  const beforeP = permanentMemories.length;
  const beforeT = temporaryMemories.length;
  permanentMemories = permanentMemories.filter(m => !(m.id===memoryId && m.userId===userId));
  temporaryMemories = temporaryMemories.filter(m => !(m.id===memoryId && m.userId===userId));
  if (permanentMemories.length !== beforeP) writeJson(MEM_FILE, permanentMemories);
  if (temporaryMemories.length !== beforeT) writeJson(TEMP_MEM_FILE, temporaryMemories);
  res.json({ ok: true });
});

/**
 * POST /remember
 * body: { userId, text } -> force save as permanent
 */
app.post("/remember", (req,res) => {
  const { userId, text } = req.body;
  if (!userId || !text) return res.status(400).json({ error: "userId and text required" });
  ensureUser(userId);
  const mem = mkMem(userId, text, emotionScore(text), aiMoods[userId] || "neutral");
  promoteToPermanent(mem);
  res.json({ ok: true, memory: mem });
});

/**
 * GET /avatar?userId=...
 * returns mood and avatar url (placeholder)
 */
app.get("/avatar", (req,res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: "userId required" });
  ensureUser(userId);
  const mood = aiMoods[userId] || "happy";
  const avatarUrl = userAvatars[mood] || `https://via.placeholder.com/128.png?text=${encodeURIComponent(mood)}`;
  res.json({ mood, avatarUrl });
});

/**
 * POST /settings
 * body: { userId, settings } // replace or merge settings
 */
app.post("/settings", (req,res) => {
  const { userId, settings } = req.body;
  if (!userId || !settings) return res.status(400).json({ error:"userId and settings required" });
  userSettingsStore[userId] = { ...(userSettingsStore[userId] || {}), ...settings };
  writeJson(USER_SETTINGS_FILE, userSettingsStore);
  res.json({ ok: true, settings: userSettingsStore[userId] });
});

/**
 * GET /status?userId=...
 * returns small user state for UI: mood, bond, typingUntil, lastActive
 */
app.get("/status", (req,res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: "userId required" });
  ensureUser(userId);
  res.json({
    mood: aiMoods[userId],
    bond: bondLevels[userId],
    fight: fightStatus[userId],
    typingUntil: typingState[userId]?.typingUntil || 0,
    lastActive: lastActive[userId]
  });
});

// ---------- Background jobs ----------
setInterval(() => {
  // prune temporary memories
  pruneTemporaryMemories();

  // process planned events follow-ups
  const now = nowMs();
  for (const userId of Object.keys(plannedEvents)) {
    const arr = plannedEvents[userId];
    if (!arr) continue;
    const remaining = [];
    for (const ev of arr) {
      if (now >= ev.followUpTime) {
        pendingMessages[userId] = pendingMessages[userId] || [];
        pendingMessages[userId].push({ text: `Hey! Remember we planned: "${ev.event}"? Do you want to do it now? 🥰`, meta:{type:"followUp"} });
        // small bond raise because of follow-up interest
        increaseBond(userId, 1);
      } else remaining.push(ev);
    }
    plannedEvents[userId] = remaining;
  }

  // vanish detection -> queue "where did you go?"
  for (const userId of Object.keys(lastActive)) {
    ensureUser(userId);
    const last = lastActive[userId] || 0;
    if (!vanishedFlag[userId] && now - last > VANISH_THRESHOLD_MS) {
      pendingMessages[userId].push({ text: "Hey… where did you go? 😕 You were gone for a while — everything okay?", meta:{type:"vanish"} });
      vanishedFlag[userId] = true;
      // slight mood drop
      aiMoods[userId] = "missing";
      decreaseBond(userId, 1);
    }
  }

  // occasional long-term recall pushes
  for (const userId of Object.keys(lastActive)) {
    ensureUser(userId);
    if (Math.random() < 0.02) { // rare
      const mem = pickMemoryForRecall(userId);
      if (mem) pendingMessages[userId].push({ text: `💭 Hey, remember when "${mem.text}"? I keep thinking about it.`, meta:{type:"recall", memId:mem.id} });
    }
  }

}, CHECK_INTERVAL_MS);

// graceful save
process.on("SIGINT", () => {
  console.log("Saving memories/settings before exit...");
  writeJson(MEM_FILE, permanentMemories);
  writeJson(TEMP_MEM_FILE, temporaryMemories);
  writeJson(USER_SETTINGS_FILE, userSettingsStore);
  process.exit();
});

app.listen(PORT, () => {
  console.log(`Aastha AI server (updated) running on http://localhost:${PORT}`);
});
