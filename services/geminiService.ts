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

class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!this.apiKey) {
      throw new Error('Gemini API key not found in environment variables');
    }
  }

  private async _fetchWithRetry(
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

  private createSystemPrompt(): string {
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

  private formatMessagesForGemini(messages: { text: string; isUser: boolean }[]): GeminiMessage[] {
    const geminiMessages: GeminiMessage[] = [];
    
    // Add system prompt as the first model message
    geminiMessages.push({
      role: 'model',
      parts: [{ text: this.createSystemPrompt() }]
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

  async generateResponse(
    currentMessage: string, 
    conversationHistory: { text: string; isUser: boolean }[] = []
  ): Promise<string> {
    try {
      // Prepare conversation context
      const allMessages = [
        ...conversationHistory,
        { text: currentMessage, isUser: true }
      ];

      const geminiMessages = this.formatMessagesForGemini(allMessages);

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

      const response = await this._fetchWithRetry(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Gemini API Error:', errorData);
        throw new Error(`Gemini API request failed: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated from Gemini');
      }

      const generatedText = data.candidates[0].content.parts[0].text;
      
      if (!generatedText || generatedText.trim() === '') {
        throw new Error('Empty response from Gemini');
      }

      return generatedText.trim();

    } catch (error) {
      console.error('Error generating Gemini response:', error);
      
      // Fallback responses for different error scenarios
      if (error instanceof Error) {
        if (error.message.includes('API request failed')) {
          return "I'm having trouble connecting right now, but I want you to know that I'm here for you. Your feelings are valid and important. 💜";
        }
        if (error.message.includes('No response generated')) {
          return "I'm listening and I care about what you're going through. Sometimes I need a moment to find the right words, but please know that your feelings matter deeply to me.";
        }
      }
      
      // Generic fallback
      return "I hear you, and I want you to know that sharing your feelings takes real courage. I'm here to support you through whatever you're experiencing. 💜";
    }
  }

  // Special responses for mood-based interactions
  async generateMoodResponse(moodAction: 'better' | 'distract' | 'reflect', conversationHistory: { text: string; isUser: boolean }[] = []): Promise<string> {
    let moodPrompt = '';
    
    switch (moodAction) {
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

    try {
      const geminiMessages = this.formatMessagesForGemini(conversationHistory);
      
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

      const response = await this._fetchWithRetry(`${this.baseUrl}?key=${this.apiKey}`, {
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

      return data.candidates[0].content.parts[0].text.trim();

    } catch (error) {
      console.error('Error generating mood response:', error);
      
      // Fallback responses for each mood type
      const fallbacks = {
        better: "I'm so glad you're feeling better! 🌟 You've shown incredible strength and resilience today. Take care of yourself, and remember - I'm always here whenever you need support.",
        distract: "Here's something beautiful to think about: Every small step you take toward healing matters, even when you can't see the progress. You're doing better than you know. ✨",
        reflect: "Looking at our conversation, I see someone who had the courage to reach out and be honest about their feelings. That vulnerability is actually a sign of tremendous strength. 💜"
      };
      
      return fallbacks[moodAction];
    }
  }
}

export const geminiService = new GeminiService();