import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { supabase } from '../lib/supabase';
import * as Updates from 'expo-updates';
const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [userPhone, setUserPhone] = useState(null);
  const [isSignUp,setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deviceId, setDeviceId] = useState(null);
  const [isCorrectPIN, setIsCorrectPIN] = useState(false); // PINLoginScreen uchun
  const [needsSmsVerification, setNeedsSmsVerification] = useState(false);
  const [hasPIN, setHasPIN] = useState(null); // PIN mavjudligini kuzatish

  // Ilovani yuklashda autentifikatsiya holatini tekshirish
  useEffect(() => {
    initializeAuth();
  }, []);

  // Qurilma ID ni olish yoki yaratish
  const getDeviceId = async () => {
    console.log('📱 getDeviceId called');

    // BIRINCHI: AsyncStorage dan o'qish
    let storedDeviceId = null;
    try {
      storedDeviceId = await AsyncStorage.getItem('deviceId');
      console.log('   Stored deviceId:', storedDeviceId);
    } catch (storageError) {
      console.error('   ❌ AsyncStorage read error:', storageError);
    }

    // Agar saqlangan ID bor bo'lsa, uni qaytarish
    if (storedDeviceId) {
      setDeviceId(storedDeviceId);
      return storedDeviceId;
    }

    // IKKINCHI: Yangi device ID yaratish
    console.log('   Creating new device ID...');
    let deviceUniqueId = null;

    // Android ID olish
    if (Platform.OS === 'android') {
      try {
        deviceUniqueId = Application.getAndroidId(); // sync, await kerak emas
        console.log('   Android ID:', deviceUniqueId);
      } catch (androidError) {
        console.warn('   Android ID error:', androidError);
      }
    }

    // iOS ID olish
    if (Platform.OS === 'ios') {
      try {
        deviceUniqueId = await Application.getIosIdForVendorAsync();
        console.log('   iOS ID:', deviceUniqueId);
      } catch (iosError) {
        console.warn('   iOS ID error:', iosError);
      }
    }

    // Agar platform ID olinmasa, qurilma ma'lumotlaridan mustahkam ID yaratish
    if (!deviceUniqueId) {
      const deviceBrand = Device.brand || 'Unknown';
      const deviceModel = Device.modelName || 'Unknown';
      const osVersion = Device.osVersion || 'Unknown';
      // Timestamp qo'shmaslik - qurilma ma'lumotlari yetarli
      deviceUniqueId = `${deviceBrand}-${deviceModel}-${osVersion}`.replace(/\s/g, '-').replace(/\./g, '-');
      console.log('   Created stable ID from device info:', deviceUniqueId);
    }

    // Device ID ni saqlash
    try {
      await AsyncStorage.setItem('deviceId', deviceUniqueId);
      console.log('✅ Device ID saved to AsyncStorage:', deviceUniqueId);
    } catch (saveError) {
      console.error('❌ Failed to save deviceId:', saveError);
    }

    setDeviceId(deviceUniqueId);
    return deviceUniqueId;
  };

  // Yangi qurilma yoki 3 oydan oshganligini tekshirish
  const checkDeviceAndLastLogin = async (phone) => {
    try {
      const currentDeviceId = await getDeviceId();

      // User ma'lumotlarini olish
      const { data: user, error } = await supabase
        .from('users')
        .select('device_id, last_login')
        .eq('phone', phone)
        .single();

      if (error || !user) {
        // Yangi user - SMS verification kerak
        return { needsVerification: true, reason: 'new_user' };
      }

      // Yangi qurilma tekshirish
      if (user.device_id && user.device_id !== currentDeviceId) {
        return { needsVerification: true, reason: 'new_device' };
      }

      // 3 oydan oshganligini tekshirish
      if (user.last_login) {
        const lastLoginDate = new Date(user.last_login);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        if (lastLoginDate < threeMonthsAgo) {
          return { needsVerification: true, reason: 'inactive_3months' };
        }
      }

      return { needsVerification: false, reason: null };
    } catch (error) {
      console.error('Device tekshirishda xato:', error);
      return { needsVerification: false, reason: null };
    }
  };

  // Last login ni yangilash
  const updateLastLogin = async (phone) => {
    try {
      const currentDeviceId = await getDeviceId();
      const deviceInfo = {
        name: Device.deviceName || 'Unknown',
        model: Device.modelName || 'Unknown',
        os: Device.osName || 'Unknown',
        osVersion: Device.osVersion || 'Unknown',
      };

      await supabase
        .from('users')
        .update({
          last_login: new Date().toISOString(),
          device_id: currentDeviceId,
          device_info: deviceInfo
        })
        .eq('phone', phone);
    } catch (error) {
      console.error('Last login yangilashda xato:', error);
    }
  };

  const initializeAuth = async () => {
    console.log('🔐 Initializing AuthContext...');

    // MUHIM: Avval device ID ni olish va state ga set qilish
    const currentDeviceId = await getDeviceId();
    console.log('   Device ID:', currentDeviceId);

    // State ga set qilish (getDeviceId ichida ham qilinadi, lekin qayta ta'kidlash)
    setDeviceId(currentDeviceId);

    // Avval device_id bo'yicha database'da user borligini tekshirish
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('phone, device_id')
        .eq('device_id', currentDeviceId)
        .single();

      if (user && !error) {
        // User topildi - PIN tekshirish
        console.log('   User topildi device_id bo\'yicha:', user.phone);
        const pin = await AsyncStorage.getItem('userPIN');

        if (pin && pin !== '') {
          // PIN ham bor - PINLogin ga o'tkazish uchun
          setHasPIN(true);
          setUserPhone(user.phone);
          console.log('   Has PIN: true, Phone:', user.phone);
        } else {
          // User bor, lekin PIN yo'q - SMS verification kerak
          console.log('   User bor, PIN yo\'q - SMS verification kerak');
          setHasPIN(false);
          setUserPhone(null);
        }
      } else {
        // User topilmadi - yangi user, SMS verification kerak
        console.log('   User topilmadi - yangi user');
        setHasPIN(false);
        setUserPhone(null);
      }
    } catch (error) {
      console.error('❌ InitializeAuth error:', error);
      setHasPIN(false);
      setUserPhone(null);
    }

    console.log('✅ AuthContext initialized');
    setLoading(false); // loading tugadi
  };

  const getUserPhone = async (providedDeviceId = null) => {
    try {
      // deviceId mavjudligini tekshirish
      const currentDeviceId = providedDeviceId || deviceId || await getDeviceId();

      if (!currentDeviceId) {
        console.log('❌ Device ID mavjud emas');
        setUserPhone(null);
        return;
      }

      console.log('🔍 Searching user by device_id:', currentDeviceId);

      const { data, error } = await supabase
        .from('users')
        .select('phone')
        .eq('device_id', currentDeviceId)
        .single();

      if (error) {
        // Agar user topilmasa, bu yangi user bo'lishi mumkin
        if (error.code === 'PGRST116') {
          console.log('⚠️ User hali database da yo\'q (yangi user)');
          setUserPhone(null);
        } else {
          console.log('❌ User phone olishda xato:', error);
          setUserPhone(null);
        }
        return;
      }

      if (data && data.phone) {
        console.log('✅ Retrieved user phone from Supabase:', data.phone);
        setUserPhone(data.phone);
      } else {
        console.log('⚠️ User phone not found');
        setUserPhone(null);
      }
    } catch (error) {
      console.log('❌ Get user phone error:', error);
      setUserPhone(null);
    }
  };

  // Telefon raqamni saqlash
  const savePhoneNumber = async (phone) => {
    try {
      await AsyncStorage.setItem('userPhone', phone);
      setUserPhone(phone);
    } catch (error) {
      Alert.error('nimadir xato ketdi!!!');
    }
  };

  // Foydalanuvchini Supabase ga saqlash (device_id va device_info bilan)
  const saveUserToDatabase = async (phone) => {
    try {
      const currentDeviceId = deviceId || await getDeviceId();
      console.log('💾 saveUserToDatabase started');
      console.log('   Phone:', phone);
      console.log('   Device ID:', currentDeviceId);

      const deviceInfo = {
        name: Device.deviceName || 'Unknown',
        model: Device.modelName || 'Unknown',
        os: Device.osName || 'Unknown',
        osVersion: Device.osVersion || 'Unknown',
      };

      const userData = {
        phone: phone,
        device_id: currentDeviceId,
        device_info: deviceInfo,
        last_login: new Date().toISOString(),
        is_active: true,
      };

      console.log('   User data to save:', JSON.stringify(userData, null, 2));

      // Upsert: agar foydalanuvchi mavjud bo'lsa update qiladi, aks holda insert qiladi
      const { data, error } = await supabase
        .from('users')
        .upsert(userData, {
          onConflict: 'phone', // phone unique bo'lgani uchun
          ignoreDuplicates: false
        })
        .select(); // Return data to verify

      if (error) {
        console.error('❌ User saqlashda xato:', error);
        throw error;
      } else {
        console.log('✅ User muvaffaqiyatli saqlandi:', phone);
        console.log('   Saved data:', JSON.stringify(data, null, 2));
        setUserPhone(phone);
      }
    } catch (error) {
      console.error('❌ saveUserToDatabase error:', error);
      throw error;
    }
  };

  // PIN yaratish
  const createPIN = async (pin, phone = null) => {
    try {
      console.log('📌 createPIN started, phone:', phone);

      // Avval barcha ma'lumotlarni saqlash
      await AsyncStorage.setItem('userPIN', pin);
      console.log('✅ PIN saved to AsyncStorage');

      if (phone) {
        // User allaqachon EditProfile da saqlanadi (device_id bilan)
        // Shuning uchun qayta saveUserToDatabase chaqirish shart emas
        // Faqat device_id va last_login ni yangilash
        const currentDeviceId = deviceId || await getDeviceId();
        const deviceInfo = {
          name: Device.deviceName || 'Unknown',
          model: Device.modelName || 'Unknown',
          os: Device.osName || 'Unknown',
          osVersion: Device.osVersion || 'Unknown',
        };

        await supabase
          .from('users')
          .update({
            device_id: currentDeviceId,
            device_info: deviceInfo,
            last_login: new Date().toISOString(),
          })
          .eq('phone', phone);

        console.log('✅ User device_id and last_login updated');

        // Database ga saqlangandan keyin to'g'ridan-to'g'ri setUserPhone qilish
        setUserPhone(phone);
        console.log('✅ userPhone set to:', phone);
      }

      // State'larni yangilash - to'g'ridan-to'g'ri Home ga o'tish uchun
      setHasPIN(true);
      setIsCorrectPIN(true);

      console.log('✅ PIN successfully created, navigating to Home');
    } catch (error) {
      console.error('❌ PIN create error:', error);
      Alert.alert('Xato', 'PIN yaratishda xatolik yuz berdi!');
      throw error;
    }
  };



  // Chiqish
  const logout = async () => {
    try {
      // Avval AsyncStorage dan ma'lumotlarni o'chirish
      // DIQQAT: deviceId ni HAM o'chirish (test uchun)
      await AsyncStorage.multiRemove(['userPIN', 'userPhone', 'deviceId']);
      console.log('🔓 Logout - AsyncStorage cleared (including deviceId)');

      // State'larni reset qilish
      setHasPIN(false);
      setIsCorrectPIN(false);
      setUserPhone(null);

      // App ni restart qilish
      console.log('🔄 Restarting app...');
      if (Platform.OS === 'android') {
        // Android uchun - app ni restart qilish
        Updates.reloadAsync();
      } else {
        // iOS uchun - app ni restart qilish
        Updates.reloadAsync();
      }
    }
    catch (error) {
      console.error('❌ Logout error:', error);
      Alert.alert('Xato', 'Chiqishda xatolik yuz berdi. Ilovani qayta oching.');
    }
  };
  const checkWithPIN = async (pin) => {
    try {
      const savedPIN = await AsyncStorage.getItem('userPIN');
      if (savedPIN == pin) {
        await getUserPhone().then(() => { console.log('User phone after correct PIN:', userPhone); });
        console.log('PIN to\'g\'ri kiritildi, userPhone:', userPhone);
        setIsCorrectPIN(true);
        return true;

      }
      else {
        console.log('PIN notog\'ri kiritildi');
        setIsCorrectPIN(false);
        return false;
      }
    }
    catch (error) {
      console.error('PIN check error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isSignUp,
        setIsAuthenticated,
        userPhone,
        setUserPhone,
        loading,
        setLoading,
        deviceId,
        isCorrectPIN,
        setIsCorrectPIN,
        needsSmsVerification,
        setNeedsSmsVerification,
        hasPIN,
        setHasPIN,
        savePhoneNumber,
        saveUserToDatabase,
        createPIN,
        logout,
        checkWithPIN,
        updateLastLogin,
        checkDeviceAndLastLogin,
        getUserPhone,
        getDeviceId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

