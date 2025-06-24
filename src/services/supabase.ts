// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { supabaseUrl, supabaseAnonKey } =
  Constants.expoConfig!.extra as {
    supabaseUrl: string;
    supabaseAnonKey: string;
  };

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // ← tell Supabase to keep the session in AsyncStorage
    storage: AsyncStorage,
  },
});
