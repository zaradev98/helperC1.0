import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import colors from '../utils/colors';
import { StatusBar } from 'expo-status-bar';

/**
 * Map dan joylashuv tanlash komponenti
 * @param {object} initialLocation - Boshlang'ich joylashuv {latitude, longitude, address}
 * @param {function} onLocationSelect - Joylashuv tanlanganda chaqiriladigan callback
 * @param {boolean} showCurrentLocation - Joriy joylashuvni ko'rsatish tugmasi
 */
const MapLocationPicker = ({
  initialLocation,
  onLocationSelect,
  showCurrentLocation = true
}) => {
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(
    initialLocation || {
      latitude: 41.2995,  // Toshkent default
      longitude: 69.2401,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }
  );
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState(initialLocation?.address || '');

  // Joriy joylashuvni olish
  const getCurrentLocation = async () => {
    try {
      setLoading(true);

      // Ruxsat so'rash
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ruxsat kerak', 'Joylashuvni aniqlash uchun ruxsat bering');
        setLoading(false);
        return;
      }

      // Joriy joylashuvni olish
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setSelectedLocation(newLocation);

      // Map ni yangi joyga harakatlantirish
      if (mapRef.current) {
        mapRef.current.animateToRegion(newLocation, 500);
      }

      // Manzilni olish
      await getAddressFromCoords(newLocation.latitude, newLocation.longitude);

      setLoading(false);
    } catch (error) {
      console.error('Joylashuvni olishda xato:', error);
      Alert.alert('Xato', 'Joylashuvni aniqlab bo\'lmadi');
      setLoading(false);
    }
  };

  // Koordinatalardan manzil olish (reverse geocoding)
  const getAddressFromCoords = async (latitude, longitude) => {
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (result && result.length > 0) {
        const location = result[0];
        const addressParts = [
          location.street,
          location.district,
          location.city,
          location.region,
        ].filter(Boolean);

        const formattedAddress = addressParts.join(', ') || 'Manzil topilmadi';
        setAddress(formattedAddress);
      }
    } catch (error) {
      console.error('Manzil olishda xato:', error);
      setAddress('Manzil aniqlanmadi');
    }
  };

  // Map bosilganda
  const handleMapPress = async (event) => {
    const { coordinate } = event.nativeEvent;
    const newLocation = {
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      latitudeDelta: selectedLocation.latitudeDelta,
      longitudeDelta: selectedLocation.longitudeDelta,
    };

    setSelectedLocation(newLocation);
    await getAddressFromCoords(coordinate.latitude, coordinate.longitude);
  };

  // Marker drag qilinganda
  const handleMarkerDragEnd = async (event) => {
    const { coordinate } = event.nativeEvent;
    const newLocation = {
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      latitudeDelta: selectedLocation.latitudeDelta,
      longitudeDelta: selectedLocation.longitudeDelta,
    };

    setSelectedLocation(newLocation);
    await getAddressFromCoords(coordinate.latitude, coordinate.longitude);
  };

  // Joylashuvni tasdiqlash
  const handleConfirm = () => {
    if (onLocationSelect) {
      onLocationSelect({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        address: address,
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor='red' barStyle="dark-content" />
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={selectedLocation}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {/* Tanlangan joylashuv marker */}
        <Marker
          coordinate={{
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
          }}
          draggable
          onDragEnd={handleMarkerDragEnd}
        >
          <View style={styles.markerContainer}>
            <Ionicons name="location" size={40} color={colors.primary} />
          </View>
        </Marker>
      </MapView>

      {/* Joriy joylashuvga o'tish tugmasi */}
      {showCurrentLocation && (
        <TouchableOpacity
          style={[styles.currentLocationButton, { top: insets.top + 10 }]}
          onPress={getCurrentLocation}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Ionicons name="locate" size={24} color={colors.primary} />
          )}
        </TouchableOpacity>
      )}

      {/* Manzil va tasdiqlash paneli */}
      <View style={styles.bottomPanel}>
        <View style={styles.addressContainer}>
          <Ionicons name="location-outline" size={20} color={colors.primary} />
          <Text style={styles.addressText} numberOfLines={2}>
            {address || 'Xaritadan joylashuvni tanlang'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
          disabled={!address}
        >
          <Text style={styles.confirmButtonText}>Tasdiqlash</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationButton: {
    position: 'absolute',
    right: 20,
    backgroundColor: colors.white,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  addressText: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MapLocationPicker;
