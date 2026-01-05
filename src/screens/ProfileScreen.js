import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import colors from '../utils/colors';
import { pickImage, uploadImage, deleteImage } from '../utils/storage';

const MenuItem = ({ icon, title, subtitle, onPress, showChevron = true, rightElement, iconColor }) => {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIcon, { backgroundColor: (iconColor || colors.secondary) + '15' }]}>
        <Ionicons name={icon} size={24} color={iconColor || colors.secondary} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (showChevron && (
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      ))}
    </TouchableOpacity>
  );
};

const ProfileScreen = ({ navigation }) => {
  const { t, getLanguageName, currentLanguage } = useLanguage();
  const { logout, userPhone } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isIdentified, setIsIdentified] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user data from Supabase
  const fetchUserData = async () => {
    try {
      console.log('🔄 Fetching user data, userPhone:', userPhone);
      // Faqat initial load paytida loading ko'rsatish, refresh paytida emas
      if (!refreshing) {
        setLoading(true);
      }

      let data = null;
      let error = null;

      // Fetch user by phone number (no auth)
      if (userPhone) {
        console.log('Searching user by phone:', userPhone);
        const result = await supabase
          .from('users')
          .select('*')
          .eq('phone', userPhone)
          .single();
        data = result.data;
        error = result.error;
        console.log('User found by phone:', data);
      }

      if (error || !data) {
        console.log('User not found in database, showing as unidentified');
        // Set default unidentified user
        setUser({
          name: 'Foydalanuvchi',
          email: '',
          phone: userPhone || '',
          avatar: 'https://i.pravatar.cc/150?img=8',
        });
        setIsIdentified(false);
      } else {
        // User found - check if they have completed identification
        const hasFullName = !!data.full_name;
        const hasPhone = !!data.phone;
        const userIsIdentified = hasFullName && hasPhone;

        console.log('=== SETTING USER DATA ===');
        console.log('Full name from DB:', data.full_name);
        console.log('Email from DB:', data.email);
        console.log('Phone from DB:', data.phone);
        console.log('Is identified:', userIsIdentified);

        const userData = {
          name: data.full_name || 'Foydalanuvchi',
          email: data.email || '',
          phone: data.phone || userPhone || '',
          avatar: data.avatar_url || 'https://i.pravatar.cc/150?img=8',
        };

        console.log('User data to be set:', userData);

        setUser(userData);
        setIsIdentified(userIsIdentified);

        console.log('User state updated successfully');
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      // Set default unidentified user on error
      setUser({
        name: 'Foydalanuvchi',
        email: '',
        phone: userPhone || '',
        avatar: 'https://i.pravatar.cc/150?img=8',
      });
      setIsIdentified(false);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUserData();
  }, [userPhone]);

  // Screen ga focus bo'lganda (EditProfile dan qaytganda) avtomatik refresh
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 ProfileScreen focused - refreshing data');
      fetchUserData();
    }, [userPhone])
  );

  // Refresh handler - pastga tortilib refresh qilish
  const onRefresh = async () => {
    console.log('🔄 Pull to refresh triggered');
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
    console.log('✅ Refresh completed');
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { user });
  };

  const handleChangeAvatar = async () => {
    try {
      setUploadingAvatar(true);

      // Rasm tanlash
      const imageUri = await pickImage();
      if (!imageUri) {
        setUploadingAvatar(false);
        return;
      }

      // Rasmni yuklash (telefon raqami asosida eski rasmni o'chiradi)
      const filePrefix = `user_${userPhone.replace(/\+/g, '')}`;
      const { url, path, error } = await uploadImage(imageUri, 'avatars', 'users', filePrefix);

      if (error) {
        Alert.alert('Xato', 'Rasmni yuklashda xatolik yuz berdi');
        setUploadingAvatar(false);
        return;
      }

      // Database ni yangilash
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: url })
        .eq('phone', userPhone);

      if (updateError) {
        console.error('Error updating avatar:', updateError);
        Alert.alert('Xato', 'Ma\'lumotlarni yangilashda xatolik');
        setUploadingAvatar(false);
        return;
      }

      // State ni yangilash
      setUser(prev => ({ ...prev, avatar: url }));

      Alert.alert('Muvaffaqiyatli', 'Avatar o\'zgartirildi');
    } catch (error) {
      console.error('Error changing avatar:', error);
      Alert.alert('Xato', 'Nimadadir xatolik yuz berdi');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLanguageChange = () => {
    navigation.navigate('LanguageSelection');
  };

  const handleHowToUse = () => {
    navigation.navigate('HowToUse');
  };

  const handleIdentification = () => {
    Alert.alert(
      t('profile.identification') || 'Identifikatsiya',
      t('profile.identificationRequired') || 'Buyurtma berish uchun identifikatsiyadan o\'tishingiz kerak',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.verify') || 'Tasdiqlash',
          onPress: () => navigation.navigate('EditProfile', { user, requireIdentification: true })
        },
      ]
    );
  };

  const handleContactAdmin = () => {
    // Admin bilan chatni ochish
    navigation.navigate('ChatRoom', {
      roomId: null, // Admin chat uchun roomId yo'q
      orderId: null, // Admin chat uchun orderId yo'q
      masterName: 'Admin',
      masterAvatar: null,
      isAdminChat: true, // Bu admin chat ekanligini bildiradi
    });
  };

  const handleLogout = () => {
    Alert.alert(
      t('profile.logout'),
      t('profile.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.logout'),
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        },
      ]
    );
  };

  // Show loading state
  if (loading || !user) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('profile.title')}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.secondary]}
            tintColor={colors.secondary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('profile.title')}</Text>
        </View>

        {/* User Info Card */}
        <View style={styles.userCard}>
          <TouchableOpacity onPress={handleChangeAvatar} disabled={uploadingAvatar}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <View style={styles.cameraBadge}>
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Ionicons name="camera" size={16} color={colors.white} />
              )}
            </View>
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userPhone}>{user.phone}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Ionicons name="create-outline" size={20} color={colors.secondary} />
          </TouchableOpacity>
        </View>

        {/* Identification Banner - Show if user is not identified */}
        {!isIdentified && (
          <TouchableOpacity style={styles.identificationBanner} onPress={handleIdentification}>
            <View style={styles.identificationIconContainer}>
              <Ionicons name="alert-circle" size={24} color={colors.warning} />
            </View>
            <View style={styles.identificationContent}>
              <Text style={styles.identificationTitle}>
                {t('profile.identificationRequired') || 'Identifikatsiyadan o\'tish kerak'}
              </Text>
              <Text style={styles.identificationSubtitle}>
                {t('profile.identificationDescription') || 'Buyurtma berish uchun ma\'lumotlaringizni to\'ldiring'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.warning} />
          </TouchableOpacity>
        )}

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('common.cancel')}</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              icon="person-outline"
              title={t('profile.personalInfo')}
              subtitle={`${user.name}, ${user.email}`}
              onPress={handleEditProfile}
              iconColor={colors.secondary}
            />
            <MenuItem
              icon="location-outline"
              title={t('profile.addresses')}
              subtitle="2"
              onPress={() => navigation.navigate('Addresses')}
              iconColor={colors.secondary}
            />
            <MenuItem
              icon="card-outline"
              title={t('profile.paymentMethods')}
              subtitle="1"
              onPress={() => navigation.navigate('PaymentMethods')}
              iconColor={colors.secondary}
            />
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('tabs.profile')}</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              icon="notifications-outline"
              title={t('profile.notifications')}
              subtitle="Push"
              showChevron={false}
              iconColor={colors.secondary}
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: colors.gray300, true: colors.secondary + '40' }}
                  thumbColor={notificationsEnabled ? colors.secondary : colors.gray100}
                />
              }
            />
            <MenuItem
              icon="language-outline"
              title={t('profile.language')}
              subtitle={getLanguageName(currentLanguage)}
              onPress={handleLanguageChange}
              iconColor={colors.secondary}
            />
            <MenuItem
              icon="help-circle-outline"
              title={t('profile.howToUse')}
              subtitle={t('howToUse.videoGuide')}
              onPress={handleHowToUse}
              iconColor={colors.secondary}
            />
            <MenuItem
              icon="document-text-outline"
              title={t('profile.terms')}
              onPress={() => navigation.navigate('Terms')}
              iconColor={colors.secondary}
            />
            <MenuItem
              icon="shield-checkmark-outline"
              title={t('profile.privacy')}
              onPress={() => navigation.navigate('Privacy')}
              iconColor={colors.secondary}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.about')}</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              icon="chatbubble-ellipses-outline"
              title="Admin bilan bog'lanish"
              subtitle="Yordam yoki savol"
              onPress={handleContactAdmin}
              iconColor={colors.secondary}
            />
            <MenuItem
              icon="star-outline"
              title={t('rating.title')}
              onPress={() => console.log('Rate app')}
              iconColor={colors.secondary}
            />
            <MenuItem
              icon="share-social-outline"
              title={t('common.send')}
              onPress={() => console.log('Share app')}
              iconColor={colors.secondary}
            />
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <View style={styles.menuGroup}>
            <MenuItem
              icon="log-out-outline"
              title={t('profile.logout')}
              onPress={handleLogout}
              showChevron={false}
              iconColor={colors.error}
            />
          </View>
        </View>

        <Text style={styles.version}>{t('profile.version')} 1.0.0</Text>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    margin: 16,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
    backgroundColor: colors.gray100,
  },
  cameraBadge: {
    position: 'absolute',
    right: 12,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  menuGroup: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textTertiary,
    marginVertical: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  identificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '15',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.warning + '40',
  },
  identificationIconContainer: {
    marginRight: 12,
  },
  identificationContent: {
    flex: 1,
  },
  identificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  identificationSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});

export default ProfileScreen;
