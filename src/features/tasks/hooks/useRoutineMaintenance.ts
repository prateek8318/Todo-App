import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useTaskStore } from '../store/taskStore';
import { useSettingsStore } from '@features/settings/store/useSettingsStore';
import { reminderService } from '../services/reminderService';
import { NotificationService } from '@core/notifications/NotificationService';

export const useRoutineMaintenance = () => {
  const tasks = useTaskStore(state => state.tasks);
  const hydrated = useTaskStore(state => state._hasHydrated);
  const enabled = useSettingsStore(state => state.notificationsEnabled);
  const [ready, setReady] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let mounted = true;
    NotificationService.initialize().then(() => {
      if (mounted) setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const update = () => {
      useTaskStore.getState().refreshRoutines();
      setRefresh(value => value + 1);
    };
    update();
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') update();
    });
    const timer = setInterval(() => {
      if (AppState.currentState === 'active') update();
    }, 60000);
    return () => {
      subscription.remove();
      clearInterval(timer);
    };
  }, [hydrated]);

  useEffect(() => {
    if (ready && hydrated) reminderService.syncReminders(tasks, enabled);
  }, [tasks, enabled, ready, hydrated, refresh]);
};
