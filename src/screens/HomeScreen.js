import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Header from '../components/Header';
import MasterCard from '../components/MasterCard';
import FilterModal from '../components/FilterModal';
import ErrorState from '../components/ErrorState';
import colors from '../utils/colors';
import { useLanguage } from '../contexts/LanguageContext';

const HomeScreen = ({ navigation }) => {
  const { t, currentLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [userLocation, setUserLocation] = useState({
    latitude: 41.2995,
    longitude: 69.2401,
    address: 'Toshkent, O\'zbekiston',
  });
  const [filters, setFilters] = useState({
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

  const itemsPerPage = 10;
  const [categories, setCategories] = useState([]);
  const [mastersData, setMastersData] = useState([]);
  const [isLoadingMasters, setIsLoadingMasters] = useState(true);
  const [error, setError] = useState(null); // { type: 'network' | 'general', message: string }

  useEffect(() => {
    requestLocationPermission();

    const fetchcategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*');

        if (error) {
          throw error;
        }

        if (data) {
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchMasters = async () => {
      try {
        setIsLoadingMasters(true);
        setError(null);

        // Fetch masters data
        const { data, error: supabaseError } = await supabase
          .from('masters')
          .select('*');

        if (supabaseError) {
          throw supabaseError;
        }

        if (data) {
          // Map Supabase data to expected format (snake_case to camelCase)
          const mappedData = data.map(master => ({
            ...master,
            // Add camelCase aliases for snake_case fields
            name: master.full_name || master.name,
            avatar: master.avatar_url || master.avatar,
            hourlyRate: master.hourly_rate || master.hourlyRate,
            reviewCount: master.review_count || master.reviewCount || 0,
            completedJobs: master.completed_jobs || master.completedJobs || 0,
            isVerified: master.is_verified ?? master.isVerified ?? false,
            isInsured: master.is_insured ?? master.isInsured ?? false,
            isPro: master.is_pro ?? master.isPro ?? false,
            isQuickCall: master.is_24_7_available ?? master.isQuickCall ?? false,
            // Create workSchedule object
            workSchedule: master.is_24_7_available ? {
              type: '24/7',
              days: 'Har kuni',
              hours: 'Tun-kunduz'
            } : {
              type: 'Standart',
              days: 'Dush-Juma',
              hours: '09:00-18:00'
            },
            // Portfolio images (not implemented yet)
            portfolio: [],
          }));

          setMastersData(mappedData);
        }
      } catch (err) {
        console.error('Error fetching masters:', err);

        // Check if it's a network error
        const isNetworkError = err.message?.includes('fetch') ||
                               err.message?.includes('network') ||
                               err.code === 'ECONNREFUSED' ||
                               err.message?.includes('Failed to fetch');

        setError({
          type: isNetworkError ? 'network' : 'general',
          message: err.message
        });
      } finally {
        setIsLoadingMasters(false);
      }
    };

    fetchcategories();
    fetchMasters();

  }, []);

  // Translate known city/district/country names using locales (places.*)
  const translateAddress = (address) => {
    if (!address || typeof address !== 'string') return address;
    const parts = address.split(',').map(p => p.trim());
    const mapToken = (token) => {
      const lower = token.toLowerCase();
      // Basic mappings for city/country/district in Uzbek
      const mappings = {
        "toshkent": 'tashkent',
        "o'zbekiston": 'uzbekistan',
        "uzbekiston": 'uzbekistan',
        "yunusobod tumani": 'yunusobodDistrict',
        "chilonzor tumani": 'chilonzorDistrict',
        "sergeli tumani": 'sergeliDistrict',
        "olmazor tumani": 'olmazorDistrict',
        "yakkasaroy tumani": 'yakkasaroyDistrict',
      };
      const key = mappings[lower];
      return key ? t(`places.${key}`) : token;
    };
    return parts.map(mapToken).join(', ');
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        // Just use default location if permission not granted
        console.log('Location permission not granted, using default location');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
      });

      // Get address from coordinates
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (addressResponse.length > 0) {
        const addr = addressResponse[0];
        const address = `${addr.city || 'Toshkent'}, ${addr.country || 'O`zbekistan'}`;
        const displayAddress = translateAddress(address);
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: displayAddress,
        });
      } else {
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: translateAddress('Toshkent, O\'zbekiston'),
        });
      }
    } catch (error) {
      console.error('Location error:', error);
      // Use default location on error
    }
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset pagination on search
  };

  const handleMasterPress = (master) => {
    navigation.navigate('MasterDetail', { master });
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(selectedCategory === category.id ? null : category.id);
    setCurrentPage(1);
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset pagination on filter change
  };

  // Update masters with calculated distances
  const mastersWithDistance = mastersData.map((master) => ({
    ...master,
    calculatedDistance: calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      master.latitude || 41.2995 + (Math.random() - 0.5) * 0.1,
      master.longitude || 69.2401 + (Math.random() - 0.5) * 0.1
    ).toFixed(1),
  }));

  const applyFilters = (master) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !master.name.toLowerCase().includes(query) &&
        !master.profession.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory && master.category_id !== selectedCategory) {
      return false;
    }

    // Distance filter (use calculatedDistance instead of distance)
    if (filters.distance) {
      const dist = parseFloat(master.calculatedDistance || master.distance);
      if (filters.distance === 'near' && dist > 3) return false;
      if (filters.distance === 'medium' && (dist <= 3 || dist > 7)) return false;
      if (filters.distance === 'far' && dist <= 7) return false;
    }

    // Price range filter
    if (filters.priceRange) {
      const rate = master.hourlyRate || master.hourly_rate || 0;
      if (filters.priceRange === 'cheap' && (rate < 200000 || rate > 350000)) return false;
      if (filters.priceRange === 'medium' && (rate < 350000 || rate > 500000)) return false;
      if (filters.priceRange === 'expensive' && rate < 500000) return false;
    }

    // Rating filter
    if (filters.rating) {
      if (filters.rating === 'high' && master.rating < 4.5) return false;
      if (filters.rating === 'good' && master.rating < 4.0) return false;
      if (filters.rating === 'ok' && master.rating < 3.5) return false;
    }

    // Experience filter
    if (filters.experience) {
      const exp = master.experience || master.experience_years || 0;
      if (filters.experience === 'expert' && exp < 10) return false;
      if (filters.experience === 'experienced' && (exp < 5 || exp >= 10)) return false;
      if (filters.experience === 'beginner' && (exp < 1 || exp >= 5)) return false;
    }

    // Toggle filters
    if (filters.quickCall && !(master.isQuickCall || master.is_quick_call)) return false;
    if (filters.available && !(master.isAvailable || master.is_available)) return false;
    if (filters.verified && !(master.isVerified || master.is_verified)) return false;
    if (filters.insured && !(master.isInsured || master.is_insured)) return false;
    if (filters.pro && !(master.isPro || master.is_pro)) return false;

    return true;
  };

  const filteredMasters = mastersWithDistance.filter(applyFilters);
  const paginatedMasters = filteredMasters.slice(0, currentPage * itemsPerPage);
  const hasMore = filteredMasters.length > paginatedMasters.length;

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    // Simulate loading delay for smooth UX
    setTimeout(() => {
      setCurrentPage((prev) => prev + 1);
      setIsLoadingMore(false);
    }, 500);
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  };

  // Retry function for error state
  const handleRetry = () => {
    setError(null);
    setIsLoadingMasters(true);

    const fetchMasters = async () => {
      try {
        setError(null);

        // Fetch masters data
        const { data, error: supabaseError } = await supabase
          .from('masters')
          .select('*');

        if (supabaseError) {
          throw supabaseError;
        }

        if (data) {
          // Map Supabase data to expected format (snake_case to camelCase)
          const mappedData = data.map(master => ({
            ...master,
            // Add camelCase aliases for snake_case fields
            name: master.full_name || master.name,
            avatar: master.avatar_url || master.avatar,
            hourlyRate: master.hourly_rate || master.hourlyRate,
            reviewCount: master.review_count || master.reviewCount || 0,
            completedJobs: master.completed_jobs || master.completedJobs || 0,
            isVerified: master.is_verified ?? master.isVerified ?? false,
            isInsured: master.is_insured ?? master.isInsured ?? false,
            isPro: master.is_pro ?? master.isPro ?? false,
            isQuickCall: master.is_24_7_available ?? master.isQuickCall ?? false,
            // Create workSchedule object
            workSchedule: master.is_24_7_available ? {
              type: '24/7',
              days: 'Har kuni',
              hours: 'Tun-kunduz'
            } : {
              type: 'Standart',
              days: 'Dush-Juma',
              hours: '09:00-18:00'
            },
            // Portfolio images (not implemented yet)
            portfolio: [],
          }));

          setMastersData(mappedData);
        }
      } catch (err) {
        console.error('Error fetching masters:', err);
        const isNetworkError = err.message?.includes('fetch') ||
                               err.message?.includes('network') ||
                               err.code === 'ECONNREFUSED' ||
                               err.message?.includes('Failed to fetch');

        setError({
          type: isNetworkError ? 'network' : 'general',
          message: err.message
        });
      } finally {
        setIsLoadingMasters(false);
      }
    };

    fetchMasters();
  };

  // Show error state
  if (error && !isLoadingMasters) {
    return (
      <View style={styles.container}>
        <Header
          onSearch={handleSearch}
          location={userLocation.address}
          onFilterPress={() => setFilterModalVisible(true)}
          onLocationPress={requestLocationPermission}
          navigation={navigation}
        />
        <ErrorState
          type={error.type}
          message={error.message}
          onRetry={handleRetry}
        />
      </View>
    );
  }

  // Show loading state while fetching masters
  if (isLoadingMasters) {
    return (
      <View style={styles.container}>
        <Header
          onSearch={handleSearch}
          location={userLocation.address}
          onFilterPress={() => setFilterModalVisible(true)}
          onLocationPress={requestLocationPermission}
          navigation={navigation}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  const handleContactAdmin = () => {
    navigation.navigate('ChatRoom', {
      roomId: null,
      orderId: null,
      masterName: 'Admin',
      masterAvatar: null,
      isAdminChat: true,
    });
  };

  return (
    <View style={styles.container}>
      <Header
        onSearch={handleSearch}
        location={userLocation.address}
        onFilterPress={() => setFilterModalVisible(true)}
        onLocationPress={requestLocationPermission}
        navigation={navigation}
      />

      <FlatList
        ListHeaderComponent={
          <>
            {/* Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('home.categories')}</Text>
              <View style={styles.categoriesGrid}>
                {categories
                  .sort((a, b) => {
                    // Get category names for sorting
                    const getNameA = () => {
                      if (currentLanguage === 'uz-latin') return a.name_uz_latin || a.name;
                      if (currentLanguage === 'uz-cyrillic') return a.name_uz_cyrillic || a.name;
                      if (currentLanguage === 'ru') return a.name_ru || a.name;
                      return a.name;
                    };
                    const getNameB = () => {
                      if (currentLanguage === 'uz-latin') return b.name_uz_latin || b.name;
                      if (currentLanguage === 'uz-cyrillic') return b.name_uz_cyrillic || b.name;
                      if (currentLanguage === 'ru') return b.name_ru || b.name;
                      return b.name;
                    };
                    // Sort by text length (shorter first)
                    return getNameA().length - getNameB().length;
                  })
                  .map((category) => {
                  const isActive = selectedCategory === category.id;

                  // Get category name based on current language from database
                  const getCategoryName = () => {
                    if (currentLanguage === 'uz-latin') return category.name_uz_latin || category.name;
                    if (currentLanguage === 'uz-cyrillic') return category.name_uz_cyrillic || category.name;
                    if (currentLanguage === 'ru') return category.name_ru || category.name;
                    return category.name;
                  };

                  const label = getCategoryName();

                  // Map icon emoji to Ionicons name
                  const getIconName = () => {
                    const iconMap = {
                      '🔧': 'construct-outline',
                      '⚡': 'flash-outline',
                      '🪚': 'build-outline',
                      '🧹': 'brush-outline',
                      '🎨': 'color-palette-outline',
                      '❄️': 'snow-outline',
                      '🔌': 'power-outline',
                      '📦': 'cube-outline',
                    };
                    return iconMap[category.icon] || 'hammer-outline';
                  };

                  return (
                    <TouchableOpacity
                      key={category.id}
                      style={[styles.categoryCard, isActive && styles.categoryCardActive]}
                      onPress={() => handleCategoryPress(category)}
                    >
                      <Ionicons
                        name={getIconName()}
                        size={18}
                        color={isActive ? colors.white : colors.secondary}
                        style={styles.categoryIconInline}
                      />
                      <Text style={[styles.categoryName, isActive && styles.categoryNameActive]} numberOfLines={2}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Popular Masters Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {selectedCategory ? (() => {
                  const selectedCat = categories.find(c => c.id === selectedCategory);
                  if (!selectedCat) return '';
                  if (currentLanguage === 'uz-latin') return selectedCat.name_uz_latin || selectedCat.name;
                  if (currentLanguage === 'uz-cyrillic') return selectedCat.name_uz_cyrillic || selectedCat.name;
                  if (currentLanguage === 'ru') return selectedCat.name_ru || selectedCat.name;
                  return selectedCat.name;
                })() : t('home.topMasters')}
                {' '}({filteredMasters.length})
              </Text>
              {selectedCategory && (
                <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                  <Text style={styles.clearFilter}>{t('common.clear') || 'Clear'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        }
        data={paginatedMasters}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <MasterCard master={item} onPress={handleMasterPress} />
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={colors.gray300} />
            <Text style={styles.emptyText}>{t('home.noMasters') || 'No masters found'}</Text>
            <Text style={styles.emptySubtext}>{t('home.tryOtherFilters') || 'Try different filters'}</Text>
          </View>
        }
      />

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        currentFilters={filters}
      />

      {/* Call Center Floating Button */}
      <TouchableOpacity
        style={styles.callCenterButton}
        onPress={handleContactAdmin}
        activeOpacity={0.8}
      >
        <Ionicons name="headset" size={28} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop:Platform.OS==='android'?25:0,
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  section: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  clearFilter: {
    fontSize: 14,
    color: colors.error,
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 0,
  },
  categoryCardActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  categoryIconInline: {
    marginRight: 6,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textPrimary,
    lineHeight: 16,
    flexShrink: 1,
  },
  categoryNameActive: {
    color: colors.white,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  callCenterButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default HomeScreen;
