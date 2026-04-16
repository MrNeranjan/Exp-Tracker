import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

export type GiveTakeRecord = {
  id: string;
  person: string;
  amount: number;
  type: 'receivable' | 'payable';
  dateLabel: string;
};

type RecentGiveTakeCardProps = {
  records: GiveTakeRecord[];
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
  }).format(value);

export function RecentGiveTakeCard({ records }: RecentGiveTakeCardProps) {
  if (!records.length) {
    return (
      <View style={styles.card}>
        <Text style={styles.emptyText}>No give/take records yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {records.map((record, index) => {
        const isReceivable = record.type === 'receivable';

        return (
          <View key={record.id} style={[styles.row, index < records.length - 1 && styles.rowDivider]}>
            <View style={styles.leftWrap}>
              <Ionicons
                name={isReceivable ? 'arrow-down-circle' : 'arrow-up-circle'}
                size={20}
                color={isReceivable ? '#0F9D58' : '#DC2626'}
              />
              <View>
                <Text style={styles.personText}>{record.person}</Text>
                <Text style={styles.metaText}>{record.dateLabel}</Text>
              </View>
            </View>

            <View style={styles.rightWrap}>
              <Text style={[styles.amountText, isReceivable ? styles.receivableText : styles.payableText]}>
                {isReceivable ? '+' : '-'}{formatMoney(record.amount)}
              </Text>
              <Text style={styles.metaText}>{isReceivable ? 'Receivable' : 'Payable'}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  leftWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  rightWrap: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  personText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
  },
  receivableText: {
    color: '#0F9D58',
  },
  payableText: {
    color: '#DC2626',
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280',
    paddingVertical: 14,
    fontWeight: '600',
  },
});
