// app.config.ts
import 'dotenv/config';
import type { ExpoConfig } from '@expo/config-types';

export default ({ config }: any): ExpoConfig => ({
  ...config,

  // Basic manifest
  owner: 'SJKodehode',
  name: 'tutorial-chat-app',
  slug: 'tutorial-chat-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  scheme: 'mychatapp',

  // EAS + env
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    eas: {
      projectId: '363ca3d7-a12a-44ef-ab1a-91d9bb7454d7',
    },
  },

  // iOS native config
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.sjkodehode.tutorialchatapp', 
  },

  // Android native config
  android: {
    package: 'com.sjkodehode.tutorialchatapp',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
  },

  // Web
  web: {
    favicon: './assets/favicon.png',
  },
});
