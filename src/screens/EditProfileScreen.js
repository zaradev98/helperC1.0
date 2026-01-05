import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import colors from '../utils/colors';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditProfileScreen = ({ route, navigation }) => {
  const { user, requireIdentification, isSignUp } = route.params || {};
  const { t } = useLanguage();
  const { deviceId } = useAuth();

  const [name, setName] = useState(user?.full_name || user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar_url || user?.avatar || 'https://i.pravatar.cc/150?img=8');
  const [isLoading, setIsLoading] = useState(false);
  const [originalPhone, setOriginalPhone] = useState(user?.phone || '');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // SMS Verification states
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [generatedCode, setGeneratedCode] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const inputRefs = useRef([]);
  const scrollViewRef = useRef(null);
  const smsScrollViewRef = useRef(null);

  // Realtime subscription states
  const [realtimeSubscription, setRealtimeSubscription] = useState(null);
  const [isUpdatingFromRealtime, setIsUpdatingFromRealtime] = useState(false);

  // Generate random 6-digit code
  const generateRandomCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated verification code:', code);
    return code;
  };

  // Keyboard listeners for main screen
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Keyboard listener for SMS modal
  useEffect(() => {
    if (!showSMSModal) return;

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      if (smsScrollViewRef.current) {
        setTimeout(() => {
          smsScrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    });

    return () => {
      keyboardDidShowListener.remove();
    };
  }, [showSMSModal]);

  // Setup realtime subscription for user updates
  useEffect(() => {
    if (!user?.id && !phone) return;

    const setupRealtimeSubscription = async () => {
      console.log('📡 Setting up realtime subscription for phone:', phone);

      try {
        // Subscribe to INSERT and UPDATE events for this user's phone
        const subscription = supabase
          .channel('user-updates')
          .on(
            'postgres_changes',
            {
              event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
              schema: 'public',
              table: 'users',
              filter: `phone=eq.${phone.trim()}`
            },
            (payload) => {
              console.log('📡 Realtime update received:', payload);
              
              // Prevent infinite loop by checking if update is from this component
              if (isUpdatingFromRealtime) {
                console.log('🔄 Update from this component, skipping...');
                return;
              }

              handleRealtimeUpdate(payload);
            }
          )
          .subscribe((status) => {
            console.log('📡 Realtime subscription status:', status);
          });

        setRealtimeSubscription(subscription);
      } catch (error) {
        console.error('❌ Error setting up realtime subscription:', error);
      }
    };

    setupRealtimeSubscription();

    // Cleanup subscription
    return () => {
      if (realtimeSubscription) {
        console.log('🔌 Unsubscribing from realtime');
        supabase.removeChannel(realtimeSubscription);
      }
    };
  }, [user?.id, phone, isUpdatingFromRealtime]);

  // Handle realtime updates
  const handleRealtimeUpdate = (payload) => {
    try {
      console.log('🔄 Processing realtime update:', payload.eventType);
      
      setIsUpdatingFromRealtime(true);

      switch (payload.eventType) {
        case 'INSERT':
          console.log('🆕 New user inserted:', payload.new);
          updateLocalState(payload.new);
          break;

        case 'UPDATE':
          console.log('📝 User updated:', payload.new);
          updateLocalState(payload.new);
          
          // Show notification about update
          Alert.alert(
            'Ma\'lumot yangilandi',
            'Profil ma\'lumotlaringiz boshqa qurilmada yangilandi.',
            [{ text: 'OK' }]
          );
          break;

        case 'DELETE':
          console.log('🗑️ User deleted:', payload.old);
          // Handle delete if needed
          break;

        default:
          console.log('🔍 Unknown event type:', payload.eventType);
      }
    } catch (error) {
      console.error('❌ Error processing realtime update:', error);
    } finally {
      setTimeout(() => setIsUpdatingFromRealtime(false), 1000);
    }
  };

  // Update local state with new data
  const updateLocalState = (newData) => {
    if (newData.full_name && newData.full_name !== name) {
      console.log('👤 Name updated via realtime:', newData.full_name);
      setName(newData.full_name);
    }

    if (newData.email && newData.email !== email) {
      console.log('📧 Email updated via realtime:', newData.email);
      setEmail(newData.email);
    }

    if (newData.avatar_url && newData.avatar_url !== avatar) {
      console.log('🖼️ Avatar updated via realtime:', newData.avatar_url);
      // Add cache busting to force image reload
      const timestamp = Date.now();
      const cachedAvatar = `${newData.avatar_url}?t=${timestamp}`;
      setAvatar(cachedAvatar);
    }

    if (newData.phone && newData.phone !== phone) {
      console.log('📱 Phone updated via realtime:', newData.phone);
      setPhone(newData.phone);
    }
  };

  // Avatar state debug logging
  useEffect(() => {
    console.log('🎯 Avatar state changed:', avatar);
  }, [avatar]);

  // Timer for SMS resend
  useEffect(() => {
    if (showSMSModal && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [showSMSModal, timer]);

  // SMS modal ochilganda random kod generatsiya qilish
  useEffect(() => {
    if (showSMSModal) {
      const newCode = generateRandomCode();
      setGeneratedCode(newCode);
      setShowCode(true);
    }
  }, [showSMSModal]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          t('editProfile.changePhoto'),
          t('editProfile.choosePhoto'),
          [{ text: t('common.ok') }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const selectedUri = result.assets[0].uri;
        console.log('📸 Image selected from gallery:', selectedUri);
        setAvatar(selectedUri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert(t('common.error'), t('editProfile.errors.imageUploadError') || t('common.error'));
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          t('editProfile.changePhoto'),
          t('editProfile.choosePhoto'),
          [{ text: t('common.ok') }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const selectedUri = result.assets[0].uri;
        console.log('📷 Image captured from camera:', selectedUri);
        setAvatar(selectedUri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert(t('common.error'), t('editProfile.errors.imageCaptureError') || t('common.error'));
    }
  };

  const handleChangePhoto = () => {
    Alert.alert(
      t('editProfile.changePhoto'),
      t('editProfile.choosePhoto'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('editProfile.fromGallery'), onPress: pickImage },
        { text: t('editProfile.fromCamera'), onPress: takePhoto },
      ]
    );
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('editProfile.errors.nameRequired'));
      return false;
    }

    // Email is optional, but if provided, must be valid
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert(t('common.error'), t('editProfile.errors.emailInvalid'));
        return false;
      }
    }

    if (!phone.trim()) {
      Alert.alert(t('common.error'), t('editProfile.errors.phoneRequired'));
      return false;
    }

    return true;
  };

  const handleCodeChange = (text, index) => {
    if (text.length > 1) {
      text = text.slice(-1);
    }

    const newCode = [...verificationCode];
    newCode[index] = text;
    setVerificationCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((digit) => digit !== '') && index === 5) {
      handleVerifyCode(newCode.join(''));
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = () => {
    if (canResend) {
      const newCode = generateRandomCode();
      setGeneratedCode(newCode);
      Alert.alert(
        t('common.success'),
        `SMS kod qaytadan yuborildi: ${newCode}`
      );
      setTimer(60);
      setCanResend(false);
      setVerificationCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleVerifyCode = async (code) => {
    if (code === generatedCode) {
      console.log('✅ Verification successful!');
      await saveToSupabase();
    } else {
      Alert.alert(
        t('common.error'),
        'Tasdiqlash kodi noto\'g\'ri. Iltimos, qaytadan urinib ko\'ring.'
      );
      setVerificationCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  // Save user data with realtime updates
  const saveToSupabase = async () => {
    try {
      setIsLoading(true);
      setIsUpdatingFromRealtime(true); // Prevent realtime loop

      let avatarUrl = avatar;
      if (avatar && avatar.startsWith('file://')) {
        console.log('📤 Uploading avatar to Supabase Storage...');
        
        try {
          const { uploadImage: runtimeUploadImage } = require('../utils/storage');
          const uploadResult = await runtimeUploadImage(avatar, 'avatars', 'users');
          
          const { url, error: uploadError } = uploadResult || {};
          
          if (uploadError) {
            console.error('❌ Avatar upload failed:', uploadError);
            Alert.alert(
              'Xato',
              'Rasmni yuklashda xatolik yuz berdi: ' + (uploadError.message || 'Noma\'lum xato')
            );
            setIsLoading(false);
            setIsUpdatingFromRealtime(false);
            return;
          }

          avatarUrl = url;
          console.log('✅ Avatar uploaded:', avatarUrl);
          const cachedUrl = `${url}?t=${Date.now()}`;
          setAvatar(cachedUrl);
        } catch (e) {
          console.error('❌ Runtime require uploadImage failed:', e);
          setIsLoading(false);
          setIsUpdatingFromRealtime(false);
          Alert.alert(t('common.error'), 'Rasmni yuklash funksiyasi topilmadi');
          return;
        }
      }

      // Get device ID
      let currentDeviceId = deviceId;
      if (!currentDeviceId) {
        // Fallback: get from AsyncStorage
        currentDeviceId = await AsyncStorage.getItem('deviceId');
      }

      const deviceInfo = {
        name: Device.deviceName || 'Unknown',
        model: Device.modelName || 'Unknown',
        os: Device.osName || 'Unknown',
        osVersion: Device.osVersion || 'Unknown',
      };

      const userData = {
        full_name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        avatar_url: avatarUrl,
        device_id: currentDeviceId,
        device_info: deviceInfo,
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('💾 Saving user data:', userData);

      // Check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('phone', phone.trim())
        .single();

      let result;

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingUser) {
        // Update existing user
        result = await supabase
          .from('users')
          .update(userData)
          .eq('phone', phone.trim())
          .select(); // Return updated data

        if (result.error) throw result.error;

        console.log('✅ User updated:', result.data);
      } else {
        // Insert new user (sign up)
        result = await supabase
          .from('users')
          .insert([{
            ...userData,
            created_at: new Date().toISOString(),
            is_active: true,
          }])
          .select(); // Return inserted data

        if (result.error) throw result.error;

        console.log('✅ New user created:', result.data);
      }

      // Trigger realtime update manually for other clients
      await triggerRealtimeUpdate(phone.trim());

      setShowSMSModal(false);
      setIsLoading(false);
      
      // Reset updating flag after a delay
      setTimeout(() => setIsUpdatingFromRealtime(false), 2000);

      if (isSignUp) {
        // Sign up holati - ma'lumotlar saqlandi, endi CreatePIN ga o'tish
        // AuthContext createPIN funksiyasi avtomatik Home ga olib boradi
        console.log('✅ Sign up completed, navigating to CreatePIN');
        navigation.replace('CreatePIN', {
          isNewUser: true,
          phone: phone.trim()
        });
      } else {
        Alert.alert(
          t('common.success'),
          requireIdentification
            ? 'Ma\'lumotlaringiz muvaffaqiyatli saqlandi. Endi buyurtma berishingiz mumkin!'
            : t('editProfile.successMessage') || 'Ma\'lumotlaringiz yangilandi',
          [
            {
              text: t('common.ok'),
              onPress: () => {
                navigation.goBack();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      setIsLoading(false);
      setIsUpdatingFromRealtime(false);
      Alert.alert(
        t('common.error'),
        error.message || 'Ma\'lumotlarni saqlashda xatolik yuz berdi. Qaytadan urinib ko\'ring.'
      );
    }
  };

  // Manual trigger for realtime updates
  const triggerRealtimeUpdate = async (userPhone) => {
    try {
      console.log('🚀 Triggering realtime update for phone:', userPhone);
      
      // Send a dummy update to trigger realtime
      await supabase
        .from('users')
        .update({ 
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('phone', userPhone);
        
      console.log('✅ Realtime update triggered');
    } catch (error) {
      console.error('❌ Error triggering realtime update:', error);
    }
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const phoneChanged = phone.trim() !== originalPhone.trim();

    if (phoneChanged || requireIdentification) {
      setShowSMSModal(true);
      setTimer(60);
      setCanResend(false);
      setVerificationCode(['', '', '', '', '', '']);

      const code = generateRandomCode();
      setGeneratedCode(code);
      
      Alert.alert(
        'SMS Tasdiqlash',
        `${phone} raqamiga tasdiqlash kodi yuborildi\n\nTasdiqlash kodi: ${code}`
      );
    } else {
      saveToSupabase();
    }
  };

  const toggleShowCode = () => {
    setShowCode(!showCode);
  };

  const autoFillCode = () => {
    const codeArray = generatedCode.split('');
    setVerificationCode(codeArray);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Realtime Status Indicator */}
      {realtimeSubscription && (
        <View style={styles.realtimeIndicator}>
          <Ionicons name="radio-outline" size={12} color={colors.success} />
          <Text style={styles.realtimeText}>Realtime faol</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('editProfile.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: avatar }} style={styles.avatar} />
              <TouchableOpacity style={styles.cameraButton} onPress={handleChangePhoto}>
                <Ionicons name="camera" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleChangePhoto}>
              <Text style={styles.changePhotoText}>{t('editProfile.changePhoto')}</Text>
            </TouchableOpacity>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('editProfile.name')}</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder={t('editProfile.namePlaceholder')}
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('editProfile.email')}</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('editProfile.emailPlaceholder')}
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('editProfile.phone')}</Text>
              <View style={[styles.inputContainer, styles.phoneInputDisabled]}>
                <Ionicons name="call-outline" size={20} color={colors.textTertiary} />
                <TextInput
                  style={[styles.input, styles.phoneInputText]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder={t('editProfile.phonePlaceholder')}
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="phone-pad"
                  editable={false}
                />
                <View style={styles.phoneLockedIcon}>
                  <Ionicons name="lock-closed" size={16} color={colors.textTertiary} />
                </View>
              </View>
              <Text style={styles.phoneHintText}>Tel raqamni o'zgartirib bo'lmaydi</Text>
            </View>
          </View>

          {/* Realtime Info Card */}
          <View style={styles.realtimeInfoCard}>
            <Ionicons name="sync-outline" size={20} color={colors.info} />
            <Text style={styles.realtimeInfoText}>
              Real vaqt rejimi yoqilgan. Profilingiz barcha qurilmalarda avtomatik yangilanadi.
            </Text>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer with Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.white} />
              <Text style={styles.saveButtonText}>{t('common.save')}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* SMS Verification Modal */}
      <Modal
        visible={showSMSModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSMSModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            ref={smsScrollViewRef}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="mail-outline" size={48} color={colors.primary} />
              </View>
              <Text style={styles.modalTitle}>Tasdiqlash kodi</Text>
              <Text style={styles.modalSubtitle}>
                {phone} raqamiga yuborilgan 6 xonali kodni kiriting
              </Text>
              
              {/* Generated Code Display */}
              <View style={styles.codeDisplayContainer}>
                <View style={styles.codeDisplayHeader}>
                  <Text style={styles.codeDisplayTitle}>Tasdiqlash kodi:</Text>
                  <TouchableOpacity onPress={toggleShowCode} style={styles.eyeButton}>
                    <Ionicons 
                      name={showCode ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color={colors.primary} 
                    />
                  </TouchableOpacity>
                </View>
                
                {showCode && (
                  <>
                    <Text style={styles.generatedCode}>
                      {generatedCode}
                    </Text>
                    <TouchableOpacity onPress={autoFillCode} style={styles.autoFillButton}>
                      <Text style={styles.autoFillText}>Kodni avto-to'ldirish</Text>
                      <Ionicons name="copy-outline" size={16} color={colors.white} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>

            <View style={styles.codeContainer}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={styles.codeInput}
                  value={verificationCode[index]}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            <View style={styles.timerContainer}>
              {timer > 0 ? (
                <Text style={styles.timerText}>
                  Kodni qayta yuborish: {timer}s
                </Text>
              ) : (
                <TouchableOpacity onPress={handleResendCode}>
                  <Text style={styles.resendText}>
                    Kodni qayta yuborish
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowSMSModal(false);
                  setVerificationCode(['', '', '', '', '', '']);
                  setShowCode(false);
                }}
              >
                <Text style={styles.modalCancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalVerifyButton,
                  !verificationCode.every(d => d !== '') && styles.modalVerifyButtonDisabled
                ]}
                onPress={() => handleVerifyCode(verificationCode.join(''))}
                disabled={!verificationCode.every(d => d !== '')}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.modalVerifyButtonText}>Tasdiqlash</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  realtimeIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  realtimeText: {
    fontSize: 10,
    color: colors.success,
    fontWeight: '600',
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
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.gray100,
  },
  cameraButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  changePhotoText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },
  formSection: {
    backgroundColor: colors.white,
    marginTop: 12,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 0,
    backgroundColor: colors.gray50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 12,
    paddingVertical: Platform.OS === 'android' ? 10 : 0,
  },
  realtimeInfoCard: {
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
  realtimeInfoText: {
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
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.secondary,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  // SMS Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    marginTop: 40,
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  codeDisplayContainer: {
    width: '100%',
    backgroundColor: colors.gray50,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeDisplayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeDisplayTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  eyeButton: {
    padding: 4,
  },
  generatedCode: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    letterSpacing: 6,
    marginVertical: 8,
  },
  autoFillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  autoFillText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  codeInput: {
    width: 45,
    height: 50,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    backgroundColor: colors.gray50,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalVerifyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.secondary,
    alignItems: 'center',
  },
  modalVerifyButtonDisabled: {
    opacity: 0.5,
  },
  modalVerifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  phoneInputDisabled: {
    backgroundColor: colors.gray50,
    opacity: 0.7,
  },
  phoneInputText: {
    color: colors.textTertiary,
  },
  phoneLockedIcon: {
    marginRight: 8,
  },
  phoneHintText: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 6,
    fontStyle: 'italic',
  },
});

export default EditProfileScreen;