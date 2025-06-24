// src/screens/LoginScreen.tsx
import { View, Button, Alert, Platform, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import { supabase } from '../services/supabase';

export default function LoginScreen() {
  const signInWithGoogle = async () => {
    if (Platform.OS === 'web') {
      // 1) Start the OAuth flow, get back the URL
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) {
        Alert.alert('Error', error.message);
        return;
      }
      if (data?.url) {
        // 2) Manually redirect the browser to that URL
        window.location.href = data.url;
      }
    } else {
      const redirectTo = Linking.createURL('auth-callback');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      if (error) Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Sign in with Google" onPress={signInWithGoogle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', padding:24 },
});
