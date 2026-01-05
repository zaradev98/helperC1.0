import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../utils/colors';
import { orders } from '../data/ordersData';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const OrderDetailScreen = ({ route, navigation }) => {
  const { t } = useLanguage();
  const { userPhone } = useAuth();
  const [loadingChat, setLoadingChat] = useState(false);

  // Support both order object and orderId
  const { order: passedOrder, orderId } = route.params;

  // If orderId is passed, find the order from orders data
  const order = passedOrder || orders.find(o => o.id === orderId);

  // If order not found, show error
  if (!order) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('orders.title')}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textSecondary} />
          <Text style={{ fontSize: 18, color: colors.textPrimary, marginTop: 16, textAlign: 'center' }}>
            {t('orders.noOrders')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleCall = () => {
    Linking.openURL(`tel:${order.phone}`);
  };

  const handleMessage = async () => {
    try {
      setLoadingChat(true);

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
        Alert.alert(
          'Xato',
          'Chatni ochish uchun tizimga kirishingiz kerak'
        );
        setLoadingChat(false);
        return;
      }

      // Get or create chat room for this order
      const { data: roomId, error } = await supabase
        .rpc('get_or_create_chat_room', {
          p_order_id: order.id,
          p_user_id: currentUserId,
          p_master_id: order.masterId
        });

      if (error) {
        console.error('Error getting chat room:', error);
        Alert.alert('Xato', 'Chatni ochishda xatolik yuz berdi');
        setLoadingChat(false);
        return;
      }

      console.log('📱 Chat room ID:', roomId);

      // Navigate to chat room
      navigation.navigate('ChatRoom', {
        roomId: roomId,
        orderId: order.id,
        masterName: order.masterName,
        masterAvatar: order.masterAvatar,
      });

    } catch (error) {
      console.error('Error in handleMessage:', error);
      Alert.alert('Xato', 'Chatni ochishda xatolik yuz berdi');
    } finally {
      setLoadingChat(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return colors.primary;
      case 'completed':
        return colors.secondary;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status) => {
    console.log('Translating status:', status);
    switch (status) {
      case 'waiting':
        return t('orders.msgStatus')
      case 'active':
        return t('orders.active');
      case 'completed':
        return t('orders.completed');
      case 'cancelled':
        return t('orders.cancelled');
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return 'time-outline';
      case 'completed':
        return 'checkmark-circle';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  // Address translation similar to HomeScreen
  const translateAddress = (address) => {
    if (!address || typeof address !== 'string') return address;
    const parts = address.split(',').map(p => p.trim());
    const mapToken = (token) => {
      const lower = token.toLowerCase();
      const mappings = {
        "toshkent": 'tashkent',
        "o'zbekiston": 'uzbekistan',
        "uzbekiston": 'uzbekistan',
        "yunusobod tumani": 'yunusobodDistrict',
        "chilonzor tumani": 'chilonzorDistrict',
        "sergeli tumani": 'sergeliDistrict',
        "olmazor tumani": 'olmazorDistrict',
        "yakkasaroy tumani": 'yakkasaroyDistrict',
      };
      const key = mappings[lower];
      return key ? t(`places.${key}`) : token;
    };
    return parts.map(mapToken).join(', ');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('orders.orderDetail')} {"\n"}#{order.id.toString().slice(0,8)}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '15' }]}>
            <Ionicons name={getStatusIcon(order.status)} size={20} color={getStatusColor(order.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
              {getStatusText(order.status)}
            </Text>
          </View>
        </View>

        {/* Master Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('orders.master')}</Text>
          <View style={styles.masterCard}>
            <Image source={{ uri: order.masterAvatar }} style={styles.masterAvatar} />
            <View style={styles.masterInfo}>
              <Text style={styles.masterName}>{order.masterName}</Text>
              <Text style={styles.profession}>{order.profession}</Text>
            </View>
          </View>
        </View>

        {/* Service Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('orders.service')}</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="construct-outline" size={20} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('orders.service')}</Text>
                <Text style={styles.infoValue}>{order.service}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color={colors.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('orders.date')} • {t('orders.time')}</Text>
                <Text style={styles.infoValue}>{order.date} • {order.time}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('orders.address')}</Text>
                <Text style={styles.infoValue}>{translateAddress(order.address)}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="cash-outline" size={20} color={colors.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('orders.price')}</Text>
                <Text style={styles.priceValue}>{order.price.toLocaleString()} so'm</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Notes */}
        {order.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('common.info') || 'Info'}</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{order.notes}</Text>
            </View>
          </View>
        )}

        {/* Rating */}
        {order.status === 'completed' && order.rating && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('rating.title')}</Text>
            <View style={styles.ratingCard}>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= order.rating ? 'star' : 'star-outline'}
                    size={24}
                    color={colors.warning}
                  />
                ))}
              </View>
              {order.review && (
                <Text style={styles.reviewText}>{order.review}</Text>
              )}
            </View>
          </View>
        )}

        {/* Cancel Reason */}
        {order.status === 'cancelled' && order.cancelReason && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('orders.cancelReason')}</Text>
            <View style={styles.cancelCard}>
              <Ionicons name="information-circle" size={20} color={colors.error} />
              <Text style={styles.cancelText}>{order.cancelReason}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Action Buttons */}
      {order.status === 'active' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.messageButton, loadingChat && styles.buttonDisabled]}
            onPress={handleMessage}
            disabled={loadingChat}
          >
            {loadingChat ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
            )}
            <Text style={styles.messageButtonText}>{t('orders.chat')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <Ionicons name="call" size={20} color={colors.white} />
            <Text style={styles.callButtonText}>{t('orders.call')}</Text>
          </TouchableOpacity>
        </View>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    paddingLeft:10,
    width:'100%',
    textAlign:'left',
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  statusCard: {
    backgroundColor: colors.white,
    padding: 16,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.gray50,
  },
  masterCard: {
    backgroundColor: colors.white,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  masterAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.gray100,
    marginRight: 12,
  },
  masterInfo: {
    flex: 1,
  },
  masterName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  profession: {
    fontSize: 15,
    color: colors.secondary,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: colors.white,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  notesCard: {
    backgroundColor: colors.white,
    padding: 16,
  },
  notesText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  ratingCard: {
    backgroundColor: colors.white,
    padding: 16,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  reviewText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  cancelCard: {
    backgroundColor: colors.white,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  cancelText: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  callButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default OrderDetailScreen;
