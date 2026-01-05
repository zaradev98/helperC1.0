import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../utils/colors';
import { useLanguage } from '../contexts/LanguageContext';

const Header = ({navigation, onSearch, location = "Toshkent", onFilterPress, onLocationPress, unreadCount = 0 }) => {
  const [searchText, setSearchText] = useState('');
  const { t } = useLanguage();

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchText);
    }
  };

  const handleTextChange = (text) => {
    setSearchText(text);
    if (onSearch) {
      onSearch(text);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.locationContainer}
          onPress={onLocationPress}
        >
          <Ionicons name="location" size={20} color={colors.secondary} />
          <Text style={styles.locationText} numberOfLines={1}>{location}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.textSecondary} style={styles.chevron} />
        </TouchableOpacity>
        <View style={styles.rightButtons}>
          <TouchableOpacity
            onPress={()=>{navigation.navigate('ChatList')}}
            style={styles.adminButton}
          >
            <Ionicons name="chatbubbles-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={()=>{navigation.navigate('Notifications')}}
            style={styles.notificationButton}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('home.searchPlaceholder')}
          placeholderTextColor={colors.textTertiary}
          value={searchText}
          onChangeText={handleTextChange}
          onSubmitEditing={handleSearch}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => {
            setSearchText('');
            if (onSearch) onSearch('');
          }}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        {onFilterPress && (
          <TouchableOpacity
            onPress={onFilterPress}
            style={styles.filterButton}
          >
            <Ionicons name="options-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '70%',
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
    color: colors.textPrimary,
    flex: 1,
  },
  chevron: {
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  filterButton: {
    marginLeft: 8,
    padding: 4,
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  adminButton: {
    position: 'relative',
  },
  notificationButton: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
});

export default Header;
