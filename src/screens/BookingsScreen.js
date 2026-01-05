import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BookingCard = ({ booking, onPress }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FF9800';
      case 'confirmed':
        return '#4CAF50';
      case 'in_progress':
        return '#2196F3';
      case 'completed':
        return '#666';
      case 'cancelled':
        return '#f44336';
      default:
        return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Kutilmoqda';
      case 'confirmed':
        return 'Tasdiqlangan';
      case 'in_progress':
        return 'Jarayonda';
      case 'completed':
        return 'Bajarildi';
      case 'cancelled':
        return 'Bekor qilindi';
      default:
        return status;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(booking)}>
      <View style={styles.cardHeader}>
        <Image
          source={{ uri: booking.master.avatar }}
          style={styles.avatar}
        />
        <View style={styles.cardInfo}>
          <Text style={styles.masterName}>{booking.master.name}</Text>
          <Text style={styles.profession}>{booking.master.profession}</Text>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            <Text style={styles.date}>{booking.date}</Text>
            <Ionicons name="time-outline" size={14} color="#666" style={{ marginLeft: 8 }} />
            <Text style={styles.time}>{booking.time}</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(booking.status) + '20' },
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
            {getStatusText(booking.status)}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.addressRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.address} numberOfLines={1}>
            {booking.address}
          </Text>
        </View>
        <Text style={styles.price}>{booking.price.toLocaleString()} so'm</Text>
      </View>

      {booking.status === 'confirmed' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={20} color="#32936F" />
            <Text style={styles.actionText}>Xabar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="call-outline" size={20} color="#32936F" />
            <Text style={styles.actionText}>Qo'ng'iroq</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const BookingsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('active');

  const mockBookings = [
    {
      id: 1,
      master: {
        name: 'Sardor Karimov',
        profession: 'Santexnik',
        avatar: 'https://i.pravatar.cc/150?img=12',
      },
      date: '05.12.2025',
      time: '10:00',
      address: 'Samarqand ko\'chasi, 5-uy, 12A',
      price: 450000,
      status: 'confirmed',
    },
    {
      id: 2,
      master: {
        name: 'Aziz Rahimov',
        profession: 'Elektrik',
        avatar: 'https://i.pravatar.cc/150?img=33',
      },
      date: '06.12.2025',
      time: '14:00',
      address: 'Amir Temur ko\'chasi, 89',
      price: 350000,
      status: 'pending',
    },
  ];

  const tabs = [
    { key: 'active', label: 'Faol' },
    { key: 'completed', label: 'Bajarilgan' },
    { key: 'cancelled', label: 'Bekor qilingan' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Buyurtmalar</Text>
      </View>

      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={mockBookings}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <BookingCard booking={item} onPress={() => {}} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Buyurtmalar yo'q</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingBottom:10
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#FFE8E0',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#32936F',
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  masterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  profession: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  time: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    height: 24,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#32936F',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F2',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#32936F',
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});

export default BookingsScreen;
