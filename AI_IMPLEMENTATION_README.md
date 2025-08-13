# Aastha AI - Advanced AI Implementation Guide

This guide explains how to implement the advanced AI features in your Aastha AI project using both the updated backend and frontend components.

## 🚀 What's New

The updated system includes:
- **Advanced AI Chat**: OpenAI-powered responses with personality
- **Memory System**: Permanent and temporary memory storage
- **Bond System**: Relationship building over time
- **Mood Detection**: AI mood changes based on conversation
- **Proactive Messages**: AI initiates conversations
- **Personality Settings**: Adjustable AI personality traits
- **Real-time Updates**: Live status and typing indicators

## 📁 File Structure

```
AI Project/aastha-ai/
├── ai-girlfriend-server-updated.js    # Express backend server
├── package-express.json               # Backend dependencies
├── src/
│   └── components/
│       ├── AasthaChat.tsx            # New advanced chat component
│       ├── Dashboard.tsx             # Existing dashboard
│       └── ...                       # Other existing components
└── AI_IMPLEMENTATION_README.md       # This file
```

## 🔧 Backend Setup

### 1. Install Dependencies

```bash
cd "AI Project/aastha-ai"
npm install express node-fetch dotenv cors body-parser
```

Or use the provided package.json:
```bash
npm install -f package-express.json
```

### 2. Environment Configuration

Create a `.env` file in your project root:
```bash
# .env
OPENAI_API_KEY=your_openai_api_key_here
PORT=4000
```

### 3. Start the Server

```bash
# Start the Express server
node ai-girlfriend-server-updated.js

# Or for development with auto-restart
npx nodemon ai-girlfriend-server-updated.js
```

The server will run on `http://localhost:4000`

## 🎨 Frontend Integration

### 1. Import the New Component

In your main app or dashboard, import the new `AasthaChat` component:

```tsx
import AasthaChat from './components/AasthaChat';

// Use it in your component
<AasthaChat 
  userId="user-123" 
  apiBase="http://localhost:4000"
  onBackToLanding={handleBackToLanding}
/>
```

### 2. Replace or Add to Existing Dashboard

You can either:
- **Replace** the existing chat functionality
- **Add** as a new tab/route
- **Integrate** with your current system

### 3. Update Your Routes

Add a new route for the advanced chat:

```tsx
// In your routing configuration
<Route path="/advanced-chat" element={<AasthaChat onBackToLanding={handleBack} />} />
```

## 🔌 API Endpoints

The Express server provides these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chat` | POST | Send message, get AI response |
| `/poll` | GET | Get queued proactive messages |
| `/memories/:userId` | GET | Get user memories |
| `/memories/mark` | POST | Promote memory to permanent |
| `/memories/delete` | POST | Delete memory |
| `/remember` | POST | Force save memory |
| `/avatar` | GET | Get mood and avatar |
| `/settings` | POST | Update user settings |
| `/status` | GET | Get user status |

## 🧠 AI Features Explained

### 1. Memory System
- **Temporary**: Short-term conversation memory (7 days)
- **Permanent**: Long-term important memories
- **Smart Promotion**: Automatically promotes emotional or repeated content

### 2. Bond System
- **Range**: 0-100 scale
- **Increases**: Positive interactions, emotional messages
- **Decreases**: Negative interactions, ignoring

### 3. Mood Detection
- **Triggers**: Keywords, time of day, user activity
- **Moods**: happy, romantic, playful, supportive, curious, etc.
- **Influence**: Affects AI response style and proactive messages

### 4. Personality Settings
- **Playfulness**: How fun and silly the AI is
- **Romantic**: How affectionate and loving
- **Talkative**: How chatty and engaging
- **Caring**: How supportive and empathetic

## 🎯 Usage Examples

### Basic Chat
```tsx
<AasthaChat 
  userId="john-doe"
  apiBase="http://localhost:4000"
  onBackToLanding={() => navigate('/')}
/>
```

### Custom Configuration
```tsx
<AasthaChat 
  userId="custom-user"
  apiBase="https://your-api-domain.com"
  onBackToLanding={handleBack}
/>
```

## 🔄 Migration from Old System

### 1. Keep Existing Components
Your current `Dashboard.tsx` and other components remain unchanged.

### 2. Add New Route
Add the advanced chat as a new feature rather than replacing existing functionality.

### 3. Gradual Integration
- Start with the new chat component
- Test thoroughly
- Gradually migrate features as needed

## 🐛 Troubleshooting

### Common Issues

1. **Server won't start**
   - Check if port 4000 is available
   - Verify OpenAI API key in `.env`
   - Install all dependencies

2. **Frontend can't connect**
   - Ensure Express server is running
   - Check CORS settings
   - Verify API base URL

3. **AI responses not working**
   - Check OpenAI API key
   - Verify API quota/limits
   - Check server logs for errors

### Debug Mode

Enable debug logging:
```bash
LOG_LEVEL=debug node ai-girlfriend-server-updated.js
```

## 🚀 Advanced Customization

### 1. Custom AI Models
Modify the `generateChatReply` function to use different AI providers:
```javascript
// Example: Use Anthropic Claude
const res = await fetch("https://api.anthropic.com/v1/messages", {
  // ... configuration
});
```

### 2. Custom Memory Storage
Replace file-based storage with database:
```javascript
// Example: Use PostgreSQL
const { Pool } = require('pg');
const pool = new Pool({ /* config */ });
```

### 3. Custom Personality
Modify the `systemPersonaPrompt` function:
```javascript
function systemPersonaPrompt(userId) {
  return {
    role: "system",
    content: `You are [Custom Name], a [custom description]...`
  };
}
```

## 📊 Performance Considerations

- **Memory Management**: Automatically prunes old temporary memories
- **Polling**: Configurable intervals for proactive messages
- **Caching**: In-memory storage for active conversations
- **Scalability**: Stateless design allows horizontal scaling

## 🔒 Security Notes

- **API Keys**: Never commit `.env` files
- **User Input**: Sanitize all user inputs
- **Rate Limiting**: Consider adding rate limiting for production
- **CORS**: Configure CORS properly for production domains

## 🎉 Next Steps

1. **Test the basic setup** with the Express server
2. **Integrate the frontend component** into your app
3. **Customize the AI personality** to match your vision
4. **Add more features** like voice chat, image generation, etc.
5. **Deploy to production** with proper security measures

## 📞 Support

If you encounter issues:
1. Check the server logs
2. Verify all dependencies are installed
3. Ensure environment variables are set correctly
4. Test API endpoints individually

## 🔗 Related Files

- `ai-girlfriend-server-updated.js` - Backend server
- `src/components/AasthaChat.tsx` - Frontend component
- `package-express.json` - Backend dependencies
- Your existing Next.js app structure

---

**Happy coding! 🚀✨**
