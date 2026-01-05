import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { userPhone } = useAuth();
  const [messages, setMessages] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isMaster, setIsMaster] = useState(false);

  const chatSubscriptionRef = useRef(null);
  const messagesSubscriptionRef = useRef(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 ChatContext unmounting');
      isMountedRef.current = false;
      cleanupSubscriptions();
    };
  }, []);

  const cleanupSubscriptions = useCallback(() => {
    if (chatSubscriptionRef.current) {
      console.log('🔴 Removing chat rooms subscription');
      supabase.removeChannel(chatSubscriptionRef.current);
      chatSubscriptionRef.current = null;
    }
    if (messagesSubscriptionRef.current) {
      console.log('🔴 Removing messages subscription');
      supabase.removeChannel(messagesSubscriptionRef.current);
      messagesSubscriptionRef.current = null;
    }
  }, []);

  // Fetch user ID and role
  const fetchUserInfo = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      let currentUserId = null;

      if (authUser) {
        currentUserId = authUser.id;
      } else if (userPhone) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('phone', userPhone)
          .single();

        if (userData) {
          currentUserId = userData.id;
          console.log('👤 User ID found:', currentUserId);
        }
      }

      if (!currentUserId) {
        console.log('❌ No user ID found');
        return null;
      }

      // Check if current user is a master
      const { data: masterData } = await supabase
        .from('masters')
        .select('id')
        .eq('id', currentUserId)
        .single();

      const isUserMaster = !!masterData;

      return { userId: currentUserId, isMaster: isUserMaster };
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  }, [userPhone]);

  // Fetch chat rooms
  const fetchChatRooms = useCallback(async () => {
    if (!userId) return;

    try {
      console.log('💬 Fetching chat rooms...');

      let query = supabase
        .from('chat_rooms')
        .select(`
          *,
          masters!master_id (
            full_name,
            avatar_url,
            profession
          ),
          users!user_id (
            full_name,
            avatar_url
          ),
          last_message:messages(content, created_at, sender_type)
        `)
        .order('updated_at', { ascending: false });

      if (isMaster) {
        query = query.eq('master_id', userId);
      } else {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching chat rooms:', error);
        throw error;
      }

      console.log(`✅ ${data?.length || 0} chat rooms loaded`);
      setChatRooms(data || []);
    } catch (error) {
      console.error('Error in fetchChatRooms:', error);
      throw error;
    }
  }, [userId, isMaster]);

  // Fetch messages for a specific chat room
  const fetchMessages = useCallback(async (chatRoomId) => {
    try {
      console.log('📨 Fetching messages for room:', chatRoomId);

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_room_id', chatRoomId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching messages:', error);
        throw error;
      }

      console.log(`✅ ${data?.length || 0} messages loaded`);
      return data || [];
    } catch (error) {
      console.error('Error in fetchMessages:', error);
      throw error;
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(async (chatRoomId, content, messageType = 'text') => {
    if (!userId) {
      console.error('Cannot send message without userId');
      return null;
    }

    try {
      const senderType = isMaster ? 'master' : 'user';

      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_room_id: chatRoomId,
          sender_id: userId,
          sender_type: senderType,
          content: content,
          message_type: messageType,
          is_read: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Update chat room's updated_at and last_message
      await supabase
        .from('chat_rooms')
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq('id', chatRoomId);

      console.log('✅ Message sent:', data.id);
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [userId, isMaster]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async (chatRoomId) => {
    if (!userId) return;

    try {
      const senderType = isMaster ? 'user' : 'master';

      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('chat_room_id', chatRoomId)
        .eq('sender_type', senderType)
        .eq('is_read', false);

      if (error) throw error;

      console.log('✅ Messages marked as read for room:', chatRoomId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [userId, isMaster]);

  // Setup real-time subscription for chat rooms
  const setupChatRoomsSubscription = useCallback(() => {
    if (!userId || chatSubscriptionRef.current) return;

    const filter = isMaster
      ? `master_id=eq.${userId}`
      : `user_id=eq.${userId}`;

    console.log('🔴 Setting up chat rooms real-time subscription');

    const channel = supabase
      .channel(`chat-rooms-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms',
          filter: filter
        },
        async (payload) => {
          if (!isMountedRef.current) return;

          console.log('📡 CHAT ROOM EVENT:', payload.eventType);

          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            // Refresh chat rooms
            await fetchChatRooms();
          } else if (payload.eventType === 'DELETE') {
            setChatRooms(prev => prev.filter(room => room.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Chat rooms subscription status:', status);
      });

    chatSubscriptionRef.current = channel;
  }, [userId, isMaster, fetchChatRooms]);

  // Setup real-time subscription for messages in a specific chat room
  const setupMessagesSubscription = useCallback((chatRoomId, onNewMessage) => {
    if (messagesSubscriptionRef.current) {
      supabase.removeChannel(messagesSubscriptionRef.current);
    }

    console.log('🔴 Setting up messages real-time subscription for room:', chatRoomId);

    const channel = supabase
      .channel(`messages-${chatRoomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `chat_room_id=eq.${chatRoomId}`
        },
        async (payload) => {
          if (!isMountedRef.current) return;

          console.log('📡 MESSAGE EVENT:', payload.eventType);

          if (payload.eventType === 'INSERT') {
            if (onNewMessage) {
              onNewMessage(payload.new);
            }
          } else if (payload.eventType === 'UPDATE') {
            // Update message (e.g., read status)
            setMessages(prev =>
              prev.map(msg =>
                msg.id === payload.new.id ? payload.new : msg
              )
            );
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Messages subscription status:', status);
      });

    messagesSubscriptionRef.current = channel;
  }, []);

  // Get or create chat room
  const getOrCreateChatRoom = useCallback(async (masterId) => {
    if (!userId) {
      console.error('Cannot create chat room without userId');
      return null;
    }

    try {
      // Check if chat room already exists
      const { data: existingRoom, error: searchError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('user_id', userId)
        .eq('master_id', masterId)
        .single();

      if (existingRoom) {
        console.log('✅ Chat room already exists:', existingRoom.id);
        return existingRoom;
      }

      // Create new chat room
      const { data: newRoom, error: createError } = await supabase
        .from('chat_rooms')
        .insert({
          user_id: userId,
          master_id: masterId,
        })
        .select()
        .single();

      if (createError) throw createError;

      console.log('✅ New chat room created:', newRoom.id);
      return newRoom;
    } catch (error) {
      console.error('Error in getOrCreateChatRoom:', error);
      throw error;
    }
  }, [userId]);

  // Initialize
  const initialize = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🚀 Initializing ChatContext...');

      const userInfo = await fetchUserInfo();
      if (!userInfo) {
        setLoading(false);
        return;
      }

      setUserId(userInfo.userId);
      setIsMaster(userInfo.isMaster);

      // Fetch initial chat rooms
      await fetchChatRooms();

      // Setup real-time subscription
      setupChatRoomsSubscription();

      console.log('✅ ChatContext initialized');
    } catch (error) {
      console.error('Error initializing ChatContext:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchUserInfo, fetchChatRooms, setupChatRoomsSubscription]);

  // Auto-initialize when userPhone becomes available
  useEffect(() => {
    if (userPhone && !userId) {
      initialize();
    }
  }, [userPhone, userId, initialize]);

  const value = {
    messages,
    chatRooms,
    loading,
    userId,
    isMaster,
    fetchChatRooms,
    fetchMessages,
    sendMessage,
    markMessagesAsRead,
    setupMessagesSubscription,
    getOrCreateChatRoom,
    cleanupSubscriptions,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
