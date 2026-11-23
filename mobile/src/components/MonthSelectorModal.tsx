import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { X, Calendar } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useBudget } from '../context/BudgetContext';
import { MONTH_NAMES } from '../constants/theme';

interface MonthSelectorModalProps {
  visible: boolean;
  onClose: () => void;
}

export const MonthSelectorModal: React.FC<MonthSelectorModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors } = useTheme();
  const { selectedMonth, selectedYear, setMonthAndYear } = useBudget();

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  const handleSelect = (month: number, year: number) => {
    setMonthAndYear(month, year);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.modalBg }]}>
        <View style={[styles.content, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Calendar size={18} color={colors.primary} />
              <Text style={[styles.title, { color: colors.text }]}>Select Month & Year</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Quick jump to current month */}
          <TouchableOpacity
            style={[styles.currentBtn, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
            onPress={() => handleSelect(currentMonth, currentYear)}
          >
            <Text style={[styles.currentBtnText, { color: colors.primary }]}>
              Jump to Current ({MONTH_NAMES[currentMonth - 1]} {currentYear})
            </Text>
          </TouchableOpacity>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {years.map((year) => (
              <View key={year} style={styles.yearSection}>
                <Text style={[styles.yearTitle, { color: colors.textMuted }]}>{year}</Text>
                <View style={styles.monthsGrid}>
                  {MONTH_NAMES.map((name, index) => {
                    const monthNum = index + 1;
                    const isSelected = selectedMonth === monthNum && selectedYear === year;
                    const isCurrent = currentMonth === monthNum && currentYear === year;

                    return (
                      <TouchableOpacity
                        key={name}
                        style={[
                          styles.monthItem,
                          {
                            backgroundColor: isSelected
                              ? colors.primary
                              : isCurrent
                              ? colors.surfaceVariant
                              : colors.surface,
                            borderColor: isSelected
                              ? colors.primary
                              : isCurrent
                              ? colors.primary
                              : colors.border,
                          },
                        ]}
                        onPress={() => handleSelect(monthNum, year)}
                      >
                        <Text
                          style={[
                            styles.monthItemText,
                            {
                              color: isSelected ? '#FFFFFF' : colors.text,
                              fontWeight: isSelected ? '700' : '500',
                            },
                          ]}
                        >
                          {name.slice(0, 3)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  currentBtn: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 12,
  },
  currentBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollArea: {
    maxHeight: 380,
  },
  yearSection: {
    marginBottom: 16,
  },
  yearTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  monthItem: {
    width: '22%',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  monthItemText: {
    fontSize: 12,
  },
});
