import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../utils/colors';
import { useAuth } from '../contexts/AuthContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
// Agar react-i18next ishlatmasangiz, oddiy til fayllari yarating

// Til matnlari obyekti
const TRANSLATIONS = {
  'uz-latin': {
    title: 'Telefon raqamingizni kiriting',
    subtitle: 'Biz sizga tasdiqlash kodini SMS orqali yuboramiz',
    placeholder: '00 000 00 00',
    buttonText: 'Davom etish',
    modalTitle: 'Tilni tanlang',
    closeButtonText: 'Yopish',
    currentSelection: 'Tanlangan:',
    error: 'Xato',
    errorMessage: "Iltimos, to'g'ri telefon raqamini kiriting",
    smsVerification: 'SMS Tasdiqlash',
    newDeviceMessage: 'Yangi qurilma aniqlandi. Tasdiqlash kodi yuboriladi',
    inactiveMessage: '3 oydan ortiq faoliyat yo\'q. Tasdiqlash kodi yuboriladi',
    defaultMessage: 'Tasdiqlash kodi yuboriladi',
    languageChanged: "Til o'zgartirildi",
    languageRestart: "Ilovani qayta ishga tushirish kerak bo'lishi mumkin",
  },
  'uz-cyrillic': {
    title: 'Телефон рақамингизни киритинг',
    subtitle: 'Биз сизга тасдиқлаш кодини SMS орқали юборамиз',
    placeholder: '00 000 00 00',
    buttonText: 'Давом этиш',
    modalTitle: 'Тилни танланг',
    closeButtonText: 'Ёпиш',
    currentSelection: 'Танланган:',
    error: 'Хато',
    errorMessage: 'Илтимос, тўғри телефон рақамини киритинг',
    smsVerification: 'SMS Тасдиқлаш',
    newDeviceMessage: 'Янги қурилма аниқланди. Тасдиқлаш коди юборилади',
    inactiveMessage: '3 ойдан ортиқ фаолият йўқ. Тасдиқлаш коди юборилади',
    defaultMessage: 'Тасдиқлаш коди юборилади',
    languageChanged: 'Тил ўзгартирилди',
    languageRestart: 'Иловани қайта ишга тушириш керак бўлиши мумкин',
  },
  'ru': {
    title: 'Введите свой номер телефона',
    subtitle: 'Мы отправим вам код подтверждения по SMS',
    placeholder: '00 000 00 00',
    buttonText: 'Продолжить',
    modalTitle: 'Выберите язык',
    closeButtonText: 'Закрыть',
    currentSelection: 'Выбрано:',
    error: 'Ошибка',
    errorMessage: 'Пожалуйста, введите правильный номер телефона',
    smsVerification: 'SMS Подтверждение',
    newDeviceMessage: 'Обнаружено новое устройство. Будет отправлен код подтверждения',
    inactiveMessage: 'Нет активности более 3 месяцев. Будет отправлен код подтверждения',
    defaultMessage: 'Код подтверждения будет отправлен',
    languageChanged: 'Язык изменен',
    languageRestart: 'Может потребоваться перезапуск приложения',
  },
};

const LANGUAGES = [
  { label: "🇺🇿 O'zbekcha (Lotin)", value: 'uz-latin', flag: '🇺🇿' },
  { label: "🇺🇿 Ўзбекча (Кирилл)", value: 'uz-cyrillic', flag: '🇺🇿' },
  { label: "🇷🇺 Русский", value: 'ru', flag: '🇷🇺' },
];

const PhoneInputScreen = ({ navigation }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [languageChecked, setLanguageChecked] = useState(false);
  const { savePhoneNumber, checkDeviceAndLastLogin } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState('uz-latin');
  
  // Til matnlarini olish
  const t = TRANSLATIONS[selectedLanguage];

  // Til o'zgarishini kuzatish
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    checkLanguageSelection();
  }, []);

  const checkLanguageSelection = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('@helper_platform_language');
      const language = savedLanguage || 'uz-latin';
      setSelectedLanguage(language);
      console.log('Saqlangan til:', language);
      if (!savedLanguage) {
        await AsyncStorage.setItem('@helper_platform_language', 'uz-latin');
        // Agar til tanlanmagan bo'lsa, darhol til tanlash ekraniga o'tkazish
        navigation.replace('LanguageSelection', { isInitial: true });
      } else {
        setLanguageChecked(true);
      }
    } catch (error) {
      console.error('Til tekshirishda xato:', error);
      setLanguageChecked(true);
    }
  };

const formatPhoneNumber = (text) => {
    // Faqat raqamlarni qoldirish
    const cleaned = text.replace(/\D/g, '');
    
    // 2 3 2 2 formatida formatlash
    if (cleaned.length <= 2) {
      return cleaned;
    } else if (cleaned.length <= 5) {
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    } else if (cleaned.length <= 7) {
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
    } else if (cleaned.length <= 9) {
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7)}`;
    } else {
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)}`;
    }
  };

  const handlePhoneChange = (text) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
  };

  const handleContinue = async () => {
    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    if (cleanedPhone.length < 9) {
      Alert.alert(t.error, t.errorMessage);
      return;
    }

    setLoading(true);
    const fullPhone = `+998${cleanedPhone}`;
    await savePhoneNumber(fullPhone);

    const savedLanguage = await AsyncStorage.getItem('@helper_platform_language');
    if (!savedLanguage) {
      setLoading(false);
      navigation.navigate('LanguageSelection', {
        isInitial: true,
        phoneNumber: fullPhone
      });
      return;
    }

    const { needsVerification, reason } = await checkDeviceAndLastLogin(fullPhone);
    setLoading(false);

    if (needsVerification) {
      let message = t.defaultMessage;
      if (reason === 'new_device') {
        message = t.newDeviceMessage;
      } else if (reason === 'inactive_3months') {
        message = t.inactiveMessage;
      }

      Alert.alert(t.smsVerification, message, [
        {
          text: 'OK',
          onPress: () => navigation.navigate('SMSVerification', { 
            phoneNumber: fullPhone, 
            reason 
          })
        }
      ]);
    } else {
      navigation.navigate('SMSVerification', { 
        phoneNumber: fullPhone, 
        skipVerification: true 
      });
    }
  };

  const saveLanguage = async (languageValue) => {
    try {
      await AsyncStorage.setItem('@helper_platform_language', languageValue);
      console.log('Til saqlandi:', languageValue);
      
      // Til o'zgarishini state ga saqlash
      setSelectedLanguage(languageValue);
      
      // Komponentni qayta render qilish uchun force update
      setForceUpdate(prev => prev + 1);
      
      // Darhol foydalanuvchiga ko'rsatish
      Alert.alert(
        t.languageChanged,
        t.languageRestart,
        [{ 
          text: "OK", 
          onPress: () => {
            // Ekranni yangilash
            // Agar App.js da til kontekstida kuzatilsa, u holda avtomatik yangilanadi
          }
        }]
      );
    } catch (error) {
      console.log('Til saqlashda xatolik:', error);
    }
  };

  const handleLanguageChange = async (value) => {
    await saveLanguage(value);
    setModalOpen(false);
  };

  // Til tekshirilgunga qadar loading ko'rsatish
  if (!languageChecked) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        visible={modalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalOpen(false)}
      >
        <TouchableOpacity 
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setModalOpen(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              activeOpacity={1} 
              style={styles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.handleBarContainer}>
                <View style={styles.handleBar} />
              </View>

              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t.modalTitle}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalOpen(false)}
                >
                  <Text style={styles.closeButtonText}>{t.closeButtonText}</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={LANGUAGES}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.languageItem,
                      selectedLanguage === item.value && styles.selectedLanguageItem
                    ]}
                    onPress={() => handleLanguageChange(item.value)}
                  >
                    <View style={styles.languageItemContent}>
                      
                      <Text style={[
                        styles.languageText,
                        selectedLanguage === item.value && styles.selectedLanguageText
                      ]}>
                        {item.label}
                      </Text>
                    </View>
                    {selectedLanguage === item.value && (
                      <View style={styles.selectedIndicator}>
                        <Text style={styles.selectedIcon}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.value}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
              />

              <View style={styles.currentSelection}>
                <Text style={styles.currentSelectionText}>
                  {t.currentSelection} {LANGUAGES.find(l => l.value === selectedLanguage)?.label}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Til tugmasi */}
      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => setModalOpen(true)}
      >
        <MaterialIcons name="language" size={24} color={colors.primary} />
        <Text style={styles.languageButtonText}>
          {LANGUAGES.find(l => l.value === selectedLanguage)?.flag}
        </Text>
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
        key={selectedLanguage} // Til o'zgarganda komponentni to'liq qayta yuklash
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="phone-portrait-outline" size={64} color={colors.primary} />
          </View>

          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.subtitle}>
            {t.subtitle}
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.phoneInputWrapper}>
            <View style={styles.prefixContainer}>
              <Text style={styles.prefix}>+998</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder={t.placeholder}
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              maxLength={14}
              autoFocus
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            phoneNumber.replace(/\D/g, '').length < 9 && styles.buttonDisabled,
          ]}
          onPress={handleContinue}
          disabled={phoneNumber.replace(/\D/g, '').length < 9 || loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>{t.buttonText}</Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 8,
    borderRadius: 20,
    boxShadow: '1px 1px 4px rgba(2,2,2,0.3)',
  },
  languageButtonText: {
    marginLeft: 4,
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: '15%',
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    marginTop: 40,
    
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  prefixContainer: {
    marginRight: 8,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  prefix: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    flex: 1,
    fontSize: 28,
    color: colors.text,
    paddingLeft: 8,
  },
  button: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  buttonDisabled: {
    backgroundColor: colors.border,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal stillari o'zgarishsiz qoladi...
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
    maxHeight: '80%',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  handleBarContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 5,
  },
  handleBar: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  flatListContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  selectedLanguageItem: {
    backgroundColor: '#f0f8ff',
  },
  languageItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 15,
  },
  languageText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedLanguageText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  selectedIndicator: {
    backgroundColor: '#007AFF',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  currentSelection: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  currentSelectionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default PhoneInputScreen;