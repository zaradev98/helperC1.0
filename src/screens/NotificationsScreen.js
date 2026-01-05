import React, { useState, useEffect } from 'react';
import { Platform, Linking } from 'react-native';
import NotificationCenter from '../components/NotificationCenter';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const NotificationsScreen = ({ navigation }) => {
  const { userPhone } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from Supabase
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);

        // Get current user ID - try auth first, then phone lookup
        const { data: { user: authUser } } = await supabase.auth.getUser();

        let currentUserId = null;

        if (authUser) {
          currentUserId = authUser.id;
        } else if (userPhone) {
          // No auth user, try to find user by phone
          console.log('No auth user, searching user by phone for notifications:', userPhone);
          const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('phone', userPhone)
            .single();

          if (userData) {
            currentUserId = userData.id;
            console.log('Found user ID for notifications:', currentUserId);
          }
        }

        if (!currentUserId) {
          console.log('No user found, cannot fetch notifications');
          setLoading(false);
          return;
        }

        // Fetch notifications for this specific user
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', currentUserId)
          .eq('user_type', 'user')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          // Map Supabase data to component format and filter out review notifications
          const mappedNotifications = data
            .filter(notif => notif.type !== 'review') // Exclude review notifications
            .map(notif => ({
              ...notif,
              read: notif.is_read ?? notif.read ?? false,
              date: notif.created_at || notif.date,
            }));
          setNotifications(mappedNotifications);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userPhone]);

  const handleMarkAllAsRead = async () => {
    try {
      // Mark all notifications as read in Supabase
      const notificationIds = notifications.map(n => n.id);
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', notificationIds);

      if (error) {
        throw error;
      }

      // Update local state
      setNotifications(notifications.map(notification => ({
        ...notification,
        read: true,
        is_read: true,
      })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationPress = async (notification) => {
    console.log('Notification pressed:', notification);

    // Mark notification as read in Supabase
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notification.id);

      if (error) {
        throw error;
      }

      // Update local state
      setNotifications(notifications.map(n =>
        n.id === notification.id ? { ...n, read: true, is_read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'booking':
        // Navigate to specific order detail
        if (notification.orderId) {
          navigation.navigate('Bookings', {
            screen: 'OrderDetail',
            params: { orderId: notification.orderId }
          });
        } else {
          navigation.navigate('Bookings');
        }
        break;

      case 'message':
        // Navigate to specific chat
        if (notification.masterId) {
          navigation.navigate('Bookings', {
            screen: 'Chat',
            params: {
              master: {
                id: notification.masterId,
                name: notification.masterName || 'Usta'
              }
            }
          });
        } else {
          // If no specific chat, just show notification detail
          navigation.navigate('NotificationDetail', { notification });
        }
        break;

      case 'payment':
        // Navigate to payment receipt
        if (notification.paymentData) {
          navigation.navigate('PaymentReceipt', { payment: notification.paymentData });
        } else {
          navigation.navigate('Bookings');
        }
        break;

      case 'review':
        // Navigate to order detail to rate
        if (notification.orderId) {
          navigation.navigate('Bookings', {
            screen: 'OrderDetail',
            params: { orderId: notification.orderId, showRating: true }
          });
        } else {
          navigation.navigate('Bookings');
        }
        break;

      case 'promo':
      case 'announcement':
        // Show full HTML content in reader screen
        navigation.navigate('NotificationDetail', { notification });
        break;

      case 'update':
        // Open app store
        const appStoreUrl = Platform.OS === 'ios'
          ? 'https://apps.apple.com/app/helper-1-0'
          : 'https://play.google.com/store/apps/details?id=com.helper10';
        Linking.openURL(appStoreUrl);
        break;

      default:
        // For any other type, show notification detail
        navigation.navigate('NotificationDetail', { notification });
        break;
    }
  };

  return (
    <NotificationCenter
      notifications={notifications}
      onNotificationPress={handleNotificationPress}
      onMarkAllAsRead={handleMarkAllAsRead}
      loading={loading}
    />
  );
};

export default NotificationsScreen;
