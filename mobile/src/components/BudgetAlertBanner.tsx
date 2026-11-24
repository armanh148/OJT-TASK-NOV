import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useBudget } from '../context/BudgetContext';
import { formatCurrency } from './SummaryCards';

export const BudgetAlertBanner: React.FC = () => {
  const { colors } = useTheme();
  const { summary } = useBudget();

  const totalIncomeNum = parseFloat(summary.totalIncome) || 0;
  const balanceNum = parseFloat(summary.remainingBalance) || 0;
  const percent = Math.min(Math.max(summary.percentageSpent, 0), 100);

  // If no income is set yet, hero card handles this cleanly
  if (totalIncomeNum === 0) {
    return null;
  }

  // Overspent state
  if (summary.isOverspent) {
    const deficit = Math.abs(balanceNum);
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.expenseBg,
            borderColor: colors.expenseBorder,
          },
        ]}
      >
        <View style={styles.contentRow}>
          <AlertOctagon size={18} color={colors.expense} />
          <Text style={[styles.title, { color: colors.expense }]}>
            Budget Deficit Alert: Overspent by {formatCurrency(deficit)}!
          </Text>
        </View>
        <Text style={[styles.message, { color: colors.expense }]}>
          Your cumulative expenses exceed your total income for this month.
        </Text>

        <View style={[styles.progressTrack, { backgroundColor: colors.surfaceVariant }]}>
          <View
            style={[
              styles.progressBar,
              { width: '100%', backgroundColor: colors.expense },
            ]}
          />
        </View>
      </View>
    );
  }

  // Warning state (80% to 99% spent) - Bonus requirement
  if (summary.isNearLimit) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.warningBg,
            borderColor: colors.warningBorder,
          },
        ]}
      >
        <View style={styles.contentRow}>
          <AlertTriangle size={18} color={colors.warning} />
          <Text style={[styles.title, { color: colors.warning }]}>
            Budget Warning: {summary.percentageSpent.toFixed(0)}% of income spent!
          </Text>
        </View>
        <Text style={[styles.message, { color: colors.warning }]}>
          You have utilized 80% or more of your budget. Remaining: {formatCurrency(summary.remainingBalance)}.
        </Text>

        <View style={[styles.progressTrack, { backgroundColor: colors.surfaceVariant }]}>
          <View
            style={[
              styles.progressBar,
              { width: `${percent}%`, backgroundColor: colors.warning },
            ]}
          />
        </View>
      </View>
    );
  }

  // Normal healthy state
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.healthyRow}>
        <View style={styles.contentRow}>
          <CheckCircle2 size={16} color={colors.income} />
          <Text style={[styles.healthyText, { color: colors.text }]}>
            Budget Healthy: {summary.percentageSpent.toFixed(0)}% Spent
          </Text>
        </View>
        <Text style={[styles.healthySubtext, { color: colors.income }]}>
          {formatCurrency(summary.remainingBalance)} Left
        </Text>
      </View>

      <View style={[styles.progressTrack, { backgroundColor: colors.surfaceVariant }]}>
        <View
          style={[
            styles.progressBar,
            { width: `${percent}%`, backgroundColor: colors.income },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: 6,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  healthyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  message: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 6,
  },
  healthyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  healthySubtext: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});
