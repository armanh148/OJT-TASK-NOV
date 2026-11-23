import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown, Wallet, AlertCircle } from 'lucide-react-native';
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
  const { colors } = useTheme();
  const { summary } = useBudget();

  const isOverspent = summary.isOverspent;
  const balanceNum = parseFloat(summary.remainingBalance) || 0;

  return (
    <View style={styles.container}>
      {/* 1. Total Income Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.incomeBorder,
            borderLeftColor: colors.income,
            borderLeftWidth: 4,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardLabel, { color: colors.textMuted }]}>Total Income</Text>
          <View style={[styles.iconWrapper, { backgroundColor: colors.incomeBg }]}>
            <TrendingUp size={16} color={colors.income} />
          </View>
        </View>
        <Text style={[styles.cardAmount, { color: colors.income }]}>
          {formatCurrency(summary.totalIncome)}
        </Text>
        <Text style={[styles.cardSubtext, { color: colors.textDim }]}>Monthly Allocation</Text>
      </View>

      {/* 2. Total Expenses Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.expenseBorder,
            borderLeftColor: colors.expense,
            borderLeftWidth: 4,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardLabel, { color: colors.textMuted }]}>Total Expenses</Text>
          <View style={[styles.iconWrapper, { backgroundColor: colors.expenseBg }]}>
            <TrendingDown size={16} color={colors.expense} />
          </View>
        </View>
        <Text style={[styles.cardAmount, { color: colors.expense }]}>
          {formatCurrency(summary.totalExpenses)}
        </Text>
        <Text style={[styles.cardSubtext, { color: colors.textDim }]}>
          {summary.expenseCount} {summary.expenseCount === 1 ? 'transaction' : 'transactions'}
        </Text>
      </View>

      {/* 3. Remaining Balance Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: isOverspent ? colors.expenseBorder : colors.balanceBorder,
            borderLeftColor: isOverspent ? colors.expense : colors.balance,
            borderLeftWidth: 4,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardLabel, { color: isOverspent ? colors.expense : colors.textMuted }]}>
            {isOverspent ? 'Overspent By' : 'Remaining Balance'}
          </Text>
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: isOverspent ? colors.expenseBg : colors.balanceBg },
            ]}
          >
            {isOverspent ? (
              <AlertCircle size={16} color={colors.expense} />
            ) : (
              <Wallet size={16} color={colors.balance} />
            )}
          </View>
        </View>
        <Text
          style={[
            styles.cardAmount,
            { color: isOverspent ? colors.expense : colors.balance },
          ]}
        >
          {isOverspent
            ? `-${formatCurrency(Math.abs(balanceNum))}`
            : formatCurrency(summary.remainingBalance)}
        </Text>
        <Text style={[styles.cardSubtext, { color: colors.textDim }]}>
          {isOverspent ? 'Budget exceeded' : `${Math.round(100 - summary.percentageSpent)}% remaining`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginVertical: 8,
  },
  card: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardAmount: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  cardSubtext: {
    fontSize: 11,
  },
});
