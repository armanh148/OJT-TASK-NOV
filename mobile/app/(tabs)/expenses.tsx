import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Plus, Filter, Receipt, X } from 'lucide-react-native';
import { ScreenWrapper } from '../../src/components/ScreenWrapper';
import { Header } from '../../src/components/Header';
import { ExpenseItem } from '../../src/components/ExpenseItem';
import { MonthSelectorModal } from '../../src/components/MonthSelectorModal';
import { useBudget, Expense } from '../../src/context/BudgetContext';
import { useTheme } from '../../src/context/ThemeContext';
import { MONTH_NAMES, CATEGORY_COLORS } from '../../src/constants/theme';
import { formatCurrency } from '../../src/components/SummaryCards';

const CATEGORIES = [
  'ALL',
  'FOOD',
  'UTILITIES',
  'HOUSING',
  'TRANSPORT',
  'HEALTH',
  'ENTERTAINMENT',
  'SHOPPING',
  'EDUCATION',
  'OTHER',
];

export default function ExpensesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    selectedMonth,
    selectedYear,
    expenses,
    isRefreshing,
    refreshData,
    deleteExpense,
  } = useBudget();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [monthModalVisible, setMonthModalVisible] = useState(false);

  const monthName = MONTH_NAMES[selectedMonth - 1];

  // Filtered expenses list
  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim());
      const matchesCategory =
        selectedCategory === 'ALL' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchQuery, selectedCategory]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  }, [filteredExpenses]);

  const handleEditExpense = (expense: Expense) => {
    router.push({
      pathname: '/modal/edit-expense',
      params: {
        id: expense.id,
        name: expense.name,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
      },
    });
  };

  const handleDeleteExpense = async (id: string) => {
    await deleteExpense(id);
  };

  return (
    <ScreenWrapper>
      <Header
        title="Expense Table"
        subtitle={`${filteredExpenses.length} transactions for ${monthName} ${selectedYear}`}
        onOpenMonthPicker={() => setMonthModalVisible(true)}
      />

      <View style={styles.container}>
        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Search size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search expenses by name..."
            placeholderTextColor={colors.textDim}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <X size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Category Filters (Horizontal Scroll) */}
        <View style={styles.categoryScrollWrapper}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIES}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item }) => {
              const isSelected = selectedCategory === item;
              const catColor = item === 'ALL' ? colors.primary : CATEGORY_COLORS[item] || colors.primary;

              return (
                <TouchableOpacity
                  style={[
                    styles.categoryPill,
                    {
                      backgroundColor: isSelected ? catColor : colors.surface,
                      borderColor: isSelected ? catColor : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedCategory(item)}
                >
                  <Text
                    style={[
                      styles.categoryPillText,
                      { color: isSelected ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Subtotal & Count Bar */}
        <View
          style={[
            styles.subtotalBar,
            { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.subtotalCount, { color: colors.textMuted }]}>
            Showing {filteredExpenses.length} of {expenses.length}
          </Text>
          <Text style={[styles.subtotalAmount, { color: colors.expense }]}>
            Total: {formatCurrency(totalFilteredAmount)}
          </Text>
        </View>

        {/* Expenses List */}
        <FlatList
          data={filteredExpenses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refreshData}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View
              style={[
                styles.emptyState,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Receipt size={40} color={colors.textDim} style={{ marginBottom: 10 }} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No expenses found</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                {searchQuery || selectedCategory !== 'ALL'
                  ? 'No expenses match your search filter.'
                  : `No expenses recorded for ${monthName} ${selectedYear}.`}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <ExpenseItem
              expense={item}
              onEdit={handleEditExpense}
              onDelete={handleDeleteExpense}
            />
          )}
        />
      </View>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/modal/add-expense')}
        activeOpacity={0.8}
        accessibilityLabel="Add New Expense"
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <MonthSelectorModal
        visible={monthModalVisible}
        onClose={() => setMonthModalVisible(false)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  clearBtn: {
    padding: 4,
  },
  categoryScrollWrapper: {
    marginBottom: 10,
  },
  categoryList: {
    gap: 6,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  subtotalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  subtotalCount: {
    fontSize: 12,
  },
  subtotalAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 80,
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
});
