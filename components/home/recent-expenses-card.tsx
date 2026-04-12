import { ExpenseItemCard, type ExpenseItem } from '@/components/expense/expense-item-card';
import { StyleSheet, View } from 'react-native';

export type { ExpenseItem };

type RecentExpensesCardProps = {
  expenses: ExpenseItem[];
};

export function RecentExpensesCard({ expenses }: RecentExpensesCardProps) {
  return (
    <View style={styles.card}>
      {expenses.map((expense, index) => (
        <ExpenseItemCard
          key={expense.id}
          expense={expense}
          showDivider={index < expenses.length - 1}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
});