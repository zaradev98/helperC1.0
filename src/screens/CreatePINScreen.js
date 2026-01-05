import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../utils/colors';
import { useAuth } from '../contexts/AuthContext';

const CreatePINScreen = ({ navigation, route }) => {
  const phoneNumber = route?.params?.phoneNumber;
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState(1); // 1: PIN yaratish, 2: PIN tasdiqlash
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const { createPIN } = useAuth();

  const handleNumberPress = (number) => {
    if (step === 1) {
      if (pin.length < 4) {
        const newPin = pin + number;
        setPin(newPin);

        if (newPin.length === 4) {
          setTimeout(() => {
            setStep(2);
          }, 300);
        }
      }
    } else {
      if (confirmPin.length < 4) {
        const newConfirmPin = confirmPin + number;
        setConfirmPin(newConfirmPin);

        if (newConfirmPin.length === 4) {
          setTimeout(() => {
            verifyPins(pin, newConfirmPin);
          }, 300);
        }
      }
    }
  };

  const handleDelete = () => {
    if (step === 1) {
      setPin(pin.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const verifyPins = async (firstPin, secondPin) => {
    if (firstPin === secondPin) {
      try {
        // Phone number bilan birga PIN yaratish (device_id ham saqlanadi)
        await createPIN(firstPin, phoneNumber);
        console.log('PIN muvaffaqiyatli yaratildi, phone:', phoneNumber);
        // AuthContext avtomatik ravishda navigatsiyani boshqaradi
        // hasPIN va isCorrectPIN o'zgarishi AppNavigator ni yangilaydi
        // Navigation stackni tozalash shart emas - AppNavigator avtomatik boshqaradi

      } catch (error) {
        Alert.alert('Xato', 'PIN yaratishda xatolik yuz berdi');
        resetPins();
      }
    } else {
      shakeError();
      Alert.alert('Xato', 'PIN kodlar mos kelmadi. Qaytadan urinib ko\'ring.', [
        {
          text: 'OK',
          onPress: () => resetPins(),
        },
      ]);
    }
  };

  const resetPins = () => {
    setPin('');
    setConfirmPin('');
    setStep(1);
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

  const renderDots = () => {
    const currentPin = step === 1 ? pin : confirmPin;
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
            style={[
              styles.dot,
              index < currentPin.length && styles.dotFilled,
            ]}
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed-outline" size={64} color={colors.primary} />
          </View>

          <Text style={styles.title}>
            {step === 1 ? 'PIN kod yarating' : 'PIN kodni tasdiqlang'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? '4 xonali PIN kod kiriting'
              : 'Yana bir marta PIN kodni kiriting'}
          </Text>
        </View>

        {renderDots()}
        {renderKeypad()}

        {step === 2 && (
          <TouchableOpacity style={styles.backLink} onPress={resetPins}>
            <Text style={styles.backLinkText}>Qaytadan boshlash</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
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
    paddingBottom: 40,
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
  backLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  backLinkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default CreatePINScreen;
