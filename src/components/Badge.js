import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../utils/colors';

const Badge = ({ type = 'verified', size = 'medium' }) => {
  const getBadgeConfig = () => {
    switch (type) {
      case 'verified':
        return {
          icon: 'checkmark-circle',
          color: colors.verified,
          bgColor: colors.verified + '15',
          text: 'Tasdiqlangan',
        };
      case 'insured':
        return {
          icon: 'shield-checkmark',
          color: colors.insured,
          bgColor: colors.insured + '15',
          text: 'Sug\'urtalangan',
        };
      case 'pro':
        return {
          icon: 'star',
          color: colors.pro,
          bgColor: colors.pro + '15',
          text: 'PRO',
        };
      default:
        return {
          icon: 'checkmark-circle',
          color: colors.verified,
          bgColor: colors.verified + '15',
          text: 'Badge',
        };
    }
  };

  const config = getBadgeConfig();
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bgColor },
        isSmall && styles.badgeSmall,
      ]}
    >
      <Ionicons
        name={config.icon}
        size={isSmall ? 10 : 14}
        color={config.color}
      />
      {!isSmall && (
        <Text style={[styles.badgeText, { color: config.color }]}>
          {config.text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 3,
  },
  badgeSmall: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default Badge;
