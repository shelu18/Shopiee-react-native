import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { getAllProducts } from '../../services/productService';
import { Colors } from '../../constants/colors';
import { Product } from '../../types';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 32;
const PRODUCT_CARD_WIDTH = 180;

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const { getCartItemsCount } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const cartCount = getCartItemsCount();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const fetchedProducts = await getAllProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFirstName = () => {
    if (user?.displayName) {
      return user.displayName.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getInitial = () => {
    return getFirstName().charAt(0).toUpperCase();
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitial()}</Text>
        </View>
        <View style={styles.locationContainer}>
          <Text style={styles.locationLabel}>{getFirstName()}'s Home</Text>
          <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
        </View>
        <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/(tabs)/cart')}>
          <Ionicons name="cart-outline" size={28} color={Colors.text} />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <Text style={styles.greeting}>Hey {getFirstName()} 👋</Text>
      <Text style={styles.subtitle}>Find fresh groceries you want</Text>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search fresh groceries"
          placeholderTextColor={Colors.placeholder}
        />
        <TouchableOpacity style={styles.scanButton}>
          <Ionicons name="scan" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCarousel = () => (
    <View style={styles.carouselContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        contentContainerStyle={styles.carousel}
      >
        <View style={styles.bannerCard}>
          <Image
            source={require('../../assets/images/banner1.png')}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>New Member</Text>
            <Text style={styles.bannerDiscount}>Get 40% Off</Text>
            <TouchableOpacity style={styles.claimButton}>
              <Text style={styles.claimText}>Claim now</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.bannerCard}>
          <Image
            source={require('../../assets/images/banner1.png')}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>Fresh Veggies</Text>
            <Text style={styles.bannerDiscount}>Best Prices</Text>
            <TouchableOpacity style={styles.claimButton}>
              <Text style={styles.claimText}>Shop now</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.bannerCard}>
          <Image
            source={require('../../assets/images/banner1.png')}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>Organic Food</Text>
            <Text style={styles.bannerDiscount}>Special Offer</Text>
            <TouchableOpacity style={styles.claimButton}>
              <Text style={styles.claimText}>Explore</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>$ {item.price}</Text>
          <Text style={styles.priceUnit}>/kg</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.favoriteButton}>
        <Ionicons name="heart-outline" size={20} color={Colors.error} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={20} color={Colors.white} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderCarousel()}
        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
              <Text style={styles.viewAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item, index) => `product_${item.id}_${index}`}
            scrollEnabled={false}
            contentContainerStyle={styles.productList}
          />
        </View>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: Colors.white,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF9447',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  locationContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  locationLabel: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    marginRight: 4,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    right: 4,
    top: 4,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    height: '100%',
  },
  scanButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  carouselContainer: {
    marginTop: 20,
    marginBottom: 24,
  },
  carousel: {
    paddingHorizontal: 16,
  },
  bannerCard: {
    width: BANNER_WIDTH,
    height: 160,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    padding: 20,
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 4,
  },
  bannerDiscount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 12,
  },
  claimButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#34C759',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  claimText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  productsSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  viewAll: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
  },
  productList: {
    paddingHorizontal: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
    padding: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    position: 'relative',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: Colors.cardBackground,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
  },
  priceUnit: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addButton: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: '#34C759',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  signOutButton: {
    marginHorizontal: 16,
    marginVertical: 20,
    paddingVertical: 14,
    backgroundColor: Colors.error,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
