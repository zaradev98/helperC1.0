import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../utils/colors';
import { supabase } from '../lib/supabase';

/**
 * Master tomonidan narx taklif qilish modali
 * Usta ishni ko'rgandan keyin aniq narx taklif qiladi
 */
const PriceProposalModal = ({ visible, onClose, order, onSuccess }) => {
  const [proposedPrice, setProposedPrice] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitProposal = async () => {
    // Validation
    if (!proposedPrice || parseFloat(proposedPrice) <= 0) {
      Alert.alert('Xato', 'Narxni kiriting');
      return;
    }

    if (!workDescription.trim()) {
      Alert.alert('Xato', 'Ish tavsifini kiriting');
      return;
    }

    try {
      setIsSubmitting(true);

      const priceProposal = {
        proposed_price: parseFloat(proposedPrice),
        price_proposal_notes: JSON.stringify({
          work_description: workDescription.trim(),
          estimated_duration: estimatedDuration.trim(),
          additional_notes: notes.trim(),
        }),
        price_proposed_at: new Date().toISOString(),
        status: 'price_proposed',
        // total_price ni hali yangilamaymiz - mijoz qabul qilgandan keyin
      };

      const { error } = await supabase
        .from('orders')
        .update(priceProposal)
        .eq('id', order.id);

      if (error) throw error;

      Alert.alert(
        'Muvaffaqiyatli',
        'Narx taklifi yuborildi. Mijoz ko\'rib chiqadi.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (onSuccess) onSuccess();
              onClose();
            }
          }
        ]
      );

      // Reset form
      setProposedPrice('');
      setWorkDescription('');
      setEstimatedDuration('');
      setNotes('');
    } catch (error) {
      console.error('Narx taklifini yuborishda xato:', error);
      Alert.alert('Xato', 'Narx taklifini yuborishda xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Narx taklifi</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.instruction}>
              Ishni ko'rib chiqqandan keyin aniq narx va ish hajmini kiriting
            </Text>

            {/* Dastlabki narx (faqat ma'lumot uchun) */}
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Dastlabki narx (konsultatsiya):</Text>
              <Text style={styles.infoValue}>
                {order?.base_price?.toLocaleString()} so'm
              </Text>
            </View>

            {/* Taklif qilinadigan narx */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ish uchun narx *</Text>
              <View style={styles.priceInputWrapper}>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0"
                  keyboardType="numeric"
                  value={proposedPrice}
                  onChangeText={setProposedPrice}
                />
                <Text style={styles.currency}>so'm</Text>
              </View>
            </View>

            {/* Ish tavsifi */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bajarilishi kerak bo'lgan ishlar *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Masalan: Quvur almashtirish, kran o'rnatish..."
                multiline
                numberOfLines={4}
                value={workDescription}
                onChangeText={setWorkDescription}
              />
            </View>

            {/* Taxminiy muddat */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Taxminiy ish muddati</Text>
              <TextInput
                style={styles.input}
                placeholder="Masalan: 2-3 soat, 1 kun..."
                value={estimatedDuration}
                onChangeText={setEstimatedDuration}
              />
            </View>

            {/* Qo'shimcha izohlar */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Qo'shimcha izohlar</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Material kerakmi, maxsus asbob kerakmi..."
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Bekor qilish</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmitProposal}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Taklif yuborish</Text>
              )}
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
    backgroundColor: '#fff',
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
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    padding: 16,
    maxHeight: 500,
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  priceInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: 12,
    color: colors.primary,
  },
  currency: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  submitButton: {
    flex: 2,
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default PriceProposalModal;
