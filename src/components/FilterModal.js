import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../utils/colors';
import { useLanguage } from '../contexts/LanguageContext';

const FilterModal = ({ visible, onClose, onApply, currentFilters }) => {
  const { t } = useLanguage();
  const [filters, setFilters] = useState(currentFilters || {
    distance: null,
    priceRange: null,
    rating: null,
    experience: null,
    quickCall: false,
    available: false,
    verified: false,
    insured: false,
    pro: false,
  });

  const handleReset = () => {
    const resetFilters = {
      distance: null,
      priceRange: null,
      rating: null,
      experience: null,
      quickCall: false,
      available: false,
      verified: false,
      insured: false,
      pro: false,
    };
    setFilters(resetFilters);
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const FilterButton = ({ label, value, onPress, isActive }) => (
    <TouchableOpacity
      style={[styles.filterButton, isActive && styles.filterButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const ToggleFilter = ({ label, icon, value, onPress }) => (
    <TouchableOpacity
      style={[styles.toggleFilter, value && styles.toggleFilterActive]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={20} color={value ? colors.secondary : colors.textSecondary} />
      <Text style={[styles.toggleText, value && styles.toggleTextActive]}>{label}</Text>
      {value && <Ionicons name="checkmark-circle" size={20} color={colors.secondary} />}
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('filters.title')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Distance */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('filters.sections.distance')}</Text>
              <View style={styles.filterRow}>
                <FilterButton
                  label={t('filters.distance.near')}
                  value="near"
                  isActive={filters.distance === 'near'}
                  onPress={() => setFilters({ ...filters, distance: filters.distance === 'near' ? null : 'near' })}
                />
                <FilterButton
                  label={t('filters.distance.medium')}
                  value="medium"
                  isActive={filters.distance === 'medium'}
                  onPress={() => setFilters({ ...filters, distance: filters.distance === 'medium' ? null : 'medium' })}
                />
                <FilterButton
                  label={t('filters.distance.far')}
                  value="far"
                  isActive={filters.distance === 'far'}
                  onPress={() => setFilters({ ...filters, distance: filters.distance === 'far' ? null : 'far' })}
                />
              </View>
            </View>

            {/* Price */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('filters.sections.price')}</Text>
              <View style={styles.filterRow}>
                <FilterButton
                  label={t('filters.price.cheap')}
                  value="cheap"
                  isActive={filters.priceRange === 'cheap'}
                  onPress={() => setFilters({ ...filters, priceRange: filters.priceRange === 'cheap' ? null : 'cheap' })}
                />
                <FilterButton
                  label={t('filters.price.medium')}
                  value="medium"
                  isActive={filters.priceRange === 'medium'}
                  onPress={() => setFilters({ ...filters, priceRange: filters.priceRange === 'medium' ? null : 'medium' })}
                />
                <FilterButton
                  label={t('filters.price.expensive')}
                  value="expensive"
                  isActive={filters.priceRange === 'expensive'}
                  onPress={() => setFilters({ ...filters, priceRange: filters.priceRange === 'expensive' ? null : 'expensive' })}
                />
              </View>
            </View>

            {/* Rating */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('filters.sections.rating')}</Text>
              <View style={styles.filterRow}>
                <FilterButton
                  label={t('filters.rating.high')}
                  value="high"
                  isActive={filters.rating === 'high'}
                  onPress={() => setFilters({ ...filters, rating: filters.rating === 'high' ? null : 'high' })}
                />
                <FilterButton
                  label={t('filters.rating.good')}
                  value="good"
                  isActive={filters.rating === 'good'}
                  onPress={() => setFilters({ ...filters, rating: filters.rating === 'good' ? null : 'good' })}
                />
                <FilterButton
                  label={t('filters.rating.ok')}
                  value="ok"
                  isActive={filters.rating === 'ok'}
                  onPress={() => setFilters({ ...filters, rating: filters.rating === 'ok' ? null : 'ok' })}
                />
              </View>
            </View>

            {/* Experience */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('filters.sections.experience')}</Text>
              <View style={styles.filterRow}>
                <FilterButton
                  label={t('filters.experience.expert')}
                  value="expert"
                  isActive={filters.experience === 'expert'}
                  onPress={() => setFilters({ ...filters, experience: filters.experience === 'expert' ? null : 'expert' })}
                />
                <FilterButton
                  label={t('filters.experience.experienced')}
                  value="experienced"
                  isActive={filters.experience === 'experienced'}
                  onPress={() => setFilters({ ...filters, experience: filters.experience === 'experienced' ? null : 'experienced' })}
                />
                <FilterButton
                  label={t('filters.experience.beginner')}
                  value="beginner"
                  isActive={filters.experience === 'beginner'}
                  onPress={() => setFilters({ ...filters, experience: filters.experience === 'beginner' ? null : 'beginner' })}
                />
              </View>
            </View>

            {/* Toggle Filters */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('filters.sections.additional')}</Text>
              <ToggleFilter
                label={t('filters.toggles.quickCall')}
                icon="flash"
                value={filters.quickCall}
                onPress={() => setFilters({ ...filters, quickCall: !filters.quickCall })}
              />
              <ToggleFilter
                label={t('filters.toggles.available')}
                icon="time"
                value={filters.available}
                onPress={() => setFilters({ ...filters, available: !filters.available })}
              />
              <ToggleFilter
                label={t('filters.toggles.verified')}
                icon="checkmark-circle"
                value={filters.verified}
                onPress={() => setFilters({ ...filters, verified: !filters.verified })}
              />
              <ToggleFilter
                label={t('filters.toggles.insured')}
                icon="shield-checkmark"
                value={filters.insured}
                onPress={() => setFilters({ ...filters, insured: !filters.insured })}
              />
              <ToggleFilter
                label={t('filters.toggles.pro')}
                icon="star"
                value={filters.pro}
                onPress={() => setFilters({ ...filters, pro: !filters.pro })}
              />
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>{t('filters.actions.reset')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>{t('filters.actions.apply')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  filterButtonActive: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  toggleFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.gray50,
    borderRadius: 10,
    marginBottom: 8,
    gap: 12,
  },
  toggleFilterActive: {
    backgroundColor: colors.secondary + '10',
  },
  toggleText: {
    flex: 1,
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: colors.secondary,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resetButton: {
    flex: 1,
    backgroundColor: colors.gray100,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  applyButton: {
    flex: 2,
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default FilterModal;
