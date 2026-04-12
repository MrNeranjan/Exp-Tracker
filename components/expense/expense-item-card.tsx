import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

export type ExpenseItem = {
  id: string;
  merchant: string;
  amount: number;
  category: string;
  time: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  categoryColor?: string;
};

type ExpenseItemCardProps = {
  expense: ExpenseItem;
  showDivider?: boolean;
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
  }).format(value);

export function ExpenseItemCard({ expense, showDivider = false }: ExpenseItemCardProps) {
  return (
    <View style={[styles.expenseRow, showDivider && styles.rowDivider]}>
      <View style={styles.expenseLeft}>
        <Ionicons
          name={expense.icon}
          size={22}
          color={expense.iconColor ?? '#111827'}
          style={styles.expenseIcon}
        />
        <View>
          <Text style={styles.expenseMerchant}>{expense.merchant}</Text>
          <Text style={styles.expenseMeta}>{expense.time}</Text>
        </View>
      </View>

      <View style={styles.expenseRight}>
        <Text style={styles.expenseAmount}>-{formatMoney(expense.amount)}</Text>
        <Text style={[styles.expenseMeta, expense.categoryColor && { color: expense.categoryColor }]}>
          {expense.category}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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