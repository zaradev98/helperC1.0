import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CalendarComponent from './CalendarComponent';
import MapLocationPicker from './MapLocationPicker';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const BookingModal = ({ visible, onClose, master, navigation }) => {
  const { t } = useLanguage();
  const { userPhone } = useAuth();
  const [step, setStep] = useState(1); // 1: Address & Time, 2: Materials, 3: Payment
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [materials, setMaterials] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [location, setLocation] = useState(null);

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00',
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const handleNext = () => {
    if (step === 1 && !address) {
      Alert.alert(t('booking.error'), t('booking.addressRequired'));
      return;
    }
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleConfirmBooking();
    }
  };

  // Xaritadan joylashuvni tanlash
  const handleLocationSelect = (selectedLocation) => {
    setLocation(selectedLocation);
    setAddress(selectedLocation.address);
    setShowMapPicker(false);
  };

  const generateOrderNumber = () => {
    // Generate unique order number: ORD + YYYYMMDD + Random 4 digits
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `ORD${dateStr}${randomNum}`;
  };

  const handleConfirmBooking = async () => {
    try {
      setIsSubmitting(true);

      // Get user ID and user data - try auth first, then phone lookup
      const { data: { user: authUser } } = await supabase.auth.getUser();
      let currentUserId = null;
      let userData = null;

      if (authUser) {
        currentUserId = authUser.id;
        // Fetch user data from users table
        const { data: userFromDB } = await supabase
          .from('users')
          .select('full_name, phone, avatar_url')
          .eq('id', authUser.id)
          .single();
        userData = userFromDB;
      } else if (userPhone) {
        console.log('No auth user, searching user by phone for booking:', userPhone);
        const { data: userFromDB } = await supabase
          .from('users')
          .select('id, full_name, phone, avatar_url')
          .eq('phone', userPhone)
          .single();

        if (userFromDB) {
          currentUserId = userFromDB.id;
          userData = userFromDB;
          console.log('Found user ID for booking:', currentUserId);
        }
      }

      if (!currentUserId) {
        Alert.alert(
          t('common.error') || 'Xato',
          'Buyurtma berish uchun tizimga kirishingiz kerak'
        );
        setIsSubmitting(false);
        return;
      }

      // Generate unique order number
      const orderNumber = generateOrderNumber();

      // Calculate pricing
      const basePrice = master?.hourlyRate || 100000; // Default base price if not available
      const totalPrice = basePrice; // For now, no additional costs

      // Create order object with all required fields
      const orderData = {
        // Required fields
        order_number: orderNumber,
        user_id: currentUserId,
        master_id: master?.id,
        service_name: master?.profession || 'Xizmat',
        address: address, // Main address field (TEXT NOT NULL)
        apartment_number: apartment || null, // Separate apartment field
        scheduled_date: selectedDate.toISOString().split('T')[0],
        scheduled_time: selectedTime,
        base_price: basePrice,
        total_price: totalPrice,

        // Denormalized client info (for faster queries)
        client_name: userData?.full_name || 'Foydalanuvchi',
        client_phone: userData?.phone || userPhone,
        client_avatar: userData?.avatar_url || null,

        // Denormalized master info (for faster queries)
        master_name: master?.name || null,
        master_profession: master?.profession || null,

        // Optional fields
        user_notes: notes || null, // Customer notes
        duration_hours: 1, // Default 1 hour
        materials_cost: 0,
        additional_charges: 0,
        commission_rate: 10.00,
        commission_amount: basePrice * 0.10,

        // Status fields - use correct enum values
        status: 'new', // Schema allows: 'new', 'accepted', 'in_progress', 'completed', 'cancelled'
        payment_status: 'pending', // Schema allows: 'pending', 'paid', 'refunded'

        // Timestamps
        created_at: new Date().toISOString(),
      };

      console.log('📦 Creating order:', orderData);

      // Insert order into Supabase
      const { data: newOrder, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) {
        console.error('Error creating order:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('✅ Order created successfully:', newOrder);

      // Reset form
      setStep(1);
      setAddress('');
      setApartment('');
      setSelectedDate(new Date());
      setSelectedTime('10:00');
      setNotes('');
      setPaymentMethod('');

      // Close modal first
      onClose();

      // Show success notification
      Alert.alert(
        t('booking.confirmedTitle') || '🎉 Buyurtma tasdiqlandi!',
        t('booking.confirmedMessage', { name: master?.name }) || `${master?.name} bilan buyurtma muvaffaqiyatli yaratildi! Buyurtmalar sahifasiga o'tyapsiz...`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to Orders tab if navigation is available
              if (navigation) {
                navigation.navigate('Main', {
                  screen: 'Home',
                  params: {
                    screen:'HomeMain'
                  }
                });
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error in handleConfirmBooking:', error);
      Alert.alert(
        t('common.error') || 'Xato',
        error.message || 'Buyurtma yaratishda xatolik yuz berdi. Qaytadan urinib ko\'ring.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {step === 1 && t('booking.stepAddressTime')}
              {step === 2 && t('booking.stepMaterials')}
              {step === 3 && t('booking.stepPayment')}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Progress */}
          <View style={styles.progress}>
            {[1, 2, 3].map((s) => (
              <View
                key={s}
                style={[
                  styles.progressDot,
                  s <= step && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          <ScrollView
            style={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Step 1: Address & Time */}
            {step === 1 && (
              <View>
                <Text style={styles.label}>{t('booking.addressLabel')}</Text>

                {/* Xarita dan tanlash tugmasi */}
                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={() => setShowMapPicker(true)}
                >
                  <Ionicons name="map-outline" size={20} color="#32936F" />
                  <Text style={styles.mapButtonText}>
                    {location ? 'Xaritadan boshqa manzilni tanlash' : 'Xaritadan tanlash'}
                  </Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.input}
                  placeholder={t('booking.streetPlaceholder')}
                  value={address}
                  onChangeText={setAddress}
                />
                <TextInput
                  style={styles.input}
                  placeholder={t('booking.apartmentPlaceholder')}
                  value={apartment}
                  onChangeText={setApartment}
                />

                <Text style={[styles.label, { marginTop: 16 }]}>{t('booking.selectDate')}</Text>
                <CalendarComponent
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />

                <Text style={[styles.label, { marginTop: 16 }]}>{t('booking.selectTime')}</Text>
                <View style={styles.timeSlots}>
                  {timeSlots.map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeSlot,
                        selectedTime === time && styles.timeSlotActive,
                      ]}
                      onPress={() => setSelectedTime(time)}
                    >
                      <Text
                        style={[
                          styles.timeSlotText,
                          selectedTime === time && styles.timeSlotTextActive,
                        ]}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Step 2: Materials */}
            {step === 2 && (
              <View>
                <Text style={styles.label}>{t('booking.additionalNotes')}</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder={t('booking.problemPlaceholder')}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={4}
                />
                <Text style={styles.hint}>
                  {t('booking.exampleHint')}
                </Text>
              </View>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <View>
                <Text style={styles.label}>{t('booking.paymentMethod')}</Text>

                <TouchableOpacity
                  enabled={false} // Hozircha faollashtirilmagan
                  style={[
                    styles.paymentOption,
                    paymentMethod === 'card' && styles.paymentOptionActive,
                  ]}
                  // onPress={() => setPaymentMethod('card')}
                  onPress={() => { Alert.alert('Ma\'lumot', 'Hozircha faollashtirilmagan') }}
                >
                  <Ionicons name="card-outline" size={24} color="#333" />
                  <Text style={styles.paymentText}>{t('booking.card')}</Text>
                  {paymentMethod === 'card' && (
                    <Ionicons name="checkmark-circle" size={24} color="#32936F" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    paymentMethod === 'cash' && styles.paymentOptionActive,
                  ]}
                  onPress={() => setPaymentMethod('cash')}
                >
                  <Ionicons name="cash-outline" size={24} color="#333" />
                  <Text style={styles.paymentText}>{t('booking.cash')}</Text>
                  {paymentMethod === 'cash' && (
                    <Ionicons name="checkmark-circle" size={24} color="#32936F" />
                  )}
                </TouchableOpacity>

                <View style={styles.summary}>
                  <Text style={styles.summaryTitle}>{t('booking.summary')}</Text>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{t('booking.masterLabel')}</Text>
                    <Text style={styles.summaryValue}>{master?.name}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{t('booking.dateLabel')}</Text>
                    <Text style={styles.summaryValue}>
                      {selectedDate.toLocaleDateString('uz-UZ')} {selectedTime}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{t('booking.addressSummary')}</Text>
                    <Text style={styles.summaryValue}>{address}</Text>
                  </View>
                  <View style={[styles.summaryRow, { marginTop: 8 }]}>
                    <Text style={styles.summaryTotal}>{t('booking.estimatedPrice')}</Text>
                    <Text style={styles.summaryPrice}>
                      {master?.hourlyRate?.toLocaleString()} {t('booking.currency')}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            {step > 1 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep(step - 1)}
                disabled={isSubmitting}
              >
                <Text style={styles.backButtonText}>{t('booking.back')}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.nextButton,
                step === 1 && { flex: 1 },
                isSubmitting && styles.nextButtonDisabled
              ]}
              onPress={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.nextButtonText}>
                  {step === 3 ? t('booking.confirm') : t('booking.continue')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Map Location Picker Modal */}
      <Modal visible={showMapPicker} animationType="slide">
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <View style={styles.mapHeader}>
            <TouchableOpacity onPress={() => setShowMapPicker(false)}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.mapHeaderTitle}>Joylashuvni tanlang</Text>
            <View style={{ width: 28 }} />
          </View>
          <MapLocationPicker
            initialLocation={location}
            onLocationSelect={handleLocationSelect}
            showCurrentLocation={true}
          />
        </SafeAreaView>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 24,
    maxHeight: '85%',
    paddingBottom:Platform.OS === 'ios' ? '5%' : '10%',
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
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
  },
  progressDotActive: {
    backgroundColor: '#32936F',
    width: 24,
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f5f5f5',
  },
  timeSlotActive: {
    backgroundColor: '#4de3ac74',
    borderColor: '#32936F',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#666',
  },
  timeSlotTextActive: {
    color: '#2d2929ff',
    fontWeight: '600',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  paymentOptionActive: {
    backgroundColor: '#4de2ab57',
    borderWidth: 2,
    borderColor: '#32936F',
  },
  paymentText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  summary: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  summaryPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#32936F',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  backButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#32936F',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F0',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  mapButtonText: {
    fontSize: 14,
    color: '#32936F',
    fontWeight: '500',
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mapHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});

export default BookingModal;
