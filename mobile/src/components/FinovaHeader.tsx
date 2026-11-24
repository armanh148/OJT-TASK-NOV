import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Wallet, ChevronLeft, ChevronRight, Calendar, Moon, Sun } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useBudget } from '../context/BudgetContext';
import { useAuth } from '../context/AuthContext';
import { MONTH_NAMES } from '../constants/theme';

interface FinovaHeaderProps {
  onOpenMonthPicker: () => void;
}

export const FinovaHeader: React.FC<FinovaHeaderProps> = ({ onOpenMonthPicker }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { selectedMonth, selectedYear, setSelectedMonth, setSelectedYear } = useBudget();
  const { user } = useAuth();

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const currentMonthName = MONTH_NAMES[selectedMonth - 1] || 'November';
  const initial = (user?.name?.charAt(0) || user?.email?.charAt(0) || 'A').toUpperCase();

  return (
    <View style={[styles.headerContainer, { backgroundColor: colors.background }]}>
      {/* 1. Left Wallet Logo Box */}
      <View style={[styles.walletBox, { backgroundColor: '#0F2942' }]}>
        <Wallet size={18} color="#FFFFFF" />
      </View>

      {/* 2. Center Month Selector Pill with < and > arrows */}
      <View style={[styles.monthSelectorPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity onPress={handlePrevMonth} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.arrowBtn}>
          <ChevronLeft size={16} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onOpenMonthPicker} style={styles.monthCenterBtn} activeOpacity={0.7}>
          <Calendar size={13} color="#0F2942" />
          <Text style={[styles.monthLabel, { color: colors.text }]}>
            {currentMonthName} {selectedYear}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleNextMonth} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.arrowBtn}>
          <ChevronRight size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* 3. Right Action Buttons: Theme Toggle + User Avatar */}
      <View style={styles.rightActions}>
        <TouchableOpacity
          style={[styles.circleBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={toggleTheme}
          activeOpacity={0.7}
        >
          {isDark ? <Sun size={16} color="#FBBF24" /> : <Moon size={16} color={colors.text} />}
        </TouchableOpacity>

        <View style={[styles.avatarCircle, { backgroundColor: '#0F2942' }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F2942',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  monthSelectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 24,
    borderWidth: 1,
    gap: 4,
  },
  arrowBtn: {
    padding: 3,
  },
  monthCenterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  monthLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
