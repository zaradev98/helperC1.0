import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../utils/colors';
import { useLanguage } from '../contexts/LanguageContext';

const CancelOrderModal = ({ visible, onClose, order, onSubmit }) => {
  const [selectedReason, setSelectedReason] = useState(null);
  const [customReason, setCustomReason] = useState('');
  const inputRef = useRef(null);
  const { t } = useLanguage();

  // Use locale-backed cancel reasons
  const cancelReasons = [
    { id: 'foundAnother', icon: 'checkmark-circle-outline' },
    { id: 'tooExpensive', icon: 'cash-outline' },
    { id: 'changedMind', icon: 'time-outline' },
    { id: 'masterNotResponding', icon: 'person-outline' },
  ];

  useEffect(() => {
    if (selectedReason === 'other' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedReason]);

  const handleSubmit = () => {
    let reason = '';

    if (selectedReason === 'other') {
      reason = customReason.trim();
    } else if (selectedReason) {
      const selected = cancelReasons.find(r => r.id === selectedReason);
      reason = selected ? t(`cancelReasons.${selected.id}`) : '';
    }

    if (!reason) {
      return;
    }

    onSubmit({
      orderId: order?.id,
      cancelReason: reason,
    });

    // Reset state
    setSelectedReason(null);
    setCustomReason('');
    onClose();
  };

  const handleClose = () => {
    setSelectedReason(null);
    setCustomReason('');
    onClose();
  };

  if (!order) return null;

  const canSubmit = selectedReason === 'other' ? customReason.trim().length >= 5 : selectedReason !== null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('orders.cancelOrder')}</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Warning */}
            <View style={styles.warningCard}>
              <Ionicons name="warning-outline" size={24} color={colors.warning} />
              <Text style={styles.warningText}>
                {t('orders.cancelConfirm')}
              </Text>
            </View>

            {/* Order Info */}
            <View style={styles.orderInfo}>
              <Text style={styles.orderInfoTitle}>{t('orders.orderDetail')}</Text>
              <Text style={styles.orderInfoText}>{t('orders.service')}: {order.service}</Text>
              <Text style={styles.orderInfoText}>{t('orders.master')}: {order.masterName}</Text>
              <Text style={styles.orderInfoText}>{t('orders.date')}: {order.date} • {order.time}</Text>
            </View>

            {/* Cancel Reasons */}
            <Text style={styles.sectionTitle}>{t('orders.cancelReason')}:</Text>

            {cancelReasons.map((reason) => (
              <TouchableOpacity
                key={reason.id}
                style={[
                  styles.reasonOption,
                  selectedReason === reason.id && styles.reasonOptionSelected
                ]}
                onPress={() => setSelectedReason(reason.id)}
              >
                <View style={styles.reasonContent}>
                  <Ionicons
                    name={reason.icon}
                    size={22}
                    color={selectedReason === reason.id ? colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.reasonText,
                      selectedReason === reason.id && styles.reasonTextSelected
                    ]}
                  >
                    {t(`cancelReasons.${reason.id}`)}
                  </Text>
                </View>
                <View style={styles.radioButton}>
                  {selectedReason === reason.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </TouchableOpacity>
            ))}

            {/* Other Reason */}
            <TouchableOpacity
              style={[
                styles.reasonOption,
                selectedReason === 'other' && styles.reasonOptionSelected
              ]}
              onPress={() => setSelectedReason('other')}
            >
              <View style={styles.reasonContent}>
                <Ionicons
                  name="create-outline"
                  size={22}
                  color={selectedReason === 'other' ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.reasonText,
                    selectedReason === 'other' && styles.reasonTextSelected
                  ]}
                >
                  {t('cancelReasons.other')}
                </Text>
              </View>
              <View style={styles.radioButton}>
                {selectedReason === 'other' && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>

            {/* Custom Reason Input */}
            {selectedReason === 'other' && (
              <View style={styles.customReasonContainer}>
                <TextInput
                  ref={inputRef}
                  style={styles.customReasonInput}
                  placeholder={t('orders.cancelReasonPlaceholder') || 'Sababni yozing (kamida 5 ta belgi)...'}
                  placeholderTextColor={colors.textTertiary}
                  value={customReason}
                  onChangeText={setCustomReason}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{customReason.length} / 200</Text>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.backButton} onPress={handleClose}>
              <Text style={styles.backButtonText}>{t('common.back')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cancelButton, !canSubmit && styles.cancelButtonDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              <Text style={styles.cancelButtonText}>{t('orders.cancelOrder')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  content: {
    padding: 16,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '10',
    padding: 12,
    borderRadius: 12,
    gap: 12,
    marginBottom: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  orderInfo: {
    backgroundColor: colors.gray50,
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  orderInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  orderInfoText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  reasonOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    backgroundColor: colors.white,
  },
  reasonOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '05',
  },
  reasonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  reasonText: {
    fontSize: 15,
    color: colors.textPrimary,
    flex: 1,
  },
  reasonTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  customReasonContainer: {
    marginTop: 4,
  },
  customReasonInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: colors.textPrimary,
    minHeight: 100,
    backgroundColor: colors.white,
  },
  charCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  backButton: {
    flex: 1,
    backgroundColor: colors.gray100,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cancelButton: {
    flex: 2,
    backgroundColor: colors.error,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonDisabled: {
    backgroundColor: colors.gray300,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default CancelOrderModal;
