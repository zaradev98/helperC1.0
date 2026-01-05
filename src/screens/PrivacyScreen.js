import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../utils/colors';
import { useLanguage } from '../contexts/LanguageContext';

const PrivacyScreen = ({ navigation }) => {
  const { t, currentLanguage } = useLanguage();

  // Content based on language - this is a large content structure
  const getContent = () => {
    if (currentLanguage === 'ru') {
      return {
        intro: {
          title: 'Введение',
          text: 'В приложении Helper ваша конфиденциальность важна для нас. Эта политика конфиденциальности подробно описывает, какие данные мы собираем, как мы их используем и как защищаем.'
        },
        collection: {
          title: '1. Собираемые данные',
          text: 'Мы собираем следующие персональные данные:',
          personal: {
            title: 'Персональные данные:',
            items: ['Имя и фамилия', 'Номер телефона', 'Email адрес', 'Адрес (для оказания услуг)']
          },
          payment: {
            title: 'Платежные данные:',
            items: ['Данные банковской карты (в зашифрованном виде)', 'История платежей']
          },
          technical: {
            title: 'Технические данные:',
            items: ['Тип устройства и версия ОС', 'IP адрес', 'Данные об использовании приложения']
          }
        },
        usage: {
          title: '2. Использование данных',
          text: 'Собранные данные используются в следующих целях:',
          items: [
            'Предоставление услуг и обработка заказов',
            'Управление вашей учетной записью',
            'Улучшение качества обслуживания',
            'Отправка уведомлений и новостей',
            'Предоставление служб поддержки'
          ]
        },
        protection: {
          title: '3. Защита данных',
          text: 'Мы используем современные технологии для защиты ваших данных:',
          items: [
            'SSL шифрование (256-бит)',
            'Безопасные серверы и базы данных',
            'Регулярный аудит безопасности',
            'Зашифрованное хранение паролей',
            'Ограниченные права доступа'
          ]
        },
        sharing: {
          title: '4. Обмен данными',
          text: 'Мы делимся вашими данными с третьими лицами только в следующих случаях:',
          items: [
            'С поставщиками услуг (мастерами) - только необходимые данные для заказа',
            'С платежными системами - только для обработки платежей',
            'По требованию закона - только по официальным запросам'
          ]
        },
        rights: {
          title: '5. Ваши права',
          text: 'Вы имеете следующие права:',
          items: [
            'Просматривать и редактировать свои данные',
            'Удалять данные (удалить учетную запись)',
            'Отказаться от маркетинговых сообщений',
            'Получить копию данных'
          ]
        },
        cookies: {
          title: '6. Cookie и отслеживание',
          text: 'Мы используем технологии отслеживания для улучшения приложения. Вы можете отключить их в настройках, но это может ограничить некоторые функции.'
        },
        children: {
          title: '7. Конфиденциальность детей',
          text: 'Наши услуги не предназначены для пользователей младше 18 лет. Мы сознательно не собираем данные от пользователей младше 18 лет.'
        },
        changes: {
          title: '8. Изменения',
          text: 'Мы можем периодически обновлять эту политику конфиденциальности. Изменения будут объявлены в приложении, и вам будет отправлено уведомление.'
        },
        contact: {
          title: '9. Контакты',
          text: 'Если у вас есть вопросы о конфиденциальности, свяжитесь с нами:'
        },
        security: {
          title: 'Ваша конфиденциальность важна',
          text: 'Мы гарантируем защиту ваших персональных данных на самом высоком уровне и их использование только для предоставления услуг.'
        }
      };
    } else if (currentLanguage === 'uz-cyrillic') {
      return {
        intro: {
          title: 'Кириш',
          text: 'Helper иловасида сизнинг махфийлигингиз биз учун муҳим. Ушбу махфийлик сиёсати биз қандай маълумотларни тўплаймиз, улардан қандай фойдаланамиз ва қандай ҳимоялаймиз ҳақида батафсил маълумот беради.'
        },
        collection: {
          title: '1. Йиғиладиган маълумотлар',
          text: 'Биз қуйидаги шахсий маълумотларни тўплаймиз:',
          personal: {
            title: 'Шахсий маълумотлар:',
            items: ['Исм ва фамилия', 'Телефон рақами', 'Email манзил', 'Манзил (хизмат кўрсатиш учун)']
          },
          payment: {
            title: 'Тўлов маълумотлари:',
            items: ['Банк картаси маълумотлари (шифрланган)', 'Тўлов тарихи']
          },
          technical: {
            title: 'Техник маълумотлар:',
            items: ['Қурилма тури ва ОС версияси', 'ИП манзил', 'Илова фойдаланиш маълумотлари']
          }
        },
        usage: {
          title: '2. Маълумотлардан фойдаланиш',
          text: 'Тўпланган маълумотлардан қуйидаги мақсадларда фойдаланамиз:',
          items: [
            'Хизматларни таъдим этиш ва буюртмаларни қайта ишлаш',
            'Сизнинг ҳисобингизни бошқариш',
            'Хизмат сифатини яхшилаш',
            'Билдиришномалар ва янгиликлар юбориш',
            'Қўллаб-қувватлаш хизматлари кўрсатиш'
          ]
        },
        protection: {
          title: '3. Маълумотлар ҳимояси',
          text: 'Биз сизнинг маълумотларингизни ҳимоя қилиш учун замонавий технологиялардан фойдаланамиз:',
          items: [
            'SSL шифрлаш (256-бит)',
            'Хавфсиз серверлар ва маълумотлар базалари',
            'Мунтазам хавфсизлик аудити',
            'Паролларнинг шифрланган сақланиши',
            'Чекланган кириш ҳуқуқлари'
          ]
        },
        sharing: {
          title: '4. Маълумотларни улашиш',
          text: 'Биз сизнинг маълумотларингизни учинчи шахслар билан фақат қуйидаги ҳолларда улашамиз:',
          items: [
            'Хизмат кўрсатувчилар (усталар) билан - фақат буюртма учун зарур маълумотлар',
            'Тўлов тизимларига - фақат тўловни қайта ишлаш учун',
            'Қонун талаблари бўйича - фақат расмий сўровлар бўйича'
          ]
        },
        rights: {
          title: '5. Сизнинг ҳуқуқларингиз',
          text: 'Сиз қуйидаги ҳуқуқларга эгасиз:',
          items: [
            'Ўз маълумотларингизни кўриш ва таҳрирлаш',
            'Маълумотларни ўчириш (ҳисобни ўчириш)',
            'Маркетинг хабарларидан воз кечиш',
            'Маълумотлар нусхасини олиш'
          ]
        },
        cookies: {
          title: '6. Cookie ва кузатув',
          text: 'Биз иловани яхшилаш учун кузатув технологияларидан фойдаланамиз. Сиз созламаларда уларни ўчириб қўйишингиз мумкин, лекин бу баъзи функцияларни чеклаши мумкин.'
        },
        children: {
          title: '7. Болалар махфийлиги',
          text: 'Бизнинг хизматларимиз 18 ёшдан кичик фойдаланувчилар учун мўлжалланмаган. Биз онгли равишда 18 ёшдан кичик фойдаланувчилардан маълумот тўплама����миз.'
        },
        changes: {
          title: '8. Ўзгаришлар',
          text: 'Биз вақти-вақти билан ушбу махфийлик сиёсатини янгилашимиз мумкин. Ўзгаришлар иловада эълон қилинади ва сизга билдиришнома юборилади.'
        },
        contact: {
          title: '9. Боғланиш',
          text: 'Махфийлик ҳақида саволларингиз бўлса, биз билан боғланинг:'
        },
        security: {
          title: 'Сизнинг махфийлигингиз муҳим',
          text: 'Биз сизнинг шахсий маълумотларингизни энг юқори даражада ҳимоя қилишга ва улардан фақат хизмат кўрсатиш учун фойдаланишга кафолатлаймиз.'
        }
      };
    } else {
      // uz-latin (default)
      return {
        intro: {
          title: 'Kirish',
          text: 'Helper ilovasida sizning maxfiyligingiz biz uchun muhim. Ushbu maxfiylik siyosati biz qanday ma\'lumotlarni to\'playmiz, ulardan qanday foydalanamiz va qanday himoyalaymiz haqida batafsil ma\'lumot beradi.'
        },
        collection: {
          title: '1. Yig\'iladigan ma\'lumotlar',
          text: 'Biz quyidagi shaxsiy ma\'lumotlarni to\'playmiz:',
          personal: {
            title: 'Shaxsiy ma\'lumotlar:',
            items: ['Ism va familiya', 'Telefon raqami', 'Email manzil', 'Manzil (xizmat ko\'rsatish uchun)']
          },
          payment: {
            title: 'To\'lov ma\'lumotlari:',
            items: ['Bank kartasi ma\'lumotlari (shifrlangan)', 'To\'lov tarixi']
          },
          technical: {
            title: 'Texnik ma\'lumotlar:',
            items: ['Qurilma turi va OS versiyasi', 'IP manzil', 'Ilova foydalanish ma\'lumotlari']
          }
        },
        usage: {
          title: '2. Ma\'lumotlardan foydalanish',
          text: 'To\'plangan ma\'lumotlardan quyidagi maqsadlarda foydalanamiz:',
          items: [
            'Xizmatlarni taqdim etish va buyurtmalarni qayta ishlash',
            'Sizning hisobingizni boshqarish',
            'Xizmat sifatini yaxshilash',
            'Bildirishnomalar va yangiliklar yuborish',
            'Qo\'llab-quvvatlash xizmatlari ko\'rsatish'
          ]
        },
        protection: {
          title: '3. Ma\'lumotlar himoyasi',
          text: 'Biz sizning ma\'lumotlaringizni himoya qilish uchun zamonaviy texnologiyalardan foydalanamiz:',
          items: [
            'SSL shifrlash (256-bit)',
            'Xavfsiz serverlar va ma\'lumotlar bazalari',
            'Muntazam xavfsizlik auditi',
            'Parollarning shifrlangan saqlanishi',
            'Cheklangan kirish huquqlari'
          ]
        },
        sharing: {
          title: '4. Ma\'lumotlarni ulashish',
          text: 'Biz sizning ma\'lumotlaringizni uchinchi shaxslar bilan faqat quyidagi hollarda ulashamiz:',
          items: [
            'Xizmat ko\'rsatuvchilar (ustalar) bilan - faqat buyurtma uchun zarur ma\'lumotlar',
            'To\'lov tizimlariga - faqat to\'lovni qayta ishlash uchun',
            'Qonun talablari bo\'yicha - faqat rasmiy so\'rovlar bo\'yicha'
          ]
        },
        rights: {
          title: '5. Sizning huquqlaringiz',
          text: 'Siz quyidagi huquqlarga egasiz:',
          items: [
            'O\'z ma\'lumotlaringizni ko\'rish va tahrirlash',
            'Ma\'lumotlarni o\'chirish (hisobni o\'chirish)',
            'Marketing xabarlaridan voz kechish',
            'Ma\'lumotlar nusxasini olish'
          ]
        },
        cookies: {
          title: '6. Cookie va kuzatuv',
          text: 'Biz ilovani yaxshilash uchun kuzatuv texnologiyalaridan foydalanamiz. Siz sozlamalarda ularni o\'chirib qo\'yishingiz mumkin, lekin bu ba\'zi funksiyalarni cheklashi mumkin.'
        },
        children: {
          title: '7. Bolalar maxfiyligi',
          text: 'Bizning xizmatlarimiz 18 yoshdan kichik foydalanuvchilar uchun mo\'ljallanmagan. Biz ongli ravishda 18 yoshdan kichik foydalanuvchilardan ma\'lumot to\'plamaymiz.'
        },
        changes: {
          title: '8. O\'zgarishlar',
          text: 'Biz vaqti-vaqti bilan ushbu maxfiylik siyosatini yangilashimiz mumkin. O\'zgarishlar ilovada e\'lon qilinadi va sizga bildirishnoma yuboriladi.'
        },
        contact: {
          title: '9. Bog\'lanish',
          text: 'Maxfiylik haqida savollaringiz bo\'lsa, biz bilan bog\'laning:'
        },
        security: {
          title: 'Sizning maxfiyligingiz muhim',
          text: 'Biz sizning shaxsiy ma\'lumotlaringizni eng yuqori darajada himoya qilishga va ulardan faqat xizmat ko\'rsatish uchun foydalanishga kafolatlaymiz.'
        }
      };
    }
  };

  const content = getContent();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('privacy.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Last Updated */}
        <View style={styles.updateInfo}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.updateText}>{t('privacy.lastUpdated')}: 01.12.2024</Text>
        </View>

        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.intro.title}</Text>
          <Text style={styles.paragraph}>{content.intro.text}</Text>
        </View>

        {/* Information Collection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.collection.title}</Text>
          <Text style={styles.paragraph}>{content.collection.text}</Text>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>{content.collection.personal.title}</Text>
            {content.collection.personal.items.map((item, index) => (
              <View key={index} style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>{content.collection.payment.title}</Text>
            {content.collection.payment.items.map((item, index) => (
              <View key={index} style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>{content.collection.technical.title}</Text>
            {content.collection.technical.items.map((item, index) => (
              <View key={index} style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Information Usage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.usage.title}</Text>
          <Text style={styles.paragraph}>{content.usage.text}</Text>
          {content.usage.items.map((item, index) => (
            <View key={index} style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Data Protection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.protection.title}</Text>
          <Text style={styles.paragraph}>{content.protection.text}</Text>
          {content.protection.items.map((item, index) => (
            <View key={index} style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Data Sharing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.sharing.title}</Text>
          <Text style={styles.paragraph}>{content.sharing.text}</Text>
          {content.sharing.items.map((item, index) => (
            <View key={index} style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* User Rights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.rights.title}</Text>
          <Text style={styles.paragraph}>{content.rights.text}</Text>
          {content.rights.items.map((item, index) => (
            <View key={index} style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Cookies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.cookies.title}</Text>
          <Text style={styles.paragraph}>{content.cookies.text}</Text>
        </View>

        {/* Children Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.children.title}</Text>
          <Text style={styles.paragraph}>{content.children.text}</Text>
        </View>

        {/* Changes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.changes.title}</Text>
          <Text style={styles.paragraph}>{content.changes.text}</Text>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.contact.title}</Text>
          <Text style={styles.paragraph}>{content.contact.text}</Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={18} color={colors.primary} />
              <Text style={styles.contactText}>privacy@helper.uz</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={18} color={colors.primary} />
              <Text style={styles.contactText}>+998 71 123 45 67</Text>
            </View>
          </View>
        </View>

        {/* Security Card */}
        <View style={styles.securityCard}>
          <Ionicons name="shield-checkmark" size={32} color={colors.secondary} />
          <View style={styles.securityContent}>
            <Text style={styles.securityTitle}>{content.security.title}</Text>
            <Text style={styles.securityText}>{content.security.text}</Text>
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
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  updateText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  section: {
    backgroundColor: colors.white,
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 24,
    marginBottom: 12,
  },
  subsection: {
    marginTop: 12,
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 15,
    color: colors.secondary,
    marginRight: 8,
    fontWeight: '700',
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  contactInfo: {
    marginTop: 12,
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
  },
  contactText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.primary,
  },
  securityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    backgroundColor: colors.secondary + '10',
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.secondary + '30',
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  securityText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
});

export default PrivacyScreen;
