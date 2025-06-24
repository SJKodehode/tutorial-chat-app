import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const [hasNotifPerm, setHasNotifPerm] = useState<boolean>(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Load saved theme and notification status on mount
  useEffect(() => {
    (async () => {
      // Theme
      const savedTheme = await AsyncStorage.getItem('theme');
      setDarkMode(savedTheme === 'dark');

      // Notification permission
      const { status } = await Notifications.getPermissionsAsync();
      setHasNotifPerm(status === 'granted');

      // Stored token
      const storedToken = await SecureStore.getItemAsync('pushToken');
      if (storedToken) setPushToken(storedToken);
    })();
  }, []);

  // Request notification permission & fetch token
  const registerForPush = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Cannot get push token without permission.');
      return;
    }
    setHasNotifPerm(true);

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;
    setPushToken(token);
    await SecureStore.setItemAsync('pushToken', token);
    Alert.alert('All set!', `Token saved.`);  
  };

  // Toggle dark mode on/off
  const toggleDark = async (value: boolean) => {
    setDarkMode(value);
    await AsyncStorage.setItem('theme', value ? 'dark' : 'light');
  };

  // Clear chat history (assuming you store it under 'msgs')
  const clearChat = async () => {
    await AsyncStorage.removeItem('msgs');
    Alert.alert('Cleared', 'Chat history has been cleared.');
  };

  return (
    <View style={[styles.container, darkMode && styles.darkBg]}>
      <Text style={[styles.heading, darkMode && styles.darkText]}>
        Settings
      </Text>

      {/* Push notifications */}
      <View style={styles.row}>
        <Text style={[styles.label, darkMode && styles.darkText]}>
          Push Notifications:
        </Text>
        {hasNotifPerm ? (
          <Text style={[styles.subtext, darkMode && styles.darkText]}>
            Enabled
          </Text>
        ) : (
          <Button title="Enable" onPress={registerForPush} />
        )}
      </View>
      {pushToken && (
        <Text
          style={[styles.token, darkMode && styles.darkText]}
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          Token: {pushToken}
        </Text>
      )}

      {/* Dark mode toggle */}
      <View style={styles.row}>
        <Text style={[styles.label, darkMode && styles.darkText]}>
          Dark Mode:
        </Text>
        <Switch value={darkMode} onValueChange={toggleDark} />
      </View>

      {/* Clear chat button */}
      <View style={styles.clearBtn}>
        <Button
          title="Clear Chat History"
          color="crimson"
          onPress={clearChat}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  darkBg: { backgroundColor: '#121212' },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  darkText: { color: '#eee' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  label: { fontSize: 16 },
  subtext: { fontSize: 16, color: '#007aff' },
  token: { fontSize: 12, marginBottom: 24 },
  clearBtn: { marginTop: 40 },
});
