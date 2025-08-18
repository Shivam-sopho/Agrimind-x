import React, { useState } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Button, View, TouchableOpacity, Text, Modal, SafeAreaView } from 'react-native';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AgriChatScreen from './explore';
import { useEffect } from 'react';

export default function HomeScreen() {
  return <AgriChatScreen />;
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  optionsContainer: {
    flex: 1,
    gap: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#f5f3e7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4b5320',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 15,
    color: '#6b6b47',
    marginBottom: 4,
  },
  cardResult: {
    fontSize: 16,
    color: '#a3c14a',
    marginTop: 8,
    fontWeight: 'bold',
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<Error | null>(null);
  if (error) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Error: {error.message}</Text></View>;
  }
  return (
    <React.Suspense fallback={<Text>Loading...</Text>}>
      {React.Children.map(children, child => {
        try {
          return child;
        } catch (e) {
          setError(e as Error);
          return null;
        }
      })}
    </React.Suspense>
  );
}
