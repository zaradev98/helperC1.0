import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from './Badge';
import colors from '../utils/colors';
import { useLanguage } from '../contexts/LanguageContext';

const MasterCard = ({ master, onPress }) => {
  const { t } = useLanguage();
  const {
    name,
    profession,
    rating = 0,
    reviewCount = 0,
    hourlyRate,
    avatar,
    isVerified = false,
    isInsured = false,
    isPro = false,
    completedJobs = 0,
    distance,
    portfolio = [],
    workSchedule,
    isQuickCall = false,
  } = master;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress && onPress(master)} activeOpacity={0.7}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <Image
          source={{ uri: avatar || 'https://via.placeholder.com/60' }}
          style={styles.avatar}
        />

        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            <View style={styles.badges}>
              {isVerified && <Badge type="verified" size="small" />}
              {isInsured && <Badge type="insured" size="small" />}
              {isPro && <Badge type="pro" size="small" />}
            </View>
          </View>

          <Text style={styles.profession}>{profession}</Text>

          <View style={styles.statsRow}>
            <View style={styles.rating}>
              <Ionicons name="star" size={13} color={colors.warning} />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.jobs}>{completedJobs} {t('masterDetail.completedOrders').toLowerCase()}</Text>
            {distance && (
              <>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.distance}>{distance} km</Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Portfolio Images */}
      {portfolio && portfolio.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.portfolioScroll}
          contentContainerStyle={styles.portfolioContent}
        >
          {portfolio.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              style={styles.portfolioImage}
            />
          ))}
        </ScrollView>
      )}

      {/* Work Schedule & Quick Call */}
      <View style={styles.scheduleRow}>
        {workSchedule && (
          <View style={styles.scheduleTag}>
            <Ionicons
              name={workSchedule.type === '24/7' ? 'time' : 'calendar-outline'}
              size={12}
              color={workSchedule.type === '24/7' ? colors.secondary : colors.textSecondary}
            />
            <Text style={[
              styles.scheduleText,
              workSchedule.type === '24/7' && styles.scheduleText247
            ]}>
              {workSchedule.type}
            </Text>
          </View>
        )}

        {isQuickCall && (
          <View style={styles.quickCallTag}>
            <Ionicons name="flash" size={12} color={colors.warning} />
            <Text style={styles.quickCallText}>{t('home.quickCall') || 'Tezkor chaqiruv'}</Text>
          </View>
        )}
      </View>

      {/* Footer: Price & Button */}
      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceUnit}>{t('common.from') || 'dan'} </Text>
          <Text style={styles.price}>{hourlyRate?.toLocaleString()}</Text>
          <Text style={styles.priceUnit}> {t('common.sum') || "so'm"}</Text>
        </View>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => onPress && onPress(master)}
        >
          <Text style={styles.viewButtonText}>{t('orders.viewDetails')}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.white} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    backgroundColor: colors.gray100,
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 4,
  },
  profession: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  separator: {
    fontSize: 12,
    color: colors.gray300,
    marginHorizontal: 6,
  },
  jobs: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  distance: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  portfolioScroll: {
    marginBottom: 10,
  },
  portfolioContent: {
    paddingRight: 8,
  },
  portfolioImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: colors.gray100,
  },
  scheduleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  scheduleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.gray100,
    borderRadius: 6,
  },
  scheduleText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  scheduleText247: {
    color: colors.secondary,
    fontWeight: '600',
  },
  quickCallTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.warning + '15',
    borderRadius: 6,
  },
  quickCallText: {
    fontSize: 11,
    color: colors.warning,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  priceUnit: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  viewButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default MasterCard;
