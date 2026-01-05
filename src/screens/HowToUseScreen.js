import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../utils/colors';

const GuideSection = ({ icon, title, description, steps, isExpanded, onToggle }) => {
  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.sectionHeaderLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={24} color={colors.secondary} />
          </View>
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionDescription}>{description}</Text>
          </View>
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.sectionContent}>
          {steps.map((step, index) => (
            <View key={index} style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const HowToUseScreen = ({ navigation }) => {
  const [expandedSection, setExpandedSection] = useState(null);

  const guides = [
    {
      id: 'search-master',
      icon: 'search-outline',
      title: 'Ustani qanday topish mumkin?',
      description: 'Kerakli ustani tez va oson topish',
      steps: [
        {
          title: 'Bosh sahifaga kiring',
          description: 'Bosh sahifada barcha xizmat turlari ro\'yxati ko\'rsatiladi.',
        },
        {
          title: 'Xizmat turini tanlang',
          description: 'Kerakli xizmat turini tanlang (masalan: Santexnik, Elektrik, va h.k.).',
        },
        {
          title: 'Ustalarni ko\'ring',
          description: 'Tanlangan xizmat turi bo\'yicha ustalar ro\'yxati ko\'rsatiladi.',
        },
        {
          title: 'Ustani tanlang',
          description: 'Reytingi, bahosi va sharhlarga qarab kerakli ustani tanlang.',
        },
      ],
    },
    {
      id: 'create-booking',
      icon: 'calendar-outline',
      title: 'Buyurtma qanday berish mumkin?',
      description: 'Yangi buyurtma yaratish jarayoni',
      steps: [
        {
          title: 'Ustani tanlang',
          description: 'Ustalar ro\'yxatidan kerakli ustani tanlang va profliga o\'ting.',
        },
        {
          title: 'Buyurtma berish tugmasini bosing',
          description: '"Buyurtma berish" yoki "Bog\'lanish" tugmasini bosing.',
        },
        {
          title: 'Ma\'lumotlarni kiriting',
          description: 'Xizmat turi, sana, vaqt va manzilni kiriting.',
        },
        {
          title: 'Izoh qo\'shing',
          description: 'Qo\'shimcha izoh yoki talab bo\'lsa yozing.',
        },
        {
          title: 'Tasdiqlang',
          description: 'Barcha ma\'lumotlarni tekshiring va buyurtmani tasdiqlang.',
        },
      ],
    },
    {
      id: 'payment',
      icon: 'card-outline',
      title: 'To\'lovni qanday amalga oshirish mumkin?',
      description: 'Xizmat uchun to\'lov qilish',
      steps: [
        {
          title: 'Xizmat bajarilgandan so\'ng',
          description: 'Usta xizmatni tugatgach, to\'lov qilish taklifi keladi.',
        },
        {
          title: 'To\'lov usulini tanlang',
          description: 'Naqd pul, bank kartasi, Payme yoki Click orqali to\'lash mumkin.',
        },
        {
          title: 'To\'lovni amalga oshiring',
          description: 'Tanlangan usul bo\'yicha to\'lovni bajaring.',
        },
        {
          title: 'Chekni oling',
          description: 'To\'lov muvaffaqiyatli bo\'lsa, elektron chek olasiz.',
        },
      ],
    },
    {
      id: 'chat',
      icon: 'chatbubble-outline',
      title: 'Usta bilan qanday muloqot qilish mumkin?',
      description: 'Chat orqali xabar almashuv',
      steps: [
        {
          title: 'Buyurtma yarating',
          description: 'Avval usta bilan buyurtma yaratish kerak.',
        },
        {
          title: 'Chatga o\'ting',
          description: 'Buyurtma tafsilotlaridan "Chat" tugmasini bosing.',
        },
        {
          title: 'Xabar yuboring',
          description: 'Matn, ovozli xabar yoki rasm yuborishingiz mumkin.',
        },
        {
          title: 'Javob kuting',
          description: 'Usta sizga javob berganida bildirishnoma olasiz.',
        },
      ],
    },
    {
      id: 'rating',
      icon: 'star-outline',
      title: 'Xizmatni qanday baholash mumkin?',
      description: 'Usta va xizmat sifatini baholash',
      steps: [
        {
          title: 'Xizmat tugashi',
          description: 'Buyurtma yakunlangach, baholash taklifi keladi.',
        },
        {
          title: 'Yulduzlar bering',
          description: '1 dan 5 gacha yulduz berib baholang.',
        },
        {
          title: 'Sharh yozing',
          description: 'Xizmat haqida batafsil fikr yozishingiz mumkin.',
        },
        {
          title: 'Yuborish',
          description: 'Bahoingizni tasdiqlang va yuboring.',
        },
      ],
    },
  ];

  const handleToggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const handleWatchVideo = () => {
    // TODO: Add video tutorial link or embed video player
    Linking.openURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Qanday ishlatiladi?</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Video Section */}
        <View style={styles.videoSection}>
          <View style={styles.videoPlaceholder}>
            <Ionicons name="play-circle" size={64} color={colors.white} />
          </View>
          <TouchableOpacity style={styles.watchVideoButton} onPress={handleWatchVideo}>
            <Ionicons name="videocam-outline" size={20} color={colors.white} />
            <Text style={styles.watchVideoText}>Video yo'riqnomani tomosha qiling</Text>
          </TouchableOpacity>
        </View>

        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <Ionicons name="information-circle" size={24} color={colors.secondary} />
          <Text style={styles.welcomeText}>
            Helper ilovasidan foydalanish bo'yicha to'liq yo'riqnoma. Har bir bo'limni bosib batafsil ma'lumot olishingiz mumkin.
          </Text>
        </View>

        {/* Guides */}
        <View style={styles.guidesContainer}>
          {guides.map((guide) => (
            <GuideSection
              key={guide.id}
              icon={guide.icon}
              title={guide.title}
              description={guide.description}
              steps={guide.steps}
              isExpanded={expandedSection === guide.id}
              onToggle={() => handleToggleSection(guide.id)}
            />
          ))}
        </View>

        {/* Help Card */}
        <View style={styles.helpCard}>
          <Ionicons name="help-circle-outline" size={24} color={colors.primary} />
          <View style={styles.helpContent}>
            <Text style={styles.helpTitle}>Yordam kerakmi?</Text>
            <Text style={styles.helpDescription}>
              Agar qo'shimcha savol yoki muammo bo'lsa, biz bilan bog'laning
            </Text>
            <TouchableOpacity style={styles.contactButton}>
              <Ionicons name="call-outline" size={18} color={colors.primary} />
              <Text style={styles.contactButtonText}>+998 71 123 45 67</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  content: {
    flex: 1,
  },
  videoSection: {
    backgroundColor: colors.white,
    padding: 16,
    marginBottom: 12,
  },
  videoPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: colors.gray800,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  watchVideoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  watchVideoText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.secondary + '10',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  welcomeText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  guidesContainer: {
    gap: 8,
  },
  section: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.white,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  helpDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.primary + '10',
    alignSelf: 'flex-start',
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default HowToUseScreen;
