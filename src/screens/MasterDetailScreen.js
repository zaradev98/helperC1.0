import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import colors from '../utils/colors';
import Badge from '../components/Badge';
import BookingModal from '../components/BookingModal';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

const MasterDetailScreen = ({ route, navigation }) => {
  const { master } = route.params;
  const { t } = useLanguage();
  const { userPhone } = useAuth();
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [userId, setUserId] = useState(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);

  // Fetch services for this master
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        const { data, error } = await supabase
          .from('master_services')
          .select('*')
          .eq('master_id', master.id);

        if (error) {
          throw error;
        }

        if (data) {
          setServices(data);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, [master.id]);

  // Fetch reviews for this master
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            *,
            users:user_id(full_name, avatar_url)
          `)
          .eq('master_id', master.id)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          // Map Supabase data to component format
          const mappedReviews = data.map(review => ({
            id: review.id,
            order_id: review.order_id,
            user_id: review.user_id,
            master_id: review.master_id,
            rating: review.rating,
            comment: review.comment,
            photos: review.photos,
            status: review.status,
            created_at: review.created_at,
            updated_at: review.updated_at,
            customerName: review.users?.full_name || 'Noma`lum mijoz',
            customerAvatar: review.users?.avatar_url || null,
            date: review.created_at ? new Date(review.created_at).toLocaleDateString('uz-UZ') : null,
          }));
          setReviews(mappedReviews);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };

    // Get current user and check if they've reviewed this master
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);

        // Check if user has already reviewed this master
        const { data: existingReview } = await supabase
          .from('reviews')
          .select('id')
          .eq('user_id', user.id)
          .eq('master_id', master.id)
          .single();

        setHasUserReviewed(!!existingReview);
      }
    };

    fetchReviews();
    getUser();
  }, [master.id]);

  // Submit review handler
  const handleSubmitReview = async () => {
    if (!userId) {
      Alert.alert(t('error.generalError'), 'Iltimos tizimga kiring');
      return;
    }

    if (reviewComment.trim().length < 10) {
      Alert.alert(t('error.generalError'), 'Sharh kamida 10 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    try {
      setSubmittingReview(true);

      // Insert review into Supabase
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .insert([
          {
            user_id: userId,
            master_id: master.id,
            rating: reviewRating,
            comment: reviewComment.trim(),
            status: 'published',
            created_at: new Date().toISOString(),
          }
        ])
        .select();

      if (reviewError) {
        throw reviewError;
      }

      // Delete the review notification for this master (user's notification)
      const { error: notificationError } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)
        .eq('type', 'review')
        .eq('master_id', master.id);

      if (notificationError) {
        console.error('Error deleting notification:', notificationError);
        // Don't throw, notification deletion is not critical
      }

      // Create notification for the master about the new review
      const { error: masterNotificationError } = await supabase
        .from('notifications')
        .insert([
          {
            user_id: master.id,
            user_type: 'master',
            type: 'review',
            title: 'Yangi sharh',
            message: `Sizga ${reviewRating} yulduzli sharh qoldirildi`,
            data: {
              review_id: reviewData[0]?.id,
              rating: reviewRating,
              user_id: userId,
            },
            priority: 'medium',
            created_at: new Date().toISOString(),
          },
        ]);

      if (masterNotificationError) {
        console.error('Error creating master notification:', masterNotificationError);
        // Don't throw, notification is not critical
      }

      // Refresh reviews
      const { data: updatedReviews, error: fetchError } = await supabase
        .from('reviews')
        .select(`
          *,
          users:user_id(full_name, avatar_url)
        `)
        .eq('master_id', master.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (!fetchError && updatedReviews) {
        const mappedReviews = updatedReviews.map(review => ({
          id: review.id,
          order_id: review.order_id,
          user_id: review.user_id,
          master_id: review.master_id,
          rating: review.rating,
          comment: review.comment,
          photos: review.photos,
          status: review.status,
          created_at: review.created_at,
          updated_at: review.updated_at,
          customerName: review.users?.full_name || 'Noma\'lum mijoz',
          customerAvatar: review.users?.avatar_url || null,
          date: review.created_at ? new Date(review.created_at).toLocaleDateString('uz-UZ') : null,
        }));
        setReviews(mappedReviews);
      }

      // Reset form and close modal
      setReviewComment('');
      setReviewRating(5);
      setReviewModalVisible(false);
      setHasUserReviewed(true); // Hide the review button after submitting

      Alert.alert(
        t('common.success'),
        t('rating.thankYouMessage') || 'Sharhingiz uchun rahmat!'
      );
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert(
        t('error.generalError'),
        t('error.tryAgain') || 'Xatolik yuz berdi. Qayta urinib ko\'ring'
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle booking - only check if user is authenticated
  const handleBooking = () => {
    if (!userPhone) {
      Alert.alert(
        t('common.error') || 'Xato',
        'Buyurtma berish uchun tizimga kirishingiz kerak',
        [
          { text: t('common.ok') || 'OK', style: 'cancel' }
        ]
      );
      return;
    }
    setBookingModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('masterDetail.pageTitle')}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Master Info */}
        <View style={styles.masterInfo}>
          <Image source={{ uri: master.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{master.name}</Text>
          <Text style={styles.profession}>{master.profession}</Text>

          <View style={styles.badges}>
            {master.isVerified && <Badge type="verified" />}
            {master.isInsured && <Badge type="insured" />}
            {master.isPro && <Badge type="pro" />}
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={20} color={colors.warning} />
              <Text style={styles.statValue}>{master.rating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>{master.reviewCount} {t('masterDetail.reviewsCount')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.secondary} />
              <Text style={styles.statValue}>{master.completedJobs}</Text>
              <Text style={styles.statLabel}>{t('masterDetail.completed')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="location" size={20} color={colors.primary} />
              <Text style={styles.statValue}>{master.distance} km</Text>
              <Text style={styles.statLabel}>{t('masterDetail.distance')}</Text>
            </View>
          </View>
        </View>

        {/* Work Schedule */}
        {master.workSchedule && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('masterDetail.workSchedule')}</Text>
            <View style={styles.scheduleCard}>
              <Ionicons
                name={master.workSchedule.type === '24/7' ? 'time' : 'calendar'}
                size={24}
                color={master.workSchedule.type === '24/7' ? colors.secondary : colors.primary}
              />
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleType}>{master.workSchedule.type}</Text>
                <Text style={styles.scheduleDays}>{master.workSchedule.days}</Text>
                <Text style={styles.scheduleHours}>{master.workSchedule.hours}</Text>
              </View>
              {master.isQuickCall && (
                <View style={styles.quickCallBadge}>
                  <Ionicons name="flash" size={16} color={colors.warning} />
                  <Text style={styles.quickCallText}>{t('masterDetail.quickCall')}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('masterDetail.description')}</Text>
          <Text style={styles.description}>{master.description}</Text>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('masterDetail.services') || 'Xizmatlar'}</Text>
          {loadingServices ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : services.length > 0 ? (
            services.map((service) => (
              <View key={service.id} style={styles.serviceCard}>
                <View style={styles.serviceHeader}>
                  <Ionicons name="construct-outline" size={20} color={colors.secondary} />
                  <Text style={styles.serviceName}>{service.service_name}</Text>
                </View>
                {service.description && (
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                )}
                <View style={styles.serviceFooter}>
                  <View style={styles.serviceInfo}>
                    <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.serviceDuration}>{t('common.approx') || 'o\'rtacha'} {service.duration} {t('common.min') || 'min'}</Text>
                  </View>
                  <Text style={styles.servicePrice}>
                    {t('common.from') || 'dan'} {service.price?.toLocaleString()} {t('common.sum') || "so'm"}
                  </Text>
                </View>
                {service.hashtags && service.hashtags.length > 0 && (
                  <View style={styles.serviceHashtags}>
                    {service.hashtags.map((tag, index) => (
                      <Text key={index} style={styles.hashtag}>{tag}</Text>
                    ))}
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noServices}>{t('masterDetail.noServices') || 'Xizmatlar mavjud emas'}</Text>
          )}
        </View>

        {/* Portfolio */}
        {master.portfolio && master.portfolio.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('masterDetail.portfolio')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {master.portfolio.map((image, index) => (
                <Image key={index} source={{ uri: image }} style={styles.portfolioImage} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('masterDetail.reviews')} ({reviews.length})</Text>
          {loadingReviews ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : reviews.length > 0 ? (
            reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Image source={{ uri: review.customerAvatar }} style={styles.reviewAvatar} />
                <View style={styles.reviewInfo}>
                  <Text style={styles.reviewName}>{review.customerName}</Text>
                  <View style={styles.reviewRating}>
                    {[...Array(5)].map((_, i) => (
                      <Ionicons
                        key={i}
                        name="star"
                        size={14}
                        color={i < review.rating ? colors.warning : colors.gray300}
                      />
                    ))}
                  </View>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
              </View>
              <Text style={styles.reviewText}>{review.comment}</Text>
              {review.photos && review.photos.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewPhotos}>
                  {review.photos.map((photo, index) => (
                    <Image key={index} source={{ uri: photo }} style={styles.reviewPhoto} />
                  ))}
                </ScrollView>
              )}
            </View>
          ))
          ) : (
            <Text style={styles.noServices}>{t('masterDetail.noReviews') || 'Sharhlar yo\'q'}</Text>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>{t('masterDetail.price')}</Text>
          <Text style={styles.price}>{master.hourlyRate?.toLocaleString()} {t('masterDetail.perHour')}</Text>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBooking}
        >
          <Text style={styles.bookButtonText}>{t('masterDetail.book')}</Text>
        </TouchableOpacity>
      </View>

      {/* Booking Modal */}
      <BookingModal
        visible={bookingModalVisible}
        onClose={() => setBookingModalVisible(false)}
        master={master}
        navigation={navigation}
      />
      
      {/* Add Review Button - Only show if user hasn't reviewed yet */}
      {userId && !hasUserReviewed && (
        <TouchableOpacity
          style={styles.addReviewButton}
          onPress={() => setReviewModalVisible(true)}
        >
          <Ionicons name="star" size={20} color={colors.warning} />
          <Text style={styles.addReviewButtonText}>{t('masterDetail.addReview') || 'Sharh qo\'shish'}</Text>
        </TouchableOpacity>
      )}

      {/* Review Modal */}
      <Modal
        visible={reviewModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('rating.title') || 'Xizmatni baholang'}</Text>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                <Ionicons name="close" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Star Rating */}
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setReviewRating(star)}
                  style={styles.starButton}
                >
                  <Ionicons
                    name={star <= reviewRating ? 'star' : 'star-outline'}
                    size={40}
                    color={star <= reviewRating ? colors.warning : colors.gray300}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Comment Input */}
            <Text style={styles.inputLabel}>{t('rating.comment') || 'Izoh (ixtiyoriy)'}</Text>
            <TextInput
              style={styles.commentInput}
              placeholder={t('rating.commentPlaceholder') || 'Xizmat haqida fikringizni yozing...'}
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, submittingReview && styles.submitButtonDisabled]}
              onPress={handleSubmitReview}
              disabled={submittingReview}
            >
              {submittingReview ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>
                  {t('rating.submit') || 'Baholashni yuborish'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  masterInfo: {
    backgroundColor: colors.white,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 8,
    borderBottomColor: colors.backgroundGray,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    backgroundColor: colors.gray100,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  profession: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.gray200,
  },
  section: {
    backgroundColor: colors.white,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.gray50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  scheduleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  scheduleType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  scheduleDays: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  scheduleHours: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  quickCallBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warning + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quickCallText: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: '600',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  portfolioImage: {
    width: 160,
    height: 160,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: colors.gray100,
  },
  reviewCard: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: colors.gray100,
  },
  reviewInfo: {
    flex: 1,
  },
  reviewName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  reviewPhotos: {
    marginTop: 8,
  },
  reviewPhoto: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: colors.gray100,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  serviceCard: {
    backgroundColor: colors.gray50,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  serviceDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceDuration: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.secondary,
  },
  serviceHashtags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  hashtag: {
    fontSize: 11,
    color: colors.primary,
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  noServices: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  bookButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
  },
  bookButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  starButton: {
    padding: 5,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 100,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  addReviewButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addReviewButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MasterDetailScreen;
