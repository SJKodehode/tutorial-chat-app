// src/navigation/RootNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MainTabs from './MainTabs';
import ChatScreen from '../screens/ChatScreen';

export type RootStackParamList = {
  Login: undefined;
  Profile: undefined;
  MainTabs: undefined;
  Chat: { roomId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Unauthenticated / first‐run flows */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />

      {/* The bottom‐tabs after you’re signed in (no header) */}
      <Stack.Screen name="MainTabs" component={MainTabs} />

      {/* Chat is a full‐screen stack child */}
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}
