'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Pause, Volume2, MessageSquare, Clock, ArrowLeft } from 'lucide-react';

// Add type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  voiceUrl?: string;
}

interface VoiceChatProps {
  onMoodChange: (mood: string) => void;
  currentMood: string;
  onBackToLanding: () => void;
}

export default function VoiceChat({ onMoodChange, currentMood, onBackToLanding }: VoiceChatProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
          // Auto-submit when speech is complete
          setTimeout(() => {
            if (finalTranscript.trim()) {
              handleVoiceInput(finalTranscript);
              stopListening();
            }
          }, 1000);
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access in your browser settings.');
        }
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      setVoiceSupported(true);
    } else {
      setVoiceSupported(false);
    }
  }, []);

  const startListening = async () => {
    if (!isListening) {
      try {
        // Check if Web Speech API is available
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
          alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
          return;
        }

        // Check if we're in a secure context (HTTPS or localhost)
        if (!window.isSecureContext) {
          alert('Microphone access requires a secure connection (HTTPS) or localhost. Please use HTTPS or localhost.');
          return;
        }

        // Check if microphone permission is available
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
          } catch (permissionError) {
            console.error('Microphone permission denied:', permissionError);
            alert('Please allow microphone access to use voice features. Click the microphone icon in your browser\'s address bar and select "Allow".');
            return;
          }
        }

        setIsListening(true);
        setTranscript('');
        
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }
      } catch (error) {
        console.error('Error starting voice recognition:', error);
        alert('Unable to start voice recognition. Please check your microphone permissions and try again.');
        setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    if (isListening) {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        setIsListening(false);
      } catch (error) {
        console.error('Error stopping voice recognition:', error);
        setIsListening(false);
      }
    }
  };

  // Check if voice features are available
  const isVoiceSupported = () => {
    return (
      ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) &&
      window.isSecureContext &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia
    );
  };

  const processVoiceInput = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    // Convert audio to text (you'll integrate with OpenAI Whisper API here)
    // For now, we'll simulate it
    const simulatedText = "Hello Aastha, how are you today?";
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: simulatedText,
      role: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Get AI response
    try {
      const aiResponse = await generateAIResponse(simulatedText, currentMood);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      speakText(aiResponse);
    } catch (error) {
      console.error('Error getting AI response:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateAIResponse = async (input: string, mood: string): Promise<string> => {
    try {
      // First, detect the user's mood from their message
      const detectedMood = await detectUserMood(input);
      
      // Then generate response with the detected mood
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          mood: detectedMood,
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Fallback responses with mood-based personality
      const fallbackResponses = {
        happy: "Oh, that's wonderful! I'm so glad to hear that! 😊✨",
        excited: "Wow, that's incredible! I'm so excited for you! ⚡🎉",
        loving: "That's so sweet! I'm here for you with all my love ❤️",
        cozy: "That sounds so comforting and nice! ☕🧸",
        energetic: "That's amazing! You're absolutely crushing it! 💪🔥",
        mysterious: "How fascinating! There's something intriguing about that 🌙🔮",
        magical: "That's absolutely enchanting! ✨🪄",
        sad: "I'm here for you. Would you like to talk about what's bothering you? 💙",
        neutral: "That's interesting! Tell me more about it 🙂"
      };
      return fallbackResponses[mood as keyof typeof fallbackResponses] || fallbackResponses.neutral;
    }
  };

  // New function to detect user mood
  const detectUserMood = async (userMessage: string): Promise<string> => {
    try {
      const moodResponse = await fetch('/api/detect-mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage
        }),
      });

      if (moodResponse.ok) {
        const data = await moodResponse.json();
        return data.mood;
      }
    } catch (error) {
      console.error('Error detecting mood:', error);
    }
    
    // Fallback to current mood if detection fails
    return currentMood;
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceInput = async (text: string) => {
    if (!text.trim()) return;
    
    // Clear input immediately for better UX
    setInputText('');
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      role: 'user',
      timestamp: new Date(),
    };
    
    console.log('Adding user message:', userMessage);
    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      console.log('Updated messages:', newMessages);
      return newMessages;
    });
    
    // Generate AI response
    try {
      const aiResponse = await generateAIResponse(text, currentMood);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => {
        const newMessages = [...prev, aiMessage];
        console.log('Updated messages with AI response:', newMessages);
        return newMessages;
      });
      speakText(aiResponse);
    } catch (error) {
      console.error('Error getting AI response:', error);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative" style={{ minHeight: '100vh' }}>
      {/* Blurred Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 backdrop-blur-sm"></div>
      
      {/* Main Content */}
      <div className="flex flex-col h-full relative z-10">
        

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {/* Debug Info */}
          <div className="text-xs text-gray-500 mb-2">
            Messages: {messages.length}
          </div>
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Aastha AI!</h3>
              <p className="text-gray-700 font-medium">More Than Just AI, A True Friend</p>
              <p className="text-gray-600 text-sm mt-2">Start a conversation by speaking or typing. I'm here to chat with you!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-purple-500 text-white'
                      : 'bg-white text-gray-800 shadow-sm border'
                  }`}
                >
                  <p className="text-sm font-medium">{message.content}</p>
                  <div className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-purple-100' : 'text-gray-600'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 shadow-sm border px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                  <span className="text-sm font-medium text-gray-700">Aastha is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Voice Controls and Text Input - Fixed at Bottom */}
        <div className="bg-white border-t p-4 mt-auto">
          {/* Voice Controls */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            {voiceSupported ? (
              <>
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                  disabled={isProcessing}
                >
                  {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
                
                {isListening && (
                  <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                    🎤 Listening... {transcript && `"${transcript}"`}
                  </div>
                )}
                
                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="w-12 h-12 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center"
                  >
                    <Pause className="w-5 h-5" />
                  </button>
                )}
              </>
            ) : (
              <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  🎤 Voice features not available
                  <br />
                  <span className="text-xs">Use Chrome/Edge/Safari with HTTPS</span>
                </p>
              </div>
            )}
          </div>

          {/* Text Input */}
          <form onSubmit={(e) => { 
            e.preventDefault(); 
            if (inputText.trim()) {
              handleVoiceInput(inputText);
            }
          }} className="flex space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
