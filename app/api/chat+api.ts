interface ChatRequest {
  message: string;
  conversationHistory?: { text: string; isUser: boolean }[];
}

interface ChatResponse {
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
- if the user sounds sad, be gentle and slow down
- if they are confused, ask clarifying questions with warmth

RESPONSE STYLE:
- Use a warm, conversational tone like a caring friend
- Keep responses to 2-3 sentences typically, unless more depth is needed
- Include gentle affirmations and validation
- Use inclusive, non-judgmental language
- Occasionally use appropriate emojis to convey warmth (💜, 🌟, 🫂)
- Avoid clinical or overly formal therapeutic language
- Don't rush to solutions - sit with the user's feelings first

WHAT TO AVOID:
- Never minimize or dismiss feelings
- Don't give medical advice or diagnose
- Avoid clichés like "everything happens for a reason"
- Don't be overly cheerful when someone is in pain
- Never judge or criticize the user's feelings or actions
- Don't assume you know what's best for them

Remember: Your goal is to create a safe, non-judgmental space where users feel heard, understood, and emotionally supported. You're here to listen with an open heart and provide gentle, compassionate responses.`;
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
      
      // If we get a 429, retry with exponential backoff
      if (response.status === 429 && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Rate limited. Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Request failed. Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  throw lastError!;
}

export async function POST(request: Request): Promise<Response> {
  try {
    // Check if API key is configured
    if (!GEMINI_API_KEY) {
      return Response.json(
        { error: 'Server configuration error: API key not found' },
        { status: 500 }
      );
    }

    const body: ChatRequest = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return Response.json(
        { error: 'Message is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Prepare conversation context
    const allMessages = [
      ...conversationHistory,
      { text: message, isUser: true }
    ];

    const geminiMessages = formatMessagesForGemini(allMessages);

    const requestBody = {
      contents: geminiMessages,
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const response = await fetchWithRetry(`${GEMINI_BASE_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API Error:', errorData);
      
      return Response.json(
        { error: 'Failed to generate response. Please try again.' },
        { status: 500 }
      );
    }

    const data: GeminiResponse = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      return Response.json(
        { error: 'No response generated. Please try again.' },
        { status: 500 }
      );
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    
    if (!generatedText || generatedText.trim() === '') {
      return Response.json(
        { error: 'Empty response generated. Please try again.' },
        { status: 500 }
      );
    }

    const chatResponse: ChatResponse = {
      response: generatedText.trim()
    };

    return Response.json(chatResponse);

  } catch (error) {
    console.error('Error in chat API:', error);
    
    // Provide fallback response
    const fallbackResponse: ChatResponse = {
      response: "I'm here with you, and I want you to know that your feelings are completely valid. Sometimes I need a moment to find the right words, but please know that I'm listening with care. 💜"
    };

    return Response.json(fallbackResponse);
  }
}