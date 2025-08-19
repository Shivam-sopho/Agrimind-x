import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, Image as RNImage, Platform, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, ScrollView, Dimensions } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  // Add more Indic languages here in the future
];

type LanguageCode = 'en' | 'hi';

const AGENTS = [
  { key: 'chat', label: { en: 'General Chat', hi: 'सामान्य चैट' }, endpoint: '/infer/chat' },
  { key: 'financeflow', label: { en: 'FinanceFlow', hi: 'वित्त प्रवाह' }, endpoint: '/infer/financeflow' },
  { key: 'marketbrain', label: { en: 'MarketBrain', hi: 'बाजार सलाह' }, endpoint: '/infer/marketbrain' },
  { key: 'ecotrack', label: { en: 'EcoTrack', hi: 'इको ट्रैक' }, endpoint: '/infer/ecotrack' },
];

export default function AgriChatScreen({ onClose }: { onClose?: () => void }) {
  const [messages, setMessages] = useState<{from: string, text?: string, imageUri?: string}[]>([]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [image, setImage] = useState<string | null>(null);
  const [recording, setRecording] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [manualLocation, setManualLocation] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied. Please enter your city or village.');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    })();
  }, []);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() && !image) return;
    setLoading(true);
    setMessages((prev) => [...prev, { from: 'user', text: input, imageUri: image || undefined }]);
    let formData = new FormData();
    let promptToSend = input;
    if (language === 'hi') {
      promptToSend += '\nउत्तर हिंदी में दें। Respond in Hindi.';
    }
    formData.append('prompt', promptToSend);
    if (image) {
      const filename = image.split('/').pop() || 'photo.jpg';
      formData.append('image', {
        uri: image,
        name: filename,
        type: 'image/jpeg',
      } as any);
    }
    if (location) {
      formData.append('latitude', String(location.latitude));
      formData.append('longitude', String(location.longitude));
    } else if (manualLocation) {
      formData.append('manual_location', manualLocation);
    }
    try {
      const response = await fetch(`https://agrimind-x.onrender.com${selectedAgent.endpoint}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { from: 'bot', text: data.response }]);
    } catch (e) {
      setMessages((prev) => [...prev, { from: 'bot', text: 'Error contacting backend.' }]);
    }
    setInput('');
    setImage(null);
    setLoading(false);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  // Voice input using Expo Audio (simple MVP, not full speech-to-text)
  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) {
      alert('Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    if (uri) {
      // For demo: send audio as base64 (in real app, use REST endpoint)
      const filename = uri.split('/').pop() || 'audio.m4a';
      const formData = new FormData();
      formData.append('audio', {
        uri: uri,
        name: filename,
        type: 'audio/m4a',
      } as any);
      try {
        const response = await fetch('https://agrimind-x.onrender.com/infer/chat', {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        });
        const data = await response.json();
        setMessages((prev) => [...prev, { from: 'bot', text: data.response }]);
      } catch (e) {
        setMessages((prev) => [...prev, { from: 'bot', text: 'Error contacting backend.' }]);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 100}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, paddingBottom: 70 }}>
          <View style={styles.headerBar}>
            <Text style={styles.headerTitle}>🌾 AgriMind Chat</Text>
            {onClose && (
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.languageBar}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langButton, language === lang.code && styles.langButtonActive]}
                onPress={() => setLanguage(lang.code as LanguageCode)}
              >
                <Text style={styles.langText}>{lang.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Agent selection - horizontally scrollable */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.agentBar} style={{ minWidth: 0, flexShrink: 1 }}>
            {AGENTS.map((agent) => (
              <TouchableOpacity
                key={agent.key}
                style={[styles.agentButton, selectedAgent.key === agent.key && styles.agentButtonActive]}
                onPress={() => setSelectedAgent(agent)}
              >
                <Text style={styles.agentText}>{agent.label[language]}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* Chat intro message */}
          <View style={styles.introBox}>
            <Text style={styles.introText}>
              {language === 'hi'
                ? 'यह चैटबोट भारतीय कृषि के लिए विशेषज्ञ है। यह सिंचाई, कीट/रोग पहचान, मिट्टी की सलाह, सरकारी योजनाएँ, बाजार की भविष्यवाणी, जल/कार्बन ट्रैकिंग, और फार्म फॉर्म्स की ऑटो-फिलिंग में मदद कर सकता है। आप फसल, मिट्टी या पत्ते की फोटो भेज सकते हैं, और हिंदी या अंग्रेज़ी में सवाल पूछ सकते हैं।'
                : 'This chatbot is an expert for Indian agriculture. It can help with irrigation, pest/disease detection, soil advice, government schemes, market prediction, water/carbon tracking, and auto-filling farm forms. You can send crop, soil, or leaf photos, and ask questions in Hindi or English.'}
            </Text>
          </View>
          {/* Location error/manual entry */}
          {locationError && (
            <View style={styles.introBox}>
              <Text style={styles.introText}>{locationError}</Text>
              <TextInput
                style={styles.input}
                value={manualLocation}
                onChangeText={setManualLocation}
                placeholder={language === 'hi' ? 'शहर/गाँव दर्ज करें' : 'Enter city/village'}
              />
            </View>
          )}
          {/* Chat area - takes up more space */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item }) => (
              <View style={[styles.message, item.from === 'user' ? styles.userMsg : styles.botMsg]}>
                {item.text && <Text style={[styles.msgText, { fontSize: 15 }]}>{item.text}</Text>}
                {item.imageUri && <RNImage source={{ uri: item.imageUri }} style={styles.chatImage} />}
              </View>
            )}
            style={{ flex: 1, minHeight: 200 }}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 90 }}
          />
          {loading && <ActivityIndicator size="large" color="#a3c14a" style={{ margin: 12 }} />}
          {image && (
            <View style={styles.previewImageBar}>
              <RNImage source={{ uri: image }} style={styles.previewImage} />
              <Button title="Remove" onPress={() => setImage(null)} />
            </View>
          )}
          {/* Input bar absolutely positioned at the bottom */}
          <View style={[styles.inputBar, { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#f9fbe7', zIndex: 10 }]}>
            <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
              <Text style={styles.icon}>📷</Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.input, { fontSize: 15 }]}
              value={input}
              onChangeText={setInput}
              placeholder={language === 'hi' ? 'संदेश लिखें...' : 'Type a message...'}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              blurOnSubmit={false}
            />
            <TouchableOpacity
              onPress={recording ? stopRecording : startRecording}
              style={styles.iconButton}
            >
              <Text style={styles.icon}>{recording ? '🛑' : '🎤'}</Text>
            </TouchableOpacity>
            <Button title={language === 'hi' ? 'भेजें' : 'Send'} onPress={sendMessage} disabled={loading} />
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e6f2d8', // Light green agri theme
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#a3c14a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#dbe6c4',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4b5320',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#e0c97f',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#4b5320',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#e6f2d8',
    padding: 10,
  },
  languageBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 8,
  },
  langButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#e0c97f',
    marginHorizontal: 4,
    elevation: 2,
  },
  langButtonActive: {
    backgroundColor: '#a3c14a',
    elevation: 4,
  },
  langText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  chatList: {
    flex: 1,
    marginBottom: 10,
  },
  message: {
    padding: 12,
    borderRadius: 16,
    marginVertical: 6,
    maxWidth: '80%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  userMsg: {
    alignSelf: 'flex-end',
    backgroundColor: '#d1e7dd',
  },
  botMsg: {
    alignSelf: 'flex-start',
    backgroundColor: '#fffbe6',
  },
  msgText: {
    fontSize: 15,
  },
  chatImage: {
    width: '100%',
    maxWidth: 220,
    height: undefined,
    aspectRatio: 1,
    borderRadius: 12,
    marginTop: 6,
  },
  previewImageBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    backgroundColor: '#f9fbe7',
    borderRadius: 16,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  iconButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#e0c97f',
    marginRight: 4,
  },
  icon: {
    fontSize: 26,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#a3c14a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    backgroundColor: '#fff',
    fontSize: 18,
    minWidth: 80,
    maxWidth: 200,
  },
  status: {
    textAlign: 'center',
    marginTop: 4,
    color: '#a3c14a',
    fontWeight: 'bold',
    fontSize: 16,
  },
  introBox: {
    backgroundColor: '#f9fbe7',
    borderRadius: 12,
    padding: 8, // reduced
    marginHorizontal: 4, // reduced
    marginBottom: 4, // reduced
    borderWidth: 1,
    borderColor: '#a3c14a',
  },
  introText: {
    fontSize: 14, // reduced
    color: '#4b5320',
    textAlign: 'center',
  },
  agentBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 4, // reduced
    gap: 4, // reduced
    minHeight: 36, // reduced
    alignItems: 'center',
  },
  agentButton: {
    paddingVertical: 4, // reduced
    paddingHorizontal: 10, // reduced
    borderRadius: 14, // reduced
    backgroundColor: '#e0c97f',
    marginHorizontal: 1,
    minHeight: 32, // reduced
    minWidth: 90, // ensure tap target
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentButtonActive: {
    backgroundColor: '#a3c14a',
  },
  agentText: {
    fontWeight: 'bold',
    fontSize: 14, // reduced
  },
});
