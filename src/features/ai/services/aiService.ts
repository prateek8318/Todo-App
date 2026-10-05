import { Task, TaskPriority } from '@features/tasks/types';

const OPENAI_API_KEY = (globalThis as typeof globalThis & { OPENAI_API_KEY?: string }).OPENAI_API_KEY ?? '';

export interface AITaskSuggestion {
  title: string;
  description: string;
  priority: TaskPriority;
  dueAt?: number;
}

export const aiService = {
  /**
   * Generates a personalized insight/motivational message based on current tasks
   */
  generateDailyInsight: async (tasks: Task[]): Promise<string> => {
    try {
      const openTasks = tasks.filter(t => !t.completed).map(t => ({ title: t.title, priority: t.priority }));
      
      const prompt = `You are a productivity coach. The user has these pending tasks: ${JSON.stringify(openTasks)}. 
      Give a short 2-sentence motivational advice in Hinglish (Hindi written in English alphabet) on how they should tackle their day. Keep it friendly and concise.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        })
      });

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('AI Insight Error:', error);
      return 'Aaj ka din shandaar hai, ek ek karke apne tasks niptao aur aage badho!';
    }
  },

  /**
   * Generates a constructive budget plan (50-30-20 rule) and financial advice
   */
  generateFinancialAdvice: async (income: number, expense: number, splitOwed: number): Promise<string> => {
    try {
      const prompt = `You are a smart financial advisor.
      The user's monthly income is ₹${income}, their total expenses so far are ₹${expense}, and friends owe them ₹${splitOwed}.
      Generate a practical "Smart Budget Plan" using the 50-30-20 rule or similar logic. 
      Write a helpful, constructive 2-3 sentence advice in Hinglish (Hindi written in English alphabet) explaining how they should allocate their remaining salary and manage expenses/splits to save better.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
        })
      });

      const data = await response.json();
      if(data.error) return 'Bhai pehle apni OpenAI API key fix karle, tere financial AI advisor ka connection cut gaya hai! 😅';
      return data.choices[0].message.content.trim();
    } catch (error) {
      return 'Bhai tera hisaab itna tagda hai ki mera system hang ho gaya. API Key check karle!';
    }
  },

  /**
   * Parses natural language into a structured task
   */
  parseTaskFromText: async (text: string): Promise<AITaskSuggestion | null> => {
    try {
      const prompt = `You are a helpful AI assistant in a To-Do app. 
      The user entered this task: "${text}".
      Extract the details and return ONLY a JSON object with this exact structure:
      {
        "title": "Clear task title",
        "description": "Generate a short 1-2 sentence helpful description, tip, or mini-steps for this task. ALWAYS provide this to help the user, even if they didn't specify one.",
        "priority": "low" | "medium" | "high",
        "dueAt": "ISO date string if a time/date is mentioned, otherwise null"
      }
      Assume current date/time is ${new Date().toISOString()}. No markdown, just pure JSON.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
        })
      });

      const data = await response.json();
      const content = data.choices[0].message.content.trim();
      // Remove any potential markdown block backticks
      const cleanJson = content.replace(/```json/g, '').replace(/```/g, '');
      const parsed = JSON.parse(cleanJson);

      return {
        title: parsed.title,
        description: parsed.description,
        priority: parsed.priority || 'medium',
        dueAt: parsed.dueAt ? new Date(parsed.dueAt).getTime() : undefined,
      };
    } catch (error) {
      console.error('AI Parse Task Error:', error);
      return null;
    }
  }
};
