import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, Moon, Sun } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useBudget } from '../context/BudgetContext';
import { MONTH_NAMES } from '../constants/theme';

interface HeaderProps {
  onOpenMonthPicker?: () => void;
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMonthPicker,
  title = 'Budget Tracker',
  subtitle,
}) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { selectedMonth, selectedYear } = useBudget();

  const monthLabel = `${MONTH_NAMES[selectedMonth - 1]?.slice(0, 3)} ${selectedYear}`;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        {onOpenMonthPicker ? (
          <TouchableOpacity
            style={[styles.monthPill, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
            onPress={onOpenMonthPicker}
            activeOpacity={0.7}
          >
            <Calendar size={14} color={colors.primary} />
            <Text style={[styles.monthText, { color: colors.text }]}>{monthLabel}</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
          onPress={toggleTheme}
          activeOpacity={0.7}
          accessibilityLabel="Toggle Theme"
        >
          {isDark ? (
            <Sun size={18} color="#FBBF24" />
          ) : (
            <Moon size={18} color={colors.text} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  monthText: {
    fontSize: 13,
    fontWeight: '600',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
