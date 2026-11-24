import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown, Wallet, ShieldCheck, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useBudget } from '../context/BudgetContext';

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

export const SummaryCards: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { summary } = useBudget();

  const isOverspent = summary.isOverspent;
  const totalIncomeNum = parseFloat(summary.totalIncome) || 0;
  const totalExpensesNum = parseFloat(summary.totalExpenses) || 0;
  const balanceNum = parseFloat(summary.remainingBalance) || 0;
  const percentSpent = Math.min(Math.max(summary.percentageSpent || 0, 0), 100);

  return (
    <View style={styles.wrapper}>
      {/* 1. Hero Card: Remaining Balance */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: isDark ? '#1E293B' : '#0F172A',
            borderColor: isOverspent ? '#EF4444' : isDark ? '#334155' : '#1E293B',
          },
        ]}
      >
        {/* Top Header Row */}
        <View style={styles.heroTopRow}>
          <View style={styles.heroBadgeRow}>
            <View style={[styles.heroIconCircle, { backgroundColor: isOverspent ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)' }]}>
              <Wallet size={15} color={isOverspent ? '#F87171' : '#60A5FA'} />
            </View>
            <Text style={styles.heroLabel}>REMAINING BALANCE</Text>
          </View>

          {/* Status Badge */}
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: isOverspent
                  ? 'rgba(239, 68, 68, 0.2)'
                  : totalIncomeNum === 0
                  ? 'rgba(148, 163, 184, 0.2)'
                  : 'rgba(34, 197, 94, 0.2)',
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: isOverspent
                    ? '#F87171'
                    : totalIncomeNum === 0
                    ? '#94A3B8'
                    : '#4ADE80',
                },
              ]}
            >
              {isOverspent
                ? 'Overspent'
                : totalIncomeNum === 0
                ? 'No Income Set'
                : `${(100 - percentSpent).toFixed(0)}% Left`}
            </Text>
          </View>
        </View>

        {/* Main Large Amount */}
        <Text
          style={[
            styles.heroAmount,
            { color: isOverspent ? '#F87171' : '#FFFFFF' },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formatCurrency(summary.remainingBalance)}
        </Text>

        {/* Micro Progress Bar */}
        {totalIncomeNum > 0 ? (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${percentSpent}%`,
                    backgroundColor: isOverspent
                      ? '#EF4444'
                      : percentSpent >= 80
                      ? '#F59E0B'
                      : '#3B82F6',
                  },
                ]}
              />
            </View>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>{percentSpent}% of budget used</Text>
              <Text style={styles.progressLabel}>{formatCurrency(summary.totalIncome)} Total</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noIncomeSubtext}>Set your monthly income below to start tracking</Text>
        )}
      </View>

      {/* 2 & 3. Side-by-Side Dual Cards: Total Income & Total Expenses */}
      <View style={styles.dualCardsRow}>
        {/* Income Card */}
        <View
          style={[
            styles.miniCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.miniCardHeader}>
            <View style={[styles.miniIconCircle, { backgroundColor: colors.incomeBg }]}>
              <TrendingUp size={13} color={colors.income} />
            </View>
            <Text style={[styles.miniCardLabel, { color: colors.textMuted }]}>TOTAL INCOME</Text>
          </View>
          <Text
            style={[styles.miniCardAmount, { color: colors.income }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatCurrency(summary.totalIncome)}
          </Text>
          <Text style={[styles.miniCardSub, { color: colors.textDim }]}>Monthly Allocation</Text>
        </View>

        {/* Expense Card */}
        <View
          style={[
            styles.miniCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.miniCardHeader}>
            <View style={[styles.miniIconCircle, { backgroundColor: colors.expenseBg }]}>
              <TrendingDown size={13} color={colors.expense} />
            </View>
            <Text style={[styles.miniCardLabel, { color: colors.textMuted }]}>TOTAL EXPENSES</Text>
          </View>
          <Text
            style={[styles.miniCardAmount, { color: colors.expense }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatCurrency(summary.totalExpenses)}
          </Text>
          <Text style={[styles.miniCardSub, { color: colors.textDim }]}>
            {summary.expenseCount} {summary.expenseCount === 1 ? 'transaction' : 'transactions'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 6,
    gap: 10,
  },
  heroCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  heroAmount: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  progressContainer: {
    marginTop: 2,
    gap: 5,
  },
  progressTrack: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '500',
  },
  noIncomeSubtext: {
    color: '#94A3B8',
    fontSize: 11,
    fontStyle: 'italic',
  },
  dualCardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  miniCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  miniCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  miniIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniCardLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  miniCardAmount: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  miniCardSub: {
    fontSize: 10,
  },
});
