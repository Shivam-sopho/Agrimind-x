import React, { useState } from 'react';
import { StyleSheet, Button, View, Text } from 'react-native';
import Constants from 'expo-constants';

export default function HomeScreen() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchHello = async () => {
    setLoading(true);
    try {
      const apiBaseUrl =
        Constants.expoConfig?.extra?.API_BASE_URL ||
        Constants.manifest?.extra?.API_BASE_URL ||
        'http://192.168.1.4:8000';
      const res = await fetch(`${apiBaseUrl}/`);
      const data = await res.json();
      setMessage(data.msg);
    } catch (e) {
      setMessage('Error connecting to backend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button title={loading ? 'Loading...' : 'Say Hello'} onPress={fetchHello} disabled={loading} />
      {message ? <View style={{ marginTop: 16 }}><Text style={styles.text}>{message}</Text></View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    color: '#333',
  },
});
