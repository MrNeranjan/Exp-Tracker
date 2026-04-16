import { ExpenseItem, ExpenseItemCard } from '@/components/expense/expense-item-card';
import { FloatingAddButton } from '@/components/ui/floating-add-button';
import { Reveal } from '@/components/ui/reveal';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ExpenseGroup = {
  monthLabel: string;
  entries: ExpenseItem[];
};

const today = new Date();
const todayAt = (hours: number, minutes: number) => {
  const value = new Date(today);
  value.setHours(hours, minutes, 0, 0);
  return value;
};

const formatTimeFromDate = (date: Date) => {
  const datePart = date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
  });
  const timePart = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return `${datePart}, ${timePart}`;
};

const expenseGroups: ExpenseGroup[] = [
  {
    monthLabel: 'October 2023',
    entries: [
      {
        id: 'oct-1',
        merchant: 'Whole Foods Market',
        amount: 145.3,
        category: 'Food',
        time: formatTimeFromDate(todayAt(16, 15)),
        createdAt: todayAt(16, 15).toISOString(),
        icon: 'cart',
      },
      {
        id: 'oct-2',
        merchant: 'Uber Ride',
        amount: 24.5,
        category: 'Food',
        time: 'Apr 16, 4:15 AM',
        createdAt: '2023-10-25T04:15:00.000Z',
        icon: 'car',
      },
      {
        id: 'oct-3',
        merchant: 'Shell Gas Station',
        amount: 20,
        category: 'Food',
        time: 'Oct 25, 4:15 PM',
        createdAt: '2023-10-25T16:15:00.000Z',
        icon: 'flame',
      },
      {
        id: 'oct-4',
        merchant: 'Amazon.com',
        amount: 65.2,
        category: 'Shopping',
        time: 'Oct 24, 10:00 AM',
        createdAt: '2023-10-24T10:00:00.000Z',
        icon: 'bag-handle',
        iconColor: '#E39A2D',
        categoryColor: '#8A7723',
      },
      {
        id: 'oct-5',
        merchant: 'Rent Payment',
        amount: 1600,
        category: 'Rent & Utilities',
        time: 'Oct 01, 1:00 AM',
        createdAt: '2023-10-01T01:00:00.000Z',
        icon: 'home',
        iconColor: '#4FA767',
        categoryColor: '#4FA767',
      },
    ],
  },
  {
    monthLabel: 'September 2023',
    entries: [
      {
        id: 'sep-1',
        merchant: 'Local Cafe',
        amount: 12.5,
        category: 'Food & Dining',
        time: 'Sep 25, 12:00 PM',
        createdAt: '2023-09-25T12:00:00.000Z',
        icon: 'cafe',
        iconColor: '#4C8ED9',
        categoryColor: '#3F6D81',
      },
      {
        id: 'sep-2',
        merchant: 'Netflix',
        amount: 19.99,
        category: 'Entertainment',
        time: 'Sep 20, 4:15 AM',
        createdAt: '2023-09-20T04:15:00.000Z',
        icon: 'tv',
        iconColor: '#8E3B3B',
        categoryColor: '#6E3B3B',
      },
      {
        id: 'sep-3',
        merchant: 'Public Transport Pass',
        amount: 110,
        category: 'Transport',
        time: 'Sep 15, 8:00 AM',
        createdAt: '2023-09-15T08:00:00.000Z',
        icon: 'bus',
        iconColor: '#A08D2F',
        categoryColor: '#8A7723',
      },
      {
        id: 'sep-4',
        merchant: 'Home Depot',
        amount: 45.3,
        category: 'Others',
        time: 'Sep 10, 2:00 PM',
        createdAt: '2023-09-10T14:00:00.000Z',
        icon: 'hammer',
      },
    ],
  },
];

export default function ExpensesTabScreen() {
  const router = useRouter();
  const [groups, setGroups] = useState(expenseGroups);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editMerchant, setEditMerchant] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const isEditValid = useMemo(() => {
    const parsedAmount = Number(editAmount.replace(/,/g, ''));
    return Number.isFinite(parsedAmount) && parsedAmount > 0 && editCategory.trim().length > 0;
  }, [editAmount, editCategory]);

  const applyToExpense = (id: string, updater: (entry: ExpenseItem) => ExpenseItem | null) => {
    setGroups((prev) =>
      prev
        .map((group) => ({
          ...group,
          entries: group.entries
            .map((entry) => (entry.id === id ? updater(entry) : entry))
            .filter((entry): entry is ExpenseItem => entry !== null),
        }))
        .filter((group) => group.entries.length > 0)
    );
  };

  const handleDelete = (expense: ExpenseItem) => {
    Alert.alert('Delete expense?', 'This will remove the expense from the list.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          applyToExpense(expense.id, () => null);
        },
      },
    ]);
  };

  const handleOpenEdit = (expense: ExpenseItem) => {
    setEditingExpense(expense);
    setEditAmount(String(expense.amount));
    setEditMerchant(expense.merchant);
    setEditCategory(expense.category);
  };

  const handleSaveEdit = () => {
    if (!editingExpense) {
      return;
    }

    const parsedAmount = Number(editAmount.replace(/,/g, ''));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || editCategory.trim().length === 0) {
      return;
    }

    applyToExpense(editingExpense.id, (entry) => ({
      ...entry,
      amount: parsedAmount,
      merchant: editMerchant.trim() || editCategory.trim(),
      category: editCategory.trim(),
    }));

    setEditingExpense(null);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Reveal delay={30}>
          <Text style={styles.pageTitle}>Expenses</Text>
        </Reveal>

        {groups.map((group, groupIndex) => (
          <Reveal key={group.monthLabel} delay={90 + groupIndex * 90}>
            <Text style={styles.groupTitle}>{group.monthLabel}</Text>
            <View style={styles.groupCard}>
              {group.entries.map((expense, index) => (
                <ExpenseItemCard
                  key={expense.id}
                  expense={expense}
                  showDivider={index < group.entries.length - 1}
                  showActions
                  enforceSameDayActions
                  onEdit={handleOpenEdit}
                  onDelete={handleDelete}
                />
              ))}
            </View>
          </Reveal>
        ))}
      </ScrollView>

      <Modal
        visible={!!editingExpense}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingExpense(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Expense</Text>

            <Text style={styles.modalLabel}>Amount</Text>
            <TextInput
              value={editAmount}
              onChangeText={setEditAmount}
              keyboardType="decimal-pad"
              style={styles.modalInput}
              placeholder="0.00"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.modalLabel}>Merchant / Note</Text>
            <TextInput
              value={editMerchant}
              onChangeText={setEditMerchant}
              style={styles.modalInput}
              placeholder="Expense note"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.modalLabel}>Category</Text>
            <TextInput
              value={editCategory}
              onChangeText={setEditCategory}
              style={styles.modalInput}
              placeholder="Category"
              placeholderTextColor="#94A3B8"
            />

            <View style={styles.modalActionsRow}>
              <Pressable style={styles.modalCancelButton} onPress={() => setEditingExpense(null)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalSaveButton, !isEditValid && styles.modalSaveButtonDisabled]}
                onPress={handleSaveEdit}
                disabled={!isEditValid}>
                <Text style={styles.modalSaveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <FloatingAddButton onPress={() => router.push('../add-expense')} delay={280} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 88,
    gap: 8,
  },
  pageTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: '#0F172A',
  },
  groupTitle: {
    marginTop: 6,
    marginBottom: 6,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: '#6B7280',
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.35)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  modalLabel: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  modalInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    color: '#0F172A',
    fontSize: 15,
    backgroundColor: '#FFFFFF',
  },
  modalActionsRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  modalCancelButton: {
    minWidth: 86,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  modalSaveButton: {
    minWidth: 86,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D4ED8',
  },
  modalSaveButtonDisabled: {
    opacity: 0.5,
  },
  modalCancelText: {
    color: '#0F172A',
    fontWeight: '600',
    fontSize: 14,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});