import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../utils/colors';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PINLoginScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const { checkWithPIN, userPhone, isCorrectPIN } = useAuth();

  const handleNumberPress = async (number) => {
    if (pin.length < 4) {
      const newPin = pin + number;
      setPin(newPin);

      if (newPin.length === 4) {
        setTimeout(async () => {
          await verifyPin(newPin);
        }, 300);
      }
    }
  };

  React.useEffect(() => {
    if (isCorrectPIN) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    }
  }, [isCorrectPIN]);

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const verifyPin = async (enteredPin) => {
    console.log('Verifying PIN:', enteredPin);
    setIsLoading(true);
    const isCorrect = await checkWithPIN(enteredPin);
    setIsLoading(false);

    if (isCorrect) {
      // Navigation avtomatik ishlaydi useEffect orqali
    } else {
      shakeError();
      setAttempts(attempts + 1);

      if (attempts >= 4) {
        Alert.alert(
          'Juda ko\'p urinish',
          'Siz 5 marta noto\'g\'ri PIN kiritdingiz. Qaytadan ro\'yxatdan o\'tishingiz kerak.',
          [
            {
              text: 'OK',
              onPress: async () => {
                // PIN va phone ni o'chirish
                await AsyncStorage.multiRemove(['userPIN', 'userPhone']);
                // Dasturni qayta yuklash
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'PhoneInput' }],
                });
              },
            },
          ]
        );
      } else {
        Alert.alert('Xato', `Noto'g'ri PIN kod. ${5 - attempts - 1} urinish qoldi.`);
      }

      setPin('');
    }
  };

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleForgotPin = () => {
    Alert.alert(
      'PIN kodni unutdingizmi?',
      'Qaytadan ro\'yxatdan o\'tishingiz kerak bo\'ladi.',
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'Davom etish',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('userPIN')
            navigation.navigate('');
          },
        },
      ]
    );
  };

  const renderDots = () => {
    return (
      <Animated.View
        style={[
          styles.dotsContainer,
          { transform: [{ translateX: shakeAnimation }] },
        ]}
      >
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[styles.dot, index < pin.length && styles.dotFilled]}
          />
        ))}
      </Animated.View>
    );
  };

  const renderKeypad = () => {
    const numbers = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      ['', 0, 'delete'],
    ];

    return (
      <View style={styles.keypad}>
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((item, itemIndex) => {
              if (item === '') {
                return <View key={itemIndex} style={styles.keyButton} />;
              }

              if (item === 'delete') {
                return (
                  <TouchableOpacity
                    key={itemIndex}
                    style={styles.keyButton}
                    onPress={handleDelete}
                  >
                    <Ionicons
                      name="backspace-outline"
                      size={28}
                      color={colors.text}
                    />
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={itemIndex}
                  style={styles.keyButton}
                  onPress={() => handleNumberPress(item.toString())}
                >
                  <Text style={styles.keyText}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  const maskPhoneNumber = (phone) => {
    if (!phone) return '';
    const visibleDigits = phone.slice(-2);
    return `+998 ** *** ** ${visibleDigits}`;
  };

  return (
    isLoading ? <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} /> : (

      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed" size={64} color={colors.primary} />
            </View>

            <Text style={styles.title}>Xush kelibsiz!</Text>
            <Text style={styles.subtitle}>
              {maskPhoneNumber(userPhone)}
            </Text>
            <Text style={styles.instruction}>PIN kodni kiriting</Text>
          </View>

          {renderDots()}
          {renderKeypad()}

          <TouchableOpacity style={styles.forgotLink} onPress={handleForgotPin}>
            <Text style={styles.forgotLinkText}>PIN kodni unutdingizmi?</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

    )
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  instruction: {
    fontSize: 15,
    color: colors.text,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 40,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    marginHorizontal: 12,
  },
  dotFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  keypad: {
    marginTop: 'auto',
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  keyButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontSize: 28,
    fontWeight: '500',
    color: colors.text,
  },
  forgotLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  forgotLinkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default PINLoginScreen;
