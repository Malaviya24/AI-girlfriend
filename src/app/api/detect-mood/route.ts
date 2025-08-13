import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Simple, human-like mood detection
    const lowerMessage = message.toLowerCase();
    
    let detectedMood = 'neutral';
    
    // Natural mood detection based on real human expressions
    if (lowerMessage.includes('happy') || lowerMessage.includes('great') || lowerMessage.includes('amazing') || 
        lowerMessage.includes('excited') || lowerMessage.includes('wonderful') || lowerMessage.includes('fantastic') ||
        lowerMessage.includes('😊') || lowerMessage.includes('😄') || lowerMessage.includes('🎉') || 
        lowerMessage.includes('✨') || lowerMessage.includes('🥳')) {
      detectedMood = 'happy';
    } else if (lowerMessage.includes('sad') || lowerMessage.includes('down') || lowerMessage.includes('hurt') ||
               lowerMessage.includes('crying') || lowerMessage.includes('depressed') || lowerMessage.includes('lonely') ||
               lowerMessage.includes('😢') || lowerMessage.includes('💔') || lowerMessage.includes('💙')) {
      detectedMood = 'sad';
    } else if (lowerMessage.includes('love') || lowerMessage.includes('care') || lowerMessage.includes('sweet') ||
               lowerMessage.includes('dear') || lowerMessage.includes('darling') || lowerMessage.includes('miss') ||
               lowerMessage.includes('❤️') || lowerMessage.includes('💕') || lowerMessage.includes('💖')) {
      detectedMood = 'loving';
    } else if (lowerMessage.includes('stress') || lowerMessage.includes('worried') || lowerMessage.includes('anxious') ||
               lowerMessage.includes('overwhelmed') || lowerMessage.includes('tired') || lowerMessage.includes('exhausted') ||
               lowerMessage.includes('😰') || lowerMessage.includes('😓')) {
      detectedMood = 'stressed';
    } else if (lowerMessage.includes('cozy') || lowerMessage.includes('comfort') || lowerMessage.includes('peaceful') ||
               lowerMessage.includes('relaxed') || lowerMessage.includes('calm') || lowerMessage.includes('warm') ||
               lowerMessage.includes('☕') || lowerMessage.includes('🧸') || lowerMessage.includes('🌙')) {
      detectedMood = 'cozy';
    } else if (lowerMessage.includes('energy') || lowerMessage.includes('motivated') || lowerMessage.includes('pumped') ||
               lowerMessage.includes('strong') || lowerMessage.includes('powerful') || lowerMessage.includes('focused') ||
               lowerMessage.includes('💪') || lowerMessage.includes('🔥') || lowerMessage.includes('⚡')) {
      detectedMood = 'energetic';
    }

    // Aastha's natural response to the detected mood
    const moodResponse = {
      happy: "I'm literally so happy you're feeling good! Your energy is contagious and I love it! ✨",
      sad: "Oh honey, I can feel how much you're hurting and it's breaking my heart. I'm here for you, always. 💙",
      loving: "I'm feeling so much love for you right now! You're literally the best friend anyone could ask for! 💕",
      stressed: "I can feel your stress and I want to help you through this. We've got this together! 💪",
      cozy: "I'm feeling so cozy and peaceful today too! There's nothing better than feeling warm and safe. ☕",
      energetic: "I'm literally so pumped up right now! Your energy is amazing and I love it! 🔥",
      neutral: "I'm feeling pretty balanced today! Just enjoying our conversation and being here with you! 🙂"
    };

    return NextResponse.json({
      mood: detectedMood,
      aasthaResponse: moodResponse[detectedMood as keyof typeof moodResponse],
      personality: {
        name: "Aastha",
        age: "24",
        currentFeeling: moodResponse[detectedMood as keyof typeof moodResponse],
        interests: ["coffee", "design", "painting", "travel", "movies", "music"],
        speakingStyle: "casual and friendly, like your best friend"
      }
    });

  } catch (error) {
    console.error('Error in mood detection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
