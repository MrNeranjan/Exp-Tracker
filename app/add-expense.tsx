import { addExpense } from '@/services/expense-service';
import { enqueueExpenseSync, processExpenseSyncQueue } from '@/services/expense-sync-service';
import { isNetworkAvailable } from '@/services/network-service';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const baseCategories = [
  'Food & Dining',
  'Housing & Utilities',
  'Transportation',
  'Tech & Development',
  'Education & Academic',
  'Health & Wellness',
  'Family & Support',
  'Entertainment',
  'Shopping',
  'Personal Care',
  'Gifts & Donations',
  'Debt & Savings',
  'Others',
];

const formatDateLabel = (value: Date) =>
  value.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

const formatExpenseTimestamp = (value: Date) => {
  const date = value.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
  });
  const time = value.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${date}, ${time}`;
};

export default function AddExpenseScreen() {
  const router = useRouter();

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(baseCategories[0]);
  const [categories, setCategories] = useState(baseCategories);
  const [showAddCategoryInput, setShowAddCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const canSave = useMemo(() => {
    const parsedAmount = Number(amount.replace(/,/g, ''));
    return Number.isFinite(parsedAmount) && parsedAmount > 0 && selectedCategory.length > 0;
  }, [amount, selectedCategory]);

  const onDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleAddCategory = () => {
    const normalized = newCategory.trim();
    if (!normalized) {
      return;
    }

    const alreadyExists = categories.some(
      (category) => category.toLowerCase() === normalized.toLowerCase()
    );

    if (!alreadyExists) {
      setCategories((prev) => [...prev, normalized]);
    }

    setSelectedCategory(normalized);
    setNewCategory('');
    setShowAddCategoryInput(false);
  };

  const handleSave = async () => {
    const parsedAmount = Number(amount.replace(/,/g, ''));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setSubmitError('Please enter a valid amount before saving.');
      return;
    }

    const payload = {
      id: `custom-${Date.now()}`,
      merchant: note.trim() || selectedCategory,
      amount: parsedAmount,
      category: selectedCategory,
      note: note.trim() || undefined,
      time: formatExpenseTimestamp(date),
      createdAt: date.toISOString(),
      icon: 'receipt-outline' as const,
    };

    await addExpense(payload);
    await enqueueExpenseSync('create', payload);

    const online = await isNetworkAvailable();
    if (online) {
      void processExpenseSyncQueue();
    }

    setSubmitError(null);
    router.back();
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.headerRow}>
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={22} color="#0F172A" />
          </Pressable>
          <Text style={styles.headerTitle}>Add Expense</Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              autoFocus
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#94A3B8"
              returnKeyType="done"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Type / Category</Text>
            <View style={styles.categoryGrid}>
              {categories.map((category) => {
                const isSelected = category === selectedCategory;
                return (
                  <Pressable
                    key={category}
                    style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                    onPress={() => setSelectedCategory(category)}>
                    <Text
                      style={[styles.categoryChipText, isSelected && styles.categoryChipTextSelected]}>
                      {category}
                    </Text>
                  </Pressable>
                );
              })}

              <Pressable
                style={[styles.categoryChip, styles.addCategoryChip]}
                onPress={() => setShowAddCategoryInput((prev) => !prev)}>
                <Text style={styles.addCategoryChipText}>+ Add New Type</Text>
              </Pressable>
            </View>

            {showAddCategoryInput && (
              <View style={styles.newCategoryRow}>
                <TextInput
                  style={styles.newCategoryInput}
                  placeholder="New category"
                  placeholderTextColor="#94A3B8"
                  value={newCategory}
                  onChangeText={setNewCategory}
                />
                <Pressable style={styles.newCategorySaveButton} onPress={handleAddCategory}>
                  <Text style={styles.newCategorySaveText}>Add</Text>
                </Pressable>
              </View>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Date</Text>
            <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color="#1D4ED8" />
              <Text style={styles.dateButtonText}>{formatDateLabel(date)}</Text>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Reason / Note (Optional)</Text>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="Coffee with client, groceries, utility bill..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!canSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardContainer: {
    flex: 1,
  },
  headerRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 120,
    gap: 16,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: '#334155',
  },
  amountInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 72,
    fontSize: 40,
    fontWeight: '700',
    color: '#0F172A',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  categoryChipSelected: {
    backgroundColor: '#DBEAFE',
    borderColor: '#1D4ED8',
  },
  categoryChipText: {
    fontSize: 13,
    lineHeight: 17,
    color: '#1E293B',
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#1E40AF',
    fontWeight: '700',
  },
  addCategoryChip: {
    borderColor: '#1D4ED8',
    borderStyle: 'dashed',
  },
  addCategoryChipText: {
    fontSize: 13,
    lineHeight: 17,
    color: '#1D4ED8',
    fontWeight: '600',
  },
  newCategoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  newCategoryInput: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  newCategorySaveButton: {
    height: 44,
    minWidth: 70,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D4ED8',
    paddingHorizontal: 14,
  },
  newCategorySaveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  dateButton: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '600',
  },
  noteInput: {
    minHeight: 96,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0F172A',
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  saveButton: {
    height: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
  },
  saveButtonDisabled: {
    opacity: 0.45,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
  },
});