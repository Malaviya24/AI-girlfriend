export const APP_CONFIG = {
  name: 'Aastha AI',
  version: '1.0.0',
  description: 'Your Personal AI Companion',
  
  // Voice settings
  voice: {
    speed: 1.0,
    pitch: 1.1,
    volume: 0.8,
  },
  
  // Mood settings
  defaultMood: 'neutral',
  availableMoods: [
    'happy', 'excited', 'loving', 'neutral', 
    'sad', 'cozy', 'energetic', 'mysterious', 'magical'
  ],
  
  // UI settings
  ui: {
    sidebarWidth: 320,
    collapsedSidebarWidth: 80,
    mobileBreakpoint: 768,
  },
  
  // API settings
  api: {
    chatEndpoint: '/api/chat',
    timeout: 10000,
  }
};

export const MOOD_DESCRIPTIONS = {
  happy: 'Cheerful and enthusiastic',
  excited: 'Energetic and passionate',
  loving: 'Warm and caring',
  neutral: 'Balanced and calm',
  sad: 'Gentle and supportive',
  cozy: 'Comforting and relaxed',
  energetic: 'Dynamic and motivating',
  mysterious: 'Intriguing and deep',
  magical: 'Wonderful and enchanting'
};
