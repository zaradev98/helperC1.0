import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../utils/colors';
import { useLanguage } from '../contexts/LanguageContext';

const NotificationItem = ({ notification, onPress }) => {
  const getIconName = (type) => {
    switch (type) {
      case 'booking':
        return 'calendar';
      case 'payment':
        return 'card';
      case 'message':
        return 'chatbubble';
      case 'review':
        return 'star';
      case 'promo':
        return 'gift';
      case 'announcement':
        return 'megaphone';
      case 'update':
        return 'download';
      default:
        return 'notifications';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'booking':
        return colors.primary;
      case 'payment':
        return colors.secondary;
      case 'message':
        return colors.info;
      case 'review':
        return colors.warning;
      case 'promo':
        return '#9333EA'; // Purple
      case 'announcement':
        return colors.primary;
      case 'update':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.item, !notification.read && styles.itemUnread]}
      onPress={() => onPress(notification)}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: getIconColor(notification.type) + '20' },
        ]}
      >
        <Ionicons
          name={getIconName(notification.type)}
          size={24}
          color={getIconColor(notification.type)}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.message} numberOfLines={2}>
          {notification.message}
        </Text>
        <Text style={styles.time}>{notification.time}</Text>
      </View>

      {!notification.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

const NotificationCenter = ({ notifications, onNotificationPress, onMarkAllAsRead }) => {
  const hasUnreadNotifications = notifications.some(n => !n.read);
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
        {hasUnreadNotifications && (
          <TouchableOpacity onPress={onMarkAllAsRead}>
            <Text style={styles.markAllRead}>{t('notifications.markAllRead')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <NotificationItem notification={item} onPress={onNotificationPress} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>{t('notifications.noNotifications')}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  markAllRead: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  list: {
    paddingVertical: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemUnread: {
    backgroundColor: colors.primary + '08',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
});

export default NotificationCenter;
