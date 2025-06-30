interface QuickWinsRequest {
  count?: number;
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
}

interface AffirmationRequest {
  isPremium?: boolean;
}

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

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

// In-memory storage for avoiding repetition (in production, use a database)
let lastAffirmations: string[] = [];
const maxHistorySize = 10;

async function makeGeminiRequest(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('API key not configured');
  }

  const requestBody = {
    contents: [{
      role: 'user',
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature: 0.9,
      topK: 50,
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

  const response = await fetch(`${GEMINI_BASE_URL}?key=${GEMINI_API_KEY}`, {
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
}

// Quick Wins endpoint
export async function POST(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const endpoint = url.searchParams.get('endpoint');

    if (endpoint === 'quick-wins') {
      return await handleQuickWins(request);
    } else if (endpoint === 'affirmation') {
      return await handleAffirmation(request);
    } else {
      return Response.json(
        { error: 'Invalid endpoint. Use ?endpoint=quick-wins or ?endpoint=affirmation' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in mood-tools API:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleQuickWins(request: Request): Promise<Response> {
  try {
    const body: QuickWinsRequest = await request.json().catch(() => ({}));
    const { count = 3, timeOfDay = 'afternoon' } = body;

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
      const response = await makeGeminiRequest(prompt);
      
      // Parse the JSON response
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const tasks = JSON.parse(cleanResponse);
      
      // Convert to QuickWin format
      const quickWins: QuickWin[] = tasks.map((task: any, index: number) => ({
        id: `ai-${Date.now()}-${index}`,
        text: task.text,
        completed: false,
        category: task.category || 'mental'
      }));

      return Response.json({ quickWins });

    } catch (error) {
      console.error('Error generating quick wins:', error);
      
      // Fallback quick wins
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

      const shuffled = fallbackTasks.sort(() => 0.5 - Math.random());
      const quickWins: QuickWin[] = shuffled.slice(0, count).map((task, index) => ({
        id: `fallback-${Date.now()}-${index}`,
        text: task.text,
        completed: false,
        category: task.category as QuickWin['category']
      }));

      return Response.json({ quickWins });
    }
  } catch (error) {
    console.error('Error in quick wins handler:', error);
    return Response.json(
      { error: 'Failed to generate quick wins' },
      { status: 500 }
    );
  }
}

async function handleAffirmation(request: Request): Promise<Response> {
  try {
    const body: AffirmationRequest = await request.json().catch(() => ({}));
    const { isPremium = false } = body;

    const premiumContext = isPremium 
      ? 'Create a deeply personalized, empowering message that feels like it was written specifically for someone on their unique healing journey.'
      : 'Create an uplifting, universal message that resonates with anyone seeking emotional support.';

    const avoidanceContext = lastAffirmations.length > 0 
      ? `\n\nIMPORTANT: Avoid creating messages similar to these recent ones: ${lastAffirmations.join(' | ')}`
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
      const response = await makeGeminiRequest(prompt);
      
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const affirmation = JSON.parse(cleanResponse);
      
      const result: AffirmationResponse = {
        text: affirmation.text,
        type: affirmation.type || 'affirmation',
        author: affirmation.author || undefined
      };

      // Track this affirmation to avoid repetition
      lastAffirmations.push(result.text);
      if (lastAffirmations.length > maxHistorySize) {
        lastAffirmations.shift();
      }

      return Response.json({ affirmation: result });

    } catch (error) {
      console.error('Error generating affirmation:', error);
      
      // Enhanced fallback affirmations
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
        }
      ];

      const availableAffirmations = fallbackAffirmations.filter(
        aff => !lastAffirmations.some(recent => recent.includes(aff.text.substring(0, 20)))
      );

      const selectedAffirmations = availableAffirmations.length > 0 ? availableAffirmations : fallbackAffirmations;
      const randomAffirmation = selectedAffirmations[Math.floor(Math.random() * selectedAffirmations.length)];
      
      lastAffirmations.push(randomAffirmation.text);
      if (lastAffirmations.length > maxHistorySize) {
        lastAffirmations.shift();
      }

      return Response.json({ affirmation: randomAffirmation });
    }
  } catch (error) {
    console.error('Error in affirmation handler:', error);
    return Response.json(
      { error: 'Failed to generate affirmation' },
      { status: 500 }
    );
  }
}