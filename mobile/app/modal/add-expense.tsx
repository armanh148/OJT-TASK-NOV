import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { X, AlertTriangle, Check, Plus } from 'lucide-react-native';
import { ScreenWrapper } from '../../src/components/ScreenWrapper';
import { useBudget } from '../../src/context/BudgetContext';
import { useTheme } from '../../src/context/ThemeContext';
import { CATEGORY_COLORS, MONTH_NAMES } from '../../src/constants/theme';
import { formatCurrency } from '../../src/components/SummaryCards';

const CATEGORIES = [
  'FOOD',
  'UTILITIES',
  'HOUSING',
  'TRANSPORT',
  'HEALTH',
  'ENTERTAINMENT',
  'SHOPPING',
  'EDUCATION',
  'OTHER',
];

export default function AddExpenseModal() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    selectedMonth,
    selectedYear,
    summary,
    addExpense,
  } = useBudget();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('FOOD');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const monthName = MONTH_NAMES[selectedMonth - 1];
  const numAmount = parseFloat(amount) || 0;
  const currRemaining = parseFloat(summary.remainingBalance) || 0;
  const isOverRemaining = numAmount > currRemaining;

  const handleSave = async () => {
    // 1. Name validation
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Expense name cannot be empty.');
      return;
    }

    // 2. Amount validation (Positive number check)
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Validation Error', 'Amount must be a valid positive number greater than 0.');
      return;
    }

    // 3. Balance warning confirmation if exceeds remaining balance
    if (isOverRemaining) {
      Alert.alert(
        'Balance Warning',
        `This expense (${formatCurrency(numAmount)}) exceeds your current remaining balance (${formatCurrency(currRemaining)}). Do you still want to proceed?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save Anyway',
            style: 'destructive',
            onPress: () => submitExpense(),
          },
        ]
      );
      return;
    }

    await submitExpense();
  };

  const submitExpense = async () => {
    setIsSubmitting(true);
    const res = await addExpense({
      name: name.trim(),
      amount: numAmount,
      category,
      date,
    });
    setIsSubmitting(false);

    if (res.success) {
      router.back();
    } else {
      Alert.alert('Error', res.message || 'Failed to save expense');
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Add New Expense</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <X size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Target Month Pill */}
          <View style={[styles.targetMonthPill, { backgroundColor: colors.surfaceVariant }]}>
            <Text style={[styles.targetMonthText, { color: colors.textMuted }]}>
              Month: <Text style={{ fontWeight: '700', color: colors.text }}>{monthName} {selectedYear}</Text>
              {'  •  '}Available: <Text style={{ fontWeight: '700', color: colors.income }}>{formatCurrency(currRemaining)}</Text>
            </Text>
          </View>

          {/* Balance Warning Banner if amount exceeds remaining balance */}
          {numAmount > 0 && isOverRemaining ? (
            <View
              style={[
                styles.warningBox,
                { backgroundColor: colors.warningBg, borderColor: colors.warningBorder },
              ]}
            >
              <AlertTriangle size={18} color={colors.warning} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.warningTitle, { color: colors.warning }]}>
                  Exceeds Remaining Balance
                </Text>
                <Text style={[styles.warningText, { color: colors.warning }]}>
                  This expense exceeds your available balance by{' '}
                  {formatCurrency(numAmount - currRemaining)}.
                </Text>
              </View>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.form}>
            {/* Expense Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Expense Name *</Text>
              <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="e.g. Electricity Bill, Groceries, Rent"
                  placeholderTextColor={colors.textDim}
                  value={name}
                  onChangeText={setName}
                  autoFocus
                />
              </View>
            </View>

            {/* Amount */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Amount (Rs.) *</Text>
              <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <Text style={[styles.currencyPrefix, { color: colors.textMuted }]}>Rs.</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, fontWeight: '700' }]}
                  placeholder="e.g. 8000"
                  placeholderTextColor={colors.textDim}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>
            </View>

            {/* Category Selector */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Category</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  const catColor = CATEGORY_COLORS[cat] || colors.primary;

                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catPill,
                        {
                          backgroundColor: isSelected ? catColor : colors.surface,
                          borderColor: isSelected ? catColor : colors.border,
                        },
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.catPillText,
                          { color: isSelected ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Date */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Date (YYYY-MM-DD)</Text>
              <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={date}
                  onChangeText={setDate}
                  placeholder="2026-11-23"
                  placeholderTextColor={colors.textDim}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.saveBtn,
                { backgroundColor: colors.primary, opacity: isSubmitting ? 0.7 : 1 },
              ]}
              onPress={handleSave}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={styles.btnContent}>
                  <Plus size={18} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>Save Expense</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  targetMonthPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  targetMonthText: {
    fontSize: 12,
  },
  warningBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    marginBottom: 14,
    alignItems: 'center',
  },
  warningTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  warningText: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  catPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  saveBtn: {
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
