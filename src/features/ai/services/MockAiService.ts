import { AiService, AiTaskSuggestion } from '../types';

export const mockAiService: AiService = {
  suggestTasks: async (context: string) => {
    return [
      { title: 'Review weekly goals', priority: 'medium' },
      { title: 'Follow up on emails', priority: 'high' }
    ];
  },
  breakDownTask: async (taskId: string) => {
    return [
      { title: 'Step 1', priority: 'medium' },
      { title: 'Step 2', priority: 'medium' }
    ];
  },
  parseNaturalLanguage: async (input: string) => {
    return { title: input, priority: 'medium' };
  }
};
