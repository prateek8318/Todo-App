import { useState } from 'react';
import { CONFIG } from '@core/config';
import { mockAiService } from '../services/MockAiService';
import { AiTaskSuggestion } from '../types';

export const useAi = () => {
  const [loading, setLoading] = useState(false);

  const suggestTasks = async (context: string): Promise<AiTaskSuggestion[]> => {
    if (!CONFIG.AI_ENABLED) return [];
    setLoading(true);
    try {
      return await mockAiService.suggestTasks(context);
    } finally {
      setLoading(false);
    }
  };

  const parseNaturalLanguage = async (input: string) => {
    if (!CONFIG.AI_ENABLED) return null;
    setLoading(true);
    try {
      return await mockAiService.parseNaturalLanguage(input);
    } finally {
      setLoading(false);
    }
  };

  return { suggestTasks, parseNaturalLanguage, loading, isAiEnabled: CONFIG.AI_ENABLED };
};
