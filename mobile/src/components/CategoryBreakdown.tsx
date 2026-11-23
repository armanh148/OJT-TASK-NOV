import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useBudget } from '../context/BudgetContext';
import { CATEGORY_COLORS } from '../constants/theme';
import { formatCurrency } from './SummaryCards';

export const CategoryBreakdown: React.FC = () => {
  const { colors } = useTheme();
  const { summary } = useBudget();

  const totalExpenseNum = parseFloat(summary.totalExpenses) || 0;
  const entries = Object.entries(summary.categoryBreakdown || {}).sort(
    (a, b) => (parseFloat(b[1]) || 0) - (parseFloat(a[1]) || 0)
  );

  if (entries.length === 0 || totalExpenseNum === 0) {
    return (
      <View
        style={[
          styles.emptyContainer,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          No category expenses recorded for this month.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Category Distribution</Text>

      {/* Segmented Bar */}
      <View style={styles.segmentedBar}>
        {entries.map(([category, amountStr]) => {
          const amt = parseFloat(amountStr) || 0;
          const pct = (amt / totalExpenseNum) * 100;
          const catColor = CATEGORY_COLORS[category] || colors.primary;

          if (pct < 1) return null;

          return (
            <View
              key={category}
              style={{
                width: `${pct}%`,
                height: 10,
                backgroundColor: catColor,
              }}
            />
          );
        })}
      </View>

      {/* Category List */}
      <View style={styles.list}>
        {entries.map(([category, amountStr]) => {
          const amt = parseFloat(amountStr) || 0;
          const pct = ((amt / totalExpenseNum) * 100).toFixed(1);
          const catColor = CATEGORY_COLORS[category] || colors.primary;

          return (
            <View key={category} style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <View style={[styles.colorDot, { backgroundColor: catColor }]} />
                <Text style={[styles.categoryName, { color: colors.text }]}>{category}</Text>
              </View>

              <View style={styles.itemRight}>
                <Text style={[styles.itemAmount, { color: colors.text }]}>
                  {formatCurrency(amt)}
                </Text>
                <Text style={[styles.itemPct, { color: colors.textMuted }]}>({pct}%)</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 8,
  },
  emptyContainer: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: 8,
  },
  emptyText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  segmentedBar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#E2E8F0',
  },
  list: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
  itemPct: {
    fontSize: 11,
  },
});
