import {
  View,
  FlatList,
  Button,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigatior';
import { MainTabsParamList } from '../navigation/MainTabs';

type Props = NativeStackScreenProps<RootStackParamList>;
type Room = { id: string; name: string };

export default function HomeScreen({ navigation }: Props) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newName, setNewName] = useState('');

  // Fetch rooms
  const fetchRooms = useCallback(async () => {
    const { data } = await supabase.from('rooms').select('*').order('created_at');
    setRooms(data as Room[]);
  }, []);

  useEffect(() => {
    void fetchRooms();
  }, [fetchRooms]);

  // Create a new room
  const createRoom = useCallback(async () => {
    if (!newName.trim()) return;
    const { data, error } = await supabase
      .from('rooms')
      .insert({ name: newName.trim() })
      .select()
      .single();
    if (error) {
      console.error(error);
    } else {
      setRooms((prev) => [...prev, data as Room]);
      setNewName('');
      // Optionally: navigation.navigate('Chat', { roomId: data.id });
    }
  }, [newName]);

  return (
    <View style={s.container}>
      {/* Create Room UI */}
      <View style={s.createRow}>
        <TextInput
          placeholder="New room name"
          value={newName}
          onChangeText={setNewName}
          style={s.input}
        />
        <Button title="Create" onPress={createRoom} disabled={!newName.trim()} />
      </View>

      {/* List of rooms */}
      <FlatList
        data={rooms}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => (
          <Button
            title={item.name}
            onPress={() => navigation.navigate('Chat', { roomId: item.id })}
          />
        )}
        ListEmptyComponent={<Text>No rooms yet</Text>}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 12 },
  createRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
});
