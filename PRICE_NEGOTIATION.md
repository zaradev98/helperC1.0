# Narx Kelishuvi Funksionaligi

Bu hujjatda buyurtmalarda narx kelishuvi (price negotiation) jarayoni va uni qanday ishlatish tushuntirilgan.

## Jarayon

1. **Mijoz buyurtma yaratadi**
   - Status: `new`
   - `base_price` ustaning dastlabki narxi sifatida saqlanadi
   - `total_price` = `base_price` (hozircha)

2. **Usta buyurtmani qabul qiladi**
   - Status: `accepted`
   - Usta mijoz manziliga kelib ishni ko'radi (konsultatsiya)

3. **Usta narx taklif qiladi**
   - **Component:** `PriceProposalModal.js` ishlatiladi
   - Usta quyidagilarni kiritadi:
     - `proposed_price` - kelishilgan narx
     - `price_proposal_notes` - ish tavsifi, muddat, qo'shimcha ma'lumotlar (JSON formatda)
   - Status: `price_proposed`
   - `price_proposed_at` timestamp qo'yiladi

4. **Mijoz narxni ko'radi va tasdiqlaydi**
   - **Component:** `PriceApprovalCard.js` ishlatiladi
   - Mijozga 2 ta variant:
     - **Tasdiqlash** → `total_price = proposed_price`, Status: `accepted`, `price_accepted_at` timestamp
     - **Rad etish** → Status: `cancelled`, `cancel_reason` = "Narx mos kelmadi"

5. **Ish boshlanadi**
   - Status: `in_progress`
   - Ish tugagach: Status: `completed`

---

## Database Schema O'zgarishlari

### Orders jadvaliga qo'shish kerak:

```sql
-- Narx kelishuvi uchun yangi ustunlar
ALTER TABLE orders
ADD COLUMN proposed_price DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN price_proposal_notes TEXT DEFAULT NULL,
ADD COLUMN price_proposed_at TIMESTAMP DEFAULT NULL,
ADD COLUMN price_accepted_at TIMESTAMP DEFAULT NULL;

-- Status enum ga yangi statuslar (agar yo'q bo'lsa)
-- ALTER TYPE order_status ADD VALUE 'price_proposed';
```

### Ustunlar tavsifi:

| Ustun | Tip | Tavsif |
|-------|-----|--------|
| `base_price` | DECIMAL(10,2) | Ustaning dastlabki narxi (konsultatsiya) |
| `proposed_price` | DECIMAL(10,2) | Usta tomonidan taklif qilingan narx |
| `total_price` | DECIMAL(10,2) | Yakuniy narx (mijoz tasdiqlagan narx) |
| `price_proposal_notes` | TEXT | Ish tavsifi, muddat va qo'shimcha izohlar (JSON) |
| `price_proposed_at` | TIMESTAMP | Narx taklif qilingan vaqt |
| `price_accepted_at` | TIMESTAMP | Narx tasdiqlangan vaqt |

---

## Komponentlar

### 1. PriceProposalModal.js

**Maqsad:** Usta narx taklif qilish uchun

**Joylashuv:** `src/components/PriceProposalModal.js`

**Qanday ishlatish (Master App da):**

```javascript
import PriceProposalModal from '../components/PriceProposalModal';

const MasterOrderScreen = () => {
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleProposePrice = (order) => {
    setSelectedOrder(order);
    setShowPriceModal(true);
  };

  return (
    <View>
      {/* Order list */}
      <TouchableOpacity onPress={() => handleProposePrice(order)}>
        <Text>Narx taklif qilish</Text>
      </TouchableOpacity>

      {/* Price proposal modal */}
      <PriceProposalModal
        visible={showPriceModal}
        onClose={() => setShowPriceModal(false)}
        order={selectedOrder}
        onSuccess={() => {
          // Buyurtmani qayta yuklash
          refreshOrders();
        }}
      />
    </View>
  );
};
```

**Parametrlar:**
- `visible` (boolean) - Modal ochiq/yopiq
- `onClose` (function) - Modal yopish callback
- `order` (object) - Buyurtma ma'lumotlari
- `onSuccess` (function) - Narx taklif muvaffaqiyatli yuborilgach chaqiriladi

---

### 2. PriceApprovalCard.js

**Maqsad:** Mijoz narxni tasdiqlash yoki rad etish uchun

**Joylashuv:** `src/components/PriceApprovalCard.js`

**Qanday ishlatish (Client App da - OrderDetailScreen):**

```javascript
import PriceApprovalCard from '../components/PriceApprovalCard';

const OrderDetailScreen = ({ route }) => {
  const [order, setOrder] = useState(route.params?.order);

  const handleApprovalChange = () => {
    // Buyurtmani qayta yuklash
    refreshOrder();
  };

  return (
    <ScrollView>
      {/* Order ma'lumotlari */}
      <View>
        <Text>Buyurtma #{order.order_number}</Text>
      </View>

      {/* Narx tasdiqlash kartasi */}
      <PriceApprovalCard
        order={order}
        onApprovalChange={handleApprovalChange}
      />

      {/* Boshqa ma'lumotlar */}
    </ScrollView>
  );
};
```

**Parametrlar:**
- `order` (object) - Buyurtma ma'lumotlari
- `onApprovalChange` (function) - Narx tasdiqlangan/rad etilgan callback

**Eslatma:** Agar `order.status !== 'price_proposed'` bo'lsa, komponent hech narsa ko'rsatmaydi.

---

## Supabase Query Misollari

### 1. Narx taklif qilish (Usta)

```javascript
const proposePriceToClient = async (orderId, priceData) => {
  const { error } = await supabase
    .from('orders')
    .update({
      proposed_price: priceData.price,
      price_proposal_notes: JSON.stringify({
        work_description: priceData.description,
        estimated_duration: priceData.duration,
        additional_notes: priceData.notes,
      }),
      price_proposed_at: new Date().toISOString(),
      status: 'price_proposed'
    })
    .eq('id', orderId);

  return { error };
};
```

### 2. Narxni tasdiqlash (Mijoz)

```javascript
const acceptProposedPrice = async (orderId, proposedPrice) => {
  const { error } = await supabase
    .from('orders')
    .update({
      total_price: proposedPrice,
      status: 'accepted',
      price_accepted_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  return { error };
};
```

### 3. Narxni rad etish (Mijoz)

```javascript
const rejectProposedPrice = async (orderId) => {
  const { error } = await supabase
    .from('orders')
    .update({
      status: 'cancelled',
      cancel_reason: 'Narx mos kelmadi',
    })
    .eq('id', orderId);

  return { error };
};
```

---

## Status O'zgarishlari

```
new → accepted → price_proposed → accepted → in_progress → completed
  ↓       ↓           ↓
cancelled cancelled  cancelled
```

| Status | Tavsif |
|--------|--------|
| `new` | Yangi buyurtma yaratildi |
| `accepted` | Usta qabul qildi |
| `price_proposed` | Usta narx taklif qildi (mijoz kutmoqda) |
| `accepted` | Mijoz narxni tasdiqladi |
| `in_progress` | Ish jarayonda |
| `completed` | Ish tugallandi |
| `cancelled` | Bekor qilindi |

---

## Master App uchun Qo'shimcha Eslatmalar

### 1. Narx taklif qilish tugmasi

Usta buyurtmani qabul qilgandan keyin (`status: 'accepted'`), ishni ko'rgach narx taklif qilishi kerak:

```javascript
// MasterOrderDetailScreen.js
{order.status === 'accepted' && (
  <TouchableOpacity
    style={styles.proposeButton}
    onPress={() => setShowPriceModal(true)}
  >
    <Ionicons name="pricetag-outline" size={20} color="#fff" />
    <Text style={styles.proposeButtonText}>Narx taklif qilish</Text>
  </TouchableOpacity>
)}
```

### 2. Real-time yangilanish

Mijoz narxni tasdiqlasa, ustaga notification yuborish:

```javascript
// Real-time subscription
useEffect(() => {
  const subscription = supabase
    .channel('order-updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `master_id=eq.${masterId}`
      },
      (payload) => {
        if (payload.new.price_accepted_at && !payload.old.price_accepted_at) {
          Alert.alert(
            'Narx tasdiqlandi!',
            'Mijoz sizning narx taklifingizni qabul qildi.'
          );
        }
      }
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, [masterId]);
```

---

## UI/UX Tavsiyalar

### Mijoz uchun:
- ✅ Narx taklifi kelganda push notification
- ✅ Taklif qilingan narxni asl narx bilan solishtirish
- ✅ Ish tavsifini aniq ko'rsatish
- ✅ Tasdiqlash tugmasi katta va aniq bo'lishi kerak

### Usta uchun:
- ✅ Narx taklif qilishda ish hajmini aniq yozish majburiy
- ✅ Taxminiy muddatni ko'rsatish
- ✅ Mijoz tasdiqlasa notification olish
- ✅ Mijoz rad etsa sababi bilan notification olish

---

## Test Ssenariysi

1. Mijoz buyurtma yaratadi (base_price: 100,000)
2. Usta qabul qiladi va ishni ko'radi
3. Usta narx taklif qiladi (proposed_price: 150,000)
4. Mijoz narxni ko'radi:
   - **A-variant:** Tasdiqlaydi → total_price = 150,000, status = accepted
   - **B-variant:** Rad etadi → status = cancelled
5. Agar tasdiqlasa, ish boshlanadi (status = in_progress)

---

## Xatolar va Debugging

### Agar narx taklifi ko'rinmasa:

1. `order.status === 'price_proposed'` ekanligini tekshiring
2. `order.proposed_price` null emasligini tekshiring
3. Console.log bilan order ma'lumotlarini tekshiring

### Agar tasdiqlash ishlamasa:

1. Supabase error ni console ga chiqaring
2. User ID to'g'riligini tekshiring
3. Order ID to'g'riligini tekshiring

---

## Fayl Manzillari

- **PriceProposalModal:** `/src/components/PriceProposalModal.js`
- **PriceApprovalCard:** `/src/components/PriceApprovalCard.js`
- **Database Migration:** Yuqoridagi SQL buyruqlar

---

## Qo'shimcha Imkoniyatlar (Kelajakda)

1. **Qayta muhokama:** Mijoz boshqa narx taklif qilishi
2. **Tarix:** Narx muhokama tarixi ko'rsatish
3. **Multiple proposals:** Bir nechta variant taklif qilish
4. **Auto-accept:** Ma'lum vaqtdan keyin avtomatik tasdiqlash

---

**Oxirgi yangilanish:** 2024-12-23
**Muallif:** Claude Code Assistant
