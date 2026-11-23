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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Trash2, Check } from 'lucide-react-native';
import { ScreenWrapper } from '../../src/components/ScreenWrapper';
import { useBudget } from '../../src/context/BudgetContext';
import { useTheme } from '../../src/context/ThemeContext';
import { CATEGORY_COLORS } from '../../src/constants/theme';
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

export default function EditExpenseModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    amount: string;
    category: string;
    date: string;
  }>();

  const { colors } = useTheme();
  const { updateExpense, deleteExpense } = useBudget();

  const [name, setName] = useState(params.name || '');
  const [amount, setAmount] = useState(params.amount ? String(parseFloat(params.amount)) : '');
  const [category, setCategory] = useState(params.category || 'FOOD');
  const [date, setDate] = useState(
    params.date ? new Date(params.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const numAmount = parseFloat(amount) || 0;

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Expense name cannot be empty.');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Validation Error', 'Amount must be a positive number greater than 0.');
      return;
    }

    setIsSubmitting(true);
    const res = await updateExpense(params.id, {
      name: name.trim(),
      amount: numAmount,
      category,
      date,
    });
    setIsSubmitting(false);

    if (res.success) {
      router.back();
    } else {
      Alert.alert('Error', res.message || 'Failed to update expense');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${name}" (${formatCurrency(numAmount)})? This amount will be added back to your remaining balance.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            const res = await deleteExpense(params.id);
            setIsDeleting(false);
            if (res.success) {
              router.back();
            } else {
              Alert.alert('Error', res.message || 'Failed to delete expense');
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Expense</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <X size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Expense Name *</Text>
              <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Expense name"
                  placeholderTextColor={colors.textDim}
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
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="Amount"
                  placeholderTextColor={colors.textDim}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Category */}
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

            {/* Save / Update Button */}
            <TouchableOpacity
              style={[
                styles.saveBtn,
                { backgroundColor: colors.primary, opacity: isSubmitting ? 0.7 : 1 },
              ]}
              onPress={handleUpdate}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={styles.btnContent}>
                  <Check size={18} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>Update Expense</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Delete Button (F7) */}
            <TouchableOpacity
              style={[
                styles.deleteBtn,
                { backgroundColor: colors.expenseBg, borderColor: colors.expenseBorder, opacity: isDeleting ? 0.7 : 1 },
              ]}
              onPress={handleDelete}
              disabled={isDeleting}
              activeOpacity={0.8}
            >
              {isDeleting ? (
                <ActivityIndicator color={colors.expense} />
              ) : (
                <View style={styles.btnContent}>
                  <Trash2 size={16} color={colors.expense} />
                  <Text style={[styles.deleteBtnText, { color: colors.expense }]}>
                    Delete Expense (F7)
                  </Text>
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
  deleteBtn: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  deleteBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
