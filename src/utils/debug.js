// DEBUG HELPER - EditProfileScreen-da ishlatiladigan test
// Console-da nimalari chiqayotganini tekshirish uchun

import { supabase } from '../lib/supabase';

export const testStorageURL = async (bucket = 'avatars', testPath = 'users/test-image.jpg') => {
  console.log('🔍 Storage URL Test Started');
  console.log('Bucket:', bucket);
  console.log('Test Path:', testPath);

  try {
    // Test 1: getPublicUrl bilan
    const result = supabase.storage.from(bucket).getPublicUrl(testPath);
    console.log('📊 getPublicUrl full result:', result);
    const publicUrl = result?.data?.publicUrl;

    if (publicUrl) {
      console.log('✅ Public URL:', publicUrl);

      // URL-ni HTTP HEAD bilan tekshirish
      try {
        const response = await fetch(publicUrl, { method: 'HEAD' });
        console.log('🔗 Public URL HEAD status:', response.status);
      } catch (err) {
        console.warn('⚠️ Fetch HEAD failed for publicUrl:', err.message || err);
      }
    } else {
      console.warn('❌ publicUrl undefined from getPublicUrl. Full result:', result);
    }

    // Test 2: SDK download (to check object existence and permissions)
    try {
      console.log('📥 Attempting SDK download for path:', testPath);
      const { data: downloadData, error: downloadError } = await supabase.storage
        .from(bucket)
        .download(testPath);

      if (downloadError) {
        console.warn('⚠️ SDK download error:', downloadError);
      import { supabase } from '../lib/supabase';

      /**
       * Comprehensive storage diagnostics.
       * - logs environment
       * - lists files in a path
       * - calls getPublicUrl for a path
       * - creates a signed URL
       * - attempts SDK download
       * - issues HTTP HEAD to public/signed URLs
       */
      export const diagnoseStorage = async (options = {}) => {
        const bucket = options.bucket || 'avatars';
        const listPath = options.listPath || 'users';
        const testPath = options.testPath || null; // if provided, will test this specific file

        console.log('🔍 Storage diagnose started');
        try {
          // Log basic env info (don't print keys fully)
          const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '(not set)';
          const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : '(not set)';
          console.log('  supabaseUrl:', supabaseUrl.replace(/(https?:\/\/[^\/]+\/).*/, '$1'));
          console.log('  supabaseAnonKey:', supabaseKey);

          // 1) List files under listPath
          console.log(`\n1) Listing files in bucket='${bucket}' path='${listPath}'`);
          const { data: listData, error: listError } = await supabase.storage.from(bucket).list(listPath, { limit: 100 });
          if (listError) {
            console.warn('  ⚠️ list error:', listError);
          } else {
            console.log('  ✅ list result count:', Array.isArray(listData) ? listData.length : 'unknown');
            console.log('  sample:', Array.isArray(listData) ? listData.slice(0, 10) : listData);
          }

          // Choose a path to test: provided testPath > first listed file > null
          let pathToTest = testPath;
          if (!pathToTest && Array.isArray(listData) && listData.length > 0) {
            // if listData entries are objects with name, they are filenames relative to listPath
            const first = listData[0];
            pathToTest = `${listPath}/${first.name}`;
            console.log('  chosen pathToTest from list:', pathToTest);
          }

          if (!pathToTest) {
            console.warn('  ❌ No file to test (provide testPath or ensure bucket has files)');
            return;
          }

          // 2) getPublicUrl
          console.log(`\n2) getPublicUrl for: ${pathToTest}`);
          const getResult = supabase.storage.from(bucket).getPublicUrl(pathToTest);
          console.log('  getPublicUrl result:', getResult);
          const publicUrl = getResult?.data?.publicUrl;

          if (publicUrl) {
            console.log('  ✅ publicUrl:', publicUrl);
            try {
              const head = await fetch(publicUrl, { method: 'HEAD' });
              console.log('  HEAD status for publicUrl:', head.status);
            } catch (err) {
              console.warn('  ⚠️ fetch HEAD publicUrl failed:', err.message || err);
            }
          } else {
            console.warn('  ❌ publicUrl undefined');
          }

          // 3) createSignedUrl (temporary URL)
          console.log(`\n3) createSignedUrl for: ${pathToTest}`);
          try {
            const { data: signedData, error: signedError } = await supabase.storage.from(bucket).createSignedUrl(pathToTest, 60);
            if (signedError) {
              console.warn('  ⚠️ createSignedUrl error:', signedError);
            } else {
              console.log('  ✅ signed url:', signedData?.signedUrl);
              try {
                const head2 = await fetch(signedData.signedUrl, { method: 'HEAD' });
                console.log('  HEAD status for signedUrl:', head2.status);
              } catch (err) {
                console.warn('  ⚠️ fetch HEAD signedUrl failed:', err.message || err);
              }
            }
          } catch (err) {
            console.error('  ❌ createSignedUrl exception:', err.message || err);
          }

          // 4) SDK download
          console.log(`\n4) SDK download for: ${pathToTest}`);
          try {
            const { data: downloadData, error: downloadError } = await supabase.storage.from(bucket).download(pathToTest);
            if (downloadError) {
              console.warn('  ⚠️ SDK download error:', downloadError);
            } else if (downloadData) {
              console.log('  ✅ SDK download blob size (if available):', downloadData?.size || 'unknown');
            }
          } catch (err) {
            console.error('  ❌ SDK download exception:', err.message || err);
          }

          console.log('\n🔚 Diagnose finished');
        } catch (err) {
          console.error('❌ Diagnose failed:', err.message || err);
        }
      };
