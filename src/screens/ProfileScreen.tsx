// src/screens/ProfileScreen.tsx
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigatior';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const [nickname, setNickname] = useState('');

  // on mount, check if they already have a nickname
  useEffect(() => {
    (async () => {
      const userResponse = await supabase.auth.getUser();
      const userId = userResponse.data.user?.id;
      const { data } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('id', userId)
        .single();
      if (data?.nickname) {
        // already set, go to Home
        navigation.replace('MainTabs');
      }
    })();
  }, []);

  // Save nickname handler
  const save = async () => {
    const userResponse = await supabase.auth.getUser();
    const userId = userResponse.data.user?.id!;
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, nickname: nickname.trim() });
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      navigation.replace('MainTabs');
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, justifyContent: 'center' },
    input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16 },
  });

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Pick a nickname"
        value={nickname}
        onChangeText={setNickname}
        style={styles.input}
      />
      <Button title="Save" onPress={save} disabled={!nickname.trim()} />
    </View>
  );
}
