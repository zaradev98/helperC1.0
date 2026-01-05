import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { OrdersProvider } from './src/contexts/OrdersContext';
import { ChatProvider } from './src/contexts/ChatContext';
import AppNavigator from './src/navigation/AppNavigator';
import { KeyboardProvider } from 'react-native-keyboard-controller';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />

      <AuthProvider>
        <LanguageProvider>
          <OrdersProvider>
            <ChatProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                  <AppNavigator />
              </GestureHandlerRootView>
            </ChatProvider>
          </OrdersProvider>
        </LanguageProvider>
      </AuthProvider>
    </SafeAreaProvider >
  );
}
