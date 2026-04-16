import { StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

export type CategoryBreakdown = {
  label: string;
  amount: number;
  color: string;
  percent: number;
};

type MonthlyBreakdownCardProps = {
  categories: CategoryBreakdown[];
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
  }).format(value);

export function MonthlyBreakdownCard({ categories }: MonthlyBreakdownCardProps) {
  if (!categories.length) {
    return (
      <View style={styles.card}>
        <Text style={styles.emptyText}>No expense data yet.</Text>
      </View>
    );
  }

  const pieData = categories.map((item) => ({
    value: item.percent,
    color: item.color,
  }));

  return (
    <View style={styles.card}>
      <View style={styles.chartWrap}>
        <PieChart
          data={pieData}
          donut
          radius={80}
          innerRadius={42}
          innerCircleColor="#FFFFFF"
          strokeColor="#FFFFFF"
          strokeWidth={2}
          showValuesAsLabels
          textSize={11}
          textColor="#FFFFFF"
          centerLabelComponent={() => <Text style={styles.centerLabel}>Type</Text>}
        />
      </View>

      <View style={styles.legendGrid}>
        {categories.map((item) => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <View style={styles.legendTextWrap}>
              <Text style={styles.legendLabel}>{item.label}</Text>
              <Text style={styles.legendMeta}>
                {item.percent}% - {formatMoney(item.amount)}
              </Text>
            </View>
          </View>
        ))}
      </View>
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
  chartWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  centerLabel: {
    fontSize: 20,
    color: '#1F2937',
    fontWeight: '700',
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendTitle: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '700',
    marginBottom: 6,
  },
  legendItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    paddingRight: 8,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 99,
    marginTop: 5,
    marginRight: 6,
  },
  legendTextWrap: {
    flex: 1,
  },
  legendLabel: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '600',
  },
  legendMeta: {
    fontSize: 11,
    color: '#4B5563',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280',
    paddingVertical: 14,
    fontWeight: '600',
  },
});
