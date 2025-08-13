// components/AasthaChat.tsx
import { useEffect, useRef, useState } from "react";

/**
 * AasthaChat - Advanced AI Chat Component
 * Props:
 *  - userId (string) default "aastha-user-1"
 *  - apiBase (string) default "http://localhost:4000"
 *  - onBackToLanding (function) callback to return to main landing
 *
 * Usage:
 *  <AasthaChat userId="aastha-user-1" apiBase="http://localhost:4000" onBackToLanding={handleBack} />
 */

interface Message {
  who: string;
  text: string;
  time: string;
}

interface QueuedMessage {
  text: string;
  meta?: {
    type: string;
    mood?: string;
    memId?: string;
  };
}

interface Status {
  mood: string;
  bond: number;
  typingUntil: number;
  lastActive: number;
}

interface Avatar {
  mood: string;
  avatarUrl: string;
}

interface Memory {
  id: string;
  text: string;
  date: string;
  mood: string;
  score: number;
}

interface Memories {
  permanent: Memory[];
  temporary: Memory[];
}

interface PersonalitySettings {
  playfulness: number;
  romantic: number;
  talkative: number;
  caring: number;
}

interface Settings {
  personality: PersonalitySettings;
  optIn: {
    proactive: boolean;
    voice: boolean;
  };
}

export default function AasthaChat({ 
  userId = "aastha-user-1", 
  apiBase = "http://localhost:4000",
  onBackToLanding 
}: { 
  userId?: string; 
  apiBase?: string;
  onBackToLanding: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [queued, setQueued] = useState<QueuedMessage[]>([]);
  const [typingUntil, setTypingUntil] = useState(0);
  const [status, setStatus] = useState<Status>({ mood: "happy", bond: 0, typingUntil: 0, lastActive: 0 });
  const [avatar, setAvatar] = useState<Avatar>({ mood: "happy", avatarUrl: "" });
  const [memories, setMemories] = useState<Memories>({ permanent: [], temporary: [] });
  const [settings, setSettings] = useState<Settings>({ 
    personality: { playfulness: 0.6, romantic: 0.7, talkative: 0.6, caring: 0.8 }, 
    optIn: { proactive: true, voice: false }
  });
  
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const statusRef = useRef<NodeJS.Timeout | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  // util: add message
  function addMessage(who: string, text: string) {
    setMessages(prev => {
      const next = [...prev, { who, text, time: new Date().toLocaleTimeString() }];
      // keep last 200
      return next.slice(-200);
    });
    // auto-scroll
    setTimeout(() => {
      if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }, 50);
  }

  // load initial status, avatar, memories, settings
  useEffect(() => {
    fetchStatus();
    fetchAvatar();
    fetchMemories();
    fetchSettings();
    // start polling for queued messages
    pollRef.current = setInterval(pollQueued, 3500);
    statusRef.current = setInterval(fetchStatus, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (statusRef.current) clearInterval(statusRef.current);
    };
  }, [userId, apiBase]);

  // poll queued proactive messages
  async function pollQueued() {
    try {
      const res = await fetch(`${apiBase}/poll?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) return;
      const j = await res.json();
      if (j.queued && Array.isArray(j.queued) && j.queued.length) {
        j.queued.forEach((q: QueuedMessage) => addMessage("Aastha", q.text));
        // refresh memories/status after receiving proactive
        fetchMemories();
        fetchStatus();
      }
    } catch (e) {
      // silent
    }
  }

  async function fetchStatus() {
    try {
      const r = await fetch(`${apiBase}/status?userId=${encodeURIComponent(userId)}`);
      if (!r.ok) return;
      const j = await r.json();
      setStatus(j);
      setTypingUntil(j.typingUntil || 0);
    } catch (e) {}
  }

  async function fetchAvatar() {
    try {
      const r = await fetch(`${apiBase}/avatar?userId=${encodeURIComponent(userId)}`);
      if (!r.ok) return;
      const j = await r.json();
      setAvatar(j);
    } catch (e) {}
  }

  async function fetchMemories() {
    try {
      const r = await fetch(`${apiBase}/memories/${encodeURIComponent(userId)}`);
      if (!r.ok) return;
      const j = await r.json();
      setMemories({ permanent: j.permanent || [], temporary: j.temporary || [] });
    } catch (e) {}
  }

  async function fetchSettings() {
    try {
      const r = await fetch(`${apiBase}/settings?userId=${encodeURIComponent(userId)}`);
      if (!r.ok) return;
      const j = await r.json();
      setSettings(j);
    } catch (e) {}
  }

  // send message
  async function sendMessage() {
    const text = input.trim();
    if (!text) return;
    addMessage("You", text);
    setInput("");
    try {
      const r = await fetch(`${apiBase}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, message: text, persistMemory: false })
      });
      const j = await r.json();
      if (j.reply) addMessage("Aastha", j.reply);
      // show queued that the server sent back
      if (j.queued && j.queued.length) j.queued.forEach((q: QueuedMessage) => addMessage("Aastha", q.text));
      // update status/avatars/memories
      if (j.typingUntil) setTypingUntil(j.typingUntil);
      fetchStatus();
      fetchAvatar();
      fetchMemories();
    } catch (e) {
      addMessage("Aastha", "Oops, there was an error sending your message.");
    }
  }

  // promote memory to permanent
  async function promoteMemory(memId: string) {
    try {
      const r = await fetch(`${apiBase}/memories/mark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, memoryId: memId })
      });
      if (!r.ok) return;
      fetchMemories();
      addMessage("Aastha", "I'll keep this in my heart forever ❤️");
    } catch (e) {}
  }

  // delete memory
  async function deleteMemory(memId: string) {
    try {
      const r = await fetch(`${apiBase}/memories/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, memoryId: memId })
      });
      if (!r.ok) return;
      fetchMemories();
    } catch (e) {}
  }

  // save settings (personality sliders)
  async function saveSettings(newSettings: Settings) {
    try {
      const r = await fetch(`${apiBase}/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, settings: newSettings })
      });
      const j = await r.json();
      if (j.ok) setSettings(j.settings || newSettings);
      addMessage("Aastha", "Settings updated! I will be more " + (newSettings.personality.romantic > 0.5 ? "loving ❤️" : "chill 😌"));
    } catch (e) {}
  }

  // quick sample messages
  const quickReplies = [
    "I'm bored",
    "I miss you",
    "Let's watch a movie tonight",
    "I had a bad day"
  ];

  // typing indicator computed locally too
  const now = Date.now();
  const isTyping = typingUntil && typingUntil > now;

  return (
    <div className="max-w-6xl mx-auto p-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBackToLanding}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Aastha AI</h1>
              <p className="text-sm text-gray-600">Advanced AI Companion with Memory & Personality</p>
            </div>
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-sm text-gray-600">Mood: <span className="font-semibold">{status.mood || avatar.mood}</span></div>
            <div className="text-sm text-gray-600">Bond: <span className="font-semibold">{Math.round(status.bond || 0)}/100</span></div>
            <div className="w-32 bg-gray-200 h-2 rounded-full overflow-hidden mt-1">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300" 
                style={{ width: `${Math.min(100, Math.max(0, status.bond || 0))}%` }}
              />
            </div>
          </div>
          
          <img 
            src={avatar.avatarUrl || `https://via.placeholder.com/72?text=${avatar.mood || "Aastha"}`} 
            alt="avatar" 
            className="w-18 h-18 rounded-xl object-cover border-2 border-gray-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chat Area */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Chat with Aastha</h2>
            <p className="text-sm text-gray-600">Your AI companion with advanced memory and personality</p>
          </div>

          {/* Messages */}
          <div 
            ref={messagesRef}
            className="h-96 overflow-y-auto p-4 border border-gray-200 rounded-lg bg-gray-50 mb-4"
          >
            {messages.map((m, i) => (
              <div key={i} className="mb-4 flex gap-3">
                <div className="min-w-20 text-sm font-semibold text-gray-600">
                  {m.who === "You" ? "You" : "Aastha"}
                </div>
                <div className={`flex-1 p-3 rounded-lg ${
                  m.who === "You" 
                    ? "bg-blue-100 text-blue-900" 
                    : "bg-white border border-gray-200 text-gray-800"
                }`}>
                  <div className="whitespace-pre-wrap">{m.text}</div>
                  <div className="text-xs text-gray-500 mt-2">{m.time}</div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 items-center">
                <div className="min-w-20 text-sm font-semibold text-gray-600">Aastha</div>
                <div className="bg-white border border-gray-200 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">
                    typing<span className="animate-pulse">...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
                placeholder="Say something to Aastha..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button 
                onClick={sendMessage}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
              >
                Send
              </button>
            </div>

            {/* Quick Replies */}
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((q, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setInput(q)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button 
                onClick={fetchMemories}
                className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Refresh Memories
              </button>
              <button 
                onClick={fetchAvatar}
                className="w-full px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Refresh Avatar
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-2">Pending: {queued.length}</div>
          </div>

          {/* Memories */}
          <div className="bg-white rounded-lg shadow-sm border p-4 max-h-80 overflow-y-auto">
            <h3 className="font-semibold text-gray-800 mb-3">Memories</h3>
            
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">Permanent</div>
              {memories.permanent.length === 0 && (
                <div className="text-gray-500 text-sm">No permanent memories yet.</div>
              )}
              {memories.permanent.map(mem => (
                <div key={mem.id} className="border-b border-gray-100 py-2 mb-2">
                  <div className="text-sm text-gray-800">{mem.text}</div>
                  <div className="text-xs text-gray-500 mt-1">{mem.date} · mood: {mem.mood}</div>
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => deleteMemory(mem.id)}
                      className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">Temporary</div>
              {memories.temporary.length === 0 && (
                <div className="text-gray-500 text-sm">No temporary memories.</div>
              )}
              {memories.temporary.map(mem => (
                <div key={mem.id} className="border-b border-gray-100 py-2 mb-2">
                  <div className="text-sm text-gray-800">{mem.text}</div>
                  <div className="text-xs text-gray-500 mt-1">{mem.date} · mood: {mem.mood}</div>
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => promoteMemory(mem.id)}
                      className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    >
                      Promote
                    </button>
                    <button 
                      onClick={() => deleteMemory(mem.id)}
                      className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Personality Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Personality Settings</h3>
            <div className="space-y-4">
              {["playfulness", "romantic", "talkative", "caring"].map((trait) => (
                <label key={trait} className="block">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{trait}</span>
                    <span className="text-gray-600">
                      {Math.round(((settings.personality && settings.personality[trait as keyof PersonalitySettings]) || 0.6) * 100)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0" 
                    max="1" 
                    step="0.05"
                    value={(settings.personality && settings.personality[trait as keyof PersonalitySettings]) || 0.6}
                    onChange={e => setSettings(prev => ({ 
                      ...prev, 
                      personality: { 
                        ...prev.personality, 
                        [trait]: parseFloat(e.target.value) 
                      } 
                    }))}
                    className="w-full"
                  />
                </label>
              ))}
              
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => saveSettings(settings)}
                  className="flex-1 px-3 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Save
                </button>
                <button 
                  onClick={() => { 
                    setSettings({ 
                      personality: { playfulness: 0.6, romantic: 0.7, talkative: 0.6, caring: 0.8 }, 
                      optIn: { proactive: true, voice: false } 
                    }); 
                  }}
                  className="flex-1 px-3 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
