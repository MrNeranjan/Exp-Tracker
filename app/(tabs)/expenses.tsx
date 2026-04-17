import { ExpenseItem, ExpenseItemCard } from '@/components/expense/expense-item-card';
import { FloatingAddButton } from '@/components/ui/floating-add-button';
import { Reveal } from '@/components/ui/reveal';
import { deleteExpense, getExpenses, saveExpenses, updateExpense } from '@/services/expense-service';
import { enqueueExpenseSync, processExpenseSyncQueue } from '@/services/expense-sync-service';
import { isNetworkAvailable } from '@/services/network-service';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ExpenseGroup = {
  monthLabel: string;
  entries: ExpenseItem[];
};

const defaultExpenseCategories = [
  'Food & Dining',
  'Groceries',
  'Housing / Rent',
  'Utilities',
  'Telecommunications',
  'Transportation',
  'Health / Medical',
  'Education',
  'Personal Care',
  'Shopping',
  'Entertainment',
  'Family / Kids',
  'Insurance',
  'Debt Repayment / Loans',
  'Savings / Investments',
  'Gifts / Donations',
  'Travel',
  'Subscriptions',
  'Taxes / Fees',
  'Emergency',
];

const toValidDate = (dateValue?: string) => {
  if (!dateValue) {
    return new Date();
  }

  const parsed = new Date(dateValue);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const isCurrentMonthExpense = (expense: ExpenseItem) => {
  const expenseDate = toValidDate(expense.createdAt);
  const now = new Date();
  return expenseDate.getFullYear() === now.getFullYear() && expenseDate.getMonth() === now.getMonth();
};

const buildExpenseGroups = (expenses: ExpenseItem[]): ExpenseGroup[] => {
  const grouped = new Map<string, ExpenseItem[]>();

  for (const expense of expenses) {
    const expenseDate = toValidDate(expense.createdAt);
    const monthKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
    const existing = grouped.get(monthKey) ?? [];
    existing.push(expense);
    grouped.set(monthKey, existing);
  }

  return Array.from(grouped.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([monthKey, entries]) => {
      const [year, month] = monthKey.split('-').map(Number);
      const monthDate = new Date(year, month - 1, 1);

      return {
        monthLabel: monthDate.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        }),
        entries: [...entries].sort(
          (a, b) => toValidDate(b.createdAt).getTime() - toValidDate(a.createdAt).getTime()
        ),
      };
    });
};

export default function ExpensesTabScreen() {
  const router = useRouter();
  const [groups, setGroups] = useState<ExpenseGroup[]>([]);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editMerchant, setEditMerchant] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [isEditCategoryMenuOpen, setIsEditCategoryMenuOpen] = useState(false);

  const loadExpenses = useCallback(async () => {
    const storedExpenses = await getExpenses();
    setGroups(buildExpenseGroups(storedExpenses));
  }, []);

  useEffect(() => {
    void loadExpenses();
  }, [loadExpenses]);

  useFocusEffect(
    useCallback(() => {
      void loadExpenses();
    }, [loadExpenses])
  );

  const isEditValid = useMemo(() => {
    const parsedAmount = Number(editAmount.replace(/,/g, ''));
    return Number.isFinite(parsedAmount) && parsedAmount > 0 && editCategory.trim().length > 0;
  }, [editAmount, editCategory]);

  const categoryOptions = useMemo(() => {
    const categories = Array.from(
      new Set([
        ...defaultExpenseCategories,
        ...groups.flatMap((group) => group.entries.map((entry) => entry.category.trim())),
      ])
    ).filter((value) => value.length > 0);

    return ['All', ...categories.sort((a, b) => a.localeCompare(b))];
  }, [groups]);

  const editCategoryOptions = useMemo(() => {
    const base = categoryOptions.filter((category) => category !== 'All');
    if (editCategory.trim().length > 0 && !base.includes(editCategory)) {
      return [editCategory, ...base];
    }

    return base;
  }, [categoryOptions, editCategory]);

  const filteredGroups = useMemo(() => {
    if (selectedCategory === 'All') {
      return groups;
    }

    return groups
      .map((group) => ({
        ...group,
        entries: group.entries.filter((entry) => entry.category === selectedCategory),
      }))
      .filter((group) => group.entries.length > 0);
  }, [groups, selectedCategory]);

  useEffect(() => {
    if (!categoryOptions.includes(selectedCategory)) {
      setSelectedCategory('All');
    }
  }, [categoryOptions, selectedCategory]);

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

  const handleToggleActionMenu = (expense: ExpenseItem) => {
    setOpenActionMenuId((prev) => (prev === expense.id ? null : expense.id));
  };

  const handleCloseActionMenu = () => {
    setOpenActionMenuId(null);
  };

  const handleDelete = (expense: ExpenseItem) => {
    setOpenActionMenuId(null);
    Alert.alert('Delete expense?', 'This will remove the expense from the list.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          applyToExpense(expense.id, () => null);
          await deleteExpense(expense.id);
          await enqueueExpenseSync('delete', expense);

          const online = await isNetworkAvailable();
          if (online) {
            void processExpenseSyncQueue();
          }
        },
      },
    ]);
  };

  const handleOpenEdit = (expense: ExpenseItem) => {
    setOpenActionMenuId(null);
    setEditingExpense(expense);
    setEditAmount(String(expense.amount));
    setEditMerchant(expense.merchant);
    setEditCategory(expense.category);
    setIsEditCategoryMenuOpen(false);
  };

  const handleSaveEdit = async () => {
    if (!editingExpense) {
      return;
    }

    const parsedAmount = Number(editAmount.replace(/,/g, ''));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || editCategory.trim().length === 0) {
      return;
    }

    const updatedExpense = {
      ...editingExpense,
      amount: parsedAmount,
      merchant: editMerchant.trim() || editCategory.trim(),
      category: editCategory.trim(),
    };

    applyToExpense(editingExpense.id, () => updatedExpense);
    await updateExpense(updatedExpense);
    await enqueueExpenseSync('update', updatedExpense, editingExpense);

    const online = await isNetworkAvailable();
    if (online) {
      void processExpenseSyncQueue();
    }

    setIsEditCategoryMenuOpen(false);
    setEditingExpense(null);
  };

  const handleClearPastRecords = () => {
    const allEntries = groups.flatMap((group) => group.entries);
    const currentMonthEntries = allEntries.filter((entry) => isCurrentMonthExpense(entry));
    const hasPastRecords = allEntries.length > currentMonthEntries.length;

    if (!hasPastRecords) {
      Alert.alert('Nothing to clear', 'There are no past-month expense records to remove.');
      return;
    }

    Alert.alert(
      'Clear past records?',
      'This removes only previous-month expenses from local storage and keeps current month records.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Past',
          style: 'destructive',
          onPress: async () => {
            await saveExpenses(currentMonthEntries);
            setGroups(buildExpenseGroups(currentMonthEntries));
            setOpenActionMenuId(null);
            setIsCategoryMenuOpen(false);
            setSelectedCategory('All');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Reveal delay={30}>
          <Text style={styles.pageTitle}>Expenses</Text>
        </Reveal>

        {groups.length > 0 ? (
          <Reveal delay={60}>
            <View style={styles.filterBlock}>
              <Text style={styles.filterLabel}>Category</Text>
              <Pressable
                style={styles.dropdownTrigger}
                onPress={() => setIsCategoryMenuOpen((prev) => !prev)}>
                <Text style={styles.dropdownValue}>{selectedCategory}</Text>
                <Text style={styles.dropdownChevron}>{isCategoryMenuOpen ? '▲' : '▼'}</Text>
              </Pressable>

              {isCategoryMenuOpen ? (
                <View style={styles.dropdownMenu}>
                  <ScrollView
                    style={styles.dropdownScroll}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator
                    keyboardShouldPersistTaps="handled">
                    {categoryOptions.map((category) => {
                      const isActive = selectedCategory === category;

                      return (
                        <Pressable
                          key={category}
                          style={[styles.dropdownOption, isActive && styles.dropdownOptionActive]}
                          onPress={() => {
                            setSelectedCategory(category);
                            setIsCategoryMenuOpen(false);
                          }}>
                          <Text style={[styles.dropdownOptionText, isActive && styles.dropdownOptionTextActive]}>
                            {category}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              ) : null}

              <Pressable style={styles.clearPastButton} onPress={handleClearPastRecords}>
                <Text style={styles.clearPastButtonText}>Clear Past Records (Keep Current Month)</Text>
              </Pressable>
            </View>
          </Reveal>
        ) : null}

        {groups.length === 0 ? (
          <Reveal delay={90}>
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No expenses yet. Tap + to add your first record.</Text>
            </View>
          </Reveal>
        ) : null}

        {groups.length > 0 && filteredGroups.length === 0 ? (
          <Reveal delay={90}>
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No expenses found for {selectedCategory}.</Text>
            </View>
          </Reveal>
        ) : null}

        {filteredGroups.map((group, groupIndex) => (
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
                  isMenuOpen={openActionMenuId === expense.id}
                  onToggleMenu={handleToggleActionMenu}
                  onCloseMenu={handleCloseActionMenu}
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
        onRequestClose={() => {
          setIsEditCategoryMenuOpen(false);
          setEditingExpense(null);
        }}>
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
            <Pressable
              style={styles.modalDropdownTrigger}
              onPress={() => setIsEditCategoryMenuOpen((prev) => !prev)}>
              <Text style={styles.modalDropdownValue}>{editCategory}</Text>
              <Text style={styles.modalDropdownChevron}>{isEditCategoryMenuOpen ? '▲' : '▼'}</Text>
            </Pressable>
            {isEditCategoryMenuOpen ? (
              <View style={styles.modalDropdownMenu}>
                <ScrollView
                  style={styles.modalDropdownScroll}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator
                  keyboardShouldPersistTaps="handled">
                  {editCategoryOptions.map((category) => {
                    const isSelected = category === editCategory;

                    return (
                      <Pressable
                        key={category}
                        style={[styles.dropdownOption, isSelected && styles.dropdownOptionActive]}
                        onPress={() => {
                          setEditCategory(category);
                          setIsEditCategoryMenuOpen(false);
                        }}>
                        <Text style={[styles.dropdownOptionText, isSelected && styles.dropdownOptionTextActive]}>
                          {category}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            ) : null}

            <View style={styles.modalActionsRow}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => {
                  setIsEditCategoryMenuOpen(false);
                  setEditingExpense(null);
                }}>
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
  filterBlock: {
    marginTop: 2,
    marginBottom: 6,
  },
  filterLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: '#475569',
    fontWeight: '700',
    marginBottom: 6,
  },
  dropdownTrigger: {
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  dropdownValue: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#0F172A',
    fontWeight: '600',
  },
  dropdownChevron: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  dropdownMenu: {
    marginTop: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  dropdownScroll: {
    maxHeight: 220,
  },
  dropdownOption: {
    minHeight: 40,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dropdownOptionActive: {
    backgroundColor: '#DBEAFE',
  },
  dropdownOptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#334155',
    fontWeight: '600',
  },
  dropdownOptionTextActive: {
    color: '#1D4ED8',
  },
  clearPastButton: {
    marginTop: 10,
    minHeight: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  clearPastButtonText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#B91C1C',
    fontWeight: '700',
    textAlign: 'center',
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
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
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
  modalDropdownTrigger: {
    height: 44,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalDropdownValue: {
    flex: 1,
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '600',
  },
  modalDropdownChevron: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '700',
  },
  modalDropdownMenu: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  modalDropdownScroll: {
    maxHeight: 220,
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