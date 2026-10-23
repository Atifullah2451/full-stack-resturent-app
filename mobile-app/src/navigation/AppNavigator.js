import React from 'react';
import { Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { colors, fontSizes, fonts } from '../theme/theme';

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';

// Main Screens
import { HomeScreen } from '../screens/main/HomeScreen';
import { SearchScreen } from '../screens/main/SearchScreen';
import { CartScreen } from '../screens/main/CartScreen';
import { BookingsScreen } from '../screens/main/BookingsScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { ItemDetailScreen } from '../screens/main/ItemDetailScreen';
import { OrderHistoryScreen } from '../screens/main/OrderHistoryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tabs Navigator
function MainTabNavigator() {
  const { totalItemCount } = useCart();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTitleStyle: {
          color: colors.text,
          fontSize: fontSizes.bodyLarge,
          fontFamily: fonts.serif,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          width: '100%',
          maxWidth: 480,
          alignSelf: 'center',
        },
        tabBarLabelStyle: {
          fontSize: fontSizes.xs,
          fontFamily: fonts.medium,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="home" size={19} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: 'Search & Filter',
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="search" size={19} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: 'My Cart',
          tabBarLabel: 'Cart',
          tabBarBadge: totalItemCount > 0 ? totalItemCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.primary,
            color: colors.white,
            fontSize: fontSizes.xs,
            fontFamily: fonts.bold,
          },
          tabBarIcon: ({ color, focused }) => (
            <Feather name="shopping-bag" size={19} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          title: 'Table Reservations',
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="calendar" size={19} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'My Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="user" size={19} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.text,
  headerTitleStyle: { fontFamily: fonts.serif, fontSize: fontSizes.bodyLarge },
};

const AuthStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign In' }} />
    <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Reset Password' }} />
  </Stack.Navigator>
);

const AppStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen
      name="MainTabs"
      component={MainTabNavigator}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ItemDetail"
      component={ItemDetailScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="OrderHistory"
      component={OrderHistoryScreen}
      options={{ title: 'My Order History' }}
    />
  </Stack.Navigator>
);

// Root Application Navigator
export const AppNavigator = () => {
  const { user } = useAuth();

  return (
    <NavigationContainer key={user ? 'authenticated' : 'unauthenticated'}>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};
