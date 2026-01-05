import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const OrdersContext = createContext();

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};

export const OrdersProvider = ({ children }) => {
  const { userPhone } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isMaster, setIsMaster] = useState(false);
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);

  const subscriptionRef = useRef(null);
  const isMountedRef = useRef(true);
  const isInitializedRef = useRef(false);

  // Map database status to UI status
  const mapStatusToUI = (dbStatus) => {
    if (dbStatus === 'new' || dbStatus === 'accepted' || dbStatus === 'in_progress') {
      return 'active';
    }
    return dbStatus;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 OrdersContext unmounting');
      isMountedRef.current = false;
      cleanupSubscription();
    };
  }, []);

  const cleanupSubscription = useCallback(() => {
    if (subscriptionRef.current) {
      console.log('🔴 Removing global subscription');
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
      setRealtimeEnabled(false);
    }
  }, []);

  // Fetch user ID and role
  const fetchUserInfo = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      let currentUserId = null;

      if (authUser) {
        currentUserId = authUser.id;
      } else if (userPhone) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('phone', userPhone)
          .single();

        if (userData) {
          currentUserId = userData.id;
          console.log('👤 User ID found:', currentUserId);
        }
      }

      if (!currentUserId) {
        console.log('❌ No user ID found');
        return null;
      }

      // Check if current user is a master
      const { data: masterData } = await supabase
        .from('masters')
        .select('id')
        .eq('id', currentUserId)
        .single();

      const isUserMaster = !!masterData;

      return { userId: currentUserId, isMaster: isUserMaster };
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  }, [userPhone]);

  // Fetch orders
  const fetchOrders = useCallback(async (forUserId, forIsMaster) => {
    try {
      console.log('📦 Fetching orders globally...');

      const targetUserId = forUserId || userId;
      const targetIsMaster = forIsMaster !== undefined ? forIsMaster : isMaster;

      if (!targetUserId) {
        console.log('⚠️ No user ID available');
        return [];
      }

      let query = supabase
        .from('orders')
        .select(`
          *,
          masters!master_id (
            full_name,
            avatar_url,
            profession,
            phone
          ),
          users!user_id (
            full_name,
            phone
          )
        `);

      if (targetIsMaster) {
        query = query.eq('master_id', targetUserId);
      } else {
        query = query.eq('user_id', targetUserId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching orders:', error);
        throw error;
      }

      console.log(`✅ ${data?.length || 0} orders loaded globally`);

      if (data && data.length > 0) {
        const mappedOrders = data.map(order => ({
          id: order.id,
          masterId: order.master_id,
          userId: order.user_id,
          masterName: order.masters?.full_name || 'Noma\'lum',
          masterAvatar: order.masters?.avatar_url || 'https://i.pravatar.cc/150?img=1',
          profession: order.masters?.profession || '',
          userName: order.users?.full_name || 'Noma\'lum',
          userPhone: order.users?.phone || '',
          service: order.service_name || '',
          date: order.scheduled_date || '',
          time: order.scheduled_time || '',
          status: mapStatusToUI(order.status),
          dbStatus: order.status,
          price: order.total_price || 0,
          address: order.address || '',
          notes: order.user_notes || order.notes || '',
          createdAt: order.created_at,
          completedAt: order.completed_at,
          cancelledAt: order.cancelled_at,
          cancelReason: order.cancel_reason || '',
          rating: order.rating,
          review: order.review,
        }));

        return mappedOrders;
      }

      return [];
    } catch (error) {
      console.error('Error in fetchOrders:', error);
      throw error;
    }
  }, [userId, isMaster]);

  // Setup real-time subscription - GLOBAL, faqat 1 marta yoqiladi
  const setupRealtimeSubscription = useCallback((forUserId, forIsMaster) => {
    // Agar subscription allaqachon mavjud bo'lsa
    if (subscriptionRef.current) {
      console.log('⚠️ Global subscription already exists');
      return;
    }

    const targetUserId = forUserId || userId;
    const targetIsMaster = forIsMaster !== undefined ? forIsMaster : isMaster;

    if (!targetUserId) {
      console.log('⚠️ Cannot setup subscription without user ID');
      return;
    }

    try {
      const filter = targetIsMaster
        ? `master_id=eq.${targetUserId}`
        : `user_id=eq.${targetUserId}`;

      console.log('🔴 Setting up GLOBAL real-time subscription');
      console.log('   Filter:', filter);
      console.log('   User ID:', targetUserId);
      console.log('   Is Master:', targetIsMaster);

      const channel = supabase
        .channel(`global-orders-${targetUserId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: filter
          },
          async (payload) => {
            if (!isMountedRef.current) {
              console.log('⚠️ Component unmounted, ignoring update');
              return;
            }

            console.log('📡 REALTIME EVENT RECEIVED!');
            console.log('   Event Type:', payload.eventType);
            console.log('   Order ID:', payload.new?.id);
            console.log('   Full Payload:', JSON.stringify(payload, null, 2));

            if (payload.eventType === 'INSERT') {
              console.log('🆕 Processing INSERT event...');
              // Yangi buyurtma qo'shildi
              const { data: newOrderData } = await supabase
                .from('orders')
                .select(`
                  *,
                  masters!master_id (
                    full_name,
                    avatar_url,
                    profession,
                    phone
                  ),
                  users!user_id (
                    full_name,
                    phone
                  )
                `)
                .eq('id', payload.new.id)
                .single();

              if (newOrderData) {
                console.log('✅ New order data fetched:', newOrderData.id);

                const newOrder = {
                  id: newOrderData.id,
                  masterId: newOrderData.master_id,
                  userId: newOrderData.user_id,
                  masterName: newOrderData.masters?.full_name || 'Noma\'lum',
                  masterAvatar: newOrderData.masters?.avatar_url || 'https://i.pravatar.cc/150?img=1',
                  profession: newOrderData.masters?.profession || '',
                  userName: newOrderData.users?.full_name || 'Noma\'lum',
                  userPhone: newOrderData.users?.phone || '',
                  service: newOrderData.service_name || '',
                  date: newOrderData.scheduled_date || '',
                  time: newOrderData.scheduled_time || '',
                  status: mapStatusToUI(newOrderData.status),
                  dbStatus: newOrderData.status,
                  price: newOrderData.total_price || 0,
                  address: newOrderData.address || '',
                  notes: newOrderData.user_notes || newOrderData.notes || '',
                  createdAt: newOrderData.created_at,
                  completedAt: newOrderData.completed_at,
                  cancelledAt: newOrderData.cancelled_at,
                  cancelReason: newOrderData.cancel_reason || '',
                  rating: newOrderData.rating,
                  review: newOrderData.review,
                };

                setOrders(prev => {
                  // Dublikatlarni oldini olish
                  const exists = prev.some(o => o.id === newOrder.id);
                  if (exists) {
                    console.log('⚠️ Order already exists, updating...');
                    return prev.map(o => o.id === newOrder.id ? newOrder : o);
                  }
                  console.log('✨ Adding new order to list');
                  return [newOrder, ...prev];
                });

                console.log('🎉 New order added globally:', newOrder.id);
              } else {
                console.log('❌ Failed to fetch new order data');
              }
            }
            else if (payload.eventType === 'UPDATE') {
              // Mavjud buyurtma yangilandi
              setOrders(prev =>
                prev.map(order =>
                  order.id === payload.new.id
                    ? {
                        ...order,
                        status: mapStatusToUI(payload.new.status),
                        dbStatus: payload.new.status,
                        completedAt: payload.new.completed_at,
                        cancelledAt: payload.new.cancelled_at,
                        cancelReason: payload.new.cancel_reason,
                        rating: payload.new.rating,
                        review: payload.new.review,
                      }
                    : order
                )
              );

              console.log('🔄 Order updated globally:', payload.new.id);
            }
            else if (payload.eventType === 'DELETE') {
              // Buyurtma o'chirildi
              setOrders(prev => prev.filter(order => order.id !== payload.old.id));
              console.log('🗑️ Order deleted globally:', payload.old.id);
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Global subscription status:', status);
          if (status === 'SUBSCRIBED') {
            console.log('✅ Global realtime subscription active');
            setRealtimeEnabled(true);
          }
        });

      subscriptionRef.current = channel;

    } catch (error) {
      console.error('Error setting up global real-time subscription:', error);
    }
  }, [userId, isMaster]);

  // Initialize - faqat 1 marta
  const initialize = useCallback(async () => {
    if (isInitializedRef.current) {
      console.log('⚡ Already initialized globally');
      return;
    }

    try {
      setLoading(true);
      console.log('🚀 Initializing OrdersContext...');

      // Get user info
      const userInfo = await fetchUserInfo();
      if (!userInfo) {
        setLoading(false);
        return;
      }

      setUserId(userInfo.userId);
      setIsMaster(userInfo.isMaster);

      // Fetch initial orders
      const ordersData = await fetchOrders(userInfo.userId, userInfo.isMaster);
      setOrders(ordersData);

      // Setup real-time subscription GLOBAL
      setupRealtimeSubscription(userInfo.userId, userInfo.isMaster);

      isInitializedRef.current = true;
      console.log('✅ OrdersContext initialized');

    } catch (error) {
      console.error('Error initializing OrdersContext:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchUserInfo, fetchOrders, setupRealtimeSubscription]);

  // Auto-initialize when userPhone becomes available
  useEffect(() => {
    console.log('🔍 OrdersContext useEffect triggered');
    console.log('   userPhone:', userPhone);
    console.log('   isInitialized:', isInitializedRef.current);

    if (userPhone && !isInitializedRef.current) {
      console.log('✅ Conditions met, calling initialize()');
      initialize();
    } else {
      if (!userPhone) console.log('⏸️ Waiting for userPhone...');
      if (isInitializedRef.current) console.log('⏸️ Already initialized');
    }
  }, [userPhone, initialize]);

  // Refresh orders function
  const refreshOrders = useCallback(async () => {
    if (!userId) return;

    console.log('🔄 Refreshing orders globally...');

    try {
      const ordersData = await fetchOrders(userId, isMaster);
      setOrders(ordersData);
      console.log('✅ Orders refreshed globally'),ordersData;
    } catch (error) {
      console.error('Error refreshing orders:', error);
      throw error;
    }
  }, [userId, isMaster, fetchOrders]);

  // Update order locally (optimistic update)
  const updateOrderLocally = useCallback((orderId, updates) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, ...updates } : order
      )
    );
  }, []);

  // Cancel order
  const cancelOrder = useCallback(async (orderId, cancelReason) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          cancel_reason: cancelReason,
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Realtime avtomatik yangilaydi, lekin optimistic update ham qilamiz
      updateOrderLocally(orderId, {
        status: 'cancelled',
        dbStatus: 'cancelled',
        cancelReason: cancelReason,
        cancelledAt: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }, [updateOrderLocally]);

  // Rate order
  const rateOrder = useCallback(async (orderId, rating, review) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          rating: rating,
          review: review,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Optimistic update
      updateOrderLocally(orderId, { rating, review });

      return true;
    } catch (error) {
      console.error('Error rating order:', error);
      throw error;
    }
  }, [updateOrderLocally]);

  const value = {
    orders,
    loading,
    userId,
    isMaster,
    realtimeEnabled,
    refreshOrders,
    updateOrderLocally,
    cancelOrder,
    rateOrder,
    initialize,
    cleanupSubscription
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
};
