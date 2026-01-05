import { supabase, isSupabaseConfigured } from '../lib/supabase';
import * as mockData from '../data/mockData';

// Agar Supabase configured bo'lmasa, mock data ishlatiladi
const useMockData = !isSupabaseConfigured();

/**
 * Categories
 */
export const getCategories = async () => {
  if (useMockData) {
    return { data: mockData.categories, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name_uz_latin');

    return { data, error };
  } catch (error) {
    console.error('getCategories error:', error);
    return { data: mockData.categories, error };
  }
};

/**
 * Masters
 */
export const getMasters = async (filters = {}) => {
  if (useMockData) {
    let masters = mockData.masters;

    // Apply filters to mock data
    if (filters.category_id) {
      masters = masters.filter(m => m.category_id === filters.category_id);
    }
    if (filters.is_pro !== undefined) {
      masters = masters.filter(m => m.is_pro === filters.is_pro);
    }
    if (filters.is_verified !== undefined) {
      masters = masters.filter(m => m.is_verified === filters.is_verified);
    }

    return { data: masters, error: null };
  }

  try {
    let query = supabase
      .from('masters')
      .select(`
        *,
        categories:category_id(id, name_uz_latin, name_uz_cyrillic, name_ru)
      `)
      .eq('status', 'active');

    // Apply filters
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id);
    }
    if (filters.is_pro !== undefined) {
      query = query.eq('is_pro', filters.is_pro);
    }
    if (filters.is_verified !== undefined) {
      query = query.eq('is_verified', filters.is_verified);
    }
    if (filters.min_rating) {
      query = query.gte('rating', filters.min_rating);
    }

    // Sorting
    query = query.order('rating', { ascending: false });

    const { data, error } = await query;

    // Transform data to match mobile app format
    const transformedData = data?.map(master => ({
      ...master,
      name: master.full_name,
      avatar: master.avatar_url,
      reviewCount: master.review_count,
      completedJobs: master.completed_jobs,
      hourlyRate: master.hourly_rate,
      isVerified: master.is_verified,
      isInsured: master.is_insured,
      isPro: master.is_pro,
      is24_7Available: master.is_24_7_available,
      experienceYears: master.experience_years,
    }));

    return { data: transformedData, error };
  } catch (error) {
    console.error('getMasters error:', error);
    return { data: mockData.masters, error };
  }
};

/**
 * Featured Masters
 */
export const getFeaturedMasters = async () => {
  if (useMockData) {
    return { data: mockData.featuredMasters, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('masters')
      .select('*')
      .eq('status', 'active')
      .eq('is_pro', true)
      .gte('rating', 4.5)
      .order('rating', { ascending: false })
      .limit(5);

    // Transform data
    const transformedData = data?.map(master => ({
      ...master,
      name: master.full_name,
      avatar: master.avatar_url,
      reviewCount: master.review_count,
      completedJobs: master.completed_jobs,
      hourlyRate: master.hourly_rate,
      isVerified: master.is_verified,
      isInsured: master.is_insured,
      isPro: master.is_pro,
      is24_7Available: master.is_24_7_available,
    }));

    return { data: transformedData, error };
  } catch (error) {
    console.error('getFeaturedMasters error:', error);
    return { data: mockData.featuredMasters, error };
  }
};

/**
 * Master by ID
 */
export const getMasterById = async (masterId) => {
  if (useMockData) {
    const master = mockData.featuredMasters.find(m => m.id === masterId) ||
                   mockData.masters.find(m => m.id === masterId);
    return { data: master, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('masters')
      .select(`
        *,
        categories:category_id(id, name_uz_latin),
        master_services(id, service_name, price, duration, is_available)
      `)
      .eq('id', masterId)
      .single();

    if (error) throw error;

    // Transform data
    const transformedData = {
      ...data,
      name: data.full_name,
      avatar: data.avatar_url,
      reviewCount: data.review_count,
      completedJobs: data.completed_jobs,
      hourlyRate: data.hourly_rate,
      isVerified: data.is_verified,
      isInsured: data.is_insured,
      isPro: data.is_pro,
      is24_7Available: data.is_24_7_available,
      services: data.master_services || [],
    };

    return { data: transformedData, error: null };
  } catch (error) {
    console.error('getMasterById error:', error);
    const master = mockData.featuredMasters.find(m => m.id === masterId);
    return { data: master, error };
  }
};

/**
 * Services
 */
export const getServices = async () => {
  if (useMockData) {
    return { data: mockData.services, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('master_services')
      .select(`
        *,
        masters(full_name),
        categories(name_uz_latin)
      `)
      .eq('is_available', true);

    return { data, error };
  } catch (error) {
    console.error('getServices error:', error);
    return { data: mockData.services, error };
  }
};

/**
 * Notifications
 */
export const getNotifications = async (userId) => {
  if (useMockData) {
    return { data: mockData.notifications, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_type', 'user')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    console.error('getNotifications error:', error);
    return { data: mockData.notifications, error };
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  if (useMockData) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    return { success: !error, error };
  } catch (error) {
    console.error('markNotificationAsRead error:', error);
    return { success: false, error };
  }
};

/**
 * Reviews
 */
export const getReviewsByMasterId = async (masterId) => {
  if (useMockData) {
    const reviews = mockData.reviews.filter(r => r.master_id === masterId);
    return { data: reviews, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        users:user_id(full_name, avatar_url)
      `)
      .eq('master_id', masterId)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    // Transform data
    const transformedData = data?.map(review => ({
      ...review,
      customerName: review.users?.full_name,
      customerAvatar: review.users?.avatar_url,
      date: review.created_at,
    }));

    return { data: transformedData, error };
  } catch (error) {
    console.error('getReviewsByMasterId error:', error);
    return { data: [], error };
  }
};

/**
 * Create Order
 */
export const createOrder = async (orderData) => {
  if (useMockData) {
    console.log('Mock mode: Order created', orderData);
    return { data: { id: Date.now(), ...orderData }, error: null };
  }

  try {
    // Generate order number
    const orderNumber = `HLP-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;

    const { data, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: orderData.user_id,
        master_id: orderData.master_id,
        category_id: orderData.category_id,
        service_name: orderData.service_name,
        scheduled_date: orderData.scheduled_date,
        scheduled_time: orderData.scheduled_time,
        address: orderData.address,
        apartment_number: orderData.apartment_number,
        latitude: orderData.latitude,
        longitude: orderData.longitude,
        base_price: orderData.base_price,
        total_price: orderData.total_price,
        user_notes: orderData.user_notes,
        status: 'new',
        payment_status: 'pending',
      })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('createOrder error:', error);
    return { data: null, error };
  }
};

/**
 * Get User Orders
 */
export const getUserOrders = async (userId) => {
  if (useMockData) {
    // Mock data doesn't have user-specific orders
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        masters:master_id(full_name, avatar_url, phone, profession),
        categories:category_id(name_uz_latin)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Transform data
    const transformedData = data?.map(order => ({
      ...order,
      masterName: order.masters?.full_name,
      masterAvatar: order.masters?.avatar_url,
      masterPhone: order.masters?.phone,
      profession: order.masters?.profession,
      service: order.service_name,
      date: order.scheduled_date,
      time: order.scheduled_time,
    }));

    return { data: transformedData, error };
  } catch (error) {
    console.error('getUserOrders error:', error);
    return { data: [], error };
  }
};

// Export flag to check if using mock data
export { useMockData };
