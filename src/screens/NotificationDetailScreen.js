import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import colors from '../utils/colors';

const NotificationDetailScreen = ({ route, navigation }) => {
  const { notification } = route.params;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Bugun, ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Kecha, ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else {
      return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}, ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'booking':
        return 'calendar';
      case 'message':
        return 'chatbubble';
      case 'payment':
        return 'card';
      case 'review':
        return 'star';
      case 'promo':
        return 'gift';
      case 'update':
        return 'download';
      default:
        return 'notifications';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'booking':
        return colors.primary;
      case 'message':
        return colors.info;
      case 'payment':
        return colors.secondary;
      case 'review':
        return colors.warning;
      case 'promo':
        return '#9333EA'; // Purple
      case 'update':
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  };

  // For HTML content (promo, announcement), show full screen
  if (notification.htmlContent) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{notification.title}</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Full Screen HTML Content */}
        <WebView
          source={{ html: notification.htmlContent }}
          style={styles.fullScreenWebView}
          scalesPageToFit={true}
        />

        {/* Additional Info at Bottom */}
        {notification.additionalInfo && (
          <View style={styles.bottomInfoCard}>
            <Ionicons name="information-circle-outline" size={20} color={colors.info} />
            <Text style={styles.infoText}>{notification.additionalInfo}</Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // For regular text notifications
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xabar</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notification Header */}
        <View style={styles.notificationHeader}>
          <View style={[styles.iconContainer, { backgroundColor: getTypeColor(notification.type) + '15' }]}>
            <Ionicons name={getTypeIcon(notification.type)} size={28} color={getTypeColor(notification.type)} />
          </View>
          <View style={styles.notificationHeaderText}>
            <Text style={styles.title}>{notification.title}</Text>
            <Text style={styles.date}>{formatDate(notification.date)}</Text>
          </View>
        </View>

        {/* Text Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.message}>{notification.message}</Text>
        </View>

        {/* Additional Info */}
        {notification.additionalInfo && (
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color={colors.info} />
            <Text style={styles.infoText}>{notification.additionalInfo}</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
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
  notificationHeader: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notificationHeaderText: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  date: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  contentContainer: {
    backgroundColor: colors.white,
    marginTop: 12,
    padding: 20,
  },
  message: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  fullScreenWebView: {
    flex: 1,
    backgroundColor: colors.white,
  },
  bottomInfoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.info + '10',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  infoCard: {
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
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
});

export default NotificationDetailScreen;
