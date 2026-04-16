import { MonthlyBreakdownCard, type CategoryBreakdown } from '@/components/home/monthly-breakdown-card';
import { MonthlySummaryCard } from '@/components/home/monthly-summary-card';
import { RecentGiveTakeCard, type GiveTakeRecord } from '@/components/home/recent-give-take-card';
import { FloatingAddButton } from '@/components/ui/floating-add-button';
import { Reveal } from '@/components/ui/reveal';
import { getExpenses } from '@/services/expense-service';
import { getGiveTakeEntries } from '@/services/give-take-service';
import { getSettings } from '@/services/settings-service';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const colorForIndex = (index: number) => {
  // Golden-angle hues prevent near-duplicates while scaling to many categories.
  const hue = (index * 137.508) % 360;
  return `hsl(${hue}, 68%, 50%)`;
};

const toExpenseDate = (createdAt?: string) => {
  if (!createdAt) {
    return new Date();
  }

  const parsed = new Date(createdAt);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

export default function HomeTabScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ newExpense?: string }>();
  const handledPayload = useRef<string | null>(null);

  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [totalSpentValue, setTotalSpentValue] = useState(0);
  const [categoryData, setCategoryData] = useState<CategoryBreakdown[]>([]);
  const [recentGiveTakeRecords, setRecentGiveTakeRecords] = useState<GiveTakeRecord[]>([]);

  const hydrateDashboard = useCallback(async () => {
    const [expenses, settings, giveTake] = await Promise.all([
      getExpenses(),
      getSettings(),
      getGiveTakeEntries(),
    ]);

    const now = new Date();
    const currentMonthExpenses = expenses.filter((item) => {
      const date = toExpenseDate(item.createdAt);
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    });

    setMonthlyBudget(settings.monthlyBudget || 0);
    setTotalSpentValue(currentMonthExpenses.reduce((sum, item) => sum + item.amount, 0));

    const amountsByCategory = currentMonthExpenses.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + item.amount;
      return acc;
    }, {});

    const total = currentMonthExpenses.reduce((sum, item) => sum + item.amount, 0);
    const categories = Object.entries(amountsByCategory)
      .sort((a, b) => b[1] - a[1])
      .map(([label, amount], index) => ({
        label,
        amount,
        percent: total > 0 ? Math.round((amount / total) * 100) : 0,
        color: colorForIndex(index),
      }));

    setCategoryData(categories);

    const records: GiveTakeRecord[] = giveTake.slice(0, 6).map((entry) => ({
      id: entry.id,
      person: entry.person,
      amount: entry.amount,
      type: entry.type === 'i-gave' ? 'receivable' : 'payable',
      dateLabel: entry.dateLabel,
    }));

    setRecentGiveTakeRecords(records);
  }, []);

  useEffect(() => {
    void hydrateDashboard();
  }, [hydrateDashboard]);

  useFocusEffect(
    useCallback(() => {
      void hydrateDashboard();
    }, [hydrateDashboard])
  );

  useEffect(() => {
    const payloadParam = Array.isArray(params.newExpense) ? params.newExpense[0] : params.newExpense;

    if (!payloadParam || handledPayload.current === payloadParam) {
      return;
    }

    void hydrateDashboard();
    handledPayload.current = payloadParam;
  }, [hydrateDashboard, params.newExpense]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Reveal delay={40}>
          <MonthlySummaryCard totalSpent={totalSpentValue} monthlyBudget={monthlyBudget} />
        </Reveal>

        <Reveal delay={110}>
          <Text style={styles.sectionTitle}>Breakdown</Text>
        </Reveal>
        <Reveal delay={150}>
          <MonthlyBreakdownCard categories={categoryData} />
        </Reveal>

        <Reveal delay={220}>
          <Text style={styles.sectionTitle}>Recent Give/Take Records</Text>
        </Reveal>
        <Reveal delay={260}>
          <RecentGiveTakeCard records={recentGiveTakeRecords} />
        </Reveal>
      </ScrollView>

      <FloatingAddButton onPress={() => router.push('../add-expense')} delay={320} />
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
    paddingTop: 16,
    paddingBottom: 22,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 24,
    lineHeight: 30,
    color: '#1F2937',
    fontWeight: '700',
    marginTop: 4,
  },
});