// src/screens/ChatScreen.tsx
import {
  View,
  FlatList,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigatior';
import MessageBubble from '../components/MessageBubble';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;
type Message = {
  id: string;
  text: string;
  user_id: string;
  created_at: string;
  nickname: string;
};

export default function ChatScreen({ route }: Props) {
  const { roomId } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');

  // 1) Load existing messages + their sender’s nickname
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*, profiles(nickname)')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) {
        console.warn(error);
      } else {
        const msgs: Message[] = (data as any).map((row: any) => ({
          id: row.id,
          text: row.text,
          user_id: row.user_id,
          created_at: row.created_at,
          nickname: row.profiles?.nickname ?? '',
        }));
        setMessages(msgs);
      }
    })();
  }, [roomId]);

  // 2) Subscribe to new messages and fetch each sender’s nickname
  useEffect(() => {
    const channel = supabase
      .channel(`messages_room_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const m = payload.new as Message;
          const { data: prof } = await supabase
            .from('profiles')
            .select('nickname')
            .eq('id', m.user_id)
            .single();

          setMessages(prev => [
            ...prev,
            { ...m, nickname: prof?.nickname ?? '' },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // 3) Send a new message (realtime subscription will handle display)
  const send = useCallback(async () => {
    if (!text.trim()) return;

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user?.id) {
      Alert.alert('Error', 'Could not get user ID');
      return;
    }

    const { error } = await supabase
      .from('messages')
      .insert({
        room_id: roomId,
        text: text.trim(),
        user_id: userData.user.id,
      });

    if (error) {
      console.error(error);
      Alert.alert('Error sending message', error.message);
    } else {
      setText('');
    }
  }, [roomId, text]);

  return (
    <View style={s.container}>
      <FlatList
        data={messages}
        keyExtractor={m => m.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        contentContainerStyle={s.list}
      />
      <View style={s.inputRow}>
        <TextInput
          placeholder="Message…"
          value={text}
          onChangeText={setText}
          style={s.input}
        />
        <Button title="Send" onPress={send} disabled={!text.trim()} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 12 },
  inputRow: { flexDirection: 'row', padding: 8, gap: 8 },
  input: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 10 },
});
