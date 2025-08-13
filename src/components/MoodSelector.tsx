'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Smile, 
  Frown, 
  Meh, 
  Zap, 
  Heart, 
  Coffee, 
  Sun, 
  Moon,
  Sparkles,
  X
} from 'lucide-react';

interface Mood {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

interface MoodSelectorProps {
  currentMood: string;
  onMoodChange: (mood: string) => void;
  onClose?: () => void;
}

const moods: Mood[] = [
  {
    id: 'happy',
    name: 'Happy',
    icon: <Smile className="w-5 h-5" />,
    color: 'from-yellow-400 to-orange-400',
    description: 'Cheerful and enthusiastic'
  },
  {
    id: 'excited',
    name: 'Excited',
    icon: <Zap className="w-5 h-5" />,
    color: 'from-pink-400 to-purple-400',
    description: 'Energetic and passionate'
  },
  {
    id: 'loving',
    name: 'Loving',
    icon: <Heart className="w-5 h-5" />,
    color: 'from-red-400 to-pink-400',
    description: 'Warm and caring'
  },
  {
    id: 'neutral',
    name: 'Neutral',
    icon: <Meh className="w-5 h-5" />,
    color: 'from-gray-400 to-gray-500',
    description: 'Balanced and calm'
  },
  {
    id: 'sad',
    name: 'Sad',
    icon: <Frown className="w-5 h-5" />,
    color: 'from-blue-400 to-indigo-400',
    description: 'Gentle and supportive'
  },
  {
    id: 'cozy',
    name: 'Cozy',
    icon: <Coffee className="w-5 h-5" />,
    color: 'from-amber-400 to-brown-400',
    description: 'Comforting and relaxed'
  },
  {
    id: 'energetic',
    name: 'Energetic',
    icon: <Sun className="w-5 h-5" />,
    color: 'from-yellow-300 to-green-400',
    description: 'Dynamic and motivating'
  },
  {
    id: 'mysterious',
    name: 'Mysterious',
    icon: <Moon className="w-5 h-5" />,
    color: 'from-purple-500 to-indigo-600',
    description: 'Intriguing and deep'
  },
  {
    id: 'magical',
    name: 'Magical',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'from-purple-400 to-pink-500',
    description: 'Wonderful and enchanting'
  }
];

export default function MoodSelector({ currentMood, onMoodChange, onClose }: MoodSelectorProps) {
  const currentMoodData = moods.find(mood => mood.id === currentMood) || moods[3]; // default to neutral

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm relative">
      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close mood selector"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      )}
      
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Aastha's Mood</h3>
        <p className="text-sm text-gray-600">Change how I respond to you</p>
      </div>

      {/* Current Mood Display */}
      <div className="mb-4">
        <div className="text-center">
          <motion.div
            className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-r ${currentMoodData.color} flex items-center justify-center text-white mb-2`}
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {currentMoodData.icon}
          </motion.div>
          <h4 className="text-base font-medium text-gray-800 mb-1">
            {currentMoodData.name}
          </h4>
          <p className="text-xs text-gray-600">
            {currentMoodData.description}
          </p>
        </div>
      </div>

      {/* Mood Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {moods.map((mood) => (
          <motion.button
            key={mood.id}
            onClick={() => onMoodChange(mood.id)}
            className={`p-2 rounded-lg border-2 transition-all duration-200 ${
              currentMood === mood.id
                ? `border-purple-500 bg-purple-50`
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-center">
              <div className={`w-6 h-6 mx-auto rounded-full bg-gradient-to-r ${mood.color} flex items-center justify-center text-white mb-1`}>
                {mood.icon}
              </div>
              <span className="text-xs font-medium text-gray-700">
                {mood.name}
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Compact Mood Description */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <h5 className="text-xs font-medium text-gray-800 mb-2">How mood affects responses:</h5>
        <div className="text-xs text-gray-600 grid grid-cols-2 gap-1">
          <span>• <strong>Happy/Excited:</strong> Enthusiastic</span>
          <span>• <strong>Loving/Cozy:</strong> Caring</span>
          <span>• <strong>Neutral:</strong> Balanced</span>
          <span>• <strong>Sad:</strong> Supportive</span>
          <span>• <strong>Energetic:</strong> Motivating</span>
          <span>• <strong>Mysterious:</strong> Creative</span>
        </div>
      </div>
    </div>
  );
}
