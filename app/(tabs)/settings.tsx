import { Reveal } from '@/components/ui/reveal';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsTabScreen() {
  const [sheetUrl, setSheetUrl] = useState('https://sheets.googleapis.com/v1/...');
  const [budgetAmount, setBudgetAmount] = useState('3500.00');

  const handleBudgetChange = (value: string) => {
    // Keep typing fully responsive; sanitize only on blur.
    setBudgetAmount(value);
  };

  const formatBudgetToTwoDecimals = () => {
    const normalized = budgetAmount.replace(',', '.');
    const cleaned = normalized.replace(/[^0-9.]/g, '');
    const firstDotIndex = cleaned.indexOf('.');
    const compactValue =
      firstDotIndex === -1
        ? cleaned
        : `${cleaned.slice(0, firstDotIndex)}.${cleaned
            .slice(firstDotIndex + 1)
            .replace(/\./g, '')}`;

    const numericValue = Number.parseFloat(compactValue);

    if (Number.isNaN(numericValue)) {
      setBudgetAmount('0.00');
      return;
    }

    setBudgetAmount(numericValue.toFixed(2));
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Reveal delay={30}>
          <Text style={styles.pageTitle}>Settings</Text>
        </Reveal>

        <Reveal delay={90}>
          <View style={styles.card}>
          <Text style={styles.cardTitle}>Google Sheet Integration</Text>

          <Text style={styles.fieldLabel}>Sheet API Endpoint (URL)</Text>
          <TextInput
            value={sheetUrl}
            onChangeText={setSheetUrl}
            style={styles.urlInput}
            placeholder="https://sheets.googleapis.com/v1/..."
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Pressable accessibilityRole="button" accessibilityLabel="Sync Google Sheet" onPress={() => {}}>
            <LinearGradient
              colors={['#43A36F', '#3C9D67']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Sync Google Sheet</Text>
            </LinearGradient>
          </Pressable>
          </View>
        </Reveal>

        <Reveal delay={160}>
          <View style={styles.card}>
          <Text style={styles.cardTitle}>Budget Configuration</Text>

          <Text style={styles.fieldLabel}>Set Monthly Budget</Text>

          <View style={styles.budgetInputRow}>
            <View style={styles.currencyPrefixBox}>
              <Text style={styles.currencyPrefixText}>LKR</Text>
            </View>

            <TextInput
              value={budgetAmount}
              onChangeText={handleBudgetChange}
              onBlur={formatBudgetToTwoDecimals}
              style={styles.budgetInput}
              keyboardType="decimal-pad"
              inputMode="decimal"
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
              selectTextOnFocus
            />
          </View>

          <Text style={styles.helpText}>Update this amount to change your budget for the next month.</Text>

          <Pressable accessibilityRole="button" accessibilityLabel="Save Budget" onPress={() => {}}>
            <LinearGradient
              colors={['#2D7BC8', '#286CB2']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.secondaryButton}>
              <Text style={styles.primaryButtonText}>Save Budget</Text>
            </LinearGradient>
          </Pressable>
          </View>
        </Reveal>
      </ScrollView>
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
    paddingBottom: 26,
    gap: 10,
  },
  pageTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: '#0F172A',
  },
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
  cardTitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#111827',
    fontWeight: '700',
    marginBottom: 2,
  },
  fieldLabel: {
    fontSize: 12,
    lineHeight: 18,
    color: '#111827',
    fontWeight: '500',
    marginBottom: 4,
  },
  urlInput: {
    height: 38,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 12,
    color: '#374151',
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  primaryButton: {
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  budgetInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  currencyPrefixBox: {
    height: '100%',
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#D1D5DB',
    backgroundColor: '#F3F4F6',
  },
  currencyPrefixText: {
    fontSize: 16,
    lineHeight: 20,
    color: '#111827',
    fontWeight: '500',
  },
  budgetInput: {
    flex: 1,
    height: '100%',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '500',
    color: '#111827',
    letterSpacing: 0.5,
    paddingHorizontal: 10,
    paddingVertical: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  helpText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#111827',
    marginBottom: 8,
  },
});