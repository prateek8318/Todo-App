export interface AiTaskSuggestion {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface AiService {
  suggestTasks(context: string): Promise<AiTaskSuggestion[]>;
  breakDownTask(taskId: string): Promise<AiTaskSuggestion[]>;
  parseNaturalLanguage(input: string): Promise<Partial<AiTaskSuggestion> | null>;
}
