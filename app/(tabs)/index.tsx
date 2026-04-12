import { MonthlyBreakdownCard, type CategoryBreakdown } from '@/components/home/monthly-breakdown-card';
import { MonthlySummaryCard } from '@/components/home/monthly-summary-card';
import { RecentExpensesCard, type ExpenseItem } from '@/components/home/recent-expenses-card';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
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
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <MonthlySummaryCard totalSpent={totalSpent} monthlyBudget={monthlyBudget} />

        <Text style={styles.sectionTitle}>Breakdown</Text>
        <MonthlyBreakdownCard categories={categoryData} />

        <Text style={styles.sectionTitle}>Recent Expenses</Text>
        <RecentExpensesCard expenses={recentExpenses} />
      </ScrollView>

      <Pressable
        style={styles.quickActionButton}
        accessibilityRole="button"
        accessibilityLabel="Add expense entry"
        onPress={() => {}}>
        <Ionicons name="add" size={38} color="#FFFFFF" />
      </Pressable>
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
  quickActionButton: {
    position: 'absolute',
    right: 18,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2FC95E',
    shadowColor: '#2FC95E',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 9,
  },
});