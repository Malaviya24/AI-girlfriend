'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Menu, Volume2, Mic, MessageSquare, Brain, MemoryStick } from 'lucide-react';
import VoiceChat from './VoiceChat';

export default function Dashboard({ onBackToLanding }: { onBackToLanding: () => void }) {
  const [currentMood, setCurrentMood] = useState('loving');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  
  // AI Integration State
  const [aiStatus, setAiStatus] = useState({ mood: "happy", bond: 0, typingUntil: 0 });
  const [aiMemories, setAiMemories] = useState({ permanent: [], temporary: [] });
  const [aiSettings, setAiSettings] = useState({ 
    personality: { playfulness: 0.6, romantic: 0.7, talkative: 0.6, caring: 0.8 }
  });
  const [userEmotion, setUserEmotion] = useState({ primary: "neutral", intensity: 5, secondary: [] });
  const [userLanguage, setUserLanguage] = useState({ code: "eng", name: "English" });

  // Real-time update state
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [updateInterval, setUpdateInterval] = useState(5000); // 5 seconds default
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connected'); // connected, disconnected, reconnecting

  // WebSocket connection for real-time updates
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const [wsStatus, setWsStatus] = useState('disconnected'); // disconnected, connecting, connected, error

  // Chat functionality state
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [conversations, setConversations] = useState([
    { 
      id: 1, 
      title: 'How to make pasta?', 
      timestamp: '2 hours ago', 
      active: true,
      messages: [
        { role: 'user', content: 'How to make pasta?', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        { role: 'assistant', content: 'To make pasta, boil water with salt, add pasta, cook until al dente, then drain and serve with your favorite sauce! 🍝', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) }
      ]
    },
    { 
      id: 2, 
      title: 'Tell me a joke', 
      timestamp: 'Yesterday', 
      active: false,
      messages: [
        { role: 'user', content: 'Tell me a joke', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        { role: 'assistant', content: 'Why don\'t scientists trust atoms? Because they make up everything! 😄', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      ]
    },
    { 
      id: 3, 
      title: 'Weather forecast', 
      timestamp: '3 days ago', 
      active: false,
      messages: [
        { role: 'user', content: 'What\'s the weather like?', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { role: 'assistant', content: 'I can\'t check real-time weather, but I hope it\'s beautiful where you are! ☀️', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
      ]
    }
  ]);

  // Language and stats update callbacks
  const handleLanguageUpdate = (language: { code: string; name: string }) => {
    setUserLanguage(language);
    console.log('Language updated:', language);
  };

  const handleUserStatsUpdate = (stats: any) => {
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

  // AI Integration Functions
  const fetchAiStatus = async () => {
    try {
      const response = await fetch('http://localhost:4000/status?userId=default');
      if (response.ok) {
        const data = await response.json();
        setAiStatus(data);
        setLastUpdate(Date.now());
        setConnectionStatus('connected');
      }
    } catch (error) {
      console.log('AI status not available');
      setConnectionStatus('disconnected');
    }
  };

  const fetchAiMemories = async () => {
    try {
      const response = await fetch('http://localhost:4000/memories/default');
      if (response.ok) {
        const data = await response.json();
        setAiMemories(data);
        setLastUpdate(Date.now());
        setConnectionStatus('connected');
      }
    } catch (error) {
      console.log('AI memories not available');
      setConnectionStatus('disconnected');
    }
  };

  // Enhanced real-time update function
  const triggerRealTimeUpdate = () => {
    if (isRealTimeEnabled) {
      fetchAiStatus();
      fetchAiMemories();
    }
  };

  // Real-time updates when chat happens
  const handleChatUpdate = () => {
    // Immediate update when chat happens
    triggerRealTimeUpdate();
    
    // Schedule additional updates for chat context
    setTimeout(() => triggerRealTimeUpdate(), 1000);
    setTimeout(() => triggerRealTimeUpdate(), 3000);
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
      const response = await fetch('http://localhost:4000/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: 'default', 
          settings: newSettings 
        })
      });
      if (response.ok) {
        setAiSettings(newSettings);
        // Trigger real-time update after personality change
        triggerRealTimeUpdate();
      }
    } catch (error) {
      console.log('Failed to update AI personality');
    }
  };

  // Initialize WebSocket connection
  const initializeWebSocket = () => {
    try {
      // Check if WebSocket is supported
      if (!('WebSocket' in window)) {
        console.log('WebSocket not supported, using HTTP fallback');
        setWsStatus('disconnected');
        return;
      }

      const ws = new WebSocket('ws://localhost:4000');
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setWsStatus('connected');
        setConnectionStatus('connected');
        
        // Subscribe to real-time updates
        try {
          ws.send(JSON.stringify({
            type: 'subscribe',
            userId: 'default',
            channels: ['status', 'memories', 'personality']
          }));
        } catch (sendError) {
          console.log('Failed to send subscription, continuing with HTTP fallback');
        }
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'status_update':
              setAiStatus(data.data);
              setLastUpdate(Date.now());
              break;
            case 'memory_update':
              setAiMemories(data.data);
              setLastUpdate(Date.now());
              break;
            case 'personality_update':
              setAiSettings(prev => ({
                ...prev,
                personality: { ...prev.personality, ...data.data }
              }));
              setLastUpdate(Date.now());
              break;
            case 'heartbeat':
              // Keep connection alive
              try {
                ws.send(JSON.stringify({ type: 'heartbeat' }));
              } catch (e) {
                console.log('Heartbeat failed, connection may be unstable');
              }
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setWsStatus('disconnected');
        setConnectionStatus('disconnected');
        
        // Don't auto-reconnect to avoid infinite loops
        // Let HTTP fallback handle updates
      };
      
      ws.onerror = (error) => {
        console.log('WebSocket error, using HTTP fallback:', error);
        setWsStatus('error');
        setConnectionStatus('disconnected');
        
        // Close connection and use HTTP fallback
        try {
          ws.close();
        } catch (e) {
          // Ignore close errors
        }
      };
      
      setWsConnection(ws);
      
    } catch (error) {
      console.log('Failed to initialize WebSocket, using HTTP fallback:', error);
      setWsStatus('error');
      setConnectionStatus('disconnected');
    }
  };

  // Cleanup WebSocket on unmount
  const cleanupWebSocket = () => {
    if (wsConnection) {
      wsConnection.close();
      setWsConnection(null);
    }
  };

  // Chat functionality functions
  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: 'New Chat',
      timestamp: 'Just now',
      active: true,
      messages: []
    };
    
    // Set all other chats as inactive
    setConversations(prev => prev.map(chat => ({ ...chat, active: false })));
    
    // Add new chat and set as current
    setConversations(prev => [newChat, ...prev]);
    setCurrentConversationId(newChat.id);
    
    // Close sidebar
    setShowSidebar(false);
  };

  const selectChat = (chatId: number) => {
    // Set all chats as inactive
    setConversations(prev => prev.map(chat => ({ ...chat, active: false })));
    
    // Set selected chat as active
    setConversations(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, active: true } : chat
    ));
    
    setCurrentConversationId(chatId);
    setShowSidebar(false);
  };

  const deleteChat = (chatId: number) => {
    setConversations(prev => prev.filter(chat => chat.id !== chatId));
    
    // If we deleted the current chat, set first available as current
    if (currentConversationId === chatId) {
      const remainingChats = conversations.filter(chat => chat.id !== chatId);
      if (remainingChats.length > 0) {
        setCurrentConversationId(remainingChats[0].id);
        setConversations(prev => prev.map((chat, index) => 
          index === 0 ? { ...chat, active: true } : { ...chat, active: false }
        ));
      } else {
        setCurrentConversationId(null);
      }
    }
  };

  const updateChatTitle = (chatId: number, newTitle: string) => {
    setConversations(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, title: newTitle } : chat
    ));
  };

  const addMessageToCurrentChat = (role: 'user' | 'assistant', content: string) => {
    if (!currentConversationId) {
      // If no current chat, create a new one
      createNewChat();
      // Wait for the new chat to be created, then add message
      setTimeout(() => {
        const newChatId = Date.now();
        setConversations(prev => prev.map(chat => 
          chat.id === newChatId ? { ...chat, messages: [...chat.messages, { role, content, timestamp: new Date() }] } : chat
        ));
      }, 100);
      return;
    }

    setConversations(prev => prev.map(chat => 
      chat.id === currentConversationId 
        ? { 
            ...chat, 
            messages: [...chat.messages, { role, content, timestamp: new Date() }],
            title: role === 'user' && chat.messages.length === 0 ? content.substring(0, 30) + '...' : chat.title
          }
        : chat
    ));
  };

  useEffect(() => {
    // Initial data fetch
    fetchAiStatus();
    fetchAiMemories();
    
    // Try WebSocket for real-time updates (optional)
    if (isRealTimeEnabled) {
      try {
        initializeWebSocket();
      } catch (error) {
        console.log('WebSocket initialization failed, using HTTP fallback');
        setWsStatus('error');
      }
    }
    
    // Auto-refresh timer as fallback (always active)
    const aiStatusInterval = setInterval(() => {
      if (isRealTimeEnabled) {
        fetchAiStatus();
      }
    }, updateInterval);
    
    const aiMemoriesInterval = setInterval(() => {
      if (isRealTimeEnabled) {
        fetchAiMemories();
      }
    }, updateInterval);
    
    // Cleanup function
    return () => {
      clearInterval(aiStatusInterval);
      clearInterval(aiMemoriesInterval);
      cleanupWebSocket();
    };
  }, [isRealTimeEnabled, updateInterval]);

  // Real-time updates when AI panel opens
  useEffect(() => {
    if (showAiPanel && isRealTimeEnabled) {
      // Immediate refresh when panel opens
      triggerRealTimeUpdate();
      
      // Enable WebSocket if not connected
      if (wsStatus !== 'connected') {
        initializeWebSocket();
      }
    }
  }, [showAiPanel, isRealTimeEnabled, wsStatus]);

  // Real-time updates when user emotions change
  useEffect(() => {
    if (userEmotion.primary !== 'neutral' && isRealTimeEnabled) {
      // Trigger update when emotions change
      handleChatUpdate();
    }
  }, [userEmotion.primary, isRealTimeEnabled]);

  // Real-time updates when user language changes
  useEffect(() => {
    if (userLanguage.code !== 'eng' && isRealTimeEnabled) {
      // Trigger update when language changes
      triggerRealTimeUpdate();
    }
  }, [userLanguage.code, isRealTimeEnabled]);

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b p-3 sm:p-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button 
              onClick={onBackToLanding}
              className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity cursor-pointer touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-lg">A</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Aastha AI</h1>
                <p className="text-xs sm:text-sm text-gray-600">More Than Just AI, A True Friend</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-base font-semibold text-gray-800">Aastha AI</h1>
              </div>
            </button>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Conversations Toggle Button */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-500 text-white rounded-full text-xs sm:text-sm font-semibold hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-1 sm:space-x-2 touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Conversations</span>
              <span className="sm:hidden">Chats</span>
            </button>
            

            
            {/* AI Panel Button */}
            <button
              onClick={() => setShowAiPanel(true)}
              className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 touch-manipulation"
              title="AI Intelligence Panel"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative pt-24">
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
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Conversations</h3>
                    <button
                      onClick={() => setShowSidebar(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  
                                     {/* Search Bar */}
                   <div className="mb-4">
                     <div className="relative">
                       <input
                         type="text"
                         placeholder="Search conversations..."
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       />
                       <svg
                         className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
                         fill="none"
                         stroke="currentColor"
                         viewBox="0 0 24 24"
                       >
                         <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={2}
                           d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                         />
                       </svg>
                     </div>
                   </div>

                   {/* New Chat Button */}
                   <button
                     onClick={createNewChat}
                     className="w-full mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                     </svg>
                     <span>New Chat</span>
                   </button>

                   {/* Chat History */}
                   <div className="space-y-2">
                     <h4 className="text-sm font-medium text-gray-700 mb-3">Previous Chats</h4>
                     
                     {/* Filtered Chat History */}
                     {(() => {
                       const filteredChats = conversations.filter(chat => 
                         chat.title.toLowerCase().includes(searchQuery.toLowerCase())
                       );
                       
                       if (filteredChats.length === 0) {
                         return (
                           <div className="text-center py-8 text-gray-500">
                             <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                             </svg>
                             <p className="text-sm">
                               {searchQuery ? 'No conversations found' : 'No previous conversations'}
                             </p>
                             <p className="text-xs text-gray-400">
                               {searchQuery ? 'Try a different search term' : 'Start chatting to see your history'}
                             </p>
                           </div>
                         );
                       }
                       
                       return (
                          <div className="space-y-1">
                            {filteredChats.map((chat) => (
                              <div 
                                key={chat.id}
                                className={`w-full p-2 rounded-lg transition-colors group cursor-pointer ${
                                  chat.active ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-100'
                                }`}
                                onClick={() => selectChat(chat.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm truncate ${
                                      chat.active ? 'text-blue-800 font-medium' : 'text-gray-800'
                                    }`}>
                                      {chat.title}
                                    </p>
                                    <p className={`text-xs truncate ${
                                      chat.active ? 'text-blue-600' : 'text-gray-500'
                                    }`}>
                                      {chat.timestamp}
                                    </p>
                                    {chat.messages.length > 0 && (
                                      <p className="text-xs text-gray-400 truncate mt-1">
                                        {chat.messages.length} message{chat.messages.length !== 1 ? 's' : ''}
                                      </p>
                                    )}
                                  </div>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteChat(chat.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                                    title="Delete chat"
                                  >
                                    <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                     })()}
                     

                   </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <VoiceChat
          onMoodChange={setCurrentMood}
          currentMood={currentMood}
          onBackToLanding={onBackToLanding}
          onLanguageUpdate={handleLanguageUpdate}
          onUserStatsUpdate={handleUserStatsUpdate}
          onAddMessage={addMessageToCurrentChat}
        />
      </div>

      

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
            <div className="absolute inset-0 bg-gray-50 bg-opacity-80 backdrop-blur-md"></div>
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
                       <span className="text-sm text-gray-700 font-medium">Voice Speed</span>
                                               <select 
                          defaultValue="1.0"
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="0.8" className="text-gray-900">Slow</option>
                          <option value="1.0" className="text-gray-900">Normal</option>
                          <option value="1.2" className="text-gray-900">Fast</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 font-medium">Voice Pitch</span>
                        <select 
                          defaultValue="1.0"
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="0.8" className="text-gray-900">Low</option>
                          <option value="1.0" className="text-gray-900">Normal</option>
                          <option value="1.2" className="text-gray-900">High</option>
                        </select>
                     </div>
                  </div>
                </div>

                {/* Chat Settings */}
                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-3">Chat Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 font-medium">Auto-scroll to bottom</span>
                      <input type="checkbox" className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 font-medium">Show timestamps</span>
                      <input type="checkbox" className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2" defaultChecked />
                    </div>
                  </div>
                </div>

                {/* About */}
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-md font-medium text-gray-800 mb-3">About Aastha AI</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    More Than Just AI, A True Friend. Aastha is designed to make conversations feel natural and engaging. 
                    With voice interaction, mood-based responses, and conversation memory, Aastha adapts to your 
                    personality and needs.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
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
              paddingTop: '80px', // Better mobile visibility - reduced from 120px
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain'
            }}
          >
            <div className="absolute inset-0 bg-gray-50 bg-opacity-80 backdrop-blur-md"></div>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 w-full max-w-4xl max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
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
                    className="absolute top-4 right-4 w-12 h-12 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center transition-all duration-200 text-gray-800 hover:text-black active:bg-gray-100 touch-manipulation shadow-lg"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <X className="w-7 h-7" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 120px)' }}>
                <div className="space-y-4 sm:space-y-6">
                  {/* AI Status & Bond */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 sm:p-4 rounded-lg border">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center">
                      <Brain className="w-4 h-4 sm:w-5 sm:w-5 mr-2 text-blue-600" />
                      AI Status
                    </h4>
                    
                    {/* Real-Time Connection Status */}
                    <div className="mb-3 p-2 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-gray-700">Real-Time Status:</span>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            wsStatus === 'connected' ? 'bg-green-500' : 
                            wsStatus === 'connecting' ? 'bg-yellow-500' : 
                            wsStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
                          }`}></div>
                          <span className={`text-xs font-medium ${
                            wsStatus === 'connected' ? 'text-green-600' : 
                            wsStatus === 'connecting' ? 'text-yellow-600' : 
                            wsStatus === 'error' ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {wsStatus === 'connected' ? 'WebSocket' : 
                             wsStatus === 'connecting' ? 'Connecting...' : 
                             wsStatus === 'error' ? 'Error' : 'Fallback'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-1">
                        <span className="text-gray-600">Last Update:</span>
                        <span className="text-gray-800 font-mono">
                          {new Date(lastUpdate).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    
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
                    
                    {/* Real-Time Controls */}
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isRealTimeEnabled}
                            onChange={(e) => setIsRealTimeEnabled(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-700">Enable Real-Time</span>
                        </label>
                        <select
                          value={updateInterval}
                          onChange={(e) => setUpdateInterval(Number(e.target.value))}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value={2000}>2s</option>
                          <option value={5000}>5s</option>
                          <option value={10000}>10s</option>
                          <option value={30000}>30s</option>
                        </select>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={triggerRealTimeUpdate}
                          className="flex-1 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                        >
                          Update Now
                        </button>
                        <button
                          onClick={() => {
                            if (wsStatus === 'connected') {
                              cleanupWebSocket();
                            } else {
                              initializeWebSocket();
                            }
                          }}
                          className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                            wsStatus === 'connected' 
                              ? 'bg-red-500 text-white hover:bg-red-600' 
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                          {wsStatus === 'connected' ? 'Disconnect' : 'Connect WS'}
                        </button>
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
