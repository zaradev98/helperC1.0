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

const TermsScreen = ({ navigation }) => {
  const { t, currentLanguage } = useLanguage();

  // Content based on language
  const getContent = () => {
    if (currentLanguage === 'ru') {
      return {
        intro: {
          title: '1. Введение',
          text: 'Используя приложение Helper, вы соглашаетесь со следующими условиями. Пожалуйста, внимательно прочитайте эти условия перед использованием приложения.'
        },
        services: {
          title: '2. Услуги',
          text: 'Через приложение Helper вы можете найти различных специалистов (мастеров) и связаться с ними. Приложение выступает в роли посредника и не несет полной ответственности за качество услуг.',
          bullets: [
            'Все специалисты проверены и подтверждены',
            'Качество услуг и цены устанавливаются мастерами',
            'Действуют условия отмены заказов'
          ]
        },
        responsibilities: {
          title: '3. Обязанности пользователя',
          text: 'При использовании приложения вы обязаны:',
          bullets: [
            'Предоставлять правильную и точную информацию',
            'Уважительно относиться к мастерам',
            'Своевременно производить оплату',
            'Уважать права других пользователей'
          ]
        },
        payments: {
          title: '4. Платежи',
          text: 'Все платежи осуществляются безопасно через приложение. Способы оплаты: банковские карты, электронные кошельки (Payme, Click) и наличные.',
          bullets: [
            'Приложение не взимает комиссию за платежи',
            'Данные карты хранятся в зашифрованном виде',
            'Возвраты обрабатываются в течение 3-5 рабочих дней'
          ]
        },
        cancellations: {
          title: '5. Политика отмены',
          text: 'Отмена заказов осуществляется в соответствии со следующими условиями:',
          bullets: [
            'Отмена за 24 часа - полный возврат',
            'Отмена за 12 часов - возврат 50%',
            'Отмена менее чем за 12 часов - возврат не осуществляется'
          ]
        },
        privacy: {
          title: '6. Конфиденциальность',
          text: 'Ваши персональные данные защищены в соответствии с нашей политикой конфиденциальности. Для получения подробной информации см. раздел Политика конфиденциальности.'
        },
        liability: {
          title: '7. Ответственность',
          text: 'Приложение Helper - это платформа, работающая в качестве посредника. Мы не несем полной ответственности за качество услуг, предоставляемых специалистами. При этом мы проверяем всех мастеров и серьезно рассматриваем жалобы клиентов.'
        },
        changes: {
          title: '8. Изменения',
          text: 'Мы оставляем за собой право изменять эти условия в любое время. Изменения будут объявлены в приложении, и пользователи будут уведомлены.'
        },
        contact: {
          title: '9. Контакты',
          text: 'Если у вас есть вопросы, свяжитесь с нами:'
        },
        acceptance: 'Используя приложение Helper, вы полностью соглашаетесь с этими условиями.'
      };
    } else if (currentLanguage === 'uz-cyrillic') {
      return {
        intro: {
          title: '1. Кириш',
          text: 'Helper илова орқали фойдаланиш орқали сиз қуйидаги шартларга розилик билдирасиз. Илтимос, иловадан фойдаланишдан олдин ушбу шартларни диққат билан ўқиб чиқинг.'
        },
        services: {
          title: '2. Хизматлар',
          text: 'Helper илова орқали сиз турли хил хизмат кўрсатувчи мутахассисларни (усталарни) топишингиз ва улар билан боғланишингиз мумкин. Илова воситачи ролини ўйнайди ва хизматлар сифатига тўлиқ жавобгар эмас.',
          bullets: [
            'Барча хизмат кўрсатувчилар текширилади ва тасдиқланган',
            'Хизмат сифати ва нархлар усталар томонидан белгиланади',
            'Буюртмаларни бекор қилиш шартлари амал қилади'
          ]
        },
        responsibilities: {
          title: '3. Фойдаланувчи мажбуриятлари',
          text: 'Иловадан фойдаланишда сиз қуйидагиларга мажбурсиз:',
          bullets: [
            'Тўғри ва аниқ маълумотлар бериш',
            'Усталар билан ҳурматли муносабатда бўлиш',
            'Тўловларни ўз вақтида амалга ошириш',
            'Бошқа фойдаланувчиларнинг ҳуқуқларини ҳурмат қилиш'
          ]
        },
        payments: {
          title: '4. Тўловлар',
          text: 'Барча тўловлар илова орқали хавфсиз тарзда амалга оширилади. Тўлов усуллари: банк карталари, электрон ҳамёнлар (Payme, Click) ва нақд пул.',
          bullets: [
            'Илова тўловлар учун комиссия олмайди',
            'Карта маълумотлари шифрланган ҳолда сақланади',
            'Қайтарилган тўловлар 3-5 иш кунида қайтарилади'
          ]
        },
        cancellations: {
          title: '5. Бекор қилиш сиёсати',
          text: 'Буюртмаларни бекор қилиш қуйидаги шартларга биноан амалга оширилади:',
          bullets: [
            '24 соатдан олдин бекор қилиш - тўлиқ қайтарилади',
            '12 соатдан олдин бекор қилиш - 50% қайтарилади',
            '12 соатдан кейин бекор қилиш - қайтарилмайди'
          ]
        },
        privacy: {
          title: '6. Махфийлик',
          text: 'Сизнинг шахсий маълумотларингиз махфийлик сиёсатимизга мувофиқ ҳимояланади. Батафсил маълумот учун Махфийлик сиёсати бўлимини кўринг.'
        },
        liability: {
          title: '7. Жавобгарлик',
          text: 'Helper илова воситачи сифатида ишлайдиган платформадир. Биз хизмат кўрсатувчилар томонидан кўрсатиладиган хизматлар сифати учун тўлиқ жавобгар эмасмиз. Шу билан бирга, биз барча усталарни текширамиз ва мижозлар шикоятларини жиддий кўриб чиқамиз.'
        },
        changes: {
          title: '8. Ўзгаришлар',
          text: 'Биз ушбу шартларни исталган вақтда ўзгартириш ҳуқуқини сақлаб қоламиз. Ўзгаришлар иловада эълон қилинади ва фойдаланувчилар билдиришнома орқали хабардор қилинади.'
        },
        contact: {
          title: '9. Алоқа',
          text: 'Саволларингиз бўлса, биз билан боғланинг:'
        },
        acceptance: 'Helper иловасидан фойдаланиш орқали сиз ушбу шартларга тўлиқ розилик билдирасиз.'
      };
    } else {
      // uz-latin (default)
      return {
        intro: {
          title: '1. Kirish',
          text: 'Helper ilovasidan foydalanish orqali siz quyidagi shartlarga rozilik bildirasiz. Iltimos, ilovadan foydalanishdan oldin ushbu shartlarni diqqat bilan o\'qib chiqing.'
        },
        services: {
          title: '2. Xizmatlar',
          text: 'Helper ilova orqali siz turli xil xizmat ko\'rsatuvchi mutaxassislarni (ustalarni) topishingiz va ular bilan bog\'lanishingiz mumkin. Ilova vositachi rolini o\'ynaydi va xizmatlar sifatiga to\'liq javobgar emas.',
          bullets: [
            'Barcha xizmat ko\'rsatuvchilar tekshiriladi va tasdiqlangan',
            'Xizmat sifati va narxlar ustalar tomonidan belgilanadi',
            'Buyurtmalarni bekor qilish shartlari amal qiladi'
          ]
        },
        responsibilities: {
          title: '3. Foydalanuvchi majburiyatlari',
          text: 'Ilovadan foydalanishda siz quyidagilarga majbursiz:',
          bullets: [
            'To\'g\'ri va aniq ma\'lumotlar berish',
            'Ustalar bilan hurmatli munosabatda bo\'lish',
            'To\'lovlarni o\'z vaqtida amalga oshirish',
            'Boshqa foydalanuvchilarning huquqlarini hurmat qilish'
          ]
        },
        payments: {
          title: '4. To\'lovlar',
          text: 'Barcha to\'lovlar ilova orqali xavfsiz tarzda amalga oshiriladi. To\'lov usullari: bank kartalari, elektron hamyonlar (Payme, Click) va naqd pul.',
          bullets: [
            'Ilova to\'lovlar uchun komissiya olmaydi',
            'Karta ma\'lumotlari shifrlangan holda saqlanadi',
            'Qaytarilgan to\'lovlar 3-5 ish kunida qaytariladi'
          ]
        },
        cancellations: {
          title: '5. Bekor qilish siyosati',
          text: 'Buyurtmalarni bekor qilish quyidagi shartlarga binoan amalga oshiriladi:',
          bullets: [
            '24 soatdan oldin bekor qilish - to\'liq qaytariladi',
            '12 soatdan oldin bekor qilish - 50% qaytariladi',
            '12 soatdan keyin bekor qilish - qaytarilmaydi'
          ]
        },
        privacy: {
          title: '6. Maxfiylik',
          text: 'Sizning shaxsiy ma\'lumotlaringiz maxfiylik siyosatimizga muvofiq himoyalanadi. Batafsil ma\'lumot uchun Maxfiylik siyosati bo\'limini ko\'ring.'
        },
        liability: {
          title: '7. Javobgarlik',
          text: 'Helper ilova vositachi sifatida ishlaydigan platformadir. Biz xizmat ko\'rsatuvchilar tomonidan ko\'rsatiladigan xizmatlar sifati uchun to\'liq javobgar emasmiz. Shu bilan birga, biz barcha ustalarni tekshiramiz va mijozlar shikoyatlarini jiddiy ko\'rib chiqamiz.'
        },
        changes: {
          title: '8. O\'zgarishlar',
          text: 'Biz ushbu shartlarni istalgan vaqtda o\'zgartirish huquqini saqlab qolamiz. O\'zgarishlar ilovada e\'lon qilinadi va foydalanuvchilar bildirishnoma orqali xabardor qilinadi.'
        },
        contact: {
          title: '9. Aloqa',
          text: 'Savollaringiz bo\'lsa, biz bilan bog\'laning:'
        },
        acceptance: 'Helper ilovasidan foydalanish orqali siz ushbu shartlarga to\'liq rozilik bildirasiz.'
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
        <Text style={styles.headerTitle}>{t('terms.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Last Updated */}
        <View style={styles.updateInfo}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.updateText}>{t('terms.lastUpdated')}: 01.12.2024</Text>
        </View>

        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.intro.title}</Text>
          <Text style={styles.paragraph}>{content.intro.text}</Text>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.services.title}</Text>
          <Text style={styles.paragraph}>{content.services.text}</Text>
          {content.services.bullets.map((bullet, index) => (
            <View key={index} style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{bullet}</Text>
            </View>
          ))}
        </View>

        {/* User Responsibilities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.responsibilities.title}</Text>
          <Text style={styles.paragraph}>{content.responsibilities.text}</Text>
          {content.responsibilities.bullets.map((bullet, index) => (
            <View key={index} style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{bullet}</Text>
            </View>
          ))}
        </View>

        {/* Payments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.payments.title}</Text>
          <Text style={styles.paragraph}>{content.payments.text}</Text>
          {content.payments.bullets.map((bullet, index) => (
            <View key={index} style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{bullet}</Text>
            </View>
          ))}
        </View>

        {/* Cancellations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.cancellations.title}</Text>
          <Text style={styles.paragraph}>{content.cancellations.text}</Text>
          {content.cancellations.bullets.map((bullet, index) => (
            <View key={index} style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{bullet}</Text>
            </View>
          ))}
        </View>

        {/* Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.privacy.title}</Text>
          <Text style={styles.paragraph}>{content.privacy.text}</Text>
        </View>

        {/* Liability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.liability.title}</Text>
          <Text style={styles.paragraph}>{content.liability.text}</Text>
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
              <Text style={styles.contactText}>support@helper.uz</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={18} color={colors.primary} />
              <Text style={styles.contactText}>+998 71 123 45 67</Text>
            </View>
          </View>
        </View>

        {/* Acceptance */}
        <View style={styles.acceptanceCard}>
          <Ionicons name="checkmark-circle" size={24} color={colors.secondary} />
          <Text style={styles.acceptanceText}>{content.acceptance}</Text>
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
  acceptanceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.secondary + '10',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  acceptanceText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
});

export default TermsScreen;
