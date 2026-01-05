import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../utils/colors';
import { useLanguage } from '../contexts/LanguageContext';

const ErrorState = ({
  type = 'general', // 'general', 'network', 'notFound'
  onRetry,
  message,
  showRetryButton = true
}) => {
  const { t } = useLanguage();

  const getErrorContent = () => {
    switch (type) {
      case 'network':
        return {
          icon: 'cloud-offline-outline',
          title: t('error.noInternet') || 'Internet ulanmagan',
          subtitle: t('error.checkConnection') || 'Internet aloqangizni tekshiring va qayta urinib ko\'ring',
        };
      case 'notFound':
        return {
          icon: 'search-outline',
          title: t('error.notFound') || 'Ma\'lumot topilmadi',
          subtitle: message || t('error.noData') || 'Hech qanday ma\'lumot topilmadi',
        };
      default:
        return {
          icon: 'alert-circle-outline',
          title: t('error.generalError') || 'Xatolik yuz berdi',
          subtitle: message || t('error.tryAgain') || 'Iltimos qayta urinib ko\'ring',
        };
    }
  };

  const content = getErrorContent();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={content.icon}
          size={80}
          color={type === 'network' ? colors.error : colors.gray400}
        />
      </View>

      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.subtitle}>{content.subtitle}</Text>

      {showRetryButton && onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh-outline" size={20} color={colors.white} />
          <Text style={styles.retryButtonText}>
            {t('common.retry') || 'Qayta urinish'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: colors.backgroundGray,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default ErrorState;
