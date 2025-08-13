# 🤖 AI Integration Setup Guide

## 🚀 **Option 1: OpenAI GPT (Recommended)**

### **Step 1: Get OpenAI API Key**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up/Login and create an API key
3. Copy your API key

### **Step 2: Create Environment File**
Create a `.env.local` file in your project root:

```env
# Database
DATABASE_URL="file:./dev.db"

# OpenAI API Key
OPENAI_API_KEY="sk-your-actual-api-key-here"

# App Settings
NEXT_PUBLIC_APP_NAME="Aastha AI"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

### **Step 3: Test the Integration**
1. Restart your development server
2. Send a message in the chat
3. Check the console for "OpenAI" or "Fallback" responses

---

## 🌟 **Option 2: Other AI Providers**

### **Anthropic Claude**
Replace the OpenAI function in `src/app/api/chat/route.ts`:

```typescript
async function getClaudeResponse(message: string, mood: string, history: ChatMessage[]): Promise<string | null> {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  
  if (!ANTHROPIC_API_KEY) return null;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 150,
        messages: [{
          role: 'user',
          content: `You are Aastha, an AI companion in ${mood} mood. ${moodPrompts[mood]}\n\nUser: ${message}`
        }]
      })
    });
    
    const data = await response.json();
    return data.content[0]?.text || null;
  } catch (error) {
    console.error('Claude API error:', error);
    return null;
  }
}
```

### **Google Gemini**
```typescript
async function getGeminiResponse(message: string, mood: string, history: ChatMessage[]): Promise<string | null> {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) return null;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are Aastha, an AI companion in ${mood} mood. ${moodPrompts[mood]}\n\nUser: ${message}`
          }]
        }]
      })
    });
    
    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || null;
  } catch (error) {
    console.error('Gemini API error:', error);
    return null;
  }
}
```

---

## 🎯 **Option 3: Local AI Models**

### **Ollama (Local LLM)**
1. Install [Ollama](https://ollama.ai/)
2. Run: `ollama pull llama2`
3. Add to your API:

```typescript
async function getOllamaResponse(message: string, mood: string, history: ChatMessage[]): Promise<string | null> {
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama2',
        prompt: `You are Aastha, an AI companion in ${mood} mood. ${moodPrompts[mood]}\n\nUser: ${message}\n\nAastha:`,
        stream: false
      })
    });
    
    const data = await response.json();
    return data.response || null;
  } catch (error) {
    console.error('Ollama error:', error);
    return null;
  }
}
```

---

## 🔧 **Advanced Configuration**

### **Voice AI Integration**
For better voice responses, add ElevenLabs:

```typescript
async function getElevenLabsVoice(text: string): Promise<ArrayBuffer | null> {
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  
  if (!ELEVENLABS_API_KEY) return null;

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });
    
    return await response.arrayBuffer();
  } catch (error) {
    console.error('ElevenLabs error:', error);
    return null;
  }
}
```

### **Speech-to-Text with Whisper**
```typescript
async function transcribeAudio(audioBlob: Blob): Promise<string | null> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  if (!OPENAI_API_KEY) return null;

  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: formData
    });
    
    const data = await response.json();
    return data.text || null;
  } catch (error) {
    console.error('Whisper error:', error);
    return null;
  }
}
```

---

## 📱 **Mobile AI Integration**

### **React Native + Expo**
For mobile apps, you can use the same API endpoints or integrate directly:

```typescript
// In your React Native app
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: 'your-api-key',
});

const getAIResponse = async (message: string, mood: string) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are Aastha, an AI companion in ${mood} mood.`
        },
        {
          role: 'user',
          content: message
        }
      ]
    });
    
    return completion.choices[0]?.message?.content;
  } catch (error) {
    console.error('OpenAI error:', error);
    return null;
  }
};
```

---

## 🎉 **You're Ready!**

1. **Choose your AI provider** (OpenAI recommended for start)
2. **Get your API key** from the provider
3. **Add it to `.env.local`**
4. **Restart your server**
5. **Test the chat!**

Your Aastha AI will now have real intelligence and can have meaningful conversations! 🚀
