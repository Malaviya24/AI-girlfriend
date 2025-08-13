'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Menu, Volume2, Mic, MessageSquare, Brain, MemoryStick } from 'lucide-react';
import VoiceChat from './VoiceChat';
import ConversationSidebar from './ConversationSidebar';
import MoodSelector from './MoodSelector';

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  voiceUrl?: string;
}

export default function Dashboard({ onBackToLanding }: { onBackToLanding: () => void }) {
  const [currentMood, setCurrentMood] = useState('loving');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // AI Integration State
  const [aiStatus, setAiStatus] = useState({ mood: "happy", bond: 0, typingUntil: 0 });
  const [aiMemories, setAiMemories] = useState({ permanent: [], temporary: [] });
  const [aiSettings, setAiSettings] = useState({ 
    personality: { playfulness: 0.6, romantic: 0.7, talkative: 0.6, caring: 0.8 }
  });
  const [userEmotion, setUserEmotion] = useState({ primary: "neutral", intensity: 5, secondary: [] });
  const [userLanguage, setUserLanguage] = useState({ code: "eng", name: "English" });
  const [showAiPanel, setShowAiPanel] = useState(false);

  // Language and stats update callbacks
  const handleLanguageUpdate = (language: { code: string; name: string }) => {
    setUserLanguage(language);
    console.log('Language updated:', language);
  };

  const handleUserStatsUpdate = (stats: any) => {
    // Update user stats if needed
    if (stats.languagePreference) {
      setUserLanguage(prev => ({
        ...prev,
        code: stats.languagePreference,
        name: getLanguageName(stats.languagePreference)
      }));
    }
    console.log('User stats updated:', stats);
  };

  // Helper function to get language name from code
  const getLanguageName = (code: string): string => {
    const languageMap: Record<string, string> = {
      eng: "English",
      spa: "Spanish", 
      jpn: "Japanese",
      fra: "French",
      deu: "German",
      ita: "Italian",
      por: "Portuguese",
      rus: "Russian",
      kor: "Korean",
      cmn: "Chinese (Mandarin)",
      hin: "Hindi",
      ara: "Arabic"
    };
    return languageMap[code] || "English";
  };

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setShowSidebar(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Add mobile-specific CSS for range sliders
  useEffect(() => {
    if (isMobile) {
      const style = document.createElement('style');
      style.textContent = `
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
          touch-action: manipulation;
        }
        
        input[type="range"]::-webkit-slider-track {
          background: #e5e7eb;
          height: 8px;
          border-radius: 4px;
          border: none;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #8b5cf6;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          cursor: pointer;
          margin-top: -8px;
          transition: all 0.2s ease;
        }
        
        input[type="range"]::-webkit-slider-thumb:active {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
        
        input[type="range"]::-moz-range-track {
          background: #e5e7eb;
          height: 8px;
          border-radius: 4px;
          border: none;
        }
        
        input[type="range"]::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #8b5cf6;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        input[type="range"]::-moz-range-thumb:active {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
        
        input[type="range"]:focus {
          outline: none;
        }
        
        input[type="range"]:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.3);
        }
        
        input[type="range"]:focus::-moz-range-thumb {
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.3);
        }
        
        /* Mobile-specific improvements */
        @media (max-width: 640px) {
          input[type="range"]::-webkit-slider-thumb {
            width: 28px;
            height: 28px;
            margin-top: -10px;
          }
          
          input[type="range"]::-moz-range-thumb {
            width: 28px;
            height: 28px;
          }
          
          input[type="range"]::-webkit-slider-track {
            height: 10px;
          }
          
          input[type="range"]::-moz-range-track {
            height: 10px;
          }
        }
        
        /* Touch device improvements */
        @media (hover: none) and (pointer: coarse) {
          input[type="range"]::-webkit-slider-thumb {
            width: 32px;
            height: 32px;
            margin-top: -12px;
          }
          
          input[type="range"]::-moz-range-thumb {
            width: 32px;
            height: 32px;
          }
          
          input[type="range"]::-webkit-slider-track {
            height: 12px;
          }
          
          input[type="range"]::-moz-range-track {
            height: 12px;
          }
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [isMobile]);

  // Initialize with a default conversation
  useEffect(() => {
    if (conversations.length === 0) {
      const defaultConversation: Conversation = {
        id: 'default',
        title: 'Welcome Chat',
        lastMessage: 'Hello! I\'m Aastha, your AI companion.',
        timestamp: new Date(),
        messageCount: 1
      };
      setConversations([defaultConversation]);
      setActiveConversationId('default');
    }
  }, [conversations.length]);

  const handleNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: `Chat ${conversations.length + 1}`,
      lastMessage: 'New conversation started',
      timestamp: new Date(),
      messageCount: 0
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setShowSidebar(false); // Always close sidebar after selection
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    
    if (activeConversationId === id) {
      const remainingConversations = conversations.filter(conv => conv.id !== id);
      if (remainingConversations.length > 0) {
        setActiveConversationId(remainingConversations[0].id);
      } else {
        handleNewConversation();
      }
    }
  };

  const handleMoodChange = (mood: string) => {
    setCurrentMood(mood);
    setShowMoodSelector(false);
  };

  const updateConversation = (conversationId: string, lastMessage: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, lastMessage, timestamp: new Date(), messageCount: conv.messageCount + 1 }
        : conv
    ));
  };

  // AI Integration Functions
  const fetchAiStatus = async () => {
    try {
      const response = await fetch(`http://localhost:4000/status?userId=${activeConversationId || 'default'}`);
      if (response.ok) {
        const data = await response.json();
        setAiStatus(data);
      }
    } catch (error) {
      console.log('AI status not available');
    }
  };

  const fetchAiMemories = async () => {
    try {
      const response = await fetch(`http://localhost:4000/memories/${activeConversationId || 'default'}`);
      if (response.ok) {
        const data = await response.json();
        setAiMemories(data);
      }
    } catch (error) {
      console.log('AI memories not available');
    }
  };

  const updateAiPersonality = async (trait: string, value: number) => {
    const newSettings = {
      ...aiSettings,
      personality: {
        ...aiSettings.personality,
        [trait]: value
      }
    };
    
    try {
      const response = await fetch(`http://localhost:4000/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: activeConversationId || 'default', 
          settings: newSettings 
        })
      });
      if (response.ok) {
        setAiSettings(newSettings);
      }
    } catch (error) {
      console.log('Failed to update AI personality');
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
             {/* Full-Width Navbar Header */}
       <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b p-4" style={{ width: '100vw' }}>
         <div className="flex items-center justify-between w-full">
                       <div className="flex items-center space-x-3">
              <button 
                onClick={onBackToLanding}
                className="flex items-center space-x-2 md:space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm md:text-lg">A</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg md:text-xl font-semibold text-gray-800">Aastha AI</h1>
                  <p className="text-xs md:text-sm text-gray-600">More Than Just AI, A True Friend</p>
                  <p className="text-xs text-purple-600 font-medium">💬 Chat Mode</p>
                </div>
                {/* Mobile: Show only logo and title */}
                <div className="sm:hidden">
                  <h1 className="text-lg font-semibold text-gray-800">Aastha AI</h1>
                </div>
              </button>
            </div>
           
                       <div className="flex items-center space-x-2">
              {/* Mobile: Stack buttons vertically, Desktop: Horizontal */}
              <div className="hidden md:flex items-center space-x-2">
                {/* Conversations Toggle Button */}
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-semibold hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Conversations</span>
                </button>
                
                {/* Mood Display */}
                <button
                  onClick={() => setShowMoodSelector(!showMoodSelector)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <span className="mr-2">🎭</span>
                  {currentMood.charAt(0).toUpperCase() + currentMood.slice(1)}
                </button>
                
                {/* AI Panel */}
                <button
                  onClick={() => setShowAiPanel(!showAiPanel)}
                  className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 active:from-blue-700 active:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 touch-manipulation"
                  title="AI Intelligence Panel"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <Brain className="w-5 h-5" />
                </button>
                
                {/* Settings */}
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Mobile: Compact button layout */}
              <div className="flex md:hidden items-center space-x-1">
                {/* Conversations Button - Mobile */}
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="p-2 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                
                {/* Mood Button - Mobile */}
                <button
                  onClick={() => setShowMoodSelector(!showMoodSelector)}
                  className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs font-medium hover:from-purple-600 hover:to-pink-600 transition-colors"
                >
                  🎭
                </button>
                
                {/* AI Panel Button - Mobile */}
                <button
                  onClick={() => setShowAiPanel(!showAiPanel)}
                  className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 active:from-blue-700 active:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 touch-manipulation"
                  title="AI Intelligence"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <Brain className="w-4 h-4" />
                </button>
                
                {/* Settings Button - Mobile */}
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
         </div>
       </div>

      

             {/* Main Content with Top Padding for Fixed Navbar */}
       <div className="flex-1 flex flex-col relative pt-24">
                                                                               {/* Conversation Sidebar */}
            <AnimatePresence>
              {showSidebar && (
                <>
                                                        {/* Mobile Backdrop Overlay - Only behind sidebar */}
                   <motion.div
                     initial={{ opacity: 0, x: '-100%' }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: '-100%' }}
                     transition={{ 
                       type: "spring", 
                       stiffness: 300, 
                       damping: 30,
                       duration: 0.3
                     }}
                     className="fixed left-0 top-0 w-80 h-full bg-black bg-opacity-30 z-30 sm:hidden"
                     style={{ top: '96px' }}
                     onClick={() => setShowSidebar(false)}
                   />
                   
                   {/* Sidebar */}
                   <motion.div
                     initial={{ x: '-100%' }}
                     animate={{ x: 0 }}
                     exit={{ x: '-100%' }}
                     transition={{ 
                       type: "spring", 
                       stiffness: 300, 
                       damping: 30,
                       duration: 0.3
                     }}
                     className="fixed left-0 top-0 z-40 h-full bg-white shadow-lg w-80"
                     style={{ top: '96px' }} // 96px = 24 (pt-24) + navbar height
                   >
                    <ConversationSidebar
                      conversations={conversations}
                      activeConversationId={activeConversationId}
                      onSelectConversation={handleSelectConversation}
                      onNewConversation={handleNewConversation}
                      onDeleteConversation={handleDeleteConversation}
                      onClose={() => setShowSidebar(false)}
                    />
                  </motion.div>
                </>
              )}
            </AnimatePresence>

         {/* Main Chat Area */}
         <div className="flex-1 relative">
           <VoiceChat
             onMoodChange={handleMoodChange}
             currentMood={currentMood}
             onBackToLanding={onBackToLanding}
             onLanguageUpdate={handleLanguageUpdate}
             onUserStatsUpdate={handleUserStatsUpdate}
           />
         </div>
       </div>

                           {/* Mood Selector Modal */}
        <AnimatePresence>
          {showMoodSelector && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4"
              onClick={() => setShowMoodSelector(false)}
            >
              {/* Blurred Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 backdrop-blur-md"></div>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10"
              >
                                 <MoodSelector
                   currentMood={currentMood}
                   onMoodChange={handleMoodChange}
                   onClose={() => setShowMoodSelector(false)}
                 />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

             {/* Settings Modal */}
       <AnimatePresence>
         {showSettings && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[60] flex items-center justify-center p-4"
             onClick={() => setShowSettings(false)}
           >
             {/* Blurred Background */}
             <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 backdrop-blur-md"></div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto relative z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Settings</h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                                 {/* Voice Settings */}
                 <div>
                   <h4 className="text-md font-medium text-gray-800 mb-3">Voice Settings</h4>
                   <div className="space-y-3">
                     <div className="flex items-center justify-between">
                       <span className="text-sm text-black font-medium">Voice Speed</span>
                       <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm hover:border-purple-300 transition-all duration-200" defaultValue="1.0">
                         <option value="0.8" className="text-black">Slow</option>
                         <option value="1.0" className="text-black">Normal</option>
                         <option value="1.2" className="text-black">Fast</option>
                       </select>
                     </div>
                     <div className="flex items-center justify-between">
                       <span className="text-sm text-black font-medium">Voice Pitch</span>
                       <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm hover:border-purple-300 transition-all duration-200" defaultValue="1.0">
                         <option value="0.8" className="text-black">Low</option>
                         <option value="1.0" className="text-black">Normal</option>
                         <option value="1.2" className="text-black">High</option>
                       </select>
                     </div>
                   </div>
                 </div>

                                 {/* Chat Settings */}
                 <div>
                   <h4 className="text-md font-medium text-gray-800 mb-3">Chat Settings</h4>
                   <div className="space-y-3">
                     <div className="flex items-center justify-between">
                       <span className="text-sm text-black font-medium">Auto-scroll to bottom</span>
                       <input type="checkbox" className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2" defaultChecked />
                     </div>
                     <div className="flex items-center justify-between">
                       <span className="text-sm text-black font-medium">Show timestamps</span>
                       <input type="checkbox" className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2" defaultChecked />
                     </div>
                   </div>
                 </div>

                                 {/* About */}
                 <div className="pt-4 border-t border-gray-200">
                   <h4 className="text-md font-medium text-gray-800 mb-2">About Aastha AI</h4>
                   <p className="text-sm text-black leading-relaxed">
                     More Than Just AI, A True Friend. Aastha is designed to make conversations feel natural and engaging. 
                     With voice interaction, mood-based responses, and conversation memory, Aastha adapts to your 
                     personality and needs.
                   </p>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

      {/* AI Intelligence Panel Modal */}
      <AnimatePresence>
        {showAiPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-start justify-center p-2 sm:p-4"
            style={{ 
              paddingTop: '120px', // Extra top padding to avoid top bar
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain'
            }}
          >
            {/* Blurred Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 backdrop-blur-md"></div>
            
            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
              style={{ 
                marginTop: '20px', // Additional margin from top
                marginBottom: '20px' // Bottom margin for better spacing
              }}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-4 sm:p-6 relative">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center">
                    <Brain className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                    AI Intelligence Panel
                  </h2>
                  <button
                    onClick={() => setShowAiPanel(false)}
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200 text-white hover:text-gray-100 active:bg-gray-200 touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)] p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  {/* AI Status & Bond */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 sm:p-4 rounded-lg border">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center">
                      <Brain className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                      AI Status
                    </h4>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Current Mood:</span>
                        <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-medium">
                          {aiStatus.mood || 'happy'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Bond Level:</span>
                        <span className="text-xs sm:text-sm font-semibold text-gray-800">
                          {Math.round(aiStatus.bond || 0)}/100
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(100, Math.max(0, aiStatus.bond || 0))}%` }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={fetchAiStatus}
                      className="mt-2 sm:mt-3 w-full px-3 py-2 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors text-xs sm:text-sm font-medium touch-manipulation"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      Refresh Status
                    </button>
                  </div>

                  {/* Personality Settings */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 sm:p-4 rounded-lg border">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Personality Settings</h4>
                    <div className="space-y-3 sm:space-y-4">
                      {["playfulness", "romantic", "talkative", "caring"].map((trait) => (
                        <div key={trait} className="space-y-2">
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="capitalize font-medium text-gray-700">{trait}</span>
                            <span className="text-gray-600">
                              {Math.round(((aiSettings.personality && aiSettings.personality[trait as keyof typeof aiSettings.personality]) || 0.6) * 100)}%
                            </span>
                          </div>
                          <div className="relative">
                            <input
                              type="range"
                              min="0" 
                              max="1" 
                              step="0.05"
                              value={(aiSettings.personality && aiSettings.personality[trait as keyof typeof aiSettings.personality]) || 0.6}
                              onChange={e => updateAiPersonality(trait, parseFloat(e.target.value))}
                              className="w-full h-3 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer touch-manipulation"
                              style={{ 
                                WebkitAppearance: 'none',
                                WebkitTapHighlightColor: 'transparent',
                                touchAction: 'manipulation'
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Memories */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 sm:p-4 rounded-lg border">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center">
                      <MemoryStick className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
                      AI Memories
                    </h4>
                    
                    <div className="space-y-3 sm:space-y-4">
                      {/* Permanent Memories */}
                      <div>
                        <h5 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Permanent Memories</h5>
                        <div className="max-h-24 sm:max-h-32 overflow-y-auto space-y-2">
                          {aiMemories.permanent && aiMemories.permanent.length > 0 ? (
                            aiMemories.permanent.slice(-3).map((mem: any) => (
                              <div key={mem.id} className="text-xs bg-white p-2 rounded border">
                                <div className="text-gray-800">{mem.text}</div>
                                <div className="text-gray-500 text-xs mt-1">
                                  {mem.date} • mood: {mem.mood}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-500 text-xs">No permanent memories yet</div>
                          )}
                        </div>
                      </div>

                      {/* Temporary Memories */}
                      <div>
                        <h5 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Recent Memories</h5>
                        <div className="max-h-24 sm:max-h-32 overflow-y-auto space-y-2">
                          {aiMemories.temporary && aiMemories.temporary.length > 0 ? (
                            aiMemories.temporary.slice(-3).map((mem: any) => (
                              <div key={mem.id} className="text-xs bg-white p-2 rounded border">
                                <div className="text-gray-800">{mem.text}</div>
                                <div className="text-gray-500 text-xs mt-1">
                                  {mem.date} • mood: {mem.mood}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-500 text-xs">No recent memories</div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={fetchAiMemories}
                      className="mt-2 sm:mt-3 w-full px-3 py-2 sm:py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 active:bg-green-700 transition-colors text-xs sm:text-sm font-medium touch-manipulation"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      Refresh Memories
                    </button>
                  </div>

                {/* Emotional Intelligence */}
                <div className="bg-gradient-to-r from-pink-50 to-red-50 p-3 sm:p-4 rounded-lg border">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center">
                    <Brain className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-pink-600" />
                    Emotional Intelligence
                  </h4>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm font-medium text-gray-700">Your Current Mood:</span>
                      <span className="px-2 sm:px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-xs sm:text-sm font-medium capitalize">
                        {userEmotion.primary}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm font-medium text-gray-700">Emotional Intensity:</span>
                      <span className="text-xs sm:text-sm font-semibold text-gray-800">
                        {userEmotion.intensity}/10
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-red-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(userEmotion.intensity / 10) * 100}%` }}
                      />
                    </div>
                    {userEmotion.secondary.length > 0 && (
                      <div className="text-xs text-gray-600">
                        Also detected: {userEmotion.secondary.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Language Detection */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-3 sm:p-4 rounded-lg border">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center">
                    <Brain className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-600" />
                    Language Detection
                  </h4>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm font-medium text-gray-700">Detected Language:</span>
                      <span className="px-2 sm:px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs sm:text-sm font-medium">
                        {userLanguage.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm font-medium text-gray-700">Language Code:</span>
                      <span className="text-xs sm:text-sm font-semibold text-gray-800 font-mono">
                        {userLanguage.code.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 text-center">
                      Aastha will respond in your language! 🌍
                    </div>
                  </div>
                </div>

                {/* AI Features Info */}
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-3 sm:p-4 rounded-lg border">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">AI Features</h4>
                  <div className="space-y-2 text-xs sm:text-sm text-gray-700">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Advanced Memory System</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Emotional Intelligence</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Personality Adaptation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Proactive Conversations</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Multi-Language Support</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
