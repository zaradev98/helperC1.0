import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../utils/colors';

const PaymentReceiptScreen = ({ route, navigation }) => {
  const { payment } = route.params;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `To'lov cheki\n\nChek ID: ${payment.receiptId}\nXizmat: ${payment.service}\nUsta: ${payment.masterName}\nSumma: ${payment.amount.toLocaleString()} so'm\nSana: ${formatDate(payment.date)}\nStatus: To'landi ✓`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'card':
        return 'card-outline';
      case 'cash':
        return 'cash-outline';
      case 'payme':
        return 'wallet-outline';
      case 'click':
        return 'wallet-outline';
      default:
        return 'card-outline';
    }
  };

  const getPaymentMethodName = (method) => {
    switch (method) {
      case 'card':
        return 'Bank kartasi';
      case 'cash':
        return 'Naqd pul';
      case 'payme':
        return 'Payme';
      case 'click':
        return 'Click';
      default:
        return method;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>To'lov cheki</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Icon */}
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={80} color={colors.secondary} />
          </View>
          <Text style={styles.successTitle}>To'lov muvaffaqiyatli amalga oshirildi</Text>
          <Text style={styles.successSubtitle}>Xizmat uchun to'lov qabul qilindi</Text>
        </View>

        {/* Receipt Card */}
        <View style={styles.receiptCard}>
          {/* Receipt Header */}
          <View style={styles.receiptHeader}>
            <Ionicons name="receipt-outline" size={24} color={colors.primary} />
            <Text style={styles.receiptTitle}>To'lov cheki</Text>
          </View>

          <View style={styles.divider} />

          {/* Amount */}
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>To'langan summa</Text>
            <Text style={styles.amountValue}>{payment.amount.toLocaleString()} so'm</Text>
          </View>

          <View style={styles.divider} />

          {/* Receipt Details */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Chek ID</Text>
              <Text style={styles.detailValue}>{payment.receiptId}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Sana va vaqt</Text>
              <Text style={styles.detailValue}>{formatDate(payment.date)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>To'lov usuli</Text>
              <View style={styles.paymentMethodContainer}>
                <Ionicons
                  name={getPaymentMethodIcon(payment.paymentMethod)}
                  size={16}
                  color={colors.textPrimary}
                />
                <Text style={styles.detailValue}>{getPaymentMethodName(payment.paymentMethod)}</Text>
              </View>
            </View>

            {payment.cardNumber && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Karta raqami</Text>
                <Text style={styles.detailValue}>**** **** **** {payment.cardNumber}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={styles.statusBadge}>
                <Ionicons name="checkmark-circle" size={16} color={colors.secondary} />
                <Text style={styles.statusText}>To'landi</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Service Details */}
          <View style={styles.serviceSection}>
            <Text style={styles.sectionTitle}>Xizmat haqida</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Xizmat</Text>
              <Text style={styles.detailValue}>{payment.service}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Usta</Text>
              <Text style={styles.detailValue}>{payment.masterName}</Text>
            </View>

            {payment.profession && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Mutaxassislik</Text>
                <Text style={styles.detailValue}>{payment.profession}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Buyurtma ID</Text>
              <Text style={styles.detailValue}>#{payment.orderId}</Text>
            </View>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={colors.info} />
          <Text style={styles.infoText}>
            Ushbu chekni keyinchalik ko'rish uchun Buyurtmalar bo'limidagi buyurtma tafsilotlarida topishingiz mumkin.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={() => {
            // TODO: Implement download functionality
            console.log('Download receipt');
          }}
        >
          <Ionicons name="download-outline" size={20} color={colors.white} />
          <Text style={styles.downloadButtonText}>Chekni saqlash</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  shareButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  successContainer: {
    backgroundColor: colors.white,
    padding: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  receiptCard: {
    backgroundColor: colors.white,
    marginTop: 12,
    padding: 20,
  },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  amountSection: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  amountLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.secondary,
  },
  detailsSection: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.secondary + '15',
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
  },
  serviceSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.info + '10',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default PaymentReceiptScreen;
