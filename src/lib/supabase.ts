import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

const supabaseUrl = 'https://voeqfbharklewwjezadv.supabase.co';
const supabasePublishableKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvZXFmYmhhcmtsZXd3amV6YWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3Nzc2NDQsImV4cCI6MjEwNDM1MzY0NH0.SlmN0ZrTD0fahodhY9Ic64NJmAIPxsU3VBXdXf7u2cs';

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

if (Platform.OS !== 'web') {
  AppState.addEventListener('change', state => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
