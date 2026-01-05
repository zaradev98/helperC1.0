import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../utils/colors';

const AddressItem = ({ address, onEdit, onDelete, onSetDefault }) => {
  return (
    <View style={styles.addressItem}>
      <View style={styles.addressHeader}>
        <View style={styles.addressTypeContainer}>
          <Ionicons
            name={address.type === 'home' ? 'home' : address.type === 'work' ? 'briefcase' : 'location'}
            size={20}
            color={colors.secondary}
          />
          <Text style={styles.addressType}>{address.label}</Text>
        </View>
        {address.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>Asosiy</Text>
          </View>
        )}
      </View>

      <Text style={styles.addressText}>{address.address}</Text>
      <Text style={styles.addressDetails}>
        {address.city}, {address.region}
      </Text>

      <View style={styles.addressActions}>
        {!address.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onSetDefault(address.id)}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color={colors.secondary} />
            <Text style={styles.actionButtonText}>Asosiy qilish</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onEdit(address)}
        >
          <Ionicons name="create-outline" size={18} color={colors.primary} />
          <Text style={[styles.actionButtonText, { color: colors.primary }]}>Tahrirlash</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onDelete(address.id)}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
          <Text style={[styles.actionButtonText, { color: colors.error }]}>O'chirish</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const AddressesScreen = ({ navigation }) => {
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: 'home',
      label: 'Uy',
      address: 'Amir Temur ko\'chasi, 15-uy',
      city: 'Toshkent',
      region: 'Chilonzor tumani',
      isDefault: true,
    },
    {
      id: 2,
      type: 'work',
      label: 'Ish',
      address: 'Mustaqillik shoh ko\'chasi, 32-bino',
      city: 'Toshkent',
      region: 'Yunusobod tumani',
      isDefault: false,
    },
  ]);

  const handleAddAddress = () => {
    // TODO: Navigate to add address screen
    Alert.alert('Qo\'shish', 'Yangi manzil qo\'shish funksiyasi tez orada qo\'shiladi');
  };

  const handleEditAddress = (address) => {
    // TODO: Navigate to edit address screen
    Alert.alert('Tahrirlash', `${address.label} manzilini tahrirlash`);
  };

  const handleDeleteAddress = (addressId) => {
    Alert.alert(
      'O\'chirish',
      'Haqiqatan ham bu manzilni o\'chirmoqchimisiz?',
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'O\'chirish',
          style: 'destructive',
          onPress: () => {
            setAddresses(addresses.filter(addr => addr.id !== addressId));
          },
        },
      ]
    );
  };

  const handleSetDefault = (addressId) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId,
    })));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manzillarim</Text>
        <TouchableOpacity onPress={handleAddAddress} style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={colors.info} />
          <Text style={styles.infoText}>
            Saqlangan manzillaringiz. Buyurtma berishda tez tanlash uchun.
          </Text>
        </View>

        {/* Addresses List */}
        <View style={styles.addressesList}>
          {addresses.map((address) => (
            <AddressItem
              key={address.id}
              address={address}
              onEdit={handleEditAddress}
              onDelete={handleDeleteAddress}
              onSetDefault={handleSetDefault}
            />
          ))}
        </View>

        {addresses.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyStateText}>Hozircha saqlangan manzillar yo'q</Text>
            <TouchableOpacity style={styles.addFirstButton} onPress={handleAddAddress}>
              <Ionicons name="add-circle-outline" size={20} color={colors.white} />
              <Text style={styles.addFirstButtonText}>Birinchi manzilni qo'shish</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer with Add Button */}
      {addresses.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.addNewButton} onPress={handleAddAddress}>
            <Ionicons name="add-circle-outline" size={20} color={colors.white} />
            <Text style={styles.addNewButtonText}>Yangi manzil qo'shish</Text>
          </TouchableOpacity>
        </View>
      )}
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
  addButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.info + '10',
    padding: 16,
    margin: 16,
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
  addressesList: {
    gap: 12,
    paddingHorizontal: 16,
  },
  addressItem: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  defaultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.secondary + '15',
  },
  defaultBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary,
  },
  addressText: {
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  addressDetails: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: colors.gray50,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.secondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 24,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.secondary,
  },
  addFirstButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.secondary,
  },
  addNewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default AddressesScreen;
