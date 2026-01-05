import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, defaultLanguage } from '../locales';
import { Alert } from 'react-native';
const LanguageContext = createContext(null);

// Shared storage key across all Helper platform apps
const LANGUAGE_STORAGE_KEY = '@helper_platform_language';

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(defaultLanguage);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved language on app start
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && translations[savedLanguage]) {
        setCurrentLanguage(savedLanguage);
      }
    } catch (error) {
      Alert.alert('Error loading language:(');
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (languageCode) => {
    try {
      if (translations[languageCode]) {
        setCurrentLanguage(languageCode);
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
      }
    } catch (error) {
      Alert.alert('Error saving language:(');
    }
  };

  // Translation function with nested key support (e.g., 'common.save')
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let translation = translations[currentLanguage];

    for (const k of keys) {
      if (translation && translation[k] !== undefined) {
        translation = translation[k];
      } else {
        Alert.alert('xatolik yuz berdi\nIltimos!! keyinroq qayta urinib ko`ring');
      }
    }

    // Replace parameters in translation
    if (typeof translation === 'string' && Object.keys(params).length > 0) {
      return translation.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : match;
      });
    }

    return translation;
  };

  // Get language name for display
  const getLanguageName = (languageCode) => {
    const languageMap = {
      'uz-latin': 'O\'zbek (Lotin)',
      'uz-cyrillic': 'O\'zbek (Kirill)',
      'ru': 'Русский',
    };
    return languageMap[languageCode] || languageCode;
  };

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      currentLanguage,
      changeLanguage,
      t,
      isLoading,
      getLanguageName,
    }),
    [currentLanguage, isLoading]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
