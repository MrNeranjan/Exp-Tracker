import { ExpenseItem, ExpenseItemCard } from '@/components/expense/expense-item-card';
import { FloatingAddButton } from '@/components/ui/floating-add-button';
import { Reveal } from '@/components/ui/reveal';
import {
  addGiveTakeEntry,
  deleteGiveTakeEntry,
  getGiveTakeEntries,
  updateGiveTakeEntry,
} from '@/services/give-take-service';
import type { LiabilityEntry } from '@/services/models';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type LedgerType = 'i-gave' | 'i-owe';

const formatMoney = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
  }).format(value);

export default function GiveTabScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ newLiability?: string }>();
  const handledPayload = useRef<string | null>(null);
  const [entries, setEntries] = useState<LiabilityEntry[]>([]);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<LiabilityEntry | null>(null);
  const [editPerson, setEditPerson] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState<LedgerType>('i-gave');
  const [editNote, setEditNote] = useState('');

  const loadEntries = useCallback(async () => {
    const storedEntries = await getGiveTakeEntries();
    setEntries(storedEntries);
  }, []);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  useFocusEffect(
    useCallback(() => {
      void loadEntries();
    }, [loadEntries])
  );

  const isEditValid = useMemo(() => {
    const parsedAmount = Number(editAmount.replace(/,/g, ''));
    return Number.isFinite(parsedAmount) && parsedAmount > 0 && editPerson.trim().length > 0;
  }, [editAmount, editPerson]);

  const handleDeleteRecord = (entry: LiabilityEntry) => {
    setOpenActionMenuId(null);
    Alert.alert('Remove this record?', 'Use this when the give/take is settled.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setEntries((prev) => prev.filter((item) => item.id !== entry.id));
          await deleteGiveTakeEntry(entry.id);
        },
      },
    ]);
  };

  const handleOpenEdit = (entry: LiabilityEntry) => {
    setOpenActionMenuId(null);
    setEditingEntry(entry);
    setEditPerson(entry.person);
    setEditAmount(String(entry.amount));
    setEditType(entry.type);
    setEditNote(entry.note ?? '');
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) {
      return;
    }

    const parsedAmount = Number(editAmount.replace(/,/g, ''));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || !editPerson.trim()) {
      return;
    }

    const nextEntries = entries.map((entry) =>
        entry.id === editingEntry.id
          ? {
              ...entry,
              person: editPerson.trim(),
              amount: parsedAmount,
              type: editType,
              note: editNote.trim() || undefined,
            }
          : entry
      );

    setEntries(nextEntries);
    const updated = nextEntries.find((entry) => entry.id === editingEntry.id);
    if (updated) {
      await updateGiveTakeEntry(updated);
    }

    setEditingEntry(null);
  };

  useEffect(() => {
    const payloadParam = Array.isArray(params.newLiability)
      ? params.newLiability[0]
      : params.newLiability;

    if (!payloadParam || handledPayload.current === payloadParam) {
      return;
    }

    try {
      const parsedEntry = JSON.parse(decodeURIComponent(payloadParam)) as LiabilityEntry;
      setEntries((prev) => {
        if (prev.some((item) => item.id === parsedEntry.id)) {
          return prev;
        }
        return [parsedEntry, ...prev];
      });
      void addGiveTakeEntry(parsedEntry);
      void loadEntries();
      handledPayload.current = payloadParam;
    } catch {
      handledPayload.current = payloadParam;
    }
  }, [loadEntries, params.newLiability]);

  const totals = useMemo(() => {
    let receivable = 0;
    let payable = 0;

    for (const entry of entries) {
      if (entry.type === 'i-gave') {
        receivable += entry.amount;
      } else {
        payable += entry.amount;
      }
    }

    return { receivable, payable, net: receivable - payable };
  }, [entries]);

  const expenseLikeRecords: ExpenseItem[] = useMemo(
    () =>
      entries.map((entry) => {
        const isReceivable = entry.type === 'i-gave';

        return {
          id: entry.id,
          merchant: entry.person,
          amount: entry.amount,
          amountPrefix: isReceivable ? '+' : '-',
          category: isReceivable ? 'Receivable' : 'Payable',
          time: entry.dateLabel,
          note: entry.note,
          createdAt: entry.createdAt,
          icon: isReceivable ? 'arrow-down-circle' : 'arrow-up-circle',
          iconColor: isReceivable ? '#0F9D58' : '#DC2626',
          categoryColor: isReceivable ? '#0F9D58' : '#DC2626',
        };
      }),
    [entries]
  );

  const handleEditFromCard = (record: ExpenseItem) => {
    const target = entries.find((entry) => entry.id === record.id);
    if (!target) {
      return;
    }

    handleOpenEdit(target);
  };

  const handleDeleteFromCard = (record: ExpenseItem) => {
    const target = entries.find((entry) => entry.id === record.id);
    if (!target) {
      return;
    }

    handleDeleteRecord(target);
  };

  const handleToggleActionMenu = (record: ExpenseItem) => {
    setOpenActionMenuId((prev) => (prev === record.id ? null : record.id));
  };

  const handleCloseActionMenu = () => {
    setOpenActionMenuId(null);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Reveal delay={30}>
          <Text style={styles.pageTitle}>Give / Take</Text>
        </Reveal>

        <Reveal delay={260}>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, styles.receivableCard]}>
              <Text style={styles.summaryLabel}>Others Owe Me</Text>
              <Text style={styles.summaryValue}>{formatMoney(totals.receivable)}</Text>
            </View>
            <View style={[styles.summaryCard, styles.payableCard]}>
              <Text style={styles.summaryLabel}>I Owe</Text>
              <Text style={styles.summaryValue}>{formatMoney(totals.payable)}</Text>
            </View>
          </View>
        </Reveal>

        <Reveal delay={140}>
          <View style={styles.netCard}>
            <Text style={styles.netLabel}>Net Balance</Text>
            <Text style={[styles.netValue, totals.net >= 0 ? styles.netPositive : styles.netNegative]}>
              {totals.net >= 0 ? '+' : '-'}{formatMoney(Math.abs(totals.net))}
            </Text>
          </View>
        </Reveal>

        <Reveal delay={200}>
          <Text style={styles.sectionTitle}>Recent Records</Text>
        </Reveal>

        {entries.length === 0 ? (
          <Reveal delay={240}>
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No give/take records yet. Tap + to add one.</Text>
            </View>
          </Reveal>
        ) : null}

        {entries.length > 0 ? (
          <Reveal delay={240}>
            <View style={styles.groupCard}>
              {expenseLikeRecords.map((record, index) => (
                <ExpenseItemCard
                  key={record.id}
                  expense={record}
                  showDivider={index < expenseLikeRecords.length - 1}
                  showActions
                  isMenuOpen={openActionMenuId === record.id}
                  onToggleMenu={handleToggleActionMenu}
                  onCloseMenu={handleCloseActionMenu}
                  onEdit={handleEditFromCard}
                  onDelete={handleDeleteFromCard}
                />
              ))}
            </View>
          </Reveal>
        ) : null}
      </ScrollView>

      <Modal
        visible={!!editingEntry}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingEntry(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Give/Take Record</Text>

            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={styles.modalBodyContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              <Text style={styles.modalLabel}>Person / Reference</Text>
              <TextInput
                value={editPerson}
                onChangeText={setEditPerson}
                style={styles.modalInput}
                placeholder="Name or source"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.modalLabel}>Amount</Text>
              <TextInput
                value={editAmount}
                onChangeText={setEditAmount}
                keyboardType="decimal-pad"
                style={styles.modalInput}
                placeholder="0.00"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.modalLabel}>Type</Text>
              <View style={styles.typeRow}>
                <Pressable
                  style={[styles.typeButton, editType === 'i-gave' && styles.typeButtonActiveGreen]}
                  onPress={() => setEditType('i-gave')}>
                  <Text style={[styles.typeButtonText, editType === 'i-gave' && styles.typeButtonTextActiveGreen]}>
                    Receivable
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.typeButton, editType === 'i-owe' && styles.typeButtonActiveRed]}
                  onPress={() => setEditType('i-owe')}>
                  <Text style={[styles.typeButtonText, editType === 'i-owe' && styles.typeButtonTextActiveRed]}>
                    Payable
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.modalLabel}>Note (Optional)</Text>
              <TextInput
                value={editNote}
                onChangeText={setEditNote}
                style={[styles.modalInput, styles.modalNoteInput]}
                placeholder="Reason or context"
                placeholderTextColor="#94A3B8"
                multiline
                textAlignVertical="top"
              />
            </ScrollView>

            <View style={styles.modalActionsRow}>
              <Pressable style={styles.modalCancelButton} onPress={() => setEditingEntry(null)}>
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

      <FloatingAddButton onPress={() => router.push('../add-liability')} delay={280} />
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
    gap: 10,
  },
  pageTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: '#0F172A',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
  },
  receivableCard: {
    backgroundColor: '#ECFDF3',
    borderColor: '#86EFAC',
  },
  payableCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  summaryLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: '#334155',
    fontWeight: '600',
  },
  summaryValue: {
    marginTop: 6,
    fontSize: 20,
    lineHeight: 24,
    color: '#0F172A',
    fontWeight: '800',
  },
  netCard: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  netLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  netValue: {
    marginTop: 4,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },
  netPositive: {
    color: '#0F9D58',
  },
  netNegative: {
    color: '#DC2626',
  },
  sectionTitle: {
    marginTop: 2,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: '#334155',
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    paddingTop: 14,
    paddingBottom: 12,
    gap: 8,
    width: '100%',
    maxHeight: '88%',
    overflow: 'hidden',
  },
  modalBody: {
    maxHeight: 420,
  },
  modalBodyContent: {
    gap: 8,
    paddingBottom: 6,
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
  modalNoteInput: {
    height: 96,
    minHeight: 86,
    paddingTop: 10,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  typeButtonActiveGreen: {
    backgroundColor: '#ECFDF3',
    borderColor: '#22C55E',
  },
  typeButtonActiveRed: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  typeButtonTextActiveGreen: {
    color: '#15803D',
  },
  typeButtonTextActiveRed: {
    color: '#B91C1C',
  },
  modalActionsRow: {
    marginTop: 6,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
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
