import React from 'react';
import { View, Switch, StyleSheet, Linking } from 'react-native';
import { ScreenContainer, Text, Card, Button, GradientHeader } from '@shared/components';
import { useTheme } from '@core/theme';
import { useSettingsStore } from '../store/useSettingsStore';
import { CONFIG } from '@core/config';

export const SettingsScreen = () => {
  const { theme, preference, setPreference } = useTheme();
  const { notificationsEnabled, toggleNotifications } = useSettingsStore();

  const handlePrivacyPolicy = () => Linking.openURL('https://example.com/privacy');

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <GradientHeader title="Settings" />
      <View style={{ padding: theme.spacing.md, gap: theme.spacing.md, width: '100%' }}>
        <Card>
          <View style={styles.row}>
            <Text variant="h3">Notifications</Text>
            <Switch 
              value={notificationsEnabled} 
              onValueChange={toggleNotifications}
              trackColor={{ true: theme.colors.primary }}
            />
          </View>
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
          <Button label="Privacy Policy" variant="outline" onPress={handlePrivacyPolicy} />
        </Card>

        <Text align="center" color="textSecondary" style={{ marginTop: theme.spacing.xl }}>
          Version {CONFIG.VERSION}
        </Text>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({ row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' } });
