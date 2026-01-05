import { supabase } from '../lib/supabase';

/**
 * Rasmni Supabase Storage ga yuklash
 * @param {string} uri - Rasm URI (file:// yoki http://)
 * @param {string} bucket - Bucket nomi (masalan: 'avatars')
 * @param {string} folder - Papka nomi (masalan: 'users')
 * @param {string} filePrefix - Fayl nomi prefixi (masalan: 'user_123') - eski fayllarni o'chirish uchun
 * @returns {Promise<{url: string, path: string, error: null} | {url: null, path: null, error: Error}>}
 */
export const uploadImage = async (uri, bucket = 'avatars', folder = 'users', filePrefix = null) => {
  try {
    console.log('📤 Uploading image:', uri);

    // 1. File extension olish
    const ext = uri.split('.').pop().toLowerCase();

    // 2. File nomi yaratish (agar prefix berilgan bo'lsa, ishlatamiz)
    const fileName = filePrefix
      ? `${folder}/${filePrefix}.${ext}`
      : `${folder}/${Date.now()}.${ext}`;

    // 3. Content type aniqlash
    const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';

    // 4. Agar prefix berilgan bo'lsa, eski fayllarni o'chirish
    if (filePrefix) {
      console.log('🔍 Checking for old files with prefix:', filePrefix);

      const { data: oldFiles } = await supabase.storage
        .from(bucket)
        .list(folder, {
          search: filePrefix
        });

      if (oldFiles && oldFiles.length > 0) {
        console.log('🗑️ Found', oldFiles.length, 'old file(s), deleting...');

        const oldFilePaths = oldFiles.map(file => `${folder}/${file.name}`);
        const { error: deleteError } = await supabase.storage
          .from(bucket)
          .remove(oldFilePaths);

        if (deleteError) {
          console.warn('⚠️ Could not delete old files:', deleteError.message);
        } else {
          console.log('✅ Old files deleted');
        }
      }
    }

    // 5. File ni arrayBuffer sifatida o'qish (React Native da blob yo'q)
    const response = await fetch(uri);
    const arrayBuffer = await response.arrayBuffer();

    console.log('📦 File size:', arrayBuffer.byteLength, 'bytes');

    // 6. Supabase Storage ga yuklash
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, arrayBuffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      console.error('❌ Upload error:', error);
      return { url: null, path: null, error };
    }

    console.log('✅ Upload successful, path:', data.path);

    // 5. Public URL olish (upload qaytargan path ishlatiladi)
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    const publicUrl = urlData?.publicUrl;

    if (!publicUrl) {
      console.error('❌ Failed to get public URL');
      return { url: null, path: data.path, error: new Error('Public URL olishda xatolik') };
    }

    console.log('🔗 Public URL:', publicUrl);

    return {
      url: publicUrl,
      path: data.path,
      error: null,
    };
  } catch (error) {
    console.error('❌ Upload exception:', error);
    return { url: null, path: null, error };
  }
};

/**
 * Rasmni o'chirish
 * @param {string} path - Rasm path (masalan: 'users/1234567890.jpg')
 * @param {string} bucket - Bucket nomi
 * @returns {Promise<{success: boolean, error: null} | {success: false, error: Error}>}
 */
export const deleteImage = async (path, bucket = 'avatars') => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('❌ Delete error:', error);
      return { success: false, error };
    }

    console.log('✅ Delete successful:', path);
    return { success: true, error: null };
  } catch (error) {
    console.error('❌ Delete exception:', error);
    return { success: false, error };
  }
};

/**
 * Eski rasmni yangi rasm bilan almashtirish
 * @param {string} newUri - Yangi rasm URI (yuklanadi)
 * @param {string} bucket - Bucket nomi
 * @param {string} folder - Papka nomi
 * @param {string} filePrefix - Fayl prefixi (eski fayllarni avtomatik o'chirish uchun)
 */
export const replaceImage = async (newUri, bucket = 'avatars', folder = 'users', filePrefix = null) => {
  try {
    // Yangi rasmni yuklash (avtomatik eski fayllarni o'chiradi agar prefix berilgan bo'lsa)
    const uploadResult = await uploadImage(newUri, bucket, folder, filePrefix);
    return uploadResult;
  } catch (error) {
    console.error('❌ Replace exception:', error);
    return { url: null, path: null, error };
  }
};

/**
 * Image picker dan rasm tanlash (React Native)
 * @returns {Promise<string | null>} - Tanlangan rasm URI
 */
export const pickImage = async () => {
  try {
    // Image picker import qilish kerak
    // import * as ImagePicker from 'expo-image-picker';

    const { default: ImagePicker } = await import('expo-image-picker');

    // Permission so'rash
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      console.log('❌ Permission denied');
      return null;
    }

    // Rasm tanlash
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    console.error('❌ Pick image error:', error);
    return null;
  }
};

/**
 * Kameradan rasm olish
 * @returns {Promise<string | null>} - Olingan rasm URI
 */
export const takePhoto = async () => {
  try {
    const { default: ImagePicker } = await import('expo-image-picker');

    // Permission so'rash
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      console.log('❌ Camera permission denied');
      return null;
    }

    // Rasm olish
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    console.error('❌ Take photo error:', error);
    return null;
  }
};
