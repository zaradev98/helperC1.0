import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../utils/colors';
import { supabase } from '../lib/supabase';

/**
 * Mijoz uchun ustaning narx taklifini ko'rish va tasdiqlash komponenti
 * OrderDetailScreen da ishlatiladi
 */
const PriceApprovalCard = ({ order, onApprovalChange }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Agar narx taklif qilinmagan bo'lsa, hech narsa ko'rsatmaymiz
  if (order.status !== 'price_proposed' || !order.proposed_price) {
    return null;
  }

  // Parse proposal notes
  let proposalDetails = null;
  try {
    proposalDetails = order.price_proposal_notes
      ? JSON.parse(order.price_proposal_notes)
      : null;
  } catch (e) {
    console.error('Error parsing proposal notes:', e);
  }

  const handleAcceptPrice = async () => {
    Alert.alert(
      'Narxni tasdiqlash',
      `Siz ${order.proposed_price?.toLocaleString()} so'm narxga rozilik bildiryapsiz. Davom etamizmi?`,
      [
        {
          text: 'Bekor qilish',
          style: 'cancel'
        },
        {
          text: 'Ha, tasdiqlash',
          onPress: async () => {
            try {
              setIsProcessing(true);

              const { error } = await supabase
                .from('orders')
                .update({
                  total_price: order.proposed_price,
                  status: 'accepted',
                  price_accepted_at: new Date().toISOString(),
                })
                .eq('id', order.id);

              if (error) throw error;

              Alert.alert(
                'Muvaffaqiyatli',
                'Narx tasdiqlandi. Usta tez orada ishni boshlaydi.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      if (onApprovalChange) onApprovalChange();
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Narxni tasdiqlashda xato:', error);
              Alert.alert('Xato', 'Narxni tasdiqlashda xatolik yuz berdi');
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  };

  const handleRejectPrice = async () => {
    Alert.alert(
      'Narxni rad etish',
      'Agar narx mos kelmasa, buyurtmani bekor qilishingiz mumkin.',
      [
        {
          text: 'Ortga',
          style: 'cancel'
        },
        {
          text: 'Buyurtmani bekor qilish',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsProcessing(true);

              const { error } = await supabase
                .from('orders')
                .update({
                  status: 'cancelled',
                  cancel_reason: 'Narx mos kelmadi',
                })
                .eq('id', order.id);

              if (error) throw error;

              Alert.alert(
                'Bekor qilindi',
                'Buyurtma bekor qilindi',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      if (onApprovalChange) onApprovalChange();
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Buyurtmani bekor qilishda xato:', error);
              Alert.alert('Xato', 'Bekor qilishda xatolik yuz berdi');
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Alert header */}
      <View style={styles.alertHeader}>
        <View style={styles.iconWrapper}>
          <Ionicons name="pricetag" size={24} color={colors.primary} />
        </View>
        <Text style={styles.alertTitle}>Narx taklifi</Text>
      </View>

      {/* Price comparison */}
      <View style={styles.priceComparison}>
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>Dastlabki narx:</Text>
          <Text style={styles.oldPrice}>
            {order.base_price?.toLocaleString()} so'm
          </Text>
        </View>
        <Ionicons name="arrow-forward" size={20} color="#999" />
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>Taklif qilingan narx:</Text>
          <Text style={styles.proposedPrice}>
            {order.proposed_price?.toLocaleString()} so'm
          </Text>
        </View>
      </View>

      {/* Work details */}
      {proposalDetails && (
        <View style={styles.detailsSection}>
          {proposalDetails.work_description && (
            <View style={styles.detailItem}>
              <View style={styles.detailHeader}>
                <Ionicons name="construct-outline" size={18} color={colors.secondary} />
                <Text style={styles.detailTitle}>Bajarilishi kerak bo'lgan ishlar:</Text>
              </View>
              <Text style={styles.detailText}>{proposalDetails.work_description}</Text>
            </View>
          )}

          {proposalDetails.estimated_duration && (
            <View style={styles.detailItem}>
              <View style={styles.detailHeader}>
                <Ionicons name="time-outline" size={18} color={colors.secondary} />
                <Text style={styles.detailTitle}>Taxminiy muddat:</Text>
              </View>
              <Text style={styles.detailText}>{proposalDetails.estimated_duration}</Text>
            </View>
          )}

          {proposalDetails.additional_notes && (
            <View style={styles.detailItem}>
              <View style={styles.detailHeader}>
                <Ionicons name="information-circle-outline" size={18} color={colors.secondary} />
                <Text style={styles.detailTitle}>Qo'shimcha ma'lumot:</Text>
              </View>
              <Text style={styles.detailText}>{proposalDetails.additional_notes}</Text>
            </View>
          )}
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={handleRejectPrice}
          disabled={isProcessing}
        >
          <Ionicons name="close-circle-outline" size={20} color={colors.error} />
          <Text style={styles.rejectButtonText}>Rad etish</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.acceptButton]}
          onPress={handleAcceptPrice}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.acceptButtonText}>Tasdiqlash</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Info note */}
      <View style={styles.infoNote}>
        <Ionicons name="information-circle-outline" size={16} color="#666" />
        <Text style={styles.infoText}>
          Narxni tasdiqlasangiz, usta ishni boshlaydi
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF9F5',
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    borderWidth: 2,
    borderColor: colors.primary + '30',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  priceComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  priceItem: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  oldPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    textDecorationLine: 'line-through',
  },
  proposedPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  detailsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailItem: {
    marginBottom: 12,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginLeft: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  rejectButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.error,
  },
  rejectButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.error,
  },
  acceptButton: {
    backgroundColor: colors.primary,
  },
  acceptButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
});

export default PriceApprovalCard;
