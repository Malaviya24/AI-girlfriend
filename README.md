# Aastha AI - More Than Just AI, A True Friend

Aastha AI is a sophisticated, voice-enabled AI companion that makes conversations feel alive and meaningful. Built with Next.js, TypeScript, and modern web technologies, Aastha provides a natural conversation experience with mood-based responses and conversation memory.

## ✨ Features

### 🎭 **Personality & Mood System**
- **9 Different Moods**: Happy, Excited, Loving, Neutral, Sad, Cozy, Energetic, Mysterious, Magical
- **Dynamic Responses**: AI responses change based on selected mood
- **Personality Consistency**: Maintains character across conversations
- **Sentiment Analysis**: Automatically detects user's emotional state and adapts Aastha's personality
- **Intelligent Adaptation**: Aastha becomes cheerful with happy users, caring with sad users, and friendly with neutral users

### 🗣️ **Voice Interaction**
- **Voice Input**: Use your microphone to speak with Aastha
- **Voice Output**: Aastha responds with natural speech synthesis
- **Text Input**: Type messages as an alternative to voice
- **Voice Controls**: Easy-to-use voice recording interface

### 💬 **Conversation Management**
- **Memory Timeline**: View and search through past conversations
- **Context Awareness**: Aastha remembers your conversation history
- **Multiple Chats**: Create and manage different conversation threads
- **Search & Filter**: Find specific conversations quickly

### 📱 **Responsive Design**
- **Mobile-First**: Works perfectly on phones and tablets
- **Desktop Optimized**: Full-featured experience on larger screens
- **Touch Friendly**: Optimized for touch interactions
- **Adaptive Layout**: Automatically adjusts to screen size

### ⚙️ **Customization**
- **Voice Settings**: Adjust speed, pitch, and volume
- **Chat Preferences**: Configure auto-scroll and timestamps
- **Theme & Colors**: Beautiful gradient-based design
- **Accessibility**: Keyboard navigation and screen reader support

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser with microphone support

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd aastha-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### 🧪 Testing Sentiment Analysis

To test Aastha's new sentiment analysis capabilities, try these different types of messages:

**😊 Positive Messages** (Aastha becomes cheerful):
- "I got a promotion today!"
- "I'm so happy about my new puppy!"
- "Everything is going great!"

**💕 Negative Messages** (Aastha becomes caring):
- "I'm feeling really sad today"
- "I had a bad day at work"
- "I'm worried about my health"

**😊 Neutral Messages** (Aastha becomes friendly):
- "What's the weather like?"
- "Tell me about yourself"
- "How does this work?"

Watch the console logs to see the sentiment detection in action! 🎭

## 🏗️ Architecture

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations and transitions
- **Lucide React**: Beautiful, consistent icons

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Prisma ORM**: Database management
- **SQLite**: Local database storage
- **TypeScript**: Full-stack type safety

### Database Schema
- **Users**: User profiles and preferences
- **Conversations**: Chat sessions and metadata
- **Messages**: Individual chat messages with voice support
- **UserPreferences**: Customizable settings

### AI & Sentiment Analysis
- **GPT-4o-mini**: Advanced language model for natural conversations
- **Real-time Sentiment Detection**: Analyzes user messages for emotional content
- **Dynamic Personality Adaptation**: Aastha's tone changes based on detected sentiment:
  - **Positive Sentiment** → Cheerful, excited personality with emojis 😊
  - **Negative Sentiment** → Caring, comforting personality with empathy 💕
  - **Neutral Sentiment** → Friendly, supportive personality with warmth 😊
- **Multi-layered Response System**: Sentiment analysis → Mood-based fallback → Local responses

## 🎯 Core Components

### `Dashboard.tsx`
Main application interface that orchestrates all components

### `VoiceChat.tsx`
Core chat interface with voice input/output capabilities

### `ConversationSidebar.tsx`
Manages conversation history and navigation

### `api/chat/route.ts`
Advanced AI chat endpoint with sentiment analysis:
- **`getAasthaReply()`**: Sentiment detection and dynamic personality adaptation
- **`getAINodeResponse()`**: Mood-based responses with conversation context
- **`generateFallbackResponse()`**: Local fallback responses for offline scenarios

### `MoodSelector.tsx`
Interface for changing Aastha's mood and personality

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY="your_openai_api_key_here"
NEXT_PUBLIC_APP_NAME="Aastha AI"
```

### App Configuration
Modify `src/config/app.ts` to customize:
- Voice settings
- Available moods
- UI dimensions
- API endpoints

## 🎨 Customization

### Adding New Moods
1. Update `src/config/app.ts` with new mood
2. Add mood-specific responses in `src/app/api/chat/route.ts`
3. Update mood icons in `src/components/MoodSelector.tsx`

### Voice Settings
Modify voice parameters in the settings modal:
- Speed: 0.8x to 1.2x
- Pitch: Low, Normal, High
- Volume: Adjustable levels

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect repository to Vercel
3. Deploy automatically

### Other Platforms
- **Netlify**: Compatible with Next.js
- **Railway**: Easy deployment with database
- **Self-hosted**: Docker support available

## 🔮 Future Enhancements

### Planned Features
- **OpenAI Integration**: Real AI responses with GPT models
- **Voice Recognition**: Advanced speech-to-text
- **Emotion Detection**: Automatic mood detection from voice
- **Multi-language Support**: International language support
- **Offline Mode**: Local conversation storage
- **Mobile App**: React Native wrapper

### AI Improvements
- **Context Memory**: Long-term conversation memory
- **Personality Learning**: Adapt to user preferences
- **Voice Cloning**: Custom voice options
- **Smart Suggestions**: Context-aware conversation starters

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Next.js Team**: Amazing React framework
- **Prisma**: Excellent database toolkit
- **Tailwind CSS**: Beautiful utility-first CSS
- **Framer Motion**: Smooth animations
- **Lucide**: Beautiful icon set

## 📞 Support

- **Issues**: Report bugs on GitHub
- **Discussions**: Join community discussions
- **Documentation**: Check the docs folder
- **Email**: Contact the development team

---

**Made with ❤️ by the Aastha AI Team**

*"Your AI companion that truly understands you"*
