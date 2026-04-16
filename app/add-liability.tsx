import { addGiveTakeEntry } from '@/services/give-take-service';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type LiabilityType = 'i-gave' | 'i-owe';

const formatDateLabel = (value: Date) =>
  value.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

export default function AddLiabilityScreen() {
  const router = useRouter();

  const [amount, setAmount] = useState('');
  const [person, setPerson] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());
  const [type, setType] = useState<LiabilityType>('i-gave');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const canSave = useMemo(() => {
    const parsedAmount = Number(amount.replace(/,/g, ''));
    return Number.isFinite(parsedAmount) && parsedAmount > 0 && person.trim().length > 0;
  }, [amount, person]);

  const onDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSave = async () => {
    const parsedAmount = Number(amount.replace(/,/g, ''));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setSubmitError('Please enter a valid amount before saving.');
      return;
    }

    if (!person.trim()) {
      setSubmitError('Please add a person or reference name.');
      return;
    }

    const payload = {
      id: `liability-${Date.now()}`,
      person: person.trim(),
      amount: parsedAmount,
      type,
      dateLabel: formatDateLabel(date),
      note: note.trim() || undefined,
      createdAt: date.toISOString(),
    };

    setSubmitError(null);
    await addGiveTakeEntry(payload);
    router.replace({
      pathname: '/(tabs)/give',
    });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.headerRow}>
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={22} color="#0F172A" />
          </Pressable>
          <Text style={styles.headerTitle}>Add Give/Take</Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.typeRow}>
              <Pressable
                style={[styles.typeButton, type === 'i-gave' && styles.typeButtonActiveGreen]}
                onPress={() => setType('i-gave')}>
                <Text style={[styles.typeButtonText, type === 'i-gave' && styles.typeButtonTextActiveGreen]}>
                  I gave money
                </Text>
              </Pressable>
              <Pressable
                style={[styles.typeButton, type === 'i-owe' && styles.typeButtonActiveRed]}
                onPress={() => setType('i-owe')}>
                <Text style={[styles.typeButtonText, type === 'i-owe' && styles.typeButtonTextActiveRed]}>
                  I need to pay
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              autoFocus
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#94A3B8"
              returnKeyType="done"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Person / Reference</Text>
            <TextInput
              style={styles.input}
              value={person}
              onChangeText={setPerson}
              placeholder="Name or source"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Date</Text>
            <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color="#1D4ED8" />
              <Text style={styles.dateButtonText}>{formatDateLabel(date)}</Text>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Note (Optional)</Text>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="Reason or context"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!canSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardContainer: {
    flex: 1,
  },
  headerRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 120,
    gap: 16,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: '#334155',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  typeButtonActiveGreen: {
    backgroundColor: '#ECFDF3',
    borderColor: '#22C55E',
  },
  typeButtonActiveRed: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  typeButtonTextActiveGreen: {
    color: '#15803D',
  },
  typeButtonTextActiveRed: {
    color: '#B91C1C',
  },
  amountInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 72,
    fontSize: 40,
    fontWeight: '700',
    color: '#0F172A',
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  dateButton: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '600',
  },
  noteInput: {
    minHeight: 96,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0F172A',
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  saveButton: {
    height: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
  },
  saveButtonDisabled: {
    opacity: 0.45,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
  },
});
