import React, { useState } from 'react';
import { View, Switch, StyleSheet, Linking, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenContainer, Text, Card, Button, Chip, GradientHeader } from '@shared/components';
import { useTheme } from '@core/theme';
import { useSettingsStore } from '../store/useSettingsStore';
import { CONFIG } from '@core/config';
import { useTaskActions } from '@features/tasks/hooks/useTaskActions';
import { Wallpaper } from '@shared/components/Wallpaper';
import { wallpapers, getWallpaper, WallpaperCollection } from '@core/theme/wallpapers';
import { useToast } from '@core/hooks/useToast';
import { Check } from 'lucide-react-native';

export const SettingsScreen = () => {
  const { theme, preference, setPreference } = useTheme();
  const { notificationsEnabled, wallpaper, setWallpaper } = useSettingsStore();
  const { showToast } = useToast();
  const { setNotificationsEnabled } = useTaskActions();
  const [collection, setCollection] = useState<'all' | WallpaperCollection>('all');

  const handlePrivacyPolicy = () => Linking.openURL('https://example.com/privacy');

  return (
    <ScreenContainer edges={['left', 'right']}>
      <GradientHeader title="Settings" />
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md, width: '100%', paddingBottom: 120 }}>
        <Card>
          <View style={styles.row}>
            <Text variant="h3">Notifications</Text>
            <Switch 
              value={notificationsEnabled} 
              onValueChange={async enabled => {
                try {
                  const granted = await setNotificationsEnabled(enabled);
                  if (enabled && !granted) showToast({ message: 'Allow notifications in your phone settings to receive reminders.', type: 'info', action: { label: 'SETTINGS', onPress: () => Linking.openSettings() } });
                } catch {
                  showToast({ message: 'Notification permission could not be checked. Please try again.', type: 'error' });
                }
              }}
              trackColor={{ true: theme.colors.primary }}
            />
          </View>
          <Text variant="caption" color="textSecondary" style={{ marginTop: theme.spacing.sm }}>Tickd plans your next 40 reminders ahead. Opening the app refreshes them, including daily, weekly and monthly routines.</Text>
        </Card>

        <Card>
          <Text variant="h3" style={{ marginBottom: theme.spacing.md }}>Theme</Text>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            {(['system', 'light', 'dark'] as const).map(p => (
              <Button 
                key={p} 
                label={p.charAt(0).toUpperCase() + p.slice(1)} 
                variant={preference === p ? 'primary' : 'outline'}
                onPress={() => setPreference(p)}
                fullWidth={false}
                style={{ flex: 1 }}
              />
            ))}
          </View>
        </Card>

        <Card>
          <Text variant="h3" weight="bold">Wallpaper Studio</Text>
          <Text color="textSecondary" style={{ marginTop: 4, marginBottom: theme.spacing.sm }}>Soft textures, quiet colors. Find your everyday mood.</Text>
          <Text variant="caption" style={{ color: theme.colors.primary, marginBottom: theme.spacing.md }}>Currently applied: {getWallpaper(wallpaper).name}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: theme.spacing.md }}>
            {([{ id: 'all', label: 'All looks' }, { id: 'studio', label: 'Studio' }, { id: 'cute', label: 'Cute' }, { id: 'classic', label: 'Classic' }] as const).map(item => <Chip key={item.id} label={item.label} selected={collection === item.id} onPress={() => setCollection(item.id)} />)}
          </ScrollView>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 }}>
            {wallpapers.filter(option => collection === 'all' || option.collection === collection).map(option => (
              <TouchableOpacity
                key={option.id}
                accessibilityRole="button"
                accessibilityLabel={`${option.name} wallpaper`}
                accessibilityState={{ selected: wallpaper === option.id }}
                onPress={() => {
                  setWallpaper(option.id);
                  showToast({ message: `${option.name} wallpaper applied`, type: 'success' });
                }}
                style={{ width: '48%', borderRadius: theme.radius.md, overflow: 'hidden', borderWidth: 2, borderColor: wallpaper === option.id ? theme.colors.primary : theme.colors.border }}
              >
                <View style={{ height: 190 }}>
                  <Wallpaper id={option.id} preview />
                  {wallpaper === option.id && <View style={{ position: 'absolute', top: 8, right: 8, padding: 4, borderRadius: 20, backgroundColor: theme.colors.primary }}><Check size={16} color="#FFFFFF" /></View>}
                </View>
                <View style={{ padding: 10, backgroundColor: theme.colors.surface }}>
                  <Text weight="bold">{option.name}</Text>
                  <Text variant="caption" color="textSecondary">{option.caption}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card>
          <Button label="Privacy Policy" variant="outline" onPress={handlePrivacyPolicy} />
        </Card>

        <Text align="center" color="textSecondary" style={{ marginTop: theme.spacing.xl }}>
          Version {CONFIG.VERSION}
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({ row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' } });
