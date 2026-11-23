import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Edit2, Trash2 } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { Expense } from '../context/BudgetContext';
import { CATEGORY_COLORS } from '../constants/theme';
import { formatCurrency } from './SummaryCards';

interface ExpenseItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string, name: string) => void;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  onEdit,
  onDelete,
}) => {
  const { colors } = useTheme();

  const categoryColor = CATEGORY_COLORS[expense.category] || colors.primary;

  const formattedDate = expense.date
    ? new Date(expense.date).toLocaleDateString('en-PK', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No Date';

  const handleDeletePress = () => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${expense.name}" (${formatCurrency(expense.amount)})? This amount will be added back to your remaining balance.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(expense.id, expense.name),
        },
      ]
    );
  };

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
      <View style={styles.leftCol}>
        <View style={styles.topRow}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {expense.name}
          </Text>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: `${categoryColor}20`, borderColor: categoryColor },
            ]}
          >
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {expense.category || 'OTHER'}
            </Text>
          </View>
        </View>

        <Text style={[styles.date, { color: colors.textMuted }]}>{formattedDate}</Text>
      </View>

      <View style={styles.rightCol}>
        <Text style={[styles.amount, { color: colors.expense }]}>
          -{formatCurrency(expense.amount)}
        </Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.surfaceVariant }]}
            onPress={() => onEdit(expense)}
            activeOpacity={0.7}
            accessibilityLabel="Edit Expense"
          >
            <Edit2 size={13} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.expenseBg }]}
            onPress={handleDeletePress}
            activeOpacity={0.7}
            accessibilityLabel="Delete Expense"
          >
            <Trash2 size={13} color={colors.expense} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  leftCol: {
    flex: 1,
    paddingRight: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 1,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  date: {
    fontSize: 11,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
