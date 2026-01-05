import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MasterCard from '../components/MasterCard';
import BookingModal from '../components/BookingModal';
import { masters, categories } from '../data/mockData';

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState('rating'); // rating, price, distance

  const handleMasterPress = (master) => {
    setSelectedMaster(master);
    setBookingModalVisible(true);
  };

  const filteredMasters = masters.filter((master) => {
    const matchesSearch =
      !searchQuery ||
      master.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      master.profession.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !selectedCategory || master.profession === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const sortedMasters = [...filteredMasters].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'price':
        return a.hourlyRate - b.hourlyRate;
      case 'distance':
        return a.distance - b.distance;
      default:
        return 0;
    }
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Usta yoki xizmat qidiring..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: 'all', name: 'Hammasi' }, ...categories]}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                (item.id === 'all' ? !selectedCategory : selectedCategory === item.name) &&
                  styles.filterChipActive,
              ]}
              onPress={() =>
                setSelectedCategory(item.id === 'all' ? null : item.name)
              }
            >
              <Text
                style={[
                  styles.filterChipText,
                  (item.id === 'all' ? !selectedCategory : selectedCategory === item.name) &&
                    styles.filterChipTextActive,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.resultsCount}>
          {sortedMasters.length} ta usta topildi
        </Text>
        <View style={styles.sortButtons}>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'rating' && styles.sortButtonActive]}
            onPress={() => setSortBy('rating')}
          >
            <Ionicons name="star" size={16} color={sortBy === 'rating' ? '#FF6B35' : '#666'} />
            <Text style={[styles.sortText, sortBy === 'rating' && styles.sortTextActive]}>
              Reyting
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'price' && styles.sortButtonActive]}
            onPress={() => setSortBy('price')}
          >
            <Ionicons name="cash" size={16} color={sortBy === 'price' ? '#FF6B35' : '#666'} />
            <Text style={[styles.sortText, sortBy === 'price' && styles.sortTextActive]}>
              Narx
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'distance' && styles.sortButtonActive]}
            onPress={() => setSortBy('distance')}
          >
            <Ionicons name="location" size={16} color={sortBy === 'distance' ? '#FF6B35' : '#666'} />
            <Text style={[styles.sortText, sortBy === 'distance' && styles.sortTextActive]}>
              Masofa
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Results */}
      <FlatList
        data={sortedMasters}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <MasterCard master={item} onPress={handleMasterPress} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Hech narsa topilmadi</Text>
            <Text style={styles.emptySubtext}>
              Boshqa kalit so'z bilan qidiring
            </Text>
          </View>
        }
      />

      {/* Booking Modal */}
      <BookingModal
        visible={bookingModalVisible}
        onClose={() => setBookingModalVisible(false)}
        master={selectedMaster}
        navigation={navigation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filters: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filtersList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#FF6B35',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  sortButtonActive: {
    backgroundColor: '#FFE8E0',
  },
  sortText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  sortTextActive: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  list: {
    paddingBottom: 16,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});

export default SearchScreen;
