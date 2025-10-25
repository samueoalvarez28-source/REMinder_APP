import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Moon, Clock, Sparkles } from 'lucide-react-native';
import { calculateWakeTimes, calculateSleepTimes, SuggestedTime } from '@/utils/remCalculator';
import { supabase } from '@/lib/supabase';

type CalculatorMode = 'sleep-to-wake' | 'wake-to-sleep';

export default function CalculatorScreen() {
  const [mode, setMode] = useState<CalculatorMode>('sleep-to-wake');
  const [sleepTime, setSleepTime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [suggestions, setSuggestions] = useState<SuggestedTime[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    if (mode === 'sleep-to-wake') {
      if (!sleepTime || !wakeTime) {
        Alert.alert('Missing Information', 'Please enter both sleep and wake times');
        return;
      }
      const results = calculateWakeTimes(sleepTime, wakeTime);
      if (results.length === 0) {
        Alert.alert('Not Enough Sleep', 'The time window is too short for optimal REM cycles. Try going to sleep earlier or waking up later.');
        return;
      }
      setSuggestions(results);
    } else {
      if (!wakeTime) {
        Alert.alert('Missing Information', 'Please enter your wake time');
        return;
      }
      const results = calculateSleepTimes(wakeTime);
      setSuggestions(results);
    }
    setShowResults(true);
  };

  const handleSelectAlarm = async (suggestion: SuggestedTime) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase.from('sleep_records').insert({
          user_id: user.id,
          sleep_time: mode === 'sleep-to-wake' ? sleepTime : suggestion.time,
          wake_time: mode === 'sleep-to-wake' ? suggestion.time : wakeTime,
          selected_alarm: suggestion.time,
        });
        Alert.alert('Saved', 'Your sleep schedule has been saved to history');
      } else {
        Alert.alert('Success', `Set your alarm for ${suggestion.time}`);
      }
    } catch (error) {
      Alert.alert('Success', `Set your alarm for ${suggestion.time}`);
    }
  };

  const handleReset = () => {
    setShowResults(false);
    setSuggestions([]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Moon size={32} color="#6366f1" />
        </View>
        <Text style={styles.title}>REMinder</Text>
        <Text style={styles.subtitle}>Optimize your sleep cycles</Text>
      </View>

      {!showResults ? (
        <>
          <View style={styles.modeSelector}>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'sleep-to-wake' && styles.modeButtonActive]}
              onPress={() => setMode('sleep-to-wake')}>
              <Text style={[styles.modeButtonText, mode === 'sleep-to-wake' && styles.modeButtonTextActive]}>
                I know when I sleep
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'wake-to-sleep' && styles.modeButtonActive]}
              onPress={() => setMode('wake-to-sleep')}>
              <Text style={[styles.modeButtonText, mode === 'wake-to-sleep' && styles.modeButtonTextActive]}>
                I know when I wake
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputSection}>
            {mode === 'sleep-to-wake' ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Bedtime</Text>
                  <View style={styles.inputWrapper}>
                    <Clock size={20} color="#6366f1" />
                    <TextInput
                      style={styles.input}
                      value={sleepTime}
                      onChangeText={setSleepTime}
                      placeholder="22:00"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Wake Up Time</Text>
                  <View style={styles.inputWrapper}>
                    <Clock size={20} color="#6366f1" />
                    <TextInput
                      style={styles.input}
                      value={wakeTime}
                      onChangeText={setWakeTime}
                      placeholder="07:00"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Wake Up Time</Text>
                <View style={styles.inputWrapper}>
                  <Clock size={20} color="#6366f1" />
                  <TextInput
                    style={styles.input}
                    value={wakeTime}
                    onChangeText={setWakeTime}
                    placeholder="07:00"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
            )}

            <View style={styles.infoBox}>
              <Sparkles size={16} color="#6366f1" />
              <Text style={styles.infoText}>
                A complete sleep cycle is 90 minutes. We'll add 15 minutes for you to fall asleep.
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
            <Text style={styles.calculateButtonText}>Calculate Optimal Times</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              {mode === 'sleep-to-wake' ? 'Optimal Wake Times' : 'Optimal Bedtimes'}
            </Text>
            <Text style={styles.resultsSubtitle}>
              {mode === 'sleep-to-wake'
                ? 'Choose a wake time that completes full REM cycles'
                : 'Choose a bedtime to wake up refreshed'}
            </Text>
          </View>

          <View style={styles.suggestionsList}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.suggestionCard, index === 0 && styles.suggestionCardRecommended]}
                onPress={() => handleSelectAlarm(suggestion)}>
                {index === 0 && (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedBadgeText}>RECOMMENDED</Text>
                  </View>
                )}
                <Text style={styles.suggestionTime}>{suggestion.time}</Text>
                <View style={styles.suggestionDetails}>
                  <Text style={styles.suggestionCycles}>{suggestion.cycles} complete cycles</Text>
                  <Text style={styles.suggestionDuration}>{suggestion.totalSleep} of sleep</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Calculate Again</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 32,
    backgroundColor: '#ffffff',
  },
  headerIcon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  modeSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  modeButtonActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  modeButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  modeButtonTextActive: {
    color: '#6366f1',
  },
  inputSection: {
    padding: 16,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#111827',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eef2ff',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#4f46e5',
    lineHeight: 20,
  },
  calculateButton: {
    marginHorizontal: 16,
    marginVertical: 24,
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  calculateButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  resultsHeader: {
    padding: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  suggestionsList: {
    padding: 16,
    gap: 12,
  },
  suggestionCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  suggestionCardRecommended: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },
  recommendedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#6366f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  recommendedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  suggestionTime: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  suggestionDetails: {
    gap: 4,
  },
  suggestionCycles: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  suggestionDuration: {
    fontSize: 14,
    color: '#6b7280',
  },
  resetButton: {
    marginHorizontal: 16,
    marginVertical: 24,
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  resetButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
});
