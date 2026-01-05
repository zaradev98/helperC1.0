import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import colors from '../utils/colors';

const RatingModal = ({ visible, onClose, order, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [photos, setPhotos] = useState([]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Ruxsat kerak',
        'Rasmlarni tanlash uchun galereyaga ruxsat bering'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      maxFiles: 5,
    });

    if (!result.canceled) {
      const newPhotos = result.assets.map(asset => asset.uri);
      setPhotos([...photos, ...newPhotos].slice(0, 5));
    }
  };

  const handleRemovePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Diqqat', 'Iltimos, baho tanlang');
      return;
    }

    if (review.trim().length < 10) {
      Alert.alert('Diqqat', 'Sharh kamida 10 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    onSubmit({
      orderId: order.id,
      masterId: order.masterId,
      rating,
      review: review.trim(),
      photos,
    });

    // Reset form
    setRating(0);
    setReview('');
    setPhotos([]);
    onClose();
  };

  const handleClose = () => {
    setRating(0);
    setReview('');
    setPhotos([]);
    onClose();
  };

  if (!order) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            style={styles.modal}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
          >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Baholash</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Master Info */}
            <View style={styles.masterInfo}>
              <Image source={{ uri: order.masterAvatar }} style={styles.avatar} />
              <View style={styles.masterDetails}>
                <Text style={styles.masterName}>{order.masterName}</Text>
                <Text style={styles.profession}>{order.profession}</Text>
                <Text style={styles.service}>{order.service}</Text>
              </View>
            </View>

            {/* Star Rating */}
            <View style={styles.ratingSection}>
              <Text style={styles.sectionTitle}>Xizmat sifati</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starButton}
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={40}
                      color={star <= rating ? colors.warning : colors.gray300}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              {rating > 0 && (
                <Text style={styles.ratingText}>
                  {rating === 1 && 'Juda yomon'}
                  {rating === 2 && 'Yomon'}
                  {rating === 3 && 'O\'rtacha'}
                  {rating === 4 && 'Yaxshi'}
                  {rating === 5 && 'A\'lo'}
                </Text>
              )}
            </View>

            {/* Review Text */}
            <View style={styles.reviewSection}>
              <Text style={styles.sectionTitle}>Sharh yozing</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Xizmat haqida fikringizni yozing..."
                placeholderTextColor={colors.textTertiary}
                value={review}
                onChangeText={setReview}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{review.length} / 500</Text>
            </View>

            {/* Photo Upload */}
            <View style={styles.photoSection}>
              <Text style={styles.sectionTitle}>Rasmlar qo'shing (ixtiyoriy)</Text>
              <Text style={styles.photoHint}>Maksimal 5 ta rasm</Text>

              <View style={styles.photosContainer}>
                {photos.map((photo, index) => (
                  <View key={index} style={styles.photoWrapper}>
                    <Image source={{ uri: photo }} style={styles.photo} />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => handleRemovePhoto(index)}
                    >
                      <Ionicons name="close-circle" size={24} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                ))}

                {photos.length < 5 && (
                  <TouchableOpacity
                    style={styles.addPhotoButton}
                    onPress={handlePickImage}
                  >
                    <Ionicons name="camera-outline" size={32} color={colors.primary} />
                    <Text style={styles.addPhotoText}>Rasm qo'shing</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Bekor qilish</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, rating === 0 && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={rating === 0}
            >
              <Text style={styles.submitButtonText}>Yuborish</Text>
            </TouchableOpacity>
          </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
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
    maxHeight: '90%',
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
  masterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.gray50,
    borderRadius: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.gray100,
    marginRight: 12,
  },
  masterDetails: {
    flex: 1,
  },
  masterName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  profession: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  service: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  ratingSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.warning,
    textAlign: 'center',
    marginTop: 8,
  },
  reviewSection: {
    marginBottom: 24,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: colors.textPrimary,
    minHeight: 120,
    backgroundColor: colors.white,
  },
  charCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  photoSection: {
    marginBottom: 16,
  },
  photoHint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoWrapper: {
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: colors.gray100,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.error,
    borderRadius: 12,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary + '05',
  },
  addPhotoText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.gray100,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  submitButton: {
    flex: 2,
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray300,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default RatingModal;
