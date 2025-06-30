interface ChatRequest {
  message: string;
  conversationHistory?: { text: string; isUser: boolean }[];
}

interface ChatResponse {
  response: string;
  error?: string;
}

interface MoodRequest {
  action: 'better' | 'distract' | 'reflect';
  conversationHistory?: { text: string; isUser: boolean }[];
}

interface MoodResponse {
  response: string;
  error?: string;
}

interface QuickWinsRequest {
  count?: number;
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
}

interface QuickWin {
  id: string;
  text: string;
  completed: boolean;
  category: 'physical' | 'mental' | 'social' | 'creative' | 'mindful';
}

interface AffirmationRequest {
  isPremium?: boolean;
}

interface AffirmationResponse {
  text: string;
  type: 'affirmation' | 'proverb' | 'quote' | 'mantra';
  author?: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    // Use relative URLs for API routes
    this.baseUrl = '';
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async generateChatResponse(
    message: string, 
    conversationHistory: { text: string; isUser: boolean }[] = []
  ): Promise<string> {
    try {
      const requestBody: ChatRequest = {
        message,
        conversationHistory
      };

      const response = await this.makeRequest<ChatResponse>('/api/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      return response.response;
    } catch (error) {
      console.error('Error generating chat response:', error);
      
      // Fallback response
      return "I'm here with you, and I want you to know that your feelings are completely valid. Sometimes I need a moment to find the right words, but please know that I'm listening with care. 💜";
    }
  }

  async generateMoodResponse(
    action: 'better' | 'distract' | 'reflect', 
    conversationHistory: { text: string; isUser: boolean }[] = []
  ): Promise<string> {
    try {
      const requestBody: MoodRequest = {
        action,
        conversationHistory
      };

      const response = await this.makeRequest<MoodResponse>('/api/mood', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      return response.response;
    } catch (error) {
      console.error('Error generating mood response:', error);
      
      // Fallback responses
      const fallbacks = {
        better: "I'm so glad you're feeling better! 🌟 You've shown incredible strength and resilience today. Take care of yourself, and remember - I'm always here whenever you need support.",
        distract: "Here's something beautiful to think about: Every small step you take toward healing matters, even when you can't see the progress. You're doing better than you know. ✨",
        reflect: "Looking at our conversation, I see someone who had the courage to reach out and be honest about their feelings. That vulnerability is actually a sign of tremendous strength. 💜"
      };
      
      return fallbacks[action];
    }
  }

  async generateQuickWins(
    count: number = 3, 
    timeOfDay: 'morning' | 'afternoon' | 'evening' = 'afternoon'
  ): Promise<QuickWin[]> {
    try {
      const requestBody: QuickWinsRequest = {
        count,
        timeOfDay
      };

      const response = await this.makeRequest<{ quickWins: QuickWin[] }>('/api/mood-tools?endpoint=quick-wins', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      return response.quickWins;
    } catch (error) {
      console.error('Error generating quick wins:', error);
      
      // Fallback quick wins
      const fallbackTasks = [
        { text: 'Take 5 deep breaths and notice how your body feels', category: 'mindful' },
        { text: 'Write down one thing you accomplished today', category: 'mental' },
        { text: 'Do 10 gentle stretches or jumping jacks', category: 'physical' },
        { text: 'Send a kind message to someone you care about', category: 'social' },
        { text: 'Doodle or sketch something that makes you smile', category: 'creative' },
      ];

      return fallbackTasks.slice(0, count).map((task, index) => ({
        id: `fallback-${Date.now()}-${index}`,
        text: task.text,
        completed: false,
        category: task.category as QuickWin['category']
      }));
    }
  }

  async generateAffirmation(isPremium: boolean = false): Promise<AffirmationResponse> {
    try {
      const requestBody: AffirmationRequest = {
        isPremium
      };

      const response = await this.makeRequest<{ affirmation: AffirmationResponse }>('/api/mood-tools?endpoint=affirmation', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      return response.affirmation;
    } catch (error) {
      console.error('Error generating affirmation:', error);
      
      // Fallback affirmation
      return {
        text: "You are worthy of love and belonging exactly as you are.",
        type: 'affirmation',
        author: 'Brené Brown'
      };
    }
  }
}

export const apiService = new ApiService();
export type { QuickWin, AffirmationResponse };