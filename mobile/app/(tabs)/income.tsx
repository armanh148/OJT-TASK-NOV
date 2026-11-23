import React, { useState, useEffect } from 'react';
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
import { Wallet, Check, AlertCircle, Calendar } from 'lucide-react-native';
import { ScreenWrapper } from '../../src/components/ScreenWrapper';
import { Header } from '../../src/components/Header';
import { MonthSelectorModal } from '../../src/components/MonthSelectorModal';
import { useBudget } from '../../src/context/BudgetContext';
import { useTheme } from '../../src/context/ThemeContext';
import { MONTH_NAMES } from '../../src/constants/theme';
import { formatCurrency } from '../../src/components/SummaryCards';

export default function SetIncomeScreen() {
  const { colors } = useTheme();
  const {
    selectedMonth,
    selectedYear,
    income,
    summary,
    setMonthlyIncome,
    isLoading,
  } = useBudget();

  const [amountInput, setAmountInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [monthModalVisible, setMonthModalVisible] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync existing income amount into input
  useEffect(() => {
    if (income) {
      setAmountInput(String(parseFloat(income.amount) || ''));
    } else {
      setAmountInput('');
    }
    setSuccessMsg(null);
  }, [income, selectedMonth, selectedYear]);

  const monthName = MONTH_NAMES[selectedMonth - 1];

  const handleSave = async () => {
    const cleanAmount = amountInput.trim();
    const num = parseFloat(cleanAmount);

    if (isNaN(num) || num <= 0) {
      Alert.alert('Validation Error', 'Income amount must be a positive number greater than 0.');
      return;
    }

    setIsSaving(true);
    setSuccessMsg(null);

    const res = await setMonthlyIncome(num);
    setIsSaving(false);

    if (res.success) {
      setSuccessMsg(`Income for ${monthName} ${selectedYear} successfully saved!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      Alert.alert('Error', res.message || 'Failed to save monthly income');
    }
  };

  const quickAmounts = [50000, 75000, 100000, 150000, 200000];

  return (
    <ScreenWrapper>
      <Header
        title="Set Monthly Income"
        subtitle="Record your monthly income allocation"
        onOpenMonthPicker={() => setMonthModalVisible(true)}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Target Month Card */}
          <View
            style={[
              styles.targetMonthCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.targetMonthLeft}>
              <Calendar size={18} color={colors.primary} />
              <View>
                <Text style={[styles.targetMonthTitle, { color: colors.text }]}>
                  {monthName} {selectedYear}
                </Text>
                <Text style={[styles.targetMonthSub, { color: colors.textMuted }]}>
                  {income ? 'Existing income allocated' : 'No income allocated yet'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.changeMonthBtn, { backgroundColor: colors.surfaceVariant }]}
              onPress={() => setMonthModalVisible(true)}
            >
              <Text style={[styles.changeMonthText, { color: colors.primary }]}>Change</Text>
            </TouchableOpacity>
          </View>

          {/* Current Financial Status Preview */}
          <View
            style={[
              styles.statusCard,
              { backgroundColor: colors.surface, borderColor: colors.incomeBorder },
            ]}
          >
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.textMuted }]}>
                Current Recorded Income:
              </Text>
              <Text style={[styles.statusValue, { color: colors.income }]}>
                {formatCurrency(summary.totalIncome)}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.textMuted }]}>
                Current Total Expenses:
              </Text>
              <Text style={[styles.statusValue, { color: colors.expense }]}>
                {formatCurrency(summary.totalExpenses)}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.text }]}>
                Remaining Balance:
              </Text>
              <Text
                style={[
                  styles.statusValue,
                  { color: summary.isOverspent ? colors.expense : colors.balance },
                ]}
              >
                {formatCurrency(summary.remainingBalance)}
              </Text>
            </View>
          </View>

          {/* Success Message */}
          {successMsg ? (
            <View
              style={[
                styles.successBox,
                { backgroundColor: colors.incomeBg, borderColor: colors.incomeBorder },
              ]}
            >
              <Check size={16} color={colors.income} />
              <Text style={[styles.successText, { color: colors.income }]}>{successMsg}</Text>
            </View>
          ) : null}

          {/* Input Form */}
          <View
            style={[
              styles.formCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.formTitle, { color: colors.text }]}>
              {income ? 'Update Income Amount' : 'Enter Income Amount'}
            </Text>
            <Text style={[styles.formSubtitle, { color: colors.textMuted }]}>
              Enter the total net income (Rs.) available for {monthName} {selectedYear}.
            </Text>

            <View style={[styles.inputContainer, { borderColor: colors.border }]}>
              <Text style={[styles.currencyPrefix, { color: colors.textMuted }]}>Rs.</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g. 100000"
                placeholderTextColor={colors.textDim}
                keyboardType="numeric"
                value={amountInput}
                onChangeText={(val) => {
                  setAmountInput(val);
                  setSuccessMsg(null);
                }}
              />
            </View>

            {/* Quick Amount Pills */}
            <Text style={[styles.quickLabel, { color: colors.textMuted }]}>Quick Select:</Text>
            <View style={styles.quickRow}>
              {quickAmounts.map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[
                    styles.quickPill,
                    {
                      backgroundColor: colors.surfaceVariant,
                      borderColor:
                        parseFloat(amountInput) === amt ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setAmountInput(String(amt))}
                >
                  <Text
                    style={[
                      styles.quickPillText,
                      {
                        color:
                          parseFloat(amountInput) === amt ? colors.primary : colors.text,
                        fontWeight: parseFloat(amountInput) === amt ? '700' : '500',
                      },
                    ]}
                  >
                    Rs. {(amt / 1000).toFixed(0)}k
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.saveBtn,
                { backgroundColor: colors.primary, opacity: isSaving ? 0.7 : 1 },
              ]}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>
                  {income ? 'Update Monthly Income' : 'Save Monthly Income'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
    paddingBottom: 32,
    gap: 12,
  },
  targetMonthCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  targetMonthLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  targetMonthTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  targetMonthSub: {
    fontSize: 12,
    marginTop: 2,
  },
  changeMonthBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  changeMonthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 13,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  successText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  formCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 16,
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    height: '100%',
  },
  quickLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  quickPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickPillText: {
    fontSize: 12,
  },
  saveBtn: {
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
