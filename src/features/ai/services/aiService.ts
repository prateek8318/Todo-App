import { OPENAI_API_KEY } from '@env';
import { Task, TaskPriority } from '@features/tasks/types';

// Loaded from the ignored local .env file at build time.
export const AI_CONFIG = { apiKey: OPENAI_API_KEY ?? '' };

const getApiKey = (): string => {
  const key = AI_CONFIG.apiKey || (globalThis as typeof globalThis & { OPENAI_API_KEY?: string }).OPENAI_API_KEY;
  return typeof key === 'string' ? key.trim() : '';
};

const INSIGHT_FALLBACK = 'Aaj ka din shandaar hai, ek ek karke apne tasks niptao aur aage badho!';
const FINANCE_FALLBACK = 'Abhi AI advice available nahi hai. Apne income, expenses aur pending splits ko yahin track karte raho.';

export interface AITaskSuggestion {
  title: string;
  description: string;
  priority: TaskPriority;
  dueAt?: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// Missing credentials, HTTP errors, refusals and malformed responses are normal
// unavailable states, not exceptions to display in React Native's error overlay.
async function requestContent(prompt: string, temperature: number): Promise<string | null> {
  const key = getApiKey();
  if (!key) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key.trim()}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], temperature }),
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    if (!isRecord(data) || data.error || !Array.isArray(data.choices)) return null;
    const choice: unknown = data.choices[0];
    if (!isRecord(choice) || !isRecord(choice.message)) return null;
    const content = choice.message.content;
    return typeof content === 'string' && content.trim() ? content.trim() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export const aiService = {
  isConfigured: (): boolean => !!getApiKey(),
  generateDailyInsight: async (tasks: Task[]): Promise<string> => {
    const openTasks = tasks.filter(task => !task.completed).map(task => ({ title: task.title, priority: task.priority }));
    const prompt = `You are a productivity coach. The user has these pending tasks: ${JSON.stringify(openTasks)}.
      Give a short 2-sentence motivational advice in Hinglish (Hindi written in English alphabet) on how they should tackle their day. Keep it friendly and concise.`;
    return (await requestContent(prompt, 0.7)) ?? INSIGHT_FALLBACK;
  },

  generateFinancialAdvice: async (income: number, expense: number, splitOwed: number): Promise<string> => {
    const prompt = `You are a smart financial advisor.
      The user's monthly income is INR ${income}, their total expenses so far are INR ${expense}, and friends owe them INR ${splitOwed}.
      Generate a practical "Smart Budget Plan" using the 50-30-20 rule or similar logic.
      Write a helpful, constructive 2-3 sentence advice in Hinglish (Hindi written in English alphabet) explaining how they should allocate their remaining salary and manage expenses/splits to save better.`;
    return (await requestContent(prompt, 0.5)) ?? FINANCE_FALLBACK;
  },

  parseTaskFromText: async (text: string): Promise<AITaskSuggestion | null> => {
    if (!text.trim()) return null;
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
    const content = await requestContent(prompt, 0.3);
    if (!content) return null;
    try {
      const cleanJson = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
      const parsed: unknown = JSON.parse(cleanJson);
      if (!isRecord(parsed) || typeof parsed.title !== 'string' || !parsed.title.trim()) return null;
      const priority: TaskPriority = parsed.priority === 'low' || parsed.priority === 'high' ? parsed.priority : 'medium';
      const dueAt = typeof parsed.dueAt === 'string' ? Date.parse(parsed.dueAt) : NaN;
      return {
        title: parsed.title.trim(),
        description: typeof parsed.description === 'string' ? parsed.description.trim() : '',
        priority,
        dueAt: Number.isFinite(dueAt) ? dueAt : undefined,
      };
    } catch {
      return null;
    }
  },
};
