// components/DashboardWithAdvancedChat.tsx
// Example of how to integrate the new AasthaChat with existing Dashboard

'use client';

import React, { useState } from 'react';
import Dashboard from './Dashboard';
import AasthaChat from './AasthaChat';

export default function DashboardWithAdvancedChat({ onBackToLanding }: { onBackToLanding: () => void }) {
  const [currentView, setCurrentView] = useState<'dashboard' | 'advanced-chat'>('dashboard');

  const handleBackToLanding = () => {
    onBackToLanding();
  };

  const switchToAdvancedChat = () => {
    setCurrentView('advanced-chat');
  };

  const switchToDashboard = () => {
    setCurrentView('dashboard');
  };

  if (currentView === 'advanced-chat') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header with navigation */}
        <div className="bg-white shadow-sm border-b p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={switchToDashboard}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-800">Advanced AI Chat</h1>
            </div>
            
            <button 
              onClick={handleBackToLanding}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Back to Landing
            </button>
          </div>
        </div>

        {/* Advanced Chat Component */}
        <AasthaChat 
          userId="aastha-user-1"
          apiBase="http://localhost:4000"
          onBackToLanding={handleBackToLanding}
        />
      </div>
    );
  }

  // Original Dashboard with added button
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleBackToLanding}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">Aastha AI</h1>
                <p className="text-sm text-gray-600">Choose your experience</p>
              </div>
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={switchToAdvancedChat}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🚀 Try Advanced AI Chat
            </button>
          </div>
        </div>
      </div>

      {/* Original Dashboard Content */}
      <Dashboard onBackToLanding={handleBackToLanding} />
    </div>
  );
}

// Alternative: Add as a tab within the existing Dashboard
export function DashboardWithTabs({ onBackToLanding }: { onBackToLanding: () => void }) {
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={onBackToLanding}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">Aastha AI</h1>
                <p className="text-sm text-gray-600">More Than Just AI, A True Friend</p>
              </div>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'basic'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              💬 Basic Chat
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'advanced'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🚀 Advanced AI Chat
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto p-4">
        {activeTab === 'basic' ? (
          <Dashboard onBackToLanding={onBackToLanding} />
        ) : (
          <AasthaChat 
            userId="aastha-user-1"
            apiBase="http://localhost:4000"
            onBackToLanding={onBackToLanding}
          />
        )}
      </div>
    </div>
  );
}
