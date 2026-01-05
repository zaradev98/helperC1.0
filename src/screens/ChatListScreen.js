import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import colors from '../utils/colors';
import { useAuth } from '../contexts/AuthContext';

const ChatListScreen = ({ navigation }) => {
  const { userPhone, getDeviceId } = useAuth();
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    let subscription;

    const fetchChatRooms = async () => {
      try {
        setLoading(true);
        const currentDeviceId = await getDeviceId();
        console.log('cyrrenDeviceId: ' + currentDeviceId)
        // Get current user ID
        const { data: user, error: xato } = await supabase
          .from('users')
          .select('*')
          .eq('device_id', currentDeviceId)
          .single();
        console.log(user)
        if (xato) {
          Alert.alert('Xatolik:( ')
        }
        let currentUserId = null;

        if (user) {
          currentUserId = user.id;
          console.log('chatscreendagi: ' + currentUserId)
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

        // Fetch chat rooms for this user (ustalar bilan)
        const { data: rooms, error } = await supabase
          .from('chat_rooms')
          .select(`*,profiles!master_id (full_name, avatar_url, profession)`)
          .eq('user_id', currentUserId)
          .eq('is_active', true)
          .order('updated_at', { ascending: false });
          if(error){
            console.log('xatolik;(',error)
            return
          }

        const allChats = [...(rooms || [])];


        // Oxirgi xabar vaqti bo'yicha saralash
        allChats.sort((a, b) => {
          const timeA = new Date(a.last_message_at || a.created_at);
          const timeB = new Date(b.last_message_at || b.created_at);
          return timeB - timeA;
        });

        console.log('📱 All chats (ustalar + admin):', allChats);
        setChatRooms(allChats);

        // Set up real-time subscription for chat_rooms
        subscription = supabase
          .channel('all-chats-channel')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'chat_rooms',
              filter: `user_id=eq.${currentUserId}`
            },
            (payload) => {
              console.log('🔴 Chat room update:', payload);

              if (payload.eventType === 'UPDATE') {
                // Update existing room
                setChatRooms(prev =>
                  prev.map(room =>
                    room.id === payload.new.id
                      ? { ...room, ...payload.new }
                      : room
                  )
                );
              } else if (payload.eventType === 'INSERT') {
                // New chat room created
                fetchChatRooms(); // Refetch to get full data with joins
              }
            }
          ).subscribe();

      } catch (error) {
        console.error('Error in fetchChatRooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatRooms();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [userPhone]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hozir';
    if (diffMins < 60) return `${diffMins} daqiqa oldin`;
    if (diffHours < 24) return `${diffHours} soat oldin`;
    if (diffDays < 7) return `${diffDays} kun oldin`;

    return date.toLocaleDateString('uz-UZ');
  };

  const renderChatRoom = ({ item }) => {
    const isAdmin = false;

    return (
      <TouchableOpacity
        style={styles.chatCard}
        onPress={() => {
          if (isAdmin) {
            navigation.navigate('ChatRoom', {
              roomId: null,
              orderId: null,
              masterName: 'Admin',
              masterAvatar: null,
              isAdminChat: true,
            });
          } else {
            navigation.navigate('ChatRoom', {
              roomId: item.id,
              orderId: item.order_id,
              masterName: item.masters?.full_name || 'Usta',
              masterAvatar: item.masters?.avatar_url,
            });
          }
        }}
      >
        {/* Master/Admin Avatar */}
        <View style={styles.avatarContainer}>
          {isAdmin ? (
            <View style={[styles.avatar, styles.adminAvatarPlaceholder]}>
              <Ionicons name="shield-checkmark" size={28} color={colors.primary} />
            </View>
          ) : (
            <Image
              source={{
                uri: item.masters?.avatar_url || 'https://i.pravatar.cc/150?img=1'
              }}
              style={styles.avatar}
            />
          )}
          {item.user_unread_count > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {item.user_unread_count > 9 ? '9+' : item.user_unread_count}
              </Text>
            </View>
          )}
        </View>

        {/* Chat Info */}
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.masterName} numberOfLines={1}>
              {item.masters?.full_name || 'Usta'}
            </Text>
            <Text style={styles.time}>
              {formatTime(item.last_message_at)}
            </Text>
          </View>

          <Text style={styles.serviceName} numberOfLines={1}>
            {isAdmin ? item.masters?.profession : (item.orders?.service_name || '')}
          </Text>

          {item.last_message_text && (
            <Text
              style={[
                styles.lastMessage,
                item.user_unread_count > 0 && styles.unreadMessage
              ]}
              numberOfLines={2}
            >
              {item.last_message_sender_type === 'user' && 'Siz: '}
              {item.last_message_text}
            </Text>
          )}
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Yuklanmoqda...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chatlar</Text>
      </View>

      {/* Chat List */}
      {chatRooms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>Hali chatlar yo'q</Text>
          <Text style={styles.emptySubtext}>
            Buyurtma berganingizdan keyin ustalar bilan chat qilishingiz mumkin
          </Text>
        </View>
      ) : (
        <FlatList
          data={chatRooms}
          keyExtractor={(item) => item.id}
          renderItem={renderChatRoom}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  listContainer: {
    padding: 16,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  adminAvatarPlaceholder: {
    backgroundColor: colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  unreadText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 6,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  masterName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  serviceName: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  unreadMessage: {
    fontWeight: '600',
    color: colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default ChatListScreen;
