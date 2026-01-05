import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../utils/colors';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const SMSVerificationScreen = ({ navigation, route }) => {
  const phoneNumberParam = route?.params?.phoneNumber;
  const { userPhone, saveUserToDatabase, savePhoneNumber } = useAuth();
  const phoneNumber = phoneNumberParam || userPhone;
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);
  const scrollViewRef = useRef(null);
  const [generatedCode, setGeneratedCode] = useState(null);
  const generateRandomCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  useEffect(() => {
    const code = generateRandomCode();
    setGeneratedCode(code);
    console.log('Generated verification code (for demo purposes):', code);
  }, []);

  // If we don't have a phone number, redirect user to PhoneInput
  useEffect(() => {
    if (!phoneNumber) {
      navigation.replace('PhoneInput');
    }
  }, [phoneNumber]);

  // Keyboard ochilganda avtomatik scroll qilish
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {

    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleCodeChange = (text, index) => {
    // Faqat raqamlarni qabul qilish
    if (text.length > 1) {
      text = text.slice(-1);
    }

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Keyingi inputga o'tish
    if (text && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    // Agar barcha kodlar kiritilgan bo'lsa, avtomatik tekshirish
    if (newCode.every((digit) => digit !== '') && index === 5) {
      verifyCode(newCode.join(''));
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };
  const verifyCode = async (verificationCode) => {
    
    if (verificationCode === generatedCode) {
      setIsVerifying(true);

      try {
        // Supabase'da telefon raqami bo'yicha foydalanuvchini qidirish
        console.log('Qidirilayotgan telefon raqam:', phoneNumber);

        const { data: existingUser, error } = await supabase
          .from('users')
          .select('*')
          .eq('phone', phoneNumber)
          .single();

        console.log('Topilgan user:', existingUser);
        console.log('Error:', error);

        if (error && error.code !== 'PGRST116') {
          // PGRST116 = not found, boshqa xatolar
          console.error('Supabase error:', error);
          Alert.alert('Xato', 'Ma\'lumotlarni tekshirishda xatolik yuz berdi');
          setIsVerifying(false);
          return;
        }

        // SMS tasdiqlandi
        await savePhoneNumber(phoneNumber);

        if (existingUser) {
          // User database da BOR - to'g'ridan-to'g'ri CreatePIN ga
          console.log('User topildi, CreatePIN ga o\'tilmoqda...');
          navigation.navigate('CreatePIN', {
            existingUser: true,
            userData: existingUser,
            phoneNumber: phoneNumber
          });
        } else {
          // User database da YO'Q - EditProfile ga (sign up)
          console.log('Yangi user, EditProfile ga o\'tilmoqda...');
          navigation.navigate('EditProfile', {
            user: { phone: phoneNumber },
            isSignUp: true,
            existingUser: false,
            phoneNumber: phoneNumber
          });
        }
      } catch (error) {
        console.error('Verification error:', error);
        Alert.alert('Xato', 'Tasdiqlashda xatolik yuz berdi');
      } finally {
        setIsVerifying(false);
      }
    } else {
      Alert.alert('Xato', 'Tasdiqlash kodi noto\'g\'ri. Iltimos, qaytadan urinib ko\'ring.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    }
  };

  function handleResendCode() {
    if (canResend) {
      Alert.alert('Muvaffaqiyat', 'Yangi tasdiqlash kodi yuborildi.');
      setTimer(60);
      setCanResend(false);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail-outline" size={64} color={colors.primary} />
              </View>

              <Text style={styles.title}>Tasdiqlash kodi</Text>
              <Text style={styles.subtitle}>
                {phoneNumber} raqamiga yuborilgan 6 xonali kodni kiriting
              </Text>
            </View>

            <View style={styles.codeContainer}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[styles.codeInput, digit && styles.codeInputFilled]}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            <View style={styles.resendContainer}>
              {!canResend ? (
                <Text style={styles.timerText}>
                  Kodni qayta yuborish {timer} soniyadan so'ng
                </Text>
              ) : (
                <TouchableOpacity onPress={handleResendCode}>
                  <Text style={styles.resendText}>Kodni qayta yuborish</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.demoInfo}>
              <Text style={styles.demoText}>Demo rejim: ${generatedCode} ishlatishingiz mumkin</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {isVerifying && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Tekshirilmoqda...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  backButton: {
    marginLeft: 16,
    marginTop: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
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
    paddingHorizontal: 20,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 48,
    paddingHorizontal: 8,
  },
  codeInput: {
    width: 50,
    height: 56,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
  },
  codeInputFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  resendContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  resendText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  demoInfo: {
    marginTop: 40,
    padding: 16,
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE58F',
  },
  demoText: {
    fontSize: 13,
    color: '#8B7000',
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: colors.white,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 150,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
});

export default SMSVerificationScreen;
