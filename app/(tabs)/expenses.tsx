import { ExpenseItem, ExpenseItemCard } from '@/components/expense/expense-item-card';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ExpenseGroup = {
  monthLabel: string;
  entries: ExpenseItem[];
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
        time: 'Oct 28, 4:15 PM',
        icon: 'cart',
      },
      {
        id: 'oct-2',
        merchant: 'Uber Ride',
        amount: 24.5,
        category: 'Food',
        time: 'Oct 25, 4:15 AM',
        icon: 'car',
      },
      {
        id: 'oct-3',
        merchant: 'Shell Gas Station',
        amount: 20,
        category: 'Food',
        time: 'Oct 25, 4:15 PM',
        icon: 'flame',
      },
      {
        id: 'oct-4',
        merchant: 'Amazon.com',
        amount: 65.2,
        category: 'Shopping',
        time: 'Oct 24, 10:00 AM',
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
        icon: 'hammer',
      },
    ],
  },
];

export default function ExpensesTabScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Expenses</Text>

        {expenseGroups.map((group) => (
          <View key={group.monthLabel}>
            <Text style={styles.groupTitle}>{group.monthLabel}</Text>
            <View style={styles.groupCard}>
              {group.entries.map((expense, index) => (
                <ExpenseItemCard
                  key={expense.id}
                  expense={expense}
                  showDivider={index < group.entries.length - 1}
                />
              ))}
            </View>
          </View>
        ))}
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