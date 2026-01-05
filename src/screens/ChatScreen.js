import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import colors from '../utils/colors';

const ChatScreen = ({ route, navigation }) => {
  const { master } = route.params;
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'text',
      content: 'Salom! Sizga qanday yordam bera olaman?',
      sender: 'master',
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: 2,
      type: 'text',
      content: 'Assalomu alaykum! Suv quvurini ta\'mirlash kerak.',
      sender: 'user',
      timestamp: new Date(Date.now() - 3300000),
    },
    {
      id: 3,
      type: 'text',
      content: 'Albatta! Qaysi kunni afzal ko\'rasiz?',
      sender: 'master',
      timestamp: new Date(Date.now() - 3000000),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendText = () => {
    if (inputText.trim().length === 0) return;

    const newMessage = {
      id: messages.length + 1,
      type: 'text',
      content: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // Simulate master reply after 2 seconds
    setTimeout(() => {
      const replyMessage = {
        id: messages.length + 2,
        type: 'text',
        content: 'Xabaringiz uchun rahmat! Tez orada javob beraman.',
        sender: 'master',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, replyMessage]);
    }, 2000);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Ruxsat kerak',
        'Rasmlarni yuborish uchun galereyaga ruxsat bering'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newMessage = {
        id: messages.length + 1,
        type: 'image',
        content: result.assets[0].uri,
        sender: 'user',
        timestamp: new Date(),
      };

      setMessages([...messages, newMessage]);

      // Simulate master reply
      setTimeout(() => {
        const replyMessage = {
          id: messages.length + 2,
          type: 'text',
          content: 'Rasmni ko\'rdim, tushundim.',
          sender: 'master',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, replyMessage]);
      }, 2000);
    }
  };

  const handleVoiceRecord = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);

      const newMessage = {
        id: messages.length + 1,
        type: 'voice',
        content: '0:15', // Duration
        sender: 'user',
        timestamp: new Date(),
      };

      setMessages([...messages, newMessage]);

      // Simulate master reply
      setTimeout(() => {
        const replyMessage = {
          id: messages.length + 2,
          type: 'text',
          content: 'Ovozli xabaringizni tingladim.',
          sender: 'master',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, replyMessage]);
      }, 2000);
    } else {
      // Start recording
      setIsRecording(true);
    }
  };

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.masterMessageContainer,
        ]}
      >
        {/* Master Avatar */}
        {!isUser && (
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
            style={styles.avatar}
          />
        )}

        {/* Message Bubble */}
        <View style={{ flex: 1, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
          <View
            style={[
              styles.messageBubble,
              isUser ? styles.userBubble : styles.masterBubble,
            ]}
          >
            {/* Text Message */}
            {item.type === 'text' && (
              <Text style={[styles.messageText, isUser && styles.userMessageText]}>
                {item.content}
              </Text>
            )}

            {/* Image Message */}
            {item.type === 'image' && (
              <Image source={{ uri: item.content }} style={styles.messageImage} />
            )}

            {/* Voice Message */}
            {item.type === 'voice' && (
              <View style={styles.voiceMessage}>
                <TouchableOpacity style={styles.playButton}>
                  <Ionicons
                    name="play"
                    size={20}
                    color={isUser ? colors.white : colors.primary}
                  />
                </TouchableOpacity>
                <View style={styles.waveform}>
                  {[...Array(20)].map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.waveBar,
                        {
                          height: Math.random() * 24 + 8,
                          backgroundColor: isUser ? colors.white : colors.primary,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.voiceDuration, isUser && styles.userMessageText]}>
                  {item.content}
                </Text>
              </View>
            )}

            {/* Timestamp */}
            <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
              {formatTime(item.timestamp)}
            </Text>
          </View>
        </View>

        {/* User Avatar placeholder for alignment */}
        {isUser && <View style={{ width: 40 }} />}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
            style={styles.headerAvatar}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{master?.name || 'Usta'}</Text>
            <Text style={styles.headerStatus}>Onlayn</Text>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        {/* Recording Indicator */}
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Yozib olinmoqda...</Text>
            <Text style={styles.recordingTime}>0:00</Text>
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          {/* Attachment Button */}
          <TouchableOpacity style={styles.attachButton} onPress={handlePickImage}>
            <Ionicons name="image-outline" size={24} color={colors.primary} />
          </TouchableOpacity>

          {/* Text Input */}
          {!isRecording && (
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Xabar yozing..."
                placeholderTextColor={colors.textTertiary}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
              />
            </View>
          )}

          {/* Send/Voice Button */}
          {inputText.trim().length > 0 ? (
            <TouchableOpacity style={styles.sendButton} onPress={handleSendText}>
              <Ionicons name="send" size={20} color={colors.white} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.voiceButton,
                isRecording && styles.voiceButtonRecording,
              ]}
              onPress={handleVoiceRecord}
              onLongPress={handleVoiceRecord}
            >
              <Ionicons
                name={isRecording ? 'stop' : 'mic'}
                size={24}
                color={colors.white}
              />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray100,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerStatus: {
    fontSize: 13,
    color: colors.secondary,
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  masterMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray100,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  masterBubble: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  userMessageText: {
    color: colors.white,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    backgroundColor: colors.gray100,
  },
  voiceMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  waveBar: {
    width: 2,
    borderRadius: 1,
  },
  voiceDuration: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  timestamp: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 4,
  },
  userTimestamp: {
    color: colors.white + 'CC',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.error + '10',
    borderTopWidth: 1,
    borderTopColor: colors.error + '20',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
    marginRight: 8,
  },
  recordingText: {
    flex: 1,
    fontSize: 14,
    color: colors.error,
    fontWeight: '500',
  },
  recordingTime: {
    fontSize: 14,
    color: colors.error,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputContainer: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: colors.gray50,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    fontSize: 15,
    color: colors.textPrimary,
    maxHeight: 80,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButtonRecording: {
    backgroundColor: colors.error,
  },
});

export default ChatScreen;
