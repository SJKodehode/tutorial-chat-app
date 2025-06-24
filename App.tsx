// App.tsx
import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import RootNavigator, { RootStackParamList } from './src/navigation/RootNavigatior';
import { supabase } from './src/services/supabase';

export default function App() {
  const navRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  useEffect(() => {
    // 1) Handle incoming deep‐links on native (Expo Go / dev client / standalone)
    const sub = Linking.addEventListener('url', ({ url }) => {
      // NOTE: exchangeCodeForSession expects an object
      supabase.auth.exchangeCodeForSession(url);
    });

    // 2) On web, finish the implicit OAuth flow via URL fragment or query
    if (Platform.OS === 'web') {
      const hasParams =
        window.location.hash.includes('access_token') ||
        window.location.search.includes('code=');
      if (hasParams) {
        supabase.auth
          .exchangeCodeForSession(window.location.href)
          .then(({ error }) => {
            if (error) {
              console.error('OAuth callback error:', error);
            } else {
              // clean up the URL
              window.history.replaceState({}, '', window.location.pathname);
              // navigate into your app
              navRef.current?.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
            }
          });
      }
    }

    // 3) Always listen for auth changes to drive navigation
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!navRef.current) return;

        if (session?.user) {
          // Optional: check for profile row and route to Profile or Home
          const { data: profile } = await supabase
            .from('profiles')
            .select('nickname')
            .eq('id', session.user.id)
            .single();

          navRef.current.reset({
            index: 0,
            routes: [{ name: profile ? 'MainTabs' : 'Profile' }],
          });
        } else {
          navRef.current.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      }
    );

    return () => {
      sub.remove();
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <NavigationContainer ref={navRef}>
      <RootNavigator />
    </NavigationContainer>
  );
}
