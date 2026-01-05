import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../lib/supabase';
import colors from '../utils/colors';
import { useAuth } from '../contexts/AuthContext';

// Sending Dots Animation Component
const SendingDots = () => {
  const opacity1 = useRef(new Animated.Value(0.3)).current;
  const opacity2 = useRef(new Animated.Value(0.3)).current;
  const opacity3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(opacity1, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacity2, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacity3, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(opacity1, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(opacity2, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(opacity3, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animate());
    };
    animate();
  }, []);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Animated.Text style={[styles.sendingDot, { opacity: opacity1 }]}>.</Animated.Text>
      <Animated.Text style={[styles.sendingDot, { opacity: opacity2 }]}>.</Animated.Text>
      <Animated.Text style={[styles.sendingDot, { opacity: opacity3 }]}>.</Animated.Text>
    </View>
  );
};

const ChatRoomScreen = ({ route, navigation }) => {
  const { roomId, orderId, masterName, masterAvatar, isAdminChat } = route.params;
  const { userPhone } = useAuth();

  // For admin chat, use special admin identifier
  const effectiveRoomId = isAdminChat ? `admin-${userPhone}` : roomId;
  const effectiveMasterName = isAdminChat ? 'Admin' : masterName;
  const effectiveMasterAvatar = isAdminChat ? null : masterAvatar;

  // States
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState(null);
  const flatListRef = useRef(null);

  // Voice message states
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingMessageId, setPlayingMessageId] = useState(null);
  const [sound, setSound] = useState(null);
  const recordingInterval = useRef(null);

  // Hide default header
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  // Fetch messages and setup real-time subscription
  useEffect(() => {
    let subscription;

    const fetchMessages = async () => {
      try {
        setLoading(true);

        // Get current user ID
        const { data: { user: authUser } } = await supabase.auth.getUser();
        let currentUserId = null;

        if (authUser) {
          currentUserId = authUser.id;
        } else if (userPhone) {
          const { data: userFromDB } = await supabase
            .from('users')
            .select('id')
            .eq('phone', userPhone)
            .single();
          currentUserId = userFromDB?.id;
        }

        if (!currentUserId) {
          setLoading(false);
          return;
        }

        setUserId(currentUserId);

        // Fetch messages
        let messagesData = [];

        if (isAdminChat) {
          // Admin chat uchun admin_chats jadvalidan olish
          const { data, error } = await supabase
            .from('admin_chats')
            .select('*')
            .eq('user_id', currentUserId)
            .order('created_at', { ascending: true });

          if (error) {
            console.error('Error fetching admin messages:', error);
          } else {
            messagesData = data || [];
          }

          // Mark admin messages as read
          await supabase.rpc('mark_admin_messages_as_read', {
            p_user_id: currentUserId
          });
        } else {
          // Oddiy chat uchun RPC funksiyasi
          const { data, error } = await supabase
            .rpc('get_chat_messages', {
              p_room_id: effectiveRoomId
            });

          if (error) {
            console.error('Error fetching messages:', error);
            return;
          }

          messagesData = data || [];

          // Mark messages as read
          await supabase.rpc('mark_messages_as_read', {
            p_room_id: effectiveRoomId,
            p_reader_type: 'user'
          });
        }

        setMessages(messagesData);

        // Setup real-time subscription
        if (isAdminChat) {
          // Admin chat uchun - admin_chats jadvaliga real-time subscription
          subscription = supabase
            .channel(`admin-chat-${currentUserId}`)
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'admin_chats',
                filter: `user_id=eq.${currentUserId}`
              },
              (payload) => {
                setMessages(prev => {
                  const exists = prev.some(msg => msg.id === payload.new.id);
                  if (exists) return prev;
                  return [...prev, { ...payload.new, status: 'sent' }];
                });

                // Agar admin yuborgan bo'lsa, avtomatik o'qilgan qilish
                if (payload.new.sender_type === 'admin') {
                  supabase.rpc('mark_admin_messages_as_read', {
                    p_user_id: currentUserId
                  });
                }

                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
              }
            )
            .subscribe();
        } else {
          // Oddiy chat uchun
          subscription = supabase
            .channel(`chat-room-${effectiveRoomId}`)
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `room_id=eq.${effectiveRoomId}`
              },
              (payload) => {
                setMessages(prev => {
                  const exists = prev.some(msg => msg.id === payload.new.id);
                  if (exists) return prev;
                  return [...prev, { ...payload.new, status: 'sent' }];
                });

                if (payload.new.sender_type === 'master') {
                  supabase.rpc('mark_messages_as_read', {
                    p_room_id: effectiveRoomId,
                    p_reader_type: 'user'
                  });
                }

                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
              }
            )
            .subscribe();
        }

      } catch (error) {
        console.error('Error in fetchMessages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [effectiveRoomId, userPhone]);

  // Send text message
  const sendMessage = async () => {
    if (!newMessage.trim() || !userId) return;

    const tempId = `temp-${Date.now()}`;
    const messageText = newMessage.trim();

    // Optimistic update
    const tempMessage = {
      id: tempId,
      room_id: effectiveRoomId,
      sender_type: 'user',
      sender_id: userId,
      message_type: 'text',
      message_text: messageText,
      created_at: new Date().toISOString(),
      is_read: false,
      status: 'sending'
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    try {
      setSending(true);

      // Admin chat uchun admin_chats jadvaliga insert
      if (isAdminChat) {
        const { data, error } = await supabase
          .from('admin_chats')
          .insert({
            user_id: userId,
            sender_type: 'user',
            message_type: 'text',
            message_text: messageText,
            is_read: false
          })
          .select()
          .single();

        if (error) {
          console.error('Error sending admin message:', error);
          setMessages(prev => prev.map(msg =>
            msg.id === tempId ? { ...msg, status: 'error' } : msg
          ));
          return;
        }

        setMessages(prev => {
          const withoutTemp = prev.filter(msg => msg.id !== tempId);
          return [...withoutTemp, { ...data, status: 'sent' }];
        });
      } else {
        // Oddiy chat uchun RPC funksiyasi
        const { data, error } = await supabase
          .rpc('send_chat_message', {
            p_room_id: effectiveRoomId,
            p_sender_type: 'user',
            p_sender_id: userId,
            p_message_type: 'text',
            p_message_text: messageText
          });

        if (error) {
          console.error('Error sending message:', error);
          setMessages(prev => prev.map(msg =>
            msg.id === tempId ? { ...msg, status: 'error' } : msg
          ));
          return;
        }

        const sentMessage = Array.isArray(data) ? data[0] : data;
        setMessages(prev => {
          const withoutTemp = prev.filter(msg => msg.id !== tempId);
          const exists = withoutTemp.some(msg => msg.id === sentMessage.id);
          if (exists) return withoutTemp;
          return [...withoutTemp, { ...sentMessage, status: 'sent' }];
        });
      }

    } catch (error) {
      console.error('Error in sendMessage:', error);
      setMessages(prev => prev.map(msg =>
        msg.id === tempId ? { ...msg, status: 'error' } : msg
      ));
    } finally {
      setSending(false);
    }
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Ruxsat kerak', 'Ovoz yozish uchun mikrofon ruxsati kerak');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);

      recordingInterval.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Xatolik', 'Ovoz yozishni boshlab bo\'lmadi');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      clearInterval(recordingInterval.current);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        await sendVoiceMessage(uri);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const cancelRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      clearInterval(recordingInterval.current);
      setRecordingDuration(0);
      await recording.stopAndUnloadAsync();
      setRecording(null);
    } catch (err) {
      console.error('Failed to cancel recording', err);
    }
  };

  const sendVoiceMessage = async (voiceUri) => {
    if (!userId) return;

    const tempId = `temp-voice-${Date.now()}`;

    // Optimistic update - darhol ekranga chiqarish
    const tempMessage = {
      id: tempId,
      room_id: effectiveRoomId,
      sender_type: 'user',
      sender_id: userId,
      message_type: 'voice',
      voice_url: voiceUri, // Vaqtinchalik local URI
      voice_duration: recordingDuration,
      created_at: new Date().toISOString(),
      is_read: false,
      status: 'sending'
    };

    setMessages(prev => [...prev, tempMessage]);
    const savedDuration = recordingDuration;
    setRecordingDuration(0);

    try {
      setSending(true);

      const fileName = `voice_${userId}_${Date.now()}.m4a`;
      const base64 = await FileSystem.readAsStringAsync(voiceUri, {
        encoding: 'base64',
      });

      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const { error: uploadError } = await supabase.storage
        .from('voice')
        .upload(fileName, bytes.buffer, {
          contentType: 'audio/m4a',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading voice:', uploadError);
        setMessages(prev => prev.map(msg =>
          msg.id === tempId ? { ...msg, status: 'error' } : msg
        ));
        Alert.alert('Xatolik', 'Ovozni yuklashda xatolik yuz berdi');
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('voice')
        .getPublicUrl(fileName);

      // Admin chat uchun admin_chats jadvaliga voice insert
      if (isAdminChat) {
        const { data, error } = await supabase
          .from('admin_chats')
          .insert({
            user_id: userId,
            sender_type: 'user',
            message_type: 'voice',
            voice_url: publicUrl,
            voice_duration: savedDuration,
            is_read: false
          })
          .select()
          .single();

        if (error) {
          console.error('Error sending admin voice message:', error);
          setMessages(prev => prev.map(msg =>
            msg.id === tempId ? { ...msg, status: 'error' } : msg
          ));
          Alert.alert('Xatolik', 'Ovozli xabarni yuborishda xatolik');
          return;
        }

        setMessages(prev => {
          const withoutTemp = prev.filter(msg => msg.id !== tempId);
          return [...withoutTemp, { ...data, status: 'sent' }];
        });
      } else {
        // Oddiy chat uchun RPC funksiyasi
        const { data, error } = await supabase
          .rpc('send_chat_message', {
            p_room_id: effectiveRoomId,
            p_sender_type: 'user',
            p_sender_id: userId,
            p_message_type: 'voice',
            p_voice_url: publicUrl,
            p_voice_duration: savedDuration
          });

        if (error) {
          console.error('Error sending voice message:', error);
          setMessages(prev => prev.map(msg =>
            msg.id === tempId ? { ...msg, status: 'error' } : msg
          ));
          Alert.alert('Xatolik', 'Ovozli xabarni yuborishda xatolik');
          return;
        }

        // Muvaffaqiyatli yuborildi - temp xabarni haqiqiy bilan almashtirish
        const sentMessage = Array.isArray(data) ? data[0] : data;
        setMessages(prev => {
          const withoutTemp = prev.filter(msg => msg.id !== tempId);
          const exists = withoutTemp.some(msg => msg.id === sentMessage.id);
          if (exists) return withoutTemp;
          return [...withoutTemp, { ...sentMessage, status: 'sent' }];
        });
      }

    } catch (error) {
      console.error('Error in sendVoiceMessage:', error);
      setMessages(prev => prev.map(msg =>
        msg.id === tempId ? { ...msg, status: 'error' } : msg
      ));
      Alert.alert('Xatolik', 'Ovozli xabar yuborishda xatolik');
    } finally {
      setSending(false);
    }
  };

  const playVoiceMessage = async (voiceUrl, messageId) => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        if (playingMessageId === messageId) {
          setPlayingMessageId(null);
          return;
        }
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: voiceUrl },
        { shouldPlay: true }
      );

      setSound(newSound);
      setPlayingMessageId(messageId);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingMessageId(null);
          newSound.unloadAsync();
        }
      });

    } catch (error) {
      console.error('Error playing voice:', error);
      Alert.alert('Xatolik', 'Ovozni eshitib bo\'lmadi');
    }
  };

  // Cleanup sound on unmount
  useEffect(() => {
    return sound
      ? () => {
        sound.unloadAsync();
      }
      : undefined;
  }, [sound]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(date, today)) return 'Bugun';
    if (isSameDay(date, yesterday)) return 'Kecha';

    return date.toLocaleDateString('uz-UZ', {
      day: 'numeric',
      month: 'long'
    });
  };

  // Delete message function
  const deleteMessage = async (messageId, isMyMessage) => {
    if (!isMyMessage) {
      Alert.alert('Xatolik', 'Faqat o\'z xabarlaringizni o\'chirishingiz mumkin');
      return;
    }

    Alert.alert(
      'Xabarni o\'chirish',
      'Ushbu xabarni o\'chirishni xohlaysizmi?',
      [
        {
          text: 'Bekor qilish',
          style: 'cancel'
        },
        {
          text: 'O\'chirish',
          style: 'destructive',
          onPress: async () => {
            try {
              // Optimistic update - darhol ekrandan olib tashlash
              setMessages(prev => prev.filter(msg => msg.id !== messageId));

              // Supabase'dan o'chirish
              const tableName = isAdminChat ? 'admin_chats' : 'chat_messages';
              const { error } = await supabase
                .from(tableName)
                .delete()
                .eq('id', messageId);

              if (error) {
                console.error('Error deleting message:', error);
                // Xato bo'lsa qaytarib qo'yish
                if (isAdminChat) {
                  const { data } = await supabase
                    .from('admin_chats')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: true });
                  setMessages(data || []);
                } else {
                  const { data } = await supabase
                    .rpc('get_chat_messages', {
                      p_room_id: effectiveRoomId
                    });
                  setMessages(data || []);
                }
                Alert.alert('Xatolik', 'Xabarni o\'chirishda xatolik yuz berdi');
              }
            } catch (error) {
              console.error('Error in deleteMessage:', error);
              Alert.alert('Xatolik', 'Xabarni o\'chirishda xatolik yuz berdi');
            }
          }
        }
      ]
    );
  };

  const renderMessage = ({ item, index }) => {
    const isMyMessage = item.sender_type === 'user';
    const showDate = index === 0 || !isSameDay(
      new Date(messages[index - 1].created_at),
      new Date(item.created_at)
    );

    return (
      <View>
        {showDate && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
          </View>
        )}

        <View
          style={[
            styles.messageRow,
            isMyMessage ? styles.myMessageRow : styles.otherMessageRow
          ]}
        >
          <View
            style={[
              styles.messageBubble,
              isMyMessage ? styles.myBubble : styles.otherBubble
            ]}
          >
            {item.message_type === 'voice' ? (
              // Voice Message
              <TouchableOpacity
                style={styles.voiceContainer}
                onPress={() => item.status !== 'sending' && playVoiceMessage(item.voice_url, item.id)}
                onLongPress={() => deleteMessage(item.id, isMyMessage)}
                activeOpacity={item.status === 'sending' ? 1 : 0.7}
                disabled={item.status === 'sending'}
              >
                <View
                  style={[
                    styles.playButton,
                    isMyMessage ? styles.myPlayButton : styles.otherPlayButton
                  ]}
                >
                  {item.status === 'sending' ? (
                    <ActivityIndicator
                      size="small"
                      color={isMyMessage ? colors.primary : colors.white}
                    />
                  ) : (
                    <Ionicons
                      name={playingMessageId === item.id ? 'pause' : 'play'}
                      size={18}
                      color={isMyMessage ? colors.primary : colors.white}
                    />
                  )}
                </View>

                <View style={styles.voiceWaveform}>
                  {/* Simple waveform representation */}
                  <View style={styles.waveBars}>
                    {[3, 6, 4, 8, 5, 7, 4, 6].map((height, i) => (
                      <View
                        key={i}
                        style={[
                          styles.waveBar,
                          {
                            height: height * 2,
                            backgroundColor: isMyMessage
                              ? 'rgba(255,255,255,0.7)'
                              : 'rgba(11,60,180,0.5)'
                          }
                        ]}
                      />
                    ))}
                  </View>
                </View>

                <Text
                  style={[
                    styles.voiceDuration,
                    { color: isMyMessage ? colors.white : colors.textPrimary }
                  ]}
                >
                  {formatDuration(item.voice_duration || 0)}
                </Text>
              </TouchableOpacity>
            ) : (
              // Text Message
              <TouchableOpacity
                onLongPress={() => deleteMessage(item.id, isMyMessage)}
                activeOpacity={0.9}
              >
                <Text
                  style={[
                    styles.messageText,
                    { color: isMyMessage ? colors.white : colors.textPrimary }
                  ]}
                >
                  {item.message_text}
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.messageFooter}>
              <Text
                style={[
                  styles.timeText,
                  { color: isMyMessage ? 'rgba(255,255,255,0.8)' : colors.textSecondary }
                ]}
              >
                {formatTime(item.created_at)}
              </Text>

              {isMyMessage && (
                <View style={styles.statusIcon}>
                  {item.status === 'sending' && (
                    <SendingDots />
                  )}
                  {item.status === 'error' && (
                    <Text style={styles.errorIcon}>!</Text>
                  )}
                  {(!item.status || item.status === 'sent') && (
                    <Ionicons
                      name={item.is_read ? 'checkmark-done' : 'checkmark'}
                      size={16}
                      color={item.is_read ? '#4FC3F7' : 'rgba(255,255,255,0.8)'}
                    />
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.white}
        translucent={false}
      />

      {/* Custom Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.6}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            {effectiveMasterAvatar ? (
              <Image
                source={{ uri: effectiveMasterAvatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
              </View>
            )}
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>{effectiveMasterName}</Text>
              <Text style={styles.headerSubtitle}>онлайн</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            {/* Phone icon can be added here if needed */}
          </View>
        </View>
      </View>
      


      {/* Input Area */}
      <KeyboardAvoidingView
        style={{ flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
<FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }, 100);
        }}
      />
        <SafeAreaView edges={['bottom']} style={styles.inputSafeArea}>
          {isRecording ? (
            // Recording Mode
            <View style={styles.recordingBar}>
              <TouchableOpacity
                onPress={cancelRecording}
                style={styles.cancelButton}
                activeOpacity={0.6}
              >
                <Ionicons name="trash-outline" size={24} color={colors.error} />
              </TouchableOpacity>

              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingTime}>
                  {formatDuration(recordingDuration)}
                </Text>
              </View>

              <TouchableOpacity
                onPress={stopRecording}
                style={styles.sendVoiceButton}
                activeOpacity={0.6}
              >
                <Ionicons name="send" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>
          ) : (
            // Normal Input Mode
            <View style={styles.inputBar}>
              <TextInput
                style={styles.textInput}
                placeholder="Хабар..."
                placeholderTextColor={colors.textSecondary}
                value={newMessage}
                onChangeText={setNewMessage}
                multiline
                maxLength={1000}
              />

              {newMessage.trim() ? (
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={sendMessage}
                  disabled={sending}
                  activeOpacity={0.7}
                >
                  {sending ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Ionicons name="send" size={20} color={colors.white} />
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.micButton}
                  onPress={startRecording}
                  activeOpacity={0.7}
                >
                  <Ionicons name="mic" size={24} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#fff', // WhatsApp-style background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },

  // Header Styles
  header: {
    backgroundColor: '#ffffffff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    height: 56,
  },
  backButton: {
    padding: 8,
    marginRight: 4,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray200,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
  },
  headerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    width: 40,
  },

  // Messages List
  messagesList: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  messageRow: {
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  myMessageRow: {
    alignItems: 'flex-end',
  },
  otherMessageRow: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  myBubble: {
    backgroundColor: '#002ccdff', // WhatsApp green
    borderBottomRightRadius: 2,
  },
  otherBubble: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    justifyContent: 'flex-end',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
  },
  statusIcon: {
    marginLeft: 2,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendingDot: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.9)',
    marginHorizontal: -2,
  },
  errorIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
    backgroundColor: colors.white,
    width: 16,
    height: 16,
    borderRadius: 8,
    textAlign: 'center',
    lineHeight: 16,
  },

  // Voice Message Styles
  voiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    minWidth: 180,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  myPlayButton: {
    backgroundColor: colors.white,
  },
  otherPlayButton: {
    backgroundColor: colors.primary,
  },
  voiceWaveform: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  waveBars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
  },
  voiceDuration: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 8,
  },

  // Input Area Styles
  inputSafeArea: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    marginBottom:10,
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.gray50,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 20,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.gray50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Recording Styles
  recordingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 12,
  },
  cancelButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingIndicator: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 12,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  recordingTime: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sendVoiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatRoomScreen;
