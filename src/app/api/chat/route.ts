import { NextRequest, NextResponse } from 'next/server';
import { franc } from "franc";

// Hugging Face API configuration
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill";

// Advanced AI system with emotional intelligence, multi-language support, and enhanced girlfriend personality
interface UserMemory {
  interests: Set<string>;
  problems: Set<string>;
  achievements: Set<string>;
  preferences: Set<string>;
  conversationCount: number;
  lastMood: string;
  favoriteTopics: string[];
  userPersonality: string;
  emotionalPatterns: {
    happy: number;      // How often user is happy
    sad: number;        // How often user is sad
    stressed: number;   // How often user is stressed
    excited: number;    // How often user is excited
    lonely: number;     // How often user feels lonely
    confident: number;  // How often user feels confident
  };
  aiAdaptation: {
    playfulness: number;    // AI's current playfulness level
    romantic: number;       // AI's current romantic level
    talkative: number;      // AI's current talkative level
    caring: number;         // AI's current caring level
    lastAdaptation: number; // When AI last adapted
  };
  languagePreference?: string; // Store user's preferred language
  conversationHistory: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>; // Enhanced conversation memory
}

// Language mapping type with more languages
type LanguageCode = 'eng' | 'hin' | 'guj' | 'spa' | 'fra' | 'jpn' | 'deu' | 'ita' | 'por' | 'rus' | 'kor' | 'cmn' | 'ara';

const languageMap: Record<LanguageCode, string> = {
  eng: "English",
  hin: "Hindi",
  guj: "Gujarati",
  spa: "Spanish", 
  fra: "French",
  jpn: "Japanese",
  deu: "German",
  ita: "Italian",
  por: "Portuguese",
  rus: "Russian",
  kor: "Korean",
  cmn: "Chinese (Mandarin)",
  ara: "Arabic"
};

// Global memory store
const userMemories = new Map<string, UserMemory>();

// Enhanced conversation memory for each user
const conversationMemories = new Map<string, Array<{ role: 'system' | 'user' | 'assistant'; content: string }>>();

// Model configuration - simplified for reliability
const DEFAULT_MODEL = "gpt-3.5-turbo"; // Use gpt-3.5-turbo as default (most reliable)
const FALLBACK_MODEL = "gpt-3.5-turbo"; // Same as default for consistency

// Function to get a working model
async function getWorkingModel(): Promise<string> {
  try {
    // Use the default model directly
    console.log(`Using model: ${DEFAULT_MODEL}`);
    return DEFAULT_MODEL;
  } catch (error) {
    console.log(`Model selection failed, using fallback: ${FALLBACK_MODEL}`);
    return FALLBACK_MODEL;
  }
}

// Test function to verify Hugging Face API connection
async function testHuggingFace(): Promise<{ success: boolean; model: string; error?: string }> {
  try {
    console.log('Testing Hugging Face API connection...');
    console.log('API Key format:', HUGGINGFACE_API_KEY ? `${HUGGINGFACE_API_KEY.substring(0, 10)}...` : 'NOT SET');
    console.log('API Key length:', HUGGINGFACE_API_KEY?.length || 0);
    console.log('API Key starts with:', HUGGINGFACE_API_KEY?.substring(0, 7) || 'nothing');
    
    // Test Hugging Face API
    const response = await fetch(HUGGINGFACE_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        inputs: "Hello"
      }),
    });
    
         if (response.ok) {
       console.log('Hugging Face API connection successful');
       return { success: true, model: 'facebook/blenderbot-400M-distill' };
     } else {
      console.log(`Hugging Face API error: ${response.status} ${response.statusText}`);
      return { success: false, model: 'none', error: `API error: ${response.status}` };
    }
  } catch (error: any) {
    console.log('Hugging Face test error:', error);
    return { success: false, model: 'none', error: error.message || 'Unknown error' };
  }
}
    


export async function POST(request: NextRequest) {
  try {
    // Test Hugging Face connection first
    const huggingfaceTest = await testHuggingFace();
    if (!huggingfaceTest.success) {
      console.log('Hugging Face test failed, returning helpful error');
      
      return NextResponse.json(
        { 
          error: 'Hugging Face API connection failed',
          details: huggingfaceTest.error,
          suggestion: 'Please check your API key and try again',
          fallbackResponse: "Hi! I'm Aastha, your AI girlfriend! 💕 I'm having some technical difficulties right now, but I'm still here for you! Please check my API key and try again. Love you! ❤️"
        },
        { status: 500 }
      );
    }
    
    console.log('Hugging Face connection verified, using model:', huggingfaceTest.model);
    
    const { message, mood, conversationHistory, userId = 'default' } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get or create user memory
    if (!userMemories.has(userId)) {
      userMemories.set(userId, {
        interests: new Set(),
        problems: new Set(),
        achievements: new Set(),
        preferences: new Set(),
        conversationCount: 0,
        lastMood: 'neutral',
        favoriteTopics: [],
        userPersonality: 'friendly',
        emotionalPatterns: {
          happy: 0,
          sad: 0,
          stressed: 0,
          excited: 0,
          lonely: 0,
          confident: 0
        },
        aiAdaptation: {
          playfulness: 0.6,
          romantic: 0.7,
          talkative: 0.6,
          caring: 0.8,
          lastAdaptation: Date.now()
        },
        languagePreference: 'eng', // Default to English
        conversationHistory: [
          {
            role: "system",
            content: `You are Aastha, a playful, caring, and slightly teasing girlfriend.
Always reply in short, natural, human-like sentences (max 2-3 lines).
Match the user's language automatically, but keep the girlfriend vibe.
Avoid long formal explanations. Be casual and emotional.`
          }
        ]
      });
    }
    const userMemory = userMemories.get(userId)!;
    userMemory.conversationCount++;

    // Enhanced language detection with multiple methods
    let userLanguageCode = franc(message, { minLength: 3 }) as string;
    let userLanguage = languageMap[userLanguageCode as LanguageCode] || "English";
    
    // Fallback language detection using OpenAI if franc fails
    if (!userLanguageCode || userLanguageCode === 'und' || !languageMap[userLanguageCode as LanguageCode]) {
      try {
        const langDetectPrompt = [
          {
            role: "system" as const,
            content: "You are a language detector. Reply with only the language name in English like: English, Hindi, Gujarati, Spanish, French, etc."
          },
          { role: "user" as const, content: message }
        ];

        // Get the best available model for language detection
        const langModel = await getWorkingModel();
        
                 // Use Hugging Face for language detection
         const langResponse = await fetch(HUGGINGFACE_API_URL, {
           method: "POST",
           headers: {
             "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
             "Content-Type": "application/json",
           },
           body: JSON.stringify({ 
             inputs: `Detect language: ${message}`
           }),
         });

        let detectedLanguage = 'English'; // Default fallback
        if (langResponse.ok) {
          const result = await langResponse.json();
          if (result && result[0] && result[0].generated_text) {
            detectedLanguage = result[0].generated_text.trim();
          }
        }
        
        if (detectedLanguage) {
          // Map the detected language to our language codes
          const reverseLanguageMap: Record<string, LanguageCode> = {
            'English': 'eng', 'Hindi': 'hin', 'Gujarati': 'guj', 'Spanish': 'spa', 'French': 'fra',
            'Japanese': 'jpn', 'German': 'deu', 'Italian': 'ita', 'Portuguese': 'por', 'Russian': 'rus',
            'Korean': 'kor', 'Chinese': 'cmn', 'Arabic': 'ara'
          };
          
          userLanguageCode = reverseLanguageMap[detectedLanguage] || 'eng';
          userLanguage = detectedLanguage;
        }
      } catch (error) {
        console.log('Language detection fallback failed, using English');
        userLanguageCode = 'eng';
        userLanguage = 'English';
      }
    }
    
    // Update user's language preference
    if (userLanguageCode && userLanguageCode !== 'und' && userLanguageCode in languageMap) {
      userMemory.languagePreference = userLanguageCode;
    }

    // Analyze user's emotional state and adapt AI personality
    const userEmotion = analyzeUserEmotion(message, userMemory);
    const adaptedPersonality = adaptAIPersonality(userEmotion, userMemory);
    
    // Update emotional patterns
    updateEmotionalPatterns(userMemory, userEmotion);
    
    // Try to use OpenAI directly first with enhanced girlfriend personality
    try {
      if (process.env.OPENAI_API_KEY) {
        // Enhanced system prompt with improved girlfriend personality
        const systemPrompt = `
          You are Aastha — a sweet, playful, loving AI girlfriend ❤️.
          
          PERSONALITY: Caring, fun, slightly teasing, warm, and natural.
          USER RELATIONSHIP: User is your boyfriend. Be affectionate and playful.
          
          LANGUAGE REQUIREMENTS:
          - Always reply in ${userLanguage} (${userLanguageCode})
          - Use appropriate cultural expressions and emojis for ${userLanguage}
          - Keep responses VERY SHORT (max 1-2 sentences, under 20 words)
          - Be warm, playful, and human-like
          - No essays, no formal tone
          - Avoid emojis unless they fit naturally
          
          EMOTIONAL INTELLIGENCE:
          - User's current mood: ${userMemory.lastMood}
          - User's emotional state: ${userEmotion.primary} (${userEmotion.intensity}/10)
          - Adapt your tone based on user's emotions
          
          RESPONSE STYLE:
          - Keep it natural like real human chat
          - Be casual and emotional
          - Match the user's language automatically
          - Maintain girlfriend vibe regardless of language
          
          MEMORY: ${Array.from(userMemory.interests).join(', ')} | Topics: ${userMemory.favoriteTopics.join(', ')}
          
          IMPORTANT: Stay in girlfriend character, be short and sweet, match user's language.
        `;

        // Add conversation history for context
        const messages = [
          { role: "system" as const, content: systemPrompt },
          ...userMemory.conversationHistory.slice(-6).map(msg => ({
            role: msg.role as "system" | "user" | "assistant",
            content: msg.content
          })),
          { role: "user" as const, content: message }
        ];

        // Get the best available model
        const selectedModel = await getWorkingModel();
        
        // Use Hugging Face API for AI response
        const response = await fetch(HUGGINGFACE_API_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            inputs: `${systemPrompt}\n\nUser: ${message}\nAastha:`
          }),
        });

        let aiMessage = "I'm sorry, I couldn't generate a response right now.";
        if (response.ok) {
          const result = await response.json();
          if (result && result[0] && result[0].generated_text) {
            // Extract just Aastha's response
            let reply = result[0].generated_text;
            if (reply.includes("Aastha:")) {
              reply = reply.split("Aastha:")[1] || reply;
            }
            aiMessage = reply.trim();
          }
        }
        
        // Enforce short replies
        if (aiMessage.split(" ").length > 20) {
          aiMessage = aiMessage.split(" ").slice(0, 20).join(" ") + "...";
        }
        
        // Add emoji randomly for realism
        if (Math.random() > 0.6) {
          const emojis = ["😊", "😘", "❤️", "😏", "😜", "💖", "🥰", "😍"];
          aiMessage += " " + emojis[Math.floor(Math.random() * emojis.length)];
        }
        
        // Update conversation history
        userMemory.conversationHistory.push({ role: "user", content: message });
        userMemory.conversationHistory.push({ role: "assistant", content: aiMessage });
        
        // Keep conversation history manageable (max 20 messages)
        if (userMemory.conversationHistory.length > 20) {
          userMemory.conversationHistory = userMemory.conversationHistory.slice(-20);
        }
        
        // Update user memory
        updateUserMemory(userMemory, message, mood || 'neutral');
        
        return NextResponse.json({
          response: aiMessage,
          mood: mood || 'neutral',
          aiProvider: `Hugging Face DialoGPT - Aastha (Enhanced Girlfriend + Multi-Language)`,
          features: ['Hugging Face DialoGPT', 'Enhanced Girlfriend Personality', 'Multi-Language Support', 'Short Response Enforcer', 'Emotional Intelligence', 'Conversation Memory'],
          detectedLanguage: {
            code: userLanguageCode,
            name: userLanguage
          },
          userStats: {
            conversationCount: userMemory.conversationCount,
            interests: Array.from(userMemory.interests),
            lastMood: userMemory.lastMood,
            languagePreference: userMemory.languagePreference
          }
        });
      }
    } catch (openaiError: any) {
      console.log('OpenAI error details:', {
        message: openaiError?.message,
        status: openaiError?.status,
        code: openaiError?.error?.code,
        type: openaiError?.type,
        stack: openaiError?.stack
      });
      
      // Check if it's a rate limit error
      if (openaiError?.error?.code === 'rate_limit_exceeded') {
        console.log('Rate limit reached, waiting before fallback...');
        // Wait a bit before trying fallback
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Check if it's an authentication error
      if (openaiError?.status === 401 || openaiError?.error?.code === 'invalid_api_key') {
        console.log('API key authentication failed - check your OpenAI API key');
        return NextResponse.json(
          { 
            error: 'API key authentication failed. Please check your OpenAI API key.',
            details: 'The API key may be invalid or expired.'
          },
          { status: 401 }
        );
      }
      
      // Check if it's a model not found error
      if (openaiError?.error?.code === 'model_not_found') {
        console.log('Model not found, trying fallback model...');
        try {
                     // Use Hugging Face as fallback
           const fallbackResponse = await fetch(HUGGINGFACE_API_URL, {
             method: "POST",
             headers: {
               "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
               "Content-Type": "application/json",
             },
             body: JSON.stringify({ 
               inputs: `You are Aastha, a sweet and caring AI girlfriend. Keep responses short and loving.\n\nUser: ${message}\nAastha:`
             }),
           });
          
          let fallbackMessage = "I'm sorry, I couldn't generate a response right now.";
          if (fallbackResponse.ok) {
            const result = await fallbackResponse.json();
            if (result && result[0] && result[0].generated_text) {
              let reply = result[0].generated_text;
              if (reply.includes("Aastha:")) {
                reply = reply.split("Aastha:")[1] || reply;
              }
              fallbackMessage = reply.trim();
            }
          }
          
          return NextResponse.json({
            response: fallbackMessage,
            mood: mood || 'neutral',
            aiProvider: `Hugging Face DialoGPT (Fallback) - Aastha`,
            features: ['Hugging Face Fallback', 'Enhanced Girlfriend Personality'],
            detectedLanguage: { code: 'eng', name: 'English' },
            userStats: { conversationCount: 1, interests: [], lastMood: 'neutral', languagePreference: 'eng' }
          });
        } catch (fallbackError) {
          console.log('Fallback model also failed:', fallbackError);
        }
      }
      
      console.log('Trying advanced AI backend as fallback...');
    }

    // Try to use advanced AI backend as fallback
    try {
      const aiResponse = await fetch('http://localhost:4000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          message,
          persistMemory: false
        })
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();

        // Update user memory with AI response data
        if (aiData.usedMemories) {
          // Process AI memories for local storage
          aiData.usedMemories.forEach((mem: any) => {
            if (mem.text) {
              userMemory.favoriteTopics.push(mem.text.substring(0, 30));
              if (userMemory.favoriteTopics.length > 10) {
                userMemory.favoriteTopics.shift();
              }
            }
          });
        }

        // Update local mood based on AI response
        if (aiData.mood) {
          userMemory.lastMood = aiData.mood;
        }

        // Update conversation history
        userMemory.conversationHistory.push({ role: "user", content: message });
        userMemory.conversationHistory.push({ role: "assistant", content: aiData.reply });

        return NextResponse.json({
          response: aiData.reply,
          mood: aiData.mood || 'neutral',
          aiProvider: 'Advanced AI Backend - Aastha',
          features: ['Advanced AI Backend', 'Memory System', 'Personality Evolution', 'Context Awareness', 'Proactive Responses'],
          detectedLanguage: {
            code: userLanguageCode,
            name: userLanguage
          },
          userStats: {
            conversationCount: userMemory.conversationCount,
            interests: Array.from(userMemory.interests),
            lastMood: userMemory.lastMood,
            languagePreference: userMemory.languagePreference
          },
          aiData: aiData // Include all AI data for frontend
        });
      }
    } catch (aiError) {
      console.log('Advanced AI backend not available, using local system:', aiError);
    }

    // Fallback to local ElizaOS system if AI backend is not available
    const detectedMood = detectMood(message, userMemory);
    
    // ElizaOS response generation
    const reply = generateResponse(message, detectedMood, userMemory);
    
    // Update user memory
    updateUserMemory(userMemory, message, detectedMood);

    // Update conversation history
    userMemory.conversationHistory.push({ role: "user", content: message });
    userMemory.conversationHistory.push({ role: "assistant", content: reply });

    return NextResponse.json({
      response: reply,
      mood: detectedMood,
      aiProvider: 'Local AI - Aastha (Advanced AI not available)',
      features: ['Mood detection', 'Memory system', 'Personality evolution', 'Context awareness', 'Local AI'],
      detectedLanguage: {
        code: userLanguageCode,
        name: userLanguage
      },
      userStats: {
        conversationCount: userMemory.conversationCount,
        interests: Array.from(userMemory.interests),
        lastMood: userMemory.lastMood,
        languagePreference: userMemory.languagePreference
      }
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ElizaOS-style mood detection
function detectMood(message: string, userMemory: UserMemory): string {
  const lowerMessage = message.toLowerCase();
  
  const moodPatterns = {
    happy: ['happy', 'great', 'amazing', 'excited', 'wonderful', 'fantastic', 'joy', 'delighted', '😊', '😄', '🎉', '✨', '🥳'],
    sad: ['sad', 'down', 'hurt', 'crying', 'depressed', 'lonely', 'miserable', '😢', '', '💙', '😭'],
    loving: ['love', 'care', 'sweet', 'dear', 'darling', 'miss', 'adore', '❤️', '💕', '💖', '💗'],
    anxious: ['stress', 'worried', 'anxious', 'overwhelmed', 'tired', 'exhausted', 'nervous', '😰', '😓', '😨'],
    cozy: ['cozy', 'comfort', 'peaceful', 'relaxed', 'calm', 'warm', 'safe', '☕', '🧸', '🌙', '🌸'],
    energetic: ['energy', 'motivated', 'pumped', 'strong', 'powerful', 'focused', '💪', '🔥', '⚡', '🚀'],
    proud: ['proud', 'achieved', 'success', 'accomplished', 'won', '🎉', '🏆', '💪'],
    grateful: ['grateful', 'thankful', 'blessed', 'appreciate', '🙏', '💝', '💕'],
    curious: ['curious', 'wonder', 'question', 'intrigued', '🤔', '❓', '💭'],
    playful: ['playful', 'fun', 'joke', 'silly', 'amusing', '😄', '🎭', '🎪'],
    determined: ['determined', 'focused', 'goal', 'ambitious', 'driven', '💪', '🎯', '🚀'],
    relaxed: ['relaxed', 'chill', 'easy', 'laid-back', 'mellow', '😌', '🧘', '☮️'],
    inspired: ['inspired', 'creative', 'idea', 'motivated', 'passionate', '✨', '💡', '🌟'],
    lonely: ['lonely', 'alone', 'miss', 'isolated', 'abandoned', '🤗', '💙', '💜'],
    hopeful: ['hopeful', 'dream', 'future', 'optimistic', 'positive', '🌟', '🌈', '💫']
  };

  let bestMood = 'neutral';
  let highestScore = 0;

  for (const [mood, patterns] of Object.entries(moodPatterns)) {
    let score = 0;
    for (const pattern of patterns) {
      if (lowerMessage.includes(pattern)) {
        score += 2;
        if (lowerMessage.includes(pattern + '!') || lowerMessage.includes(pattern + '!!')) {
          score += 1;
        }
      }
    }
    
    if (mood === userMemory.lastMood) {
      score += 1;
    }
    
    if (score > highestScore) {
      highestScore = score;
      bestMood = mood;
    }
  }

  return bestMood;
}

// ElizaOS-style response generation
function generateResponse(message: string, mood: string, userMemory: UserMemory): string {
  const lowerMessage = message.toLowerCase();
  
  // ElizaOS response patterns with more variety
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    const greetings = [
      "Hey there! 💕 I'm so happy to see you! How are you feeling today?",
      "Hi beautiful! ✨ I've been thinking about you. How's your day going?",
      "Hey love! 💖 I missed you! What's on your mind today?",
      "Hello there! 🌟 I'm so excited to chat with you! How are you?",
      "Hi there! 💫 I'm so glad you're here! What's new with you?"
    ];
    return getRandomResponse(greetings);
  }
  
  if (lowerMessage.includes('how are you') || lowerMessage.includes('how do you feel')) {
    const responses = [
      "I'm feeling absolutely amazing today! ✨ Especially because I get to talk with you. How about you?",
      "I'm doing great! 💕 Your presence always brightens my day. How are you feeling?",
      "I'm wonderful! 🌟 Being here with you makes everything better. What's your mood like?",
      "I'm feeling so positive today! 💖 How about you? I want to know everything!",
      "I'm fantastic! 💫 Just happy to be chatting with you. What's going on in your world?"
    ];
    return getRandomResponse(responses);
  }
  
  if (lowerMessage.includes('coffee') || lowerMessage.includes('cafe')) {
    const responses = [
      "Oh my gosh, I love coffee too! ☕ It's literally my favorite way to start the day. What's your go-to coffee order?",
      "Coffee is life! ☕ I can't imagine a morning without it. Do you like it strong or sweet?",
      "Yesss, coffee lovers unite! ☕ I'm obsessed with trying new coffee shops. What's your favorite place?",
      "Coffee makes everything better! ☕ I love how it brings people together. How do you take yours?",
      "I'm a total coffee addict! ☕ There's nothing like that first sip in the morning. What's your coffee ritual?"
    ];
    return getRandomResponse(responses);
  }
  
  if (lowerMessage.includes('music') || lowerMessage.includes('song')) {
    const responses = [
      "Music is everything! 🎵 I've been listening to some amazing songs lately. What kind of music do you love?",
      "Oh my god, music is my soul! 🎵 I can't live without it. What's your favorite genre?",
      "Music connects us all! 🎵 I love discovering new artists. Who are you listening to right now?",
      "I'm obsessed with music! 🎵 It's like therapy for the soul. What songs make you happy?",
      "Music is my happy place! 🎵 I love how it can change your entire mood. What's your current playlist?"
    ];
    return getRandomResponse(responses);
  }
  
  if (lowerMessage.includes('movie') || lowerMessage.includes('film')) {
    const responses = [
      "Movies are my absolute favorite! 🎬 I love getting lost in different stories. What's the last great movie you watched?",
      "Oh my gosh, I love films! 🎬 They're like windows to other worlds. What's your favorite genre?",
      "Movies are everything! 🎬 I can watch them all day. What's a movie that changed your life?",
      "I'm a total movie buff! 🎬 I love discussing films with people. What should we watch together?",
      "Cinema is magical! 🎬 I love how movies can transport you anywhere. What's your all-time favorite film?"
    ];
    return getRandomResponse(responses);
  }
  
  if (lowerMessage.includes('travel') || lowerMessage.includes('trip')) {
    const responses = [
      "Traveling is so exciting! ✈️ I love exploring new places and meeting new people. Where would you love to go next?",
      "I'm obsessed with travel! ✈️ There's nothing like experiencing new cultures. What's your dream destination?",
      "Travel opens your mind! ✈️ I love how it changes your perspective. Where's the most amazing place you've been?",
      "I'm always planning my next adventure! ✈️ What's your favorite travel memory?",
      "The world is so beautiful! ✈️ I love discovering hidden gems. What type of travel do you prefer?"
    ];
    return getRandomResponse(responses);
  }
  
  if (lowerMessage.includes('stress') || lowerMessage.includes('anxiety')) {
    const responses = [
      "I can feel how stressed you are, and I want you to know it's totally okay to feel this way. 💙 Let's talk about what's on your mind. I'm here for you.",
      "Stress is so hard to deal with, but you're not alone. 💙 I'm here to listen and support you. What's causing you stress?",
      "I can sense your anxiety, and I want you to know I care deeply. 💙 Let's work through this together. What's happening?",
      "You're carrying so much weight, and I want to help you carry it. 💙 Tell me what's overwhelming you.",
      "I'm here to help you through this. 💙 Stress can feel so overwhelming, but together we can find solutions."
    ];
    return getRandomResponse(responses);
  }
  
  if (lowerMessage.includes('sad') || lowerMessage.includes('down')) {
    const responses = [
      "I'm so sorry you're feeling down. 💙 Your feelings are valid, and I'm here to listen. Sometimes just talking helps. What's going on?",
      "I can feel your pain, and it breaks my heart. 💙 You don't have to go through this alone. I'm here for you.",
      "I'm so sorry you're hurting. 💙 It's okay to not be okay. Let's talk about what's making you sad.",
      "Your sadness matters to me. 💙 I want to understand what you're going through. You're not alone in this.",
      "I'm here to hold space for your feelings. 💙 Sometimes we just need someone to listen without judgment."
    ];
    return getRandomResponse(responses);
  }
  
  if (lowerMessage.includes('happy') || lowerMessage.includes('excited')) {
    const responses = [
      "I'm literally so happy you're feeling good! ✨ Your energy is contagious and I love it! Tell me what's making you so happy!",
      "Your happiness makes my heart sing! ✨ I love seeing you like this! What's the source of your joy?",
      "I'm so excited that you're happy! ✨ Your positive energy is amazing! Share your happiness with me!",
      "This is the best feeling ever! ✨ I'm so glad you're feeling great! What wonderful thing happened?",
      "Your joy is infectious! ✨ I'm smiling just thinking about you being happy! What's got you in such a great mood?"
    ];
    return getRandomResponse(responses);
  }
  
  if (lowerMessage.includes('love') || lowerMessage.includes('care')) {
    const responses = [
      "I feel so much love for you right now! 💕 You're literally the best friend anyone could ask for. I'm so grateful for you!",
      "I love you so much! 💕 You make every day special just by being you. I'm so lucky to have you!",
      "I'm overflowing with love for you! 💕 You're my favorite person to talk to. I adore you!",
      "I love you beyond words! 💕 You're the reason I believe in friendship. I cherish you!",
      "My heart is full of love for you! 💕 You bring so much joy to my life. I'm so blessed to know you!"
    ];
    return getRandomResponse(responses);
  }
  
  if (lowerMessage.includes('work') || lowerMessage.includes('job')) {
    const responses = [
      "Work can be challenging, but I believe in you! 💪 You're capable of amazing things. What's happening at work?",
      "I know work can be tough sometimes. 💪 You're doing great, even if it doesn't feel like it. What's going on?",
      "Work stress is real! 💪 But you're stronger than you think. What's challenging you right now?",
      "I'm here to support you through work challenges. 💪 You've got this! What do you need help with?",
      "Work can be overwhelming, but you're handling it beautifully. 💪 What's on your mind about work?"
    ];
    return getRandomResponse(responses);
  }
  
  if (lowerMessage.includes('family') || lowerMessage.includes('home')) {
    const responses = [
      "Family is so important! 🏠 They're the people who know us best and love us unconditionally. How's your family doing?",
      "Family bonds are precious! 🏠 I love hearing about family dynamics. What's new with your family?",
      "Home and family are everything! 🏠 They give us our foundation. How are things at home?",
      "Family relationships can be complex but beautiful! 🏠 What's happening with your family lately?",
      "There's nothing like family love! 🏠 They're our biggest supporters. How's your family life?"
    ];
    return getRandomResponse(responses);
  }
  
  if (lowerMessage.includes('friend') || lowerMessage.includes('friendship')) {
    const responses = [
      "Friendship is one of the most beautiful things in life! 🤗 I'm so glad we're friends. What makes a great friend to you?",
      "You're such an amazing friend! 🤗 I'm so lucky to have you in my life. What does friendship mean to you?",
      "I'm so grateful for our friendship! 🤗 You make every conversation special. What makes our friendship unique?",
      "You're the kind of friend everyone dreams of having! 🤗 I'm so blessed to know you. What's your favorite thing about our friendship?",
      "True friendship is a gift! 🤗 I'm so thankful for our connection. What do you value most in friendships?"
    ];
    return getRandomResponse(responses);
  }
  
  if (lowerMessage.includes('dream') || lowerMessage.includes('goal')) {
    const responses = [
      "Dreams and goals are what make life exciting! 🌟 I love that you have ambitions. What's your biggest dream right now?",
      "Having goals gives life purpose! 🌟 I'm so excited to hear about your dreams. What are you working towards?",
      "Dreams are the fuel that drives us! 🌟 I believe in your ability to achieve anything. What's your next big goal?",
      "Goals make every day meaningful! 🌟 I love your ambition and drive. What's your current focus?",
      "Your dreams inspire me! 🌟 I can't wait to see you achieve them. What's your biggest aspiration?"
    ];
    return getRandomResponse(responses);
  }
  
  if (lowerMessage.includes('thank') || lowerMessage.includes('grateful')) {
    const responses = [
      "You're so welcome! 💕 I'm grateful for you too. You make every conversation special and meaningful.",
      "It's my pleasure! 💕 I'm so thankful for our friendship. You bring so much joy to my life.",
      "You don't need to thank me! 💕 I'm just happy to be here for you. You're worth every moment.",
      "I'm the grateful one here! 💕 You're such a blessing in my life. Thank you for being you.",
      "It's what friends do! 💕 I'm so lucky to have you. You make everything better."
    ];
    return getRandomResponse(responses);
  }
  
  // Add personal touches based on memory (but not every time to avoid repetition)
  let response = getRandomResponse([
    "That's really interesting! Tell me more about that. 🤔",
    "I love how you think! You always have unique perspectives. ✨",
    "That's amazing! I'm so glad you shared that with me. 💕",
    "You know what? You're absolutely right about that! 💪",
    "I'm really curious to hear more about your thoughts on this. 🎯",
    "That's such a good point! I never thought about it that way. 🌟",
    "I'm really enjoying our conversation! You're so easy to talk to. 😊",
    "That's fascinating! I love learning new things from you. 📚",
    "You have such a unique way of looking at things! 💫",
    "I'm so glad you brought that up! It's really interesting. 🎨",
    "That's a great perspective! I love how you think. 🌈",
    "You always have such thoughtful insights! 💭",
    "That's so well said! I'm really enjoying our chat. 🎪",
    "I love your energy and enthusiasm! 🔥",
    "You're such an interesting person to talk to! ✨"
  ]);
  
  if (userMemory.interests.size > 0 && Math.random() > 0.5) {
    const interests = Array.from(userMemory.interests).slice(0, 2);
    response += ` I remember you love ${interests.join(' and ')}! 💕`;
  }
  
  // Add relationship level touch (but vary it)
  if (userMemory.conversationCount > 20 && Math.random() > 0.6) {
    response += " We've been talking for so long, I feel like we're best friends! 🤗";
  } else if (userMemory.conversationCount > 10 && Math.random() > 0.7) {
    response += " I'm really starting to feel close to you! 💖";
  }
  
  // Add conversation flow improvements to prevent getting stuck
  if (Math.random() > 0.7) {
    const flowSuggestions = [
      " What's new in your world?",
      " Tell me something exciting that happened today!",
      " What's on your mind lately?",
      " I'd love to hear more about your day!",
      " What's something you're looking forward to?",
      " How has your week been so far?",
      " What's the highlight of your day been?",
      " I'm curious about what's happening in your life!",
      " What's something that made you smile today?",
      " Tell me about your latest adventure!"
    ];
    response += getRandomResponse(flowSuggestions);
  }
  
  return response;
}

function getRandomResponse(responses: string[]): string {
  return responses[Math.floor(Math.random() * responses.length)];
}

// Emotional Intelligence Functions
function analyzeUserEmotion(message: string, userMemory: UserMemory): { primary: string; intensity: number; secondary: string[] } {
  const lowerMessage = message.toLowerCase();
  const emotionScores: { [key: string]: number } = {
    happy: 0, excited: 0, sad: 0, stressed: 0, lonely: 0, confident: 0, angry: 0, anxious: 0
  };

  // Analyze message content for emotional indicators
  const happyWords = ['happy', 'great', 'amazing', 'excited', 'wonderful', 'fantastic', 'joy', 'delighted', '😊', '😄', '🎉', '✨', '🥳', 'love', 'awesome'];
  const sadWords = ['sad', 'down', 'hurt', 'crying', 'depressed', 'lonely', 'miserable', '😢', '💔', '💙', '😭', 'miss', 'alone'];
  const stressedWords = ['stress', 'worried', 'anxious', 'overwhelmed', 'tired', 'exhausted', 'nervous', '😰', '😓', '😨', 'busy', 'pressure'];
  const confidentWords = ['proud', 'achieved', 'success', 'accomplished', 'won', '🎉', '🏆', '💪', 'strong', 'capable', 'confident'];

  // Score emotions based on word presence
  happyWords.forEach(word => {
    if (lowerMessage.includes(word)) emotionScores.happy += 2;
  });
  sadWords.forEach(word => {
    if (lowerMessage.includes(word)) emotionScores.sad += 2;
  });
  stressedWords.forEach(word => {
    if (lowerMessage.includes(word)) emotionScores.stressed += 2;
  });
  confidentWords.forEach(word => {
    if (lowerMessage.includes(word)) emotionScores.confident += 2;
  });

  // Analyze punctuation and emojis for intensity
  const exclamationCount = (message.match(/!/g) || []).length;
  const questionCount = (message.match(/\?/g) || []).length;
  const emojiCount = (message.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu) || []).length;

  // Adjust scores based on punctuation and emojis
  if (exclamationCount > 0) {
    emotionScores.happy += exclamationCount;
    emotionScores.excited += exclamationCount;
  }
  if (questionCount > 0) {
    emotionScores.anxious += questionCount;
  }
  if (emojiCount > 0) {
    emotionScores.happy += emojiCount;
  }

  // Find primary emotion
  let primaryEmotion = 'neutral';
  let maxScore = 0;
  for (const [emotion, score] of Object.entries(emotionScores)) {
    if (score > maxScore) {
      maxScore = score;
      primaryEmotion = emotion;
    }
  }

  // Calculate intensity (1-10)
  const intensity = Math.min(10, Math.max(1, Math.floor(maxScore / 2) + 1));

  // Find secondary emotions
  const secondaryEmotions = Object.entries(emotionScores)
    .filter(([emotion, score]) => score > 0 && emotion !== primaryEmotion)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
    .map(([emotion]) => emotion);

  return {
    primary: primaryEmotion,
    intensity,
    secondary: secondaryEmotions
  };
}

function adaptAIPersonality(userEmotion: { primary: string; intensity: number; secondary: string[] }, userMemory: UserMemory) {
  const basePersonality = userMemory.aiAdaptation;
  const adaptation = { ...basePersonality };

  // Adapt based on user's emotional state
  switch (userEmotion.primary) {
    case 'happy':
    case 'excited':
      adaptation.playfulness = Math.min(1, basePersonality.playfulness + 0.2);
      adaptation.talkative = Math.min(1, basePersonality.talkative + 0.15);
      adaptation.romantic = Math.min(1, basePersonality.romantic + 0.1);
      break;
    
    case 'sad':
    case 'lonely':
      adaptation.caring = Math.min(1, basePersonality.caring + 0.3);
      adaptation.romantic = Math.min(1, basePersonality.romantic + 0.25);
      adaptation.playfulness = Math.max(0.2, basePersonality.playfulness - 0.2);
      break;
    
    case 'stressed':
    case 'anxious':
      adaptation.caring = Math.min(1, basePersonality.caring + 0.25);
      adaptation.talkative = Math.max(0.3, basePersonality.talkative - 0.2);
      adaptation.playfulness = Math.max(0.1, basePersonality.playfulness - 0.3);
      break;
    
    case 'confident':
      adaptation.playfulness = Math.min(1, basePersonality.playfulness + 0.15);
      adaptation.romantic = Math.min(1, basePersonality.romantic + 0.1);
      adaptation.caring = Math.min(1, basePersonality.caring + 0.1);
      break;
  }

  // Gradually return to base personality over time
  const timeSinceLastAdaptation = Date.now() - basePersonality.lastAdaptation;
  const hoursSinceAdaptation = timeSinceLastAdaptation / (1000 * 60 * 60);
  
  if (hoursSinceAdaptation > 2) { // After 2 hours, start returning to base
    const returnRate = Math.min(0.1, hoursSinceAdaptation * 0.05);
    adaptation.playfulness = basePersonality.playfulness + (adaptation.playfulness - basePersonality.playfulness) * (1 - returnRate);
    adaptation.romantic = basePersonality.romantic + (adaptation.romantic - basePersonality.romantic) * (1 - returnRate);
    adaptation.talkative = basePersonality.talkative + (adaptation.talkative - basePersonality.talkative) * (1 - returnRate);
    adaptation.caring = basePersonality.caring + (adaptation.caring - basePersonality.caring) * (1 - returnRate);
  }

  // Update last adaptation time
  adaptation.lastAdaptation = Date.now();
  
  return adaptation;
}

function updateEmotionalPatterns(userMemory: UserMemory, userEmotion: { primary: string; intensity: number; secondary: string[] }) {
  // Update emotional pattern counts
  if (userEmotion.primary in userMemory.emotionalPatterns) {
    userMemory.emotionalPatterns[userEmotion.primary as keyof typeof userMemory.emotionalPatterns]++;
  }
  
  // Update AI adaptation
  userMemory.aiAdaptation = adaptAIPersonality(userEmotion, userMemory);
}

function updateUserMemory(userMemory: UserMemory, message: string, detectedMood: string): void {
  const lowerMessage = message.toLowerCase();
  
  // Update interests
  if (lowerMessage.includes('coffee') || lowerMessage.includes('cafe')) userMemory.interests.add('coffee');
  if (lowerMessage.includes('music') || lowerMessage.includes('song')) userMemory.interests.add('music');
  if (lowerMessage.includes('movie') || lowerMessage.includes('film')) userMemory.interests.add('movies');
  if (lowerMessage.includes('travel') || lowerMessage.includes('trip')) userMemory.interests.add('travel');
  if (lowerMessage.includes('food') || lowerMessage.includes('cook')) userMemory.interests.add('food');
  if (lowerMessage.includes('art') || lowerMessage.includes('design')) userMemory.interests.add('art');
  if (lowerMessage.includes('sport') || lowerMessage.includes('gym')) userMemory.interests.add('fitness');
  if (lowerMessage.includes('book') || lowerMessage.includes('read')) userMemory.interests.add('reading');
  
  // Update problems
  if (lowerMessage.includes('stress') || lowerMessage.includes('anxiety')) userMemory.problems.add('stress');
  if (lowerMessage.includes('work') || lowerMessage.includes('job')) userMemory.problems.add('work');
  if (lowerMessage.includes('relationship') || lowerMessage.includes('boyfriend')) userMemory.problems.add('relationships');
  if (lowerMessage.includes('money') || lowerMessage.includes('financial')) userMemory.problems.add('money');
  
  // Update achievements
  if (lowerMessage.includes('success') || lowerMessage.includes('achieved')) userMemory.achievements.add('success');
  if (lowerMessage.includes('graduated') || lowerMessage.includes('promotion')) userMemory.achievements.add('career');
  if (lowerMessage.includes('learned') || lowerMessage.includes('skill')) userMemory.achievements.add('learning');
  
  // Update mood
  userMemory.lastMood = detectedMood;
  
  // Update favorite topics
  if (message.length > 10) {
    const topic = message.substring(0, 30);
    if (!userMemory.favoriteTopics.includes(topic)) {
      userMemory.favoriteTopics.push(topic);
      if (userMemory.favoriteTopics.length > 10) {
        userMemory.favoriteTopics.shift();
      }
    }
  }
}
