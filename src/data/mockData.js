// Mock data for the application - Updated for Supabase schema
import { generateMasters } from './generateMasters';

// Categories - matches Supabase categories table
export const categories = [
  { id: 1, name: 'Santexnik', key: 'plumber', icon: 'water-outline' },
  { id: 2, name: 'Elektrik', key: 'electrician', icon: 'flash-outline' },];

// Generate 100 masters
export const masters = generateMasters(100);

// Featured masters - matches Supabase masters table structure




// Notifications - matches notifications table structure
export const notifications = [
  {
    id: 1,
    user_type: 'user',
    type: 'booking',
    title: 'Buyurtma tasdiqlandi',
    message: 'Aziz Yusupov sizning buyurtmangizni qabul qildi. 10.12.2024 soat 10:00',
    date: new Date(Date.now() - 600000).toISOString(),
    time: '10 daqiqa oldin',
    read: false,
    is_read: false,
    priority: 'high',
    orderId: 1,
    masterId: 1,
    masterName: 'Aziz Yusupov',
    data: {
      order_id: 1,
      master_id: 1,
      master_name: 'Aziz Yusupov',
      scheduled_date: '2024-12-10',
      scheduled_time: '10:00'
    }
  },
  {
    id: 2,
    user_type: 'user',
    type: 'message',
    title: 'Yangi xabar',
    message: 'Jahongir Alimov sizga xabar yubordi',
    date: new Date(Date.now() - 3600000).toISOString(),
    time: '1 soat oldin',
    read: false,
    is_read: false,
    priority: 'medium',
    masterId: 2,
    masterName: 'Jahongir Alimov',
    data: {
      master_id: 2,
      master_name: 'Jahongir Alimov'
    }
  },
  {
    id: 3,
    user_type: 'user',
    type: 'payment',
    title: 'To\'lov muvaffaqiyatli',
    message: '150,000 so\'m to\'lov amalga oshirildi',
    date: new Date(Date.now() - 86400000).toISOString(),
    time: 'Kecha',
    read: true,
    is_read: true,
    priority: 'high',
    paymentData: {
      receiptId: 'TXN-2024-001',
      transaction_id: 'TXN-2024-001',
      amount: 150000,
      date: new Date(Date.now() - 86400000).toISOString(),
      paymentMethod: 'card',
      payment_method: 'card',
      cardNumber: '8600',
      service: 'Santexnika ta\'mirlash',
      masterName: 'Aziz Yusupov',
      profession: 'Santexnik',
      orderId: 1,
      order_id: 1
    },
    data: {
      payment_id: 1,
      transaction_id: 'TXN-2024-001',
      amount: 150000,
      order_id: 1
    }
  },
  {
    id: 4,
    user_type: 'user',
    type: 'review',
    title: 'Xizmatni baholang',
    message: 'Rustam Xamidov bilan ishingiz yakunlandi. Bahoni qoldiring.',
    date: new Date(Date.now() - 172800000).toISOString(),
    time: '2 kun oldin',
    read: true,
    is_read: true,
    priority: 'medium',
    orderId: 3,
    masterId: 3,
    masterName: 'Rustam Xamidov',
    data: {
      order_id: 3,
      master_id: 3,
      master_name: 'Rustam Xamidov'
    }
  },
  {
    id: 5,
    user_type: 'user',
    type: 'system',
    title: 'Maxsus chegirma! 🎉',
    message: 'Birinchi buyurtmangizga 20% chegirma. Foydalanish muddati: 30.12.2024',
    date: new Date(Date.now() - 259200000).toISOString(),
    time: '3 kun oldin',
    read: true,
    is_read: true,
    priority: 'low',
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #0B3CB4 0%, #3D65CC 100%);
            color: white;
          }
          .promo-container {
            text-align: center;
            padding: 30px 20px;
          }
          .promo-title {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .promo-discount {
            font-size: 72px;
            font-weight: bold;
            margin: 20px 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          }
          .promo-subtitle {
            font-size: 18px;
            margin-bottom: 20px;
            opacity: 0.9;
          }
          .promo-code {
            background: rgba(255,255,255,0.2);
            padding: 15px 30px;
            border-radius: 12px;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 2px;
            margin: 20px 0;
            border: 2px dashed rgba(255,255,255,0.5);
          }
          .promo-validity {
            font-size: 14px;
            margin-top: 20px;
            opacity: 0.8;
          }
        </style>
      </head>
      <body>
        <div class="promo-container">
          <div class="promo-title">🎉 Maxsus Taklifnoma 🎉</div>
          <div class="promo-discount">20%</div>
          <div class="promo-subtitle">Birinchi buyurtmangizga chegirma</div>
          <div class="promo-code">FIRST20</div>
          <div class="promo-validity">Amal qilish muddati: 30.12.2024 gacha</div>
        </div>
      </body>
      </html>
    `,
    additionalInfo: 'Chegirmani qo\'llash uchun buyurtma rasmiylashtirishda FIRST20 promokodini kiriting.',
    data: {
      promo_code: 'FIRST20',
      discount_percent: 20,
      valid_until: '2024-12-30'
    }
  },
  {
    id: 6,
    user_type: 'user',
    type: 'system',
    title: 'Yangi versiya mavjud',
    message: 'Helper 1.0 ilovasining yangi versiyasi chiqdi. Yangi funksiyalar va yaxshilanishlar!',
    date: new Date(Date.now() - 345600000).toISOString(),
    time: '4 kun oldin',
    read: true,
    is_read: true,
    priority: 'low'
  },
];

// Reviews - matches reviews table structure
export const reviews = [
  {
    id: 1,
    order_id: 1,
    user_id: 1,
    masterId: 1,
    master_id: 1,
    customerName: 'Alisher Karimov',
    customerAvatar: 'https://i.pravatar.cc/100?img=1',
    rating: 5,
    comment: 'Juda zo\'r usta! Tez va sifatli bajaradi. Hammaga tavsiya qilaman!',
    date: '2024-12-08',
    created_at: '2024-12-08T12:35:00Z',
    status: 'published',
    photos: [
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=300',
      'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=300',
    ],
  },
  {
    id: 2,
    order_id: 5,
    user_id: 5,
    masterId: 6,
    master_id: 6,
    customerName: 'Sardor Qodirov',
    customerAvatar: 'https://i.pravatar.cc/100?img=15',
    rating: 5,
    comment: 'Ajoyib oshpaz! Barcha mehmonlar mamnun qoldi! To\'yimiz juda zo\'r o\'tdi!',
    date: '2024-12-15',
    created_at: '2024-12-15T18:05:00Z',
    status: 'published',
    photos: [],
  },
  {
    id: 3,
    order_id: 9,
    user_id: 9,
    masterId: 11,
    master_id: 11,
    customerName: 'Timur Salimov',
    customerAvatar: 'https://i.pravatar.cc/100?img=51',
    rating: 4,
    comment: 'Yaxshi ish qildi, lekin biroz vaqt ko\'p ketdi. Lekin natija yaxshi.',
    date: '2024-12-05',
    created_at: '2024-12-05T18:10:00Z',
    status: 'published',
    photos: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300'],
  },
  {
    id: 4,
    order_id: 10,
    user_id: 10,
    masterId: 12,
    master_id: 12,
    customerName: 'Zarina Usmanova',
    customerAvatar: 'https://i.pravatar.cc/100?img=45',
    rating: 5,
    comment: 'Juda chiroyli ko\'ylak chiqdi! Tikuvchilik sifati a\'lo. Rahmat katta!',
    date: '2024-12-03',
    created_at: '2024-12-03T16:05:00Z',
    status: 'published',
    photos: [],
  },
];
