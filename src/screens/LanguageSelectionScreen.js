import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import colors from '../utils/colors';

const languages = [
  {
    id: 'uz-latin',
    name: 'O\'zbek (Lotin)',
    nativeName: 'O\'zbek tili',
    flag: '🇺🇿',
  },
  {
    id: 'uz-cyrillic',
    name: 'O\'zbek (Kirill)',
    nativeName: 'Ўзбек тили',
    flag: '🇺🇿',
  },
  {
    id: 'ru',
    name: 'Русский',
    nativeName: 'Русский язык',
    flag: '🇷🇺',
  },
];

const LanguageSelectionScreen = ({ navigation }) => {
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  const handleSelectLanguage = (languageId) => {
    setSelectedLanguage(languageId);
  };

  const handleSave = async () => {
    await changeLanguage(selectedLanguage);

    // Show success message based on selected language
    const successMessages = {
      'uz-latin': 'Til muvaffaqiyatli o\'zgartirildi',
      'uz-cyrillic': 'Тил муваффақиятли ўзгартирилди',
      'ru': 'Язык успешно изменен',
    };

    Alert.alert(
      t('common.success'),
      successMessages[selectedLanguage],
      [
        {
          text: t('common.ok'),
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('languageSelection.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={colors.info} />
          <Text style={styles.infoText}>
            {t('languageSelection.infoText')}
          </Text>
        </View>

        {/* Language Options */}
        <View style={styles.languageList}>
          {languages.map((language) => {
            const isSelected = selectedLanguage === language.id;

            return (
              <TouchableOpacity
                key={language.id}
                style={[
                  styles.languageItem,
                  isSelected && styles.languageItemSelected,
                ]}
                onPress={() => handleSelectLanguage(language.id)}
                activeOpacity={0.7}
              >
                <View style={styles.languageLeft}>
                  <Text style={styles.languageFlag}>{language.flag}</Text>
                  <View style={styles.languageInfo}>
                    <Text style={[
                      styles.languageName,
                      isSelected && styles.languageNameSelected,
                    ]}>
                      {language.name}
                    </Text>
                    <Text style={styles.languageNative}>{language.nativeName}</Text>
                  </View>
                </View>
                <View style={[
                  styles.radioButton,
                  isSelected && styles.radioButtonSelected,
                ]}>
                  {isSelected && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Additional Info */}
        <View style={styles.additionalInfo}>
          <Ionicons name="globe-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.additionalInfoText}>
            {t('languageSelection.saveInfo')}
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer with Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color={colors.white} />
          <Text style={styles.saveButtonText}>{t('common.save')}</Text>
        </TouchableOpacity>
      </View>
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.info + '10',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  languageList: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  languageItemSelected: {
    backgroundColor: colors.secondary + '08',
  },
  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 32,
    marginRight: 16,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  languageNameSelected: {
    color: colors.secondary,
  },
  languageNative: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: colors.secondary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.secondary,
  },
  additionalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  additionalInfoText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.secondary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default LanguageSelectionScreen;
