import { View, Text, StyleSheet } from 'react-native';
import { supabase } from '../services/supabase';

type Props = {
  message: { id: string; text: string; user_id: string; created_at: string; nickname: string; };
};

import React, { useEffect, useState } from 'react';

export default function MessageBubble({ message }: Props) {
  const [self, setSelf] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkSelf = async () => {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user.id;
      if (isMounted) {
        setSelf(message.user_id === userId);
      }
    };
    checkSelf();
    return () => {
      isMounted = false;
    };
  }, [message.user_id]);

  return (
    <View style={[s.bubble, self ? s.self : s.other]}>
     {!self && <Text style={s.nick}>{message.nickname}</Text>}
      <Text>{message.text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  bubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 12,
    marginVertical: 4,
  },
  self: { alignSelf: 'flex-end', backgroundColor: '#DCF8C6' },
  other: { alignSelf: 'flex-start', backgroundColor: '#EEE' },
  nick: { fontSize: 12, marginBottom: 4, fontWeight: '600'},
});
