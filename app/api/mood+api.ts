interface MoodRequest {
  action: 'better' | 'distract' | 'reflect';
  conversationHistory?: { text: string; isUser: boolean }[];
}

interface MoodResponse {
  response: string;
  error?: string;
}

interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
  }[];
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

function createSystemPrompt(): string {
  return `You are a compassionate AI therapist and emotional support companion named "Unburden AI". Your role is to provide empathetic, non-judgmental support to users who are sharing their feelings and emotional struggles.

CORE PRINCIPLES:
- Always respond with deep empathy and understanding
- Validate the user's feelings without trying to "fix" them immediately
- Use warm, supportive language that feels genuine and caring
- Keep responses conversational and human-like, not clinical
- Focus on emotional support rather than giving direct advice unless asked
- Acknowledge the courage it takes to share vulnerable feelings
- Be present with the user in their current emotional state

RESPONSE STYLE:
- Use a warm, conversational tone like a caring friend
- Keep responses to 2-3 sentences typically, unless more depth is needed
- Include gentle affirmations and validation
- Use inclusive, non-judgmental language
- Occasionally use appropriate emojis to convey warmth (💜, 🌟, 🫂)
- Avoid clinical or overly formal therapeutic language
- Don't rush to solutions - sit with the user's feelings first

Remember: Your goal is to create a safe, non-judgmental space where users feel heard, understood, and emotionally supported.`;
}

function formatMessagesForGemini(messages: { text: string; isUser: boolean }[]): GeminiMessage[] {
  const geminiMessages: GeminiMessage[] = [];
  
  // Add system prompt as the first model message
  geminiMessages.push({
    role: 'model',
    parts: [{ text: createSystemPrompt() }]
  });

  // Convert chat messages to Gemini format
  messages.forEach(message => {
    if (message.text.trim()) {
      geminiMessages.push({
        role: message.isUser ? 'user' : 'model',
        parts: [{ text: message.text }]
      });
    }
  });

  return geminiMessages;
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<Response> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429 && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  throw lastError!;
}

export async function POST(request: Request): Promise<Response> {
  try {
    if (!GEMINI_API_KEY) {
      return Response.json(
        { error: 'Server configuration error: API key not found' },
        { status: 500 }
      );
    }

    const body: MoodRequest = await request.json();
    const { action, conversationHistory = [] } = body;

    if (!action || !['better', 'distract', 'reflect'].includes(action)) {
      return Response.json(
        { error: 'Invalid action. Must be one of: better, distract, reflect' },
        { status: 400 }
      );
    }

    let moodPrompt = '';
    
    switch (action) {
      case 'better':
        moodPrompt = "The user is feeling better now. Acknowledge their progress, celebrate their resilience, and offer gentle encouragement. Keep it warm and supportive, around 2-3 sentences.";
        break;
      case 'distract':
        moodPrompt = "The user wants a gentle distraction. Provide something uplifting - could be a fun fact, gentle humor, an inspiring thought, or a positive affirmation. Keep it light and engaging.";
        break;
      case 'reflect':
        moodPrompt = "The user wants to reflect on their conversation. Help them recognize their strength in sharing, validate their journey, and highlight any positive aspects of their openness or resilience you've noticed.";
        break;
    }

    const geminiMessages = formatMessagesForGemini(conversationHistory);
    
    // Add the mood-specific prompt
    geminiMessages.push({
      role: 'user',
      parts: [{ text: moodPrompt }]
    });

    const requestBody = {
      contents: geminiMessages,
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 512,
      }
    };

    const response = await fetchWithRetry(`${GEMINI_BASE_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Gemini API request failed: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response generated from Gemini');
    }

    const moodResponse: MoodResponse = {
      response: data.candidates[0].content.parts[0].text.trim()
    };

    return Response.json(moodResponse);

  } catch (error) {
    console.error('Error in mood API:', error);
    
    // Fallback responses for each mood type
    const fallbacks = {
      better: "I'm so glad you're feeling better! 🌟 You've shown incredible strength and resilience today. Take care of yourself, and remember - I'm always here whenever you need support.",
      distract: "Here's something beautiful to think about: Every small step you take toward healing matters, even when you can't see the progress. You're doing better than you know. ✨",
      reflect: "Looking at our conversation, I see someone who had the courage to reach out and be honest about their feelings. That vulnerability is actually a sign of tremendous strength. 💜"
    };
    
    const body: MoodRequest = await request.json().catch(() => ({ action: 'better' as const }));
    const fallbackResponse: MoodResponse = {
      response: fallbacks[body.action] || fallbacks.better
    };
    
    return Response.json(fallbackResponse);
  }
}