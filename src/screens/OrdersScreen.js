import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../utils/colors';
import RatingModal from '../components/RatingModal';
import CancelOrderModal from '../components/CancelOrderModal';
import { useLanguage } from '../contexts/LanguageContext';
import { useOrders } from '../contexts/OrdersContext';

const OrdersScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const {
    orders,
    loading,
    realtimeEnabled,
    refreshOrders,
    cancelOrder: cancelOrderContext,
    rateOrder: rateOrderContext
  } = useOrders();

  const [activeTab, setActiveTab] = useState('active');
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    console.log('🔄 Refreshing orders from screen...');

    try {
      await refreshOrders();
      console.log('✅ Orders refreshed from screen');
    } catch (error) {
      console.error('Error refreshing orders:', error);
      Alert.alert('Xato', 'Ma\'lumotlarni yangilashda xatolik');
    } finally {
      setRefreshing(false);
    }
  }, [refreshOrders]);

  // Format price
  const formatPrice = (price) => {
    return price ? price.toLocaleString('uz-UZ') + ' so\'m' : '0 so\'m';
  };

  const getFilteredOrders = () => {
    return orders.filter(order => order.status === activeTab);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return colors.primary;
      case 'completed': return colors.secondary;
      case 'cancelled': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (order) => {
    if (order.dbStatus === 'new') return t('orders.msgStatus') || 'Javob kutilmoqda';
    if (order.dbStatus === 'accepted') return t('orders.msgStatusAccepted') || 'Qabul qilindi';
    if (order.status === 'completed') return t('orders.completed') || 'Yakunlandi';
    if (order.status === 'cancelled') return t('orders.cancelled') || 'Bekor qilindi';
    return order.status;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return 'time-outline';
      case 'completed': return 'checkmark-circle';
      case 'cancelled': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const handleOpenRatingModal = (order) => {
    setSelectedOrder(order);
    setRatingModalVisible(true);
  };

  const handleSubmitRating = async (ratingData) => {
    try {
      await rateOrderContext(ratingData.orderId, ratingData.rating, ratingData.review);
      Alert.alert('Muvaffaqiyatli', 'Baholash yuborildi');
      setRatingModalVisible(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Xato', 'Baholashni yuborishda xatolik');
    }
  };

  const handleOpenCancelModal = (order) => {
    setOrderToCancel(order);
    setCancelModalVisible(true);
  };

  const handleCancelOrder = async (cancelData) => {
    try {
      await cancelOrderContext(cancelData.orderId, cancelData.cancelReason);
      Alert.alert('Muvaffaqiyatli', 'Buyurtma bekor qilindi');
      setCancelModalVisible(false);
      setOrderToCancel(null);
    } catch (error) {
      console.error('Error cancelling order:', error);
      Alert.alert('Xato', 'Buyurtmani bekor qilishda xatolik');
    }
  };

  const renderOrderCard = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetail', { order: item })}
    >
      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
        <Ionicons name={getStatusIcon(item.status)} size={16} color={getStatusColor(item.status)} />
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {getStatusText(item)}
        </Text>
      </View>

      {/* Master Info */}
      <View style={styles.masterInfo}>
        <Image source={{ uri: item.masterAvatar }} style={styles.masterAvatar} />
        <View style={styles.masterDetails}>
          <Text style={styles.masterName}>{item.masterName}</Text>
          <Text style={styles.profession}>{item.profession}</Text>
        </View>
      </View>

      {/* Service Info */}
      <View style={styles.serviceInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="construct-outline" size={18} color={colors.primary} />
          <Text style={styles.serviceText}>{item.service}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} color={colors.secondary} />
          <Text style={styles.dateText}>{item.date} • {item.time}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color={colors.primary} />
          <Text style={styles.addressText} numberOfLines={1}>{item.address}</Text>
        </View>
      </View>

      {/* Price & Action */}
      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>{t('orders.price') || 'Narx:'}:</Text>
          <Text style={styles.price}>{formatPrice(item.price)}</Text>
        </View>

        {item.status === 'completed' && item.rating && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color={colors.warning} />
            <Text style={styles.ratingText}>{item.rating}.0</Text>
          </View>
        )}

        {item.status === 'completed' && !item.rating && (
          <TouchableOpacity
            style={styles.ratingButton}
            onPress={() => handleOpenRatingModal(item)}
          >
            <Ionicons name="star-outline" size={16} color={colors.secondary} />
            <Text style={styles.ratingButtonText}>{t('orders.rate') || 'Baholash'}</Text>
          </TouchableOpacity>
        )}

        {item.status === 'active' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('OrderDetail', { order: item })}
          >
            <Text style={styles.actionButtonText}>{t('orders.viewDetails') || 'Batafsil'}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Cancel Button for Active Orders */}
      {item.status === 'active' && (
        <TouchableOpacity
          style={styles.cancelOrderButton}
          onPress={() => handleOpenCancelModal(item)}
        >
          <Ionicons name="close-circle-outline" size={18} color={colors.error} />
          <Text style={styles.cancelOrderButtonText}>{t('orders.cancelOrder') || 'Bekor qilish'}</Text>
        </TouchableOpacity>
      )}

      {/* Cancel Reason */}
      {item.status === 'cancelled' && item.cancelReason && (
        <View style={styles.cancelReasonContainer}>
          <Ionicons name="information-circle" size={16} color={colors.textSecondary} />
          <Text style={styles.cancelReason}>{item.cancelReason}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name={activeTab === 'active' ? 'calendar-outline' : activeTab === 'completed' ? 'checkmark-circle-outline' : 'close-circle-outline'}
        size={64}
        color={colors.gray300}
      />
      <Text style={styles.emptyText}>
        {activeTab === 'active' ? 'Faol buyurtmalar yo\'q' :
         activeTab === 'completed' ? 'Yakunlangan buyurtmalar yo\'q' :
         'Bekor qilingan buyurtmalar yo\'q'}
      </Text>
      {realtimeEnabled && (
        <Text style={styles.emptySubtext}>
          Yangi buyurtmalar avtomatik ko'rinadi
        </Text>
      )}
    </View>
  );

  const filteredOrders = getFilteredOrders();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('orders.title') || 'Buyurtmalar'}</Text>
        {realtimeEnabled && (
          <View style={styles.realtimeBadge}>
            <View style={styles.realtimeDot} />
            <Text style={styles.realtimeText}>Real-time</Text>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Ionicons
            name="time-outline"
            size={20}
            color={activeTab === 'active' ? colors.primary : colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            {t('orders.active') || 'Faol'}
          </Text>
          {orders.filter(o => o.status === 'active').length > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{orders.filter(o => o.status === 'active').length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
          onPress={() => setActiveTab('completed')}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color={activeTab === 'completed' ? colors.secondary : colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
            {t('orders.completed') || 'Yakunlangan'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'cancelled' && styles.tabActive]}
          onPress={() => setActiveTab('cancelled')}
        >
          <Ionicons
            name="close-circle-outline"
            size={20}
            color={activeTab === 'cancelled' ? colors.error : colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'cancelled' && styles.tabTextActive]}>
            {t('orders.cancelled') || 'Bekor qilingan'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            Real-time yangilanishlar faollashtirilmoqda...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      )}

      {/* Rating Modal */}
      <RatingModal
        visible={ratingModalVisible}
        onClose={() => {
          setRatingModalVisible(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onSubmit={handleSubmitRating}
      />

      {/* Cancel Order Modal */}
      <CancelOrderModal
        visible={cancelModalVisible}
        onClose={() => {
          setCancelModalVisible(false);
          setOrderToCancel(null);
        }}
        order={orderToCancel}
        onSubmit={handleCancelOrder}
      />
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
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  realtimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.secondary + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  realtimeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },
  realtimeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.gray50,
    gap: 6,
  },
  tabActive: {
    backgroundColor: colors.primary + '10',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  masterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  masterAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.gray100,
    marginRight: 12,
  },
  masterDetails: {
    flex: 1,
  },
  masterName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  profession: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '500',
  },
  serviceInfo: {
    gap: 10,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  serviceText: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warning + '10',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.warning,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  ratingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.secondary,
  },
  ratingButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  cancelOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  cancelOrderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
  cancelReasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.gray50,
    borderRadius: 8,
  },
  cancelReason: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default OrdersScreen;
