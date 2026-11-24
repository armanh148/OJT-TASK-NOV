import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Plus,
  Download,
  ArrowDownRight,
  ArrowUpRight,
  Gauge,
  Clock,
  Receipt,
  ArrowRight,
} from 'lucide-react-native';
import { ScreenWrapper } from '../../src/components/ScreenWrapper';
import { FinovaHeader } from '../../src/components/FinovaHeader';
import { ExpenseItem } from '../../src/components/ExpenseItem';
import { MonthSelectorModal } from '../../src/components/MonthSelectorModal';
import { useBudget, Expense } from '../../src/context/BudgetContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { MONTH_NAMES } from '../../src/constants/theme';

export const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Rs. 0.00';
  return (
    'Rs. ' +
    num.toLocaleString('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const {
    selectedMonth,
    selectedYear,
    expenses,
    income,
    summary,
    isRefreshing,
    refreshData,
    deleteExpense,
  } = useBudget();

  const [monthModalVisible, setMonthModalVisible] = useState(false);

  const currentMonthName = MONTH_NAMES[selectedMonth - 1] || 'November';
  const recentExpenses = expenses.slice(0, 5);

  const isOverspent = summary.isOverspent;
  const totalIncomeNum = parseFloat(summary.totalIncome) || 0;
  const totalExpensesNum = parseFloat(summary.totalExpenses) || 0;
  const balanceNum = parseFloat(summary.remainingBalance) || 0;
  const percentSpent = summary.percentageSpent || 0;

  // Real-time Daily Safe-to-Spend & Pace calculations
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const isCurrentMonth = selectedYear === currentYear && selectedMonth === currentMonth;

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const currentDay = isCurrentMonth
    ? now.getDate()
    : selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentMonth)
    ? daysInMonth
    : 1;

  const daysRemaining = Math.max(1, daysInMonth - currentDay + 1);
  const dailyAllowance = balanceNum > 0 ? balanceNum / daysRemaining : 0;

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

  const handleDownloadReport = () => {
    Alert.alert(
      'Monthly Report',
      `Monthly Summary for ${currentMonthName} ${selectedYear}:\n\n` +
      `• Total Income: ${formatCurrency(summary.totalIncome)}\n` +
      `• Total Expenses: ${formatCurrency(summary.totalExpenses)}\n` +
      `• Remaining Balance: ${formatCurrency(summary.remainingBalance)}\n` +
      `• Total Transactions: ${summary.expenseCount}`
    );
  };

  return (
    <ScreenWrapper>
      {/* 1. Web-Identical Top Bar */}
      <FinovaHeader onOpenMonthPicker={() => setMonthModalVisible(true)} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshData}
            tintColor="#0F2942"
            colors={['#0F2942']}
          />
        }
      >
        {/* 2. Welcome Back Section */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>
            Welcome Back, {user?.name?.split(' ')[0] || 'admin'} 👋
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.textMuted }]}>
            Everything you need to manage, analyze, and grow your monthly finances in one place.
          </Text>

          {/* Action Row */}
          <View style={styles.headerBtnRow}>
            <TouchableOpacity
              style={styles.recordExpenseBtn}
              onPress={() => router.push('/modal/add-expense')}
              activeOpacity={0.85}
            >
              <Plus size={15} color="#FFFFFF" />
              <Text style={styles.recordExpenseText}>Record Expense</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.reportBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleDownloadReport}
              activeOpacity={0.85}
            >
              <Download size={13} color={colors.text} />
              <Text style={[styles.reportBtnText, { color: colors.text }]}>Report</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Solid Dark Navy Total Balance Hero Card */}
        <View
          style={[
            styles.heroBalanceCard,
            {
              backgroundColor: isOverspent ? '#881337' : '#0F2942',
              borderColor: isOverspent ? '#F43F5E' : '#1E3A8A',
            },
          ]}
        >
          <View style={styles.heroTopRow}>
            <Text style={styles.heroLabel}>Total Balance</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isOverspent ? 'rgba(244, 63, 94, 0.3)' : 'rgba(255, 255, 255, 0.15)' },
              ]}
            >
              <Text style={[styles.statusBadgeText, { color: isOverspent ? '#FDA4AF' : '#BAE6FD' }]}>
                {isOverspent ? 'Deficit' : 'Available'}
              </Text>
            </View>
          </View>

          <Text style={styles.heroAmount} numberOfLines={1} adjustsFontSizeToFit>
            {formatCurrency(summary.remainingBalance)}
          </Text>

          {/* Action Buttons inside Hero Card */}
          <View style={styles.heroActionsRow}>
            <TouchableOpacity
              style={styles.heroRecordBtn}
              onPress={() => router.push('/modal/add-expense')}
              activeOpacity={0.9}
            >
              <Text style={styles.heroRecordBtnText}>Record</Text>
              <ArrowDownRight size={14} color="#0F172A" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.heroDepositBtn}
              onPress={() => router.push('/(tabs)/income')}
              activeOpacity={0.9}
            >
              <Text style={styles.heroDepositBtnText}>Deposit</Text>
              <ArrowUpRight size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. 4 Metric KPI Cards (2x2 Grid) */}
        <View style={styles.kpiGrid}>
          {/* Income */}
          <View style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.kpiCardHeader}>
              <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>Income</Text>
              <View style={[styles.kpiDot, { backgroundColor: '#10B981' }]} />
            </View>
            <Text style={[styles.kpiAmount, { color: colors.text }]} numberOfLines={1}>
              {formatCurrency(summary.totalIncome)}
            </Text>
            <View style={[styles.kpiTag, { backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
              <Text style={[styles.kpiTagText, { color: '#059669' }]}>Allocated</Text>
            </View>
          </View>

          {/* Expense */}
          <View style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.kpiCardHeader}>
              <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>Expense</Text>
              <View style={[styles.kpiDot, { backgroundColor: '#DC2626' }]} />
            </View>
            <Text style={[styles.kpiAmount, { color: colors.text }]} numberOfLines={1}>
              {formatCurrency(summary.totalExpenses)}
            </Text>
            <View style={[styles.kpiTag, { backgroundColor: 'rgba(220, 38, 38, 0.12)', borderColor: 'rgba(220, 38, 38, 0.3)' }]}>
              <Text style={[styles.kpiTagText, { color: '#DC2626' }]}>Outflow</Text>
            </View>
          </View>

          {/* Runway */}
          <View style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.kpiCardHeader}>
              <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>Runway</Text>
              <View style={[styles.kpiDot, { backgroundColor: '#0F2942' }]} />
            </View>
            <Text style={[styles.kpiAmount, { color: colors.text }]} numberOfLines={1}>
              {formatCurrency(summary.remainingBalance)}
            </Text>
            <View style={[styles.kpiTag, { backgroundColor: 'rgba(15, 41, 66, 0.12)', borderColor: 'rgba(15, 41, 66, 0.3)' }]}>
              <Text style={[styles.kpiTagText, { color: '#0F2942' }]}>Surplus</Text>
            </View>
          </View>

          {/* Velocity */}
          <View style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.kpiCardHeader}>
              <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>Velocity</Text>
              <View style={[styles.kpiDot, { backgroundColor: '#DC2626' }]} />
            </View>
            <Text style={[styles.kpiAmount, { color: colors.text }]} numberOfLines={1}>
              {percentSpent.toFixed(2)}%
            </Text>
            <View style={[styles.kpiTag, { backgroundColor: 'rgba(220, 38, 38, 0.12)', borderColor: 'rgba(220, 38, 38, 0.3)' }]}>
              <Text style={[styles.kpiTagText, { color: '#DC2626' }]}>Consumed</Text>
            </View>
          </View>
        </View>

        {/* 5. Cash Flow Health & Safe Runway Card */}
        <View style={[styles.cashFlowCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cashFlowHeaderRow}>
            <View style={[styles.gaugeCircle, { backgroundColor: '#0F2942' }]}>
              <Gauge size={16} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cashFlowTitle, { color: colors.text }]}>Cash Flow Health & Safe Runway</Text>
              <Text style={[styles.cashFlowSub, { color: colors.textMuted }]}>
                Authoritative budget pacing for {currentMonthName} {selectedYear}
              </Text>
            </View>
          </View>

          {/* Safe-to-Spend Box */}
          <View style={[styles.safeSpendBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.safeSpendTop}>
              <Text style={[styles.safeSpendLabel, { color: colors.textMuted }]}>Safe-to-Spend / Day</Text>
              <Clock size={14} color={colors.textMuted} />
            </View>
            <Text style={[styles.safeSpendAmount, { color: colors.text }]}>
              {formatCurrency(dailyAllowance)}
            </Text>
          </View>
        </View>

        {/* 6. Recent Expenses List */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Receipt size={17} color="#0F2942" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Expenses</Text>
          </View>
          {expenses.length > 5 ? (
            <TouchableOpacity
              style={styles.seeAllBtn}
              onPress={() => router.push('/(tabs)/expenses')}
            >
              <Text style={[styles.seeAllText, { color: '#0F2942' }]}>View All ({expenses.length})</Text>
              <ArrowRight size={13} color="#0F2942" />
            </TouchableOpacity>
          ) : null}
        </View>

        {recentExpenses.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Receipt size={32} color={colors.textDim} style={{ marginBottom: 6 }} />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No expenses recorded</Text>
            <Text style={[styles.emptyStateSubtitle, { color: colors.textMuted }]}>
              Tap "Record Expense" above to record your first expense for {currentMonthName}.
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
    paddingBottom: 40,
  },
  welcomeSection: {
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  welcomeSubtitle: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  headerBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  recordExpenseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F2942',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    gap: 6,
    flex: 1,
    shadowColor: '#0F2942',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  recordExpenseText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    gap: 6,
  },
  reportBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  heroBalanceCard: {
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#0F2942',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.8,
    marginVertical: 14,
  },
  heroActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  heroRecordBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  heroRecordBtnText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  heroDepositBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  heroDepositBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    width: '48.5%',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'space-between',
    minHeight: 88,
  },
  kpiCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  kpiDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  kpiAmount: {
    fontSize: 15,
    fontWeight: '900',
    marginVertical: 4,
  },
  kpiTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  kpiTagText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  cashFlowCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  cashFlowHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  gaugeCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashFlowTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  cashFlowSub: {
    fontSize: 10.5,
    marginTop: 1,
  },
  safeSpendBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  safeSpendTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  safeSpendLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  safeSpendAmount: {
    fontSize: 18,
    fontWeight: '900',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  emptyState: {
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: 4,
  },
  emptyStateTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
  },
  emptyStateSubtitle: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
  },
});
