'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Mic,
  Heart,
  Brain,
  Smartphone,
  Zap,
  ArrowRight,
  MessageSquare,
  Settings,
  Users
} from 'lucide-react';
import Dashboard from '../components/Dashboard';

export default function Home() {
  const [showDashboard, setShowDashboard] = useState(false);

  if (showDashboard) {
    return <Dashboard onBackToLanding={() => setShowDashboard(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold text-gray-800">Aastha AI</span>
            </div>
            <button
              onClick={() => setShowDashboard(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium"
            >
              Start Chatting
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Your Personal AI Companion</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Meet <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Aastha</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Conversations that feel alive, with your personal AI friend.
            </p>
                               <div className="flex justify-center">
                     <button
                       onClick={() => setShowDashboard(true)}
                       className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium text-lg flex items-center justify-center space-x-2"
                     >
                       <span>Start Your Journey</span>
                       <ArrowRight className="w-5 h-5" />
                     </button>
                   </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mic className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Voice Chat</h3>
                  <p className="text-gray-600 text-sm">Natural voice interaction</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Mood Based</h3>
                  <p className="text-gray-600 text-sm">9 different personalities</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Memory</h3>
                  <p className="text-gray-600 text-sm">Remembers your chats</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Aastha AI?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore the unique features that make Aastha your trusted AI friend.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Mic className="w-8 h-8" />,
                title: "Voice-First Experience",
                description: "Talk naturally with Aastha using your voice. No typing required for a truly conversational experience.",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: <Heart className="w-8 h-8" />,
                title: "9 Mood Personalities",
                description: "From happy and excited to mysterious and magical. Change Aastha's mood to match your energy.",
                color: "from-pink-500 to-red-500"
              },
              {
                icon: <Brain className="w-8 h-8" />,
                title: "Conversation Memory",
                description: "Aastha remembers your chats and builds context over time, making conversations more meaningful.",
                color: "from-blue-500 to-purple-500"
              },
              {
                icon: <Smartphone className="w-8 h-8" />,
                title: "Mobile Responsive",
                description: "Works perfectly on all devices - from your phone to your desktop. Always accessible.",
                color: "from-green-500 to-blue-500"
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Real-time AI",
                description: "Powered by advanced AI models for intelligent, contextual responses that feel human.",
                color: "from-yellow-500 to-orange-500"
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Personal Companion",
                description: "Designed to be your personal AI friend who understands you and grows with you.",
                color: "from-indigo-500 to-purple-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center text-white mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Meet Your AI Companion?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join thousands of users who have already discovered the joy of chatting with Aastha AI
            </p>
            <button
              onClick={() => setShowDashboard(true)}
              className="bg-white text-purple-600 px-8 py-4 rounded-full hover:bg-gray-100 transition-all duration-200 font-medium text-lg flex items-center justify-center space-x-2 mx-auto"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Start Chatting Now</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="text-xl font-bold">Aastha AI</span>
              </div>
              <p className="text-gray-400">
                Conversations that feel alive, with your personal AI friend.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Voice Chat</li>
                <li>Mood System</li>
                <li>Memory</li>
                <li>Mobile Ready</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Technology</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Next.js 15</li>
                <li>TypeScript</li>
                <li>Tailwind CSS</li>
                <li>Prisma ORM</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>GitHub</li>
                <li>Support</li>
                <li>Feedback</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Aastha AI. Made with ❤️ for meaningful AI conversations.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
