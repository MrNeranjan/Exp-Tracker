import { FloatingAddButton } from '@/components/ui/floating-add-button';
import { Reveal } from '@/components/ui/reveal';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type LedgerType = 'i-gave' | 'i-owe';

type LiabilityEntry = {
  id: string;
  person: string;
  amount: number;
  type: LedgerType;
  dateLabel: string;
  note?: string;
  createdAt: string;
};

const today = new Date();

const formatDateLabel = (value: Date) =>
  value.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

const formatMoney = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
  }).format(value);

const initialEntries: LiabilityEntry[] = [
  {
    id: 'l-1',
    person: 'Nimal Perera',
    amount: 5000,
    type: 'i-gave',
    dateLabel: formatDateLabel(today),
    note: 'Emergency cash',
    createdAt: today.toISOString(),
  },
  {
    id: 'l-2',
    person: 'Book Store',
    amount: 2450,
    type: 'i-owe',
    dateLabel: 'Apr 11, 2026',
    note: 'Reference books',
    createdAt: '2026-04-11T06:20:00.000Z',
  },
];

export default function GiveTabScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ newLiability?: string }>();
  const handledPayload = useRef<string | null>(null);
  const [entries, setEntries] = useState(initialEntries);

  const handleDeleteRecord = (entry: LiabilityEntry) => {
    Alert.alert('Remove this record?', 'Use this when the give/take is settled.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setEntries((prev) => prev.filter((item) => item.id !== entry.id));
        },
      },
    ]);
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
      handledPayload.current = payloadParam;
    } catch {
      handledPayload.current = payloadParam;
    }
  }, [params.newLiability]);

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

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Reveal delay={30}>
          <Text style={styles.pageTitle}>Give / Take</Text>
        </Reveal>

        <Reveal delay={90}>
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

        {entries.map((entry, index) => {
          const isReceivable = entry.type === 'i-gave';

          return (
            <Reveal key={entry.id} delay={240 + index * 50}>
              <View style={styles.entryCard}>
                <View style={styles.entryTopRow}>
                  <View style={styles.personWrap}>
                    <Ionicons
                      name={isReceivable ? 'arrow-down-circle' : 'arrow-up-circle'}
                      size={20}
                      color={isReceivable ? '#0F9D58' : '#DC2626'}
                    />
                    <Text style={styles.personName}>{entry.person}</Text>
                  </View>
                  <View style={styles.amountActionWrap}>
                    <Text
                      style={[styles.entryAmount, isReceivable ? styles.incomeAmount : styles.outgoingAmount]}>
                      {isReceivable ? '+' : '-'}{formatMoney(entry.amount)}
                    </Text>
                    <Pressable
                      style={styles.deleteButton}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove record for ${entry.person}`}
                      onPress={() => handleDeleteRecord(entry)}>
                      <Ionicons name="trash-outline" size={15} color="#B91C1C" />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.entryMetaRow}>
                  <Text style={styles.entryMeta}>{entry.dateLabel}</Text>
                  <Text style={styles.entryMeta}>{isReceivable ? 'Receivable' : 'Payable'}</Text>
                </View>

                {entry.note ? <Text style={styles.noteText}>{entry.note}</Text> : null}
              </View>
            </Reveal>
          );
        })}
      </ScrollView>

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
  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 5,
  },
  entryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  personWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  personName: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '600',
  },
  entryAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  amountActionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  incomeAmount: {
    color: '#0F9D58',
  },
  outgoingAmount: {
    color: '#DC2626',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  entryMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  entryMeta: {
    fontSize: 12,
    color: '#64748B',
  },
  noteText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#475569',
  },
});
