import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

type MonthlySummaryCardProps = {
  totalSpent: number;
  monthlyBudget: number;
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
  }).format(value);

export function MonthlySummaryCard({ totalSpent, monthlyBudget }: MonthlySummaryCardProps) {
  const spentPercent = Math.min((totalSpent / monthlyBudget) * 100, 100);
  const remainingAmount = Math.max(monthlyBudget - totalSpent, 0);

  return (
    <View style={styles.card}>
      <Text style={styles.summaryLabel}>TOTAL SPENT THIS MONTH</Text>
      <Text style={styles.totalSpent}>{formatMoney(totalSpent)}</Text>

      <Text style={styles.budgetLabel}>MONTHLY BUDGET: {formatMoney(monthlyBudget)}</Text>

      <View style={styles.progressTrack}>
        <LinearGradient
          colors={['#43A36F', '#F29E2E']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.progressFill, { width: `${spentPercent}%` }]}
        />
      </View>

      <Text style={styles.remainingText}>{formatMoney(remainingAmount)} remaining</Text>
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
  summaryLabel: {
    textAlign: 'center',
    fontSize: 13,
    color: '#2A2A2A',
    fontWeight: '700',
  },
  totalSpent: {
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 10,
    fontSize: 46,
    lineHeight: 50,
    color: '#1F2937',
    fontWeight: '700',
  },
  budgetLabel: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '700',
    marginBottom: 6,
  },
  progressTrack: {
    position: 'relative',
    height: 18,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  remainingText: {
    textAlign: 'right',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '500',
    color: '#2A2A2A',
  },
});
