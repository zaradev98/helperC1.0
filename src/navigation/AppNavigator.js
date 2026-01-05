import React from 'react';
import { Platform, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../utils/colors';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

// Auth Screens
import PhoneInputScreen from '../screens/PhoneInputScreen';
import SMSVerificationScreen from '../screens/SMSVerificationScreen';
import CreatePINScreen from '../screens/CreatePINScreen';
import PINLoginScreen from '../screens/PINLoginScreen';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';

// Main Screens
import HomeScreen from '../screens/HomeScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import NotificationDetailScreen from '../screens/NotificationDetailScreen';
import PaymentReceiptScreen from '../screens/PaymentReceiptScreen';
import MasterDetailScreen from '../screens/MasterDetailScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import HowToUseScreen from '../screens/HowToUseScreen';
import AddressesScreen from '../screens/AddressesScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import TermsScreen from '../screens/TermsScreen';
import PrivacyScreen from '../screens/PrivacyScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Auth Stack Navigator (accepts initialRouteName so we can start at SMSVerification)
const AuthStack = ({ initialRouteName = 'PhoneInput' }) => {
  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PhoneInput" component={PhoneInputScreen} />
      <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
      <Stack.Screen name="SMSVerification" component={SMSVerificationScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="CreatePIN" component={CreatePINScreen} />
    </Stack.Navigator>
  );
};

// Home Stack Navigator
const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="MasterDetail" component={MasterDetailScreen} options={{headerShown:false}}/>
    </Stack.Navigator>
  );
};

// Orders Stack Navigator
const OrdersStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OrdersMain" component={OrdersScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen
        name="ChatRoom"
        component={ChatRoomScreen}
        options={{ headerShown: true}}
      />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [unreadCount, setUnreadCount] = React.useState(0);

  // Notification count olish
  React.useEffect(() => {
    // TODO: Supabase dan real notification countni olish
    // Hozircha hardcoded
    const fetchUnreadCount = async () => {
      const unread=await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false);
    if(unread.error){
      console.error('Error fetching unread notifications count:', unread.error);
      return;
    }
    setUnreadCount(unread.count || 0);};
    fetchUnreadCount();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={() => ({ tabBarLabel: t('tabs.home') })}
      />
      <Tab.Screen
        name="Bookings"
        component={OrdersStack}
        options={() => ({ tabBarLabel: t('tabs.bookings') })}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={() => ({
          tabBarLabel: t('tabs.notifications'),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        })}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={() => ({ tabBarLabel: t('tabs.profile') })}
      />
    </Tab.Navigator>
  );
};

// Root Stack Navigator (wraps tabs for modal screens)


// App Navigator

const AppNavigator = () => {
  const { isCorrectPIN, loading, getUserPhone, hasPIN, userPhone } = useAuth();

  React.useEffect(() => {
    // Faqat PIN to'g'ri kiritilganda va userPhone hali yo'q bo'lsa phone ni olish
    if (isCorrectPIN && hasPIN && !userPhone) {
      console.log('⏳ userPhone mavjud emas, getUserPhone() chaqirilmoqda...');
      getUserPhone();
    }
    console.log('Auth state changed: isCorrectPIN=', isCorrectPIN, 'hasPIN=', hasPIN, 'userPhone=', userPhone);
  }, [isCorrectPIN, userPhone]);

  // Loading holatida spinner ko'rsatish
  // hasPIN aniqlanmaguncha yoki loading bo'lsa, spinner ko'rsatish
  if (loading || hasPIN === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {hasPIN ? (
        // PIN bor - PINLogin yoki Main ga o'tkazish
        // key prop bilan butun stackni qayta render qilish (eski stackni tozalash)
        <Stack.Navigator
          key="main-stack"
          screenOptions={{ headerShown: false }}
          initialRouteName={isCorrectPIN ? 'Main' : 'PINLogin'}
        >
          <Stack.Screen name="PINLogin" component={PINLoginScreen} />
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} />
          <Stack.Screen name="PaymentReceipt" component={PaymentReceiptScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
          <Stack.Screen name="HowToUse" component={HowToUseScreen} />
          <Stack.Screen name="Addresses" component={AddressesScreen} />
          <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
          <Stack.Screen name="Terms" component={TermsScreen} />
          <Stack.Screen name="Privacy" component={PrivacyScreen} />
          <Stack.Screen name="ChatList" component={ChatListScreen} />
          <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
        </Stack.Navigator>
      ) : (
        // PIN yo'q - PhoneInput dan boshlash (yangi user yoki PIN o'chirilgan)
        // key prop bilan butun stackni qayta render qilish
        <AuthStack key="auth-stack" initialRouteName="PhoneInput" />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
