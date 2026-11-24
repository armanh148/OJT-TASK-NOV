import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { LayoutGrid, Receipt, Plus, DollarSign, PieChart } from 'lucide-react-native';
import { useTheme } from '../../src/context/ThemeContext';

export default function TabsLayout() {
  const { colors, isDark } = useTheme();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 26 : 10,
          paddingTop: 8,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
        },
        tabBarActiveTintColor: '#DC2626',
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: '700',
          marginTop: 2,
        },
      }}
    >
      {/* 1. Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <LayoutGrid size={22} color={focused ? '#DC2626' : color} />
          ),
        }}
      />

      {/* 2. Expenses */}
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Expenses',
          tabBarIcon: ({ color, focused }) => (
            <Receipt size={22} color={focused ? '#DC2626' : color} />
          ),
        }}
      />

      {/* 3. Center Floating Add Expense Button */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Add',
          tabBarButton: () => (
            <TouchableOpacity
              style={styles.floatingAddWrapper}
              onPress={() => router.push('/modal/add-expense')}
              activeOpacity={0.85}
            >
              <View style={styles.floatingAddBtn}>
                <Plus size={24} color="#FFFFFF" strokeWidth={2.6} />
              </View>
            </TouchableOpacity>
          ),
        }}
      />

      {/* 4. Income */}
      <Tabs.Screen
        name="income"
        options={{
          title: 'Income',
          tabBarIcon: ({ color, focused }) => (
            <DollarSign size={22} color={focused ? '#DC2626' : color} />
          ),
        }}
      />

      {/* 5. Analytics */}
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, focused }) => (
            <PieChart size={22} color={focused ? '#DC2626' : color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  floatingAddWrapper: {
    top: -16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingAddBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0F2942',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F2942',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});
