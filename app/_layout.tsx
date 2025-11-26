import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '../store';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { FavoritesProvider } from '../contexts/FavoritesContext';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </Provider>
  );
}
