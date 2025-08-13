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
  onLanguageUpdate?: (language: { code: string; name: string }) => void;
  onUserStatsUpdate?: (stats: any) => void;
  onAddMessage?: (role: 'user' | 'assistant', content: string) => void;
}

export default function VoiceChat({ onMoodChange, currentMood, onBackToLanding, onLanguageUpdate, onUserStatsUpdate, onAddMessage }: VoiceChatProps) {
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
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      try {
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
          console.log('Speech recognition started');
          setIsListening(true);
          setTranscript('');
        };
        
        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join('');
          
          setTranscript(transcript);
          
          if (event.results[0].isFinal) {
            handleVoiceInput(transcript);
            recognition.stop();
          }
        };
        
        recognition.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
          setTranscript('');
        };
        
        recognition.onerror = handleSpeechRecognitionError;
        
        recognitionRef.current = recognition;
        setVoiceSupported(true);
        
      } catch (error) {
        console.error('Failed to initialize speech recognition:', error);
        setVoiceSupported(false);
        setShowTextFallback(true);
      }
    } else {
      console.log('Speech recognition not supported');
      setVoiceSupported(false);
      setShowTextFallback(true);
    }
  }, []);

  const startListening = () => {
    if (!recognitionRef.current || isListening) return;
    
    try {
      // Reset any previous state
      setTranscript('');
      setShowTextFallback(false);
      
      // Add a small delay to ensure clean start
      setTimeout(() => {
        try {
          if (recognitionRef.current) {
            recognitionRef.current.start();
            console.log('Starting speech recognition...');
          }
        } catch (startError) {
          console.error('Failed to start speech recognition:', startError);
          alert('Failed to start voice recognition. Please try again or use text input.');
          setShowTextFallback(true);
        }
      }, 100);
      
    } catch (error) {
      console.error('Error in startListening:', error);
      alert('Voice recognition failed to start. Please use text input instead.');
      setShowTextFallback(true);
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

  // Enhanced speech recognition error handling
  const handleSpeechRecognitionError = (event: any) => {
    console.log('Speech recognition error:', event.error);
    
    let errorMessage = '';
    let shouldRetry = false;
    
    switch (event.error) {
      case 'not-allowed':
        errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
        shouldRetry = true;
        break;
      case 'network':
        errorMessage = 'Network error detected. Please check your internet connection and try again.';
        shouldRetry = true;
        break;
      case 'no-speech':
        errorMessage = 'No speech detected. Please speak clearly and try again.';
        shouldRetry = true;
        break;
      case 'audio-capture':
        errorMessage = 'Audio capture failed. Please check your microphone and try again.';
        shouldRetry = true;
        break;
      case 'aborted':
        errorMessage = 'Speech recognition was aborted. Please try again.';
        shouldRetry = true;
        break;
      default:
        errorMessage = `Speech recognition error: ${event.error}. Please try again.`;
        shouldRetry = true;
        break;
    }
    
    // Show user-friendly error message
    alert(errorMessage);
    
    // Reset recognition state
    setIsListening(false);
    setTranscript('');
    
    // If it's a network error, show text fallback
    if (event.error === 'network') {
      setShowTextFallback(true);
    }
    
    // Auto-retry after a delay for certain errors
    if (shouldRetry && event.error !== 'not-allowed') {
      setTimeout(() => {
        if (voiceSupported && !isListening) {
          console.log('Auto-retrying speech recognition...');
          startListening();
        }
      }, 2000);
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

  // Fallback to text input if voice fails
  const [showTextFallback, setShowTextFallback] = useState(false);
  
  const handleVoiceFailure = () => {
    setShowTextFallback(true);
    setIsListening(false);
    alert('Voice recognition failed. You can now type your message instead.');
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
      
      // Update language information if available
      if (data.detectedLanguage && onLanguageUpdate) {
        onLanguageUpdate(data.detectedLanguage);
      }
      
      // Update user stats if available
      if (data.userStats && onUserStatsUpdate) {
        onUserStatsUpdate(data.userStats);
      }
      
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
    
    // Add user message to local state
    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      console.log('Updated messages:', newMessages);
      return newMessages;
    });

    // Save user message to conversation
    if (onAddMessage) {
      onAddMessage('user', text);
    }
    
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

      // Save AI message to conversation
      if (onAddMessage) {
        onAddMessage('assistant', aiResponse);
      }

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
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4 min-h-0">
          {/* Debug Info - Hidden on mobile */}
          <div className="hidden sm:block text-xs text-gray-500 mb-2">
            Messages: {messages.length}
          </div>
          {messages.length === 0 ? (
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Welcome to Aastha AI!</h3>
              <p className="text-gray-700 font-medium text-sm sm:text-base">More Than Just AI, A True Friend</p>
              <p className="text-gray-600 text-xs sm:text-sm mt-2 px-4">Start a conversation by speaking or typing. I'm here to chat with you!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 sm:py-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-purple-500 text-white'
                      : 'bg-white text-gray-800 shadow-sm border'
                  }`}
                >
                  <p className="text-sm sm:text-base font-medium leading-relaxed">{message.content}</p>
                  <div className={`text-xs mt-1 sm:mt-2 ${
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
              <div className="bg-white text-gray-800 shadow-sm border px-3 sm:px-4 py-2 sm:py-3 rounded-lg max-w-[85%] sm:max-w-xs">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-purple-500"></div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Aastha is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Voice Controls and Text Input - Fixed at Bottom */}
        <div className="bg-white border-t p-3 sm:p-4 mt-auto">
          {/* Voice Controls */}
          <div className="flex items-center justify-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
            {voiceSupported && !showTextFallback ? (
              <>
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all touch-manipulation ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                  disabled={isProcessing}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {isListening ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
                </button>
                
                {isListening && (
                  <div className="text-xs sm:text-sm text-gray-600 bg-gray-50 px-2 sm:px-3 py-1 sm:py-2 rounded-lg max-w-[200px] sm:max-w-none">
                    🎤 Listening... {transcript && `"${transcript}"`}
                  </div>
                )}
                
                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
              </>
            ) : showTextFallback ? (
              <div className="text-center p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg max-w-[280px] sm:max-w-none">
                <p className="text-xs sm:text-sm text-blue-800">
                  🎤 Voice recognition failed
                  <br />
                  <span className="text-xs">
                    {voiceSupported ? 
                      'Network or microphone issue detected. You can now type your messages below.' : 
                      'Voice features not available. Please use text input below.'
                    }
                  </span>
                  <br />
                  <button
                    onClick={() => {
                      setShowTextFallback(false);
                      // Try to reinitialize voice recognition
                      if (recognitionRef.current) {
                        try {
                          recognitionRef.current.start();
                          setIsListening(true);
                        } catch (e) {
                          console.log('Voice recognition still not working');
                          setShowTextFallback(true);
                        }
                      }
                    }}
                    className="mt-2 px-2 sm:px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    Try Voice Again
                  </button>
                </p>
              </div>
            ) : (
              <div className="text-center p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg max-w-[280px] sm:max-w-none">
                <p className="text-xs sm:text-sm text-yellow-800">
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
          }} className="flex space-x-2 sm:space-x-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-500 text-sm sm:text-base"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm sm:text-base font-medium touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
