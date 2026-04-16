import { MonthlyBreakdownCard, type CategoryBreakdown } from '@/components/home/monthly-breakdown-card';
import { MonthlySummaryCard } from '@/components/home/monthly-summary-card';
import { RecentExpensesCard, type ExpenseItem } from '@/components/home/recent-expenses-card';
import { FloatingAddButton } from '@/components/ui/floating-add-button';
import { Reveal } from '@/components/ui/reveal';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const monthlyBudget = 3500;
const totalSpent = 2845.6;
const categoryData: CategoryBreakdown[] = [
  { label: 'Food & Dining', percent: 35, amount: 1651, color: '#4C8ED9' },
  { label: 'Rent & Utilities', percent: 25, amount: 711, color: '#4FA767' },
  { label: 'Transport', percent: 12, amount: 427, color: '#F39B2E' },
  { label: 'Shopping', percent: 12, amount: 241, color: '#E0A11B' },
  { label: 'Entertainment', percent: 10, amount: 288, color: '#E36742' },
  { label: 'Others', percent: 6, amount: 142, color: '#8A96AC' },
];

const recentExpenses: ExpenseItem[] = [
  {
    id: '1',
    merchant: 'Whole Foods Market',
    amount: 145.3,
    category: 'Food',
    time: 'Oct 28, 4:15 PM',
    icon: 'cart',
  },
  {
    id: '2',
    merchant: 'Uber Ride',
    amount: 24.5,
    category: 'Travel',
    time: 'Oct 25, 4:15 PM',
    icon: 'car',
  },
  {
    id: '3',
    merchant: 'Shell Gas Station',
    amount: 20,
    category: 'Fuel',
    time: 'Oct 25, 4:15 PM',
    icon: 'flame',
  },
];

export default function HomeTabScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ newExpense?: string }>();
  const handledPayload = useRef<string | null>(null);

  const [totalSpentValue, setTotalSpentValue] = useState(totalSpent);
  const [recentExpensesState, setRecentExpensesState] = useState(recentExpenses);

  useEffect(() => {
    const payloadParam = Array.isArray(params.newExpense) ? params.newExpense[0] : params.newExpense;

    if (!payloadParam || handledPayload.current === payloadParam) {
      return;
    }

    try {
      const parsedExpense = JSON.parse(decodeURIComponent(payloadParam)) as ExpenseItem;
      setRecentExpensesState((prev) => {
        if (prev.some((item) => item.id === parsedExpense.id)) {
          return prev;
        }
        return [parsedExpense, ...prev].slice(0, 6);
      });
      setTotalSpentValue((prev) => prev + parsedExpense.amount);
      handledPayload.current = payloadParam;
    } catch {
      handledPayload.current = payloadParam;
    }
  }, [params.newExpense]);

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
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
        </Reveal>
        <Reveal delay={260}>
          <RecentExpensesCard expenses={recentExpensesState} />
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