interface QuickWin {
  id: string;
  text: string;
  completed: boolean;
  category: 'physical' | 'mental' | 'social' | 'creative' | 'mindful';
}

interface AffirmationResponse {
  text: string;
  type: 'affirmation' | 'proverb' | 'quote' | 'mantra';
  author?: string;
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
  }[];
}

class MoodToolsService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
  private lastAffirmations: string[] = []; // Track recent affirmations to avoid repetition
  private maxHistorySize = 10; // Keep track of last 10 affirmations

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!this.apiKey) {
      throw new Error('Gemini API key not found in environment variables');
    }
  }

  private async makeGeminiRequest(prompt: string): Promise<string> {
    try {
      const requestBody = {
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.9, // Increased for more variety
          topK: 50, // Increased for more diversity
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

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
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
      console.error('Error making Gemini request:', error);
      throw error;
    }
  }

  async generateQuickWins(count: number = 3, timeOfDay: 'morning' | 'afternoon' | 'evening' = 'afternoon'): Promise<QuickWin[]> {
    const timeContext = {
      morning: 'energizing morning activities to start the day positively',
      afternoon: 'refreshing midday activities to boost energy and mood',
      evening: 'calming evening activities for relaxation and reflection'
    };

    const prompt = `Generate ${count} simple, uplifting quick win tasks for someone looking to boost their mood and motivation. These should be ${timeContext[timeOfDay]}.

Requirements:
- Each task should take 5-15 minutes maximum
- Mix different categories: physical movement, mental wellness, social connection, creative expression, and mindfulness
- Make them specific, actionable, and immediately doable
- Focus on small wins that build momentum
- Consider the ${timeOfDay} time context
- Make them feel achievable and rewarding
- Be creative and varied - avoid generic suggestions

Format your response as a JSON array with this structure:
[
  {
    "text": "specific task description",
    "category": "physical|mental|social|creative|mindful"
  }
]

Only return the JSON array, no additional text.`;

    try {
      const response = await this.makeGeminiRequest(prompt);
      
      // Parse the JSON response
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const tasks = JSON.parse(cleanResponse);
      
      // Convert to QuickWin format
      return tasks.map((task: any, index: number) => ({
        id: `ai-${Date.now()}-${index}`,
        text: task.text,
        completed: false,
        category: task.category || 'mental'
      }));

    } catch (error) {
      console.error('Error generating quick wins:', error);
      
      // Fallback quick wins with more variety
      const fallbackTasks = [
        { text: 'Take 5 deep breaths and notice how your body feels', category: 'mindful' },
        { text: 'Write down one thing you accomplished today', category: 'mental' },
        { text: 'Do 10 gentle stretches or jumping jacks', category: 'physical' },
        { text: 'Send a kind message to someone you care about', category: 'social' },
        { text: 'Doodle or sketch something that makes you smile', category: 'creative' },
        { text: 'Organize one small area of your space', category: 'mental' },
        { text: 'Step outside and notice three beautiful things', category: 'mindful' },
        { text: 'Listen to your favorite uplifting song', category: 'mental' },
        { text: 'Write a thank you note to yourself', category: 'mental' },
        { text: 'Dance to one song that makes you happy', category: 'physical' },
        { text: 'Call a friend or family member just to say hi', category: 'social' },
        { text: 'Take photos of things that bring you joy', category: 'creative' },
        { text: 'Practice gratitude by listing 3 good things', category: 'mindful' },
        { text: 'Do a 5-minute meditation or breathing exercise', category: 'mindful' },
        { text: 'Write down a positive affirmation about yourself', category: 'mental' }
      ];

      // Randomly select the requested number of tasks
      const shuffled = fallbackTasks.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count).map((task, index) => ({
        id: `fallback-${Date.now()}-${index}`,
        text: task.text,
        completed: false,
        category: task.category as QuickWin['category']
      }));
    }
  }

  async generateAffirmation(isPremium: boolean = false): Promise<AffirmationResponse> {
    const premiumContext = isPremium 
      ? 'Create a deeply personalized, empowering message that feels like it was written specifically for someone on their unique healing journey.'
      : 'Create an uplifting, universal message that resonates with anyone seeking emotional support.';

    // Add context about avoiding repetition
    const avoidanceContext = this.lastAffirmations.length > 0 
      ? `\n\nIMPORTANT: Avoid creating messages similar to these recent ones: ${this.lastAffirmations.join(' | ')}`
      : '';

    const prompt = `Generate a unique, inspiring message for someone seeking emotional wellness and strength. ${premiumContext}

The message should be one of these types (vary the type for diversity):
1. Personal affirmation (empowering "I am" or "You are" statements)
2. Wisdom proverb (timeless wisdom about resilience, growth, or inner strength)
3. Inspirational quote (motivational message about overcoming challenges)
4. Mindful mantra (short, powerful phrases for meditation)

Requirements:
- Keep it between 10-30 words
- Make it emotionally resonant and genuinely uplifting
- Avoid clichés or overly generic phrases
- BE CREATIVE AND UNIQUE - avoid repetitive themes
- Focus on different aspects: inner strength, self-compassion, resilience, hope, growth, courage, peace, etc.
- Make it feel warm and supportive
- Vary the language style and approach each time
${isPremium ? '- Make it feel personally crafted and unique' : '- Keep it universally relatable'}
${avoidanceContext}

Format your response as JSON:
{
  "text": "the inspiring message",
  "type": "affirmation|proverb|quote|mantra",
  "author": "author name if it's a quote, otherwise null"
}

Only return the JSON object, no additional text.`;

    try {
      const response = await this.makeGeminiRequest(prompt);
      
      // Parse the JSON response
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const affirmation = JSON.parse(cleanResponse);
      
      const result = {
        text: affirmation.text,
        type: affirmation.type || 'affirmation',
        author: affirmation.author || undefined
      };

      // Track this affirmation to avoid repetition
      this.lastAffirmations.push(result.text);
      if (this.lastAffirmations.length > this.maxHistorySize) {
        this.lastAffirmations.shift(); // Remove oldest
      }

      return result;

    } catch (error) {
      console.error('Error generating affirmation:', error);
      
      // Enhanced fallback affirmations with more variety
      const fallbackAffirmations = [
        {
          text: "You are braver than you believe, stronger than you seem, and more loved than you'll ever know.",
          type: 'affirmation' as const,
          author: 'A.A. Milne'
        },
        {
          text: "Your present circumstances don't determine where you can go; they merely determine where you start.",
          type: 'quote' as const,
          author: 'Nido Qubein'
        },
        {
          text: "Progress, not perfection, is the goal.",
          type: 'mantra' as const
        },
        {
          text: "Every small step forward is a victory worth celebrating.",
          type: 'affirmation' as const
        },
        {
          text: "You have been assigned this mountain to show others it can be moved.",
          type: 'proverb' as const,
          author: 'Mel Robbins'
        },
        {
          text: "Your resilience is your superpower, even when you don't feel strong.",
          type: 'affirmation' as const
        },
        {
          text: "Healing takes time, and asking for help is a courageous step.",
          type: 'quote' as const,
          author: 'Mariska Hargitay'
        },
        {
          text: "You are worthy of love and belonging exactly as you are.",
          type: 'affirmation' as const,
          author: 'Brené Brown'
        },
        {
          text: "Sometimes the bravest thing you can do is rest.",
          type: 'proverb' as const
        },
        {
          text: "I am enough, I have enough, I do enough.",
          type: 'mantra' as const
        },
        {
          text: "Your journey is unique, and every step forward matters.",
          type: 'affirmation' as const
        },
        {
          text: "In this moment, you have everything you need to take the next right step.",
          type: 'mantra' as const
        },
        {
          text: "Growth begins at the end of your comfort zone.",
          type: 'proverb' as const
        },
        {
          text: "You are not broken. You are breaking through.",
          type: 'affirmation' as const
        },
        {
          text: "Peace comes from within. Do not seek it without.",
          type: 'quote' as const,
          author: 'Buddha'
        },
        {
          text: "I choose courage over comfort.",
          type: 'mantra' as const
        },
        {
          text: "Your sensitivity is a strength, not a weakness.",
          type: 'affirmation' as const
        },
        {
          text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
          type: 'quote' as const,
          author: 'Ralph Waldo Emerson'
        },
        {
          text: "I am learning to trust my own journey.",
          type: 'mantra' as const
        },
        {
          text: "You don't have to be perfect to be worthy of love.",
          type: 'affirmation' as const
        }
      ];

      // Filter out recently used affirmations if possible
      const availableAffirmations = fallbackAffirmations.filter(
        aff => !this.lastAffirmations.some(recent => recent.includes(aff.text.substring(0, 20)))
      );

      const selectedAffirmations = availableAffirmations.length > 0 ? availableAffirmations : fallbackAffirmations;
      const randomAffirmation = selectedAffirmations[Math.floor(Math.random() * selectedAffirmations.length)];
      
      // Track this fallback affirmation too
      this.lastAffirmations.push(randomAffirmation.text);
      if (this.lastAffirmations.length > this.maxHistorySize) {
        this.lastAffirmations.shift();
      }

      return randomAffirmation;
    }
  }

  async generatePersonalizedQuickWins(userMood: string, completedTasks: string[] = []): Promise<QuickWin[]> {
    const prompt = `Based on the user's current mood: "${userMood}", generate 3 personalized quick win tasks that would be most helpful right now.

Consider:
- Their emotional state and what might lift their spirits
- Avoid suggesting tasks similar to these recently completed ones: ${completedTasks.join(', ')}
- Mix different approaches: physical movement, mental wellness, social connection, creative expression, mindfulness
- Make tasks feel achievable and specifically relevant to their current mood
- Each task should take 5-15 minutes maximum

Format your response as a JSON array:
[
  {
    "text": "specific task description tailored to their mood",
    "category": "physical|mental|social|creative|mindful"
  }
]

Only return the JSON array, no additional text.`;

    try {
      const response = await this.makeGeminiRequest(prompt);
      
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const tasks = JSON.parse(cleanResponse);
      
      return tasks.map((task: any, index: number) => ({
        id: `mood-${Date.now()}-${index}`,
        text: task.text,
        completed: false,
        category: task.category || 'mental'
      }));

    } catch (error) {
      console.error('Error generating personalized quick wins:', error);
      
      // Fallback to regular quick wins
      return this.generateQuickWins(3);
    }
  }
}

export const moodToolsService = new MoodToolsService();
export type { QuickWin, AffirmationResponse };