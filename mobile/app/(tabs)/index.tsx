import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, ArrowRight, Receipt, PlusCircle } from 'lucide-react-native';
import { ScreenWrapper } from '../../src/components/ScreenWrapper';
import { Header } from '../../src/components/Header';
import { SummaryCards } from '../../src/components/SummaryCards';
import { BudgetAlertBanner } from '../../src/components/BudgetAlertBanner';
import { CategoryBreakdown } from '../../src/components/CategoryBreakdown';
import { ExpenseItem } from '../../src/components/ExpenseItem';
import { MonthSelectorModal } from '../../src/components/MonthSelectorModal';
import { useBudget, Expense } from '../../src/context/BudgetContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { MONTH_NAMES } from '../../src/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const {
    selectedMonth,
    selectedYear,
    expenses,
    income,
    isRefreshing,
    refreshData,
    deleteExpense,
  } = useBudget();

  const [monthModalVisible, setMonthModalVisible] = useState(false);

  const recentExpenses = expenses.slice(0, 5);
  const currentMonthName = MONTH_NAMES[selectedMonth - 1];

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
        title="Monthly Budget"
        subtitle={`Welcome, ${user?.name || 'User'}`}
        onOpenMonthPicker={() => setMonthModalVisible(true)}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshData}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* F8: 3 Summary Cards (Hero Balance + Dual Metrics) */}
        <SummaryCards />

        {/* Budget Alert / Status */}
        <BudgetAlertBanner />

        {/* Quick Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/modal/add-expense')}
            activeOpacity={0.8}
          >
            <Plus size={18} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>Add Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryActionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push('/(tabs)/income')}
            activeOpacity={0.8}
          >
            <PlusCircle size={18} color={colors.income} />
            <Text style={[styles.secondaryActionText, { color: colors.text }]}>
              {income ? 'Update Income' : 'Set Income'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* F5: Recent Expenses Table (immediately below summary cards) */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Receipt size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Expenses</Text>
          </View>
          {expenses.length > 5 ? (
            <TouchableOpacity
              style={styles.seeAllBtn}
              onPress={() => router.push('/(tabs)/expenses')}
            >
              <Text style={[styles.seeAllText, { color: colors.primary }]}>View All ({expenses.length})</Text>
              <ArrowRight size={14} color={colors.primary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {recentExpenses.length === 0 ? (
          <View
            style={[
              styles.emptyState,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Receipt size={32} color={colors.textDim} style={{ marginBottom: 6 }} />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
              No expenses recorded
            </Text>
            <Text style={[styles.emptyStateSubtitle, { color: colors.textMuted }]}>
              Tap "Add Expense" above to record your first expense for {currentMonthName}.
            </Text>
          </View>
        ) : (
          recentExpenses.map((exp) => (
            <ExpenseItem
              key={exp.id}
              expense={exp}
              onEdit={handleEditExpense}
              onDelete={handleDeleteExpense}
            />
          ))
        )}

        {/* Bonus: Category Distribution */}
        {expenses.length > 0 && <CategoryBreakdown />}
      </ScrollView>

      {/* Month Selector Modal */}
      <MonthSelectorModal
        visible={monthModalVisible}
        onClose={() => setMonthModalVisible(false)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  monthBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  monthBannerText: {
    fontSize: 13,
  },
  switchLink: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 10,
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: 8,
  },
  emptyStateTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});
