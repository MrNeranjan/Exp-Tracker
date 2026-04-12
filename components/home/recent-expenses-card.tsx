import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

export type ExpenseItem = {
  id: string;
  merchant: string;
  amount: number;
  category: string;
  time: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type RecentExpensesCardProps = {
  expenses: ExpenseItem[];
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
  }).format(value);

export function RecentExpensesCard({ expenses }: RecentExpensesCardProps) {
  return (
    <View style={styles.card}>
      {expenses.map((expense, index) => (
        <View
          key={expense.id}
          style={[styles.expenseRow, index < expenses.length - 1 && styles.rowDivider]}>
          <View style={styles.expenseLeft}>
            <Ionicons name={expense.icon} size={22} color="#111827" style={styles.expenseIcon} />
            <View>
              <Text style={styles.expenseMerchant}>{expense.merchant}</Text>
              <Text style={styles.expenseMeta}>{expense.time}</Text>
            </View>
          </View>

          <View style={styles.expenseRight}>
            <Text style={styles.expenseAmount}>-{formatMoney(expense.amount)}</Text>
            <Text style={styles.expenseMeta}>{expense.category}</Text>
          </View>
        </View>
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
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expenseIcon: {
    marginRight: 8,
  },
  expenseMerchant: {
    fontSize: 17,
    color: '#111827',
    fontWeight: '600',
  },
  expenseRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  expenseAmount: {
    fontSize: 17,
    color: '#111827',
    fontWeight: '600',
  },
  expenseMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
});