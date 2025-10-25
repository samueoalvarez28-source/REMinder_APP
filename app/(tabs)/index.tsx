import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { Moon, Clock, Sparkles, Plus, X } from 'lucide-react-native';
import { calculateWakeTimes, calculateSleepTimes, SuggestedTime } from '@/utils/remCalculator';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

type CalculatorMode = 'sleep-to-wake' | 'wake-to-sleep';

export default function CalculatorScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [mode, setMode] = useState<CalculatorMode>('sleep-to-wake');
  const [sleepTime, setSleepTime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [suggestions, setSuggestions] = useState<SuggestedTime[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showCustomAlarm, setShowCustomAlarm] = useState(false);
  const [customAlarmTime, setCustomAlarmTime] = useState('');
  const [recommendationCount, setRecommendationCount] = useState<3 | 5>(5);
  const [selectedSound, setSelectedSound] = useState('classic');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_preferences')
          .select('alarm_sound')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data?.alarm_sound) {
          setSelectedSound(data.alarm_sound);
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleCalculate = () => {
    if (mode === 'sleep-to-wake') {
      if (!sleepTime || !wakeTime) {
        Alert.alert(t('missingInfo'), t('enterBothTimes'));
        return;
      }
      const results = calculateWakeTimes(sleepTime, wakeTime, recommendationCount);
      if (results.length === 0) {
        Alert.alert(t('notEnoughSleep'), t('timeWindowShort'));
        return;
      }
      setSuggestions(results);
    } else {
      if (!wakeTime) {
        Alert.alert(t('missingInfo'), t('enterWakeTime'));
        return;
      }
      const results = calculateSleepTimes(wakeTime, recommendationCount);
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
          alarm_sound: selectedSound,
          is_custom: false,
        });
        Alert.alert(t('saved'), t('savedToHistory'));
      } else {
        Alert.alert(t('success'), `${t('setAlarmFor')} ${suggestion.time}`);
      }
    } catch (error) {
      Alert.alert(t('success'), `${t('setAlarmFor')} ${suggestion.time}`);
    }
  };

  const handleSaveCustomAlarm = async () => {
    if (!customAlarmTime || !/^\d{2}:\d{2}$/.test(customAlarmTime)) {
      Alert.alert(t('missingInfo'), t('enterTime'));
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase.from('sleep_records').insert({
          user_id: user.id,
          sleep_time: mode === 'sleep-to-wake' ? sleepTime : '00:00',
          wake_time: customAlarmTime,
          selected_alarm: customAlarmTime,
          alarm_sound: selectedSound,
          is_custom: true,
        });
        Alert.alert(t('saved'), t('savedToHistory'));
      } else {
        Alert.alert(t('success'), `${t('setAlarmFor')} ${customAlarmTime}`);
      }
    } catch (error) {
      Alert.alert(t('success'), `${t('setAlarmFor')} ${customAlarmTime}`);
    }

    setShowCustomAlarm(false);
    setCustomAlarmTime('');
  };

  const handleReset = () => {
    setShowResults(false);
    setSuggestions([]);
  };

  const styles = createStyles(colors);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Moon size={32} color={colors.primary} />
        </View>
        <Text style={styles.title}>{t('appTitle')}</Text>
        <Text style={styles.subtitle}>{t('appSubtitle')}</Text>
      </View>

      {!showResults ? (
        <>
          <View style={styles.modeSelector}>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'sleep-to-wake' && styles.modeButtonActive]}
              onPress={() => setMode('sleep-to-wake')}>
              <Text style={[styles.modeButtonText, mode === 'sleep-to-wake' && styles.modeButtonTextActive]}>
                {t('sleepToWake')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'wake-to-sleep' && styles.modeButtonActive]}
              onPress={() => setMode('wake-to-sleep')}>
              <Text style={[styles.modeButtonText, mode === 'wake-to-sleep' && styles.modeButtonTextActive]}>
                {t('wakeToSleep')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputSection}>
            {mode === 'sleep-to-wake' ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('bedtime')}</Text>
                  <View style={styles.inputWrapper}>
                    <Clock size={20} color={colors.primary} />
                    <TextInput
                      style={styles.input}
                      value={sleepTime}
                      onChangeText={setSleepTime}
                      placeholder="22:00"
                      placeholderTextColor={colors.inactive}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('wakeUpTime')}</Text>
                  <View style={styles.inputWrapper}>
                    <Clock size={20} color={colors.primary} />
                    <TextInput
                      style={styles.input}
                      value={wakeTime}
                      onChangeText={setWakeTime}
                      placeholder="07:00"
                      placeholderTextColor={colors.inactive}
                    />
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('wakeUpTime')}</Text>
                <View style={styles.inputWrapper}>
                  <Clock size={20} color={colors.primary} />
                  <TextInput
                    style={styles.input}
                    value={wakeTime}
                    onChangeText={setWakeTime}
                    placeholder="07:00"
                    placeholderTextColor={colors.inactive}
                  />
                </View>
              </View>
            )}

            <View style={styles.recommendationSelector}>
              <TouchableOpacity
                style={[styles.recButton, recommendationCount === 3 && styles.recButtonActive]}
                onPress={() => setRecommendationCount(3)}>
                <Text style={[styles.recButtonText, recommendationCount === 3 && styles.recButtonTextActive]}>
                  3
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.recButton, recommendationCount === 5 && styles.recButtonActive]}
                onPress={() => setRecommendationCount(5)}>
                <Text style={[styles.recButtonText, recommendationCount === 5 && styles.recButtonTextActive]}>
                  5
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
              <Sparkles size={16} color={colors.primary} />
              <Text style={styles.infoText}>{t('cycleInfo')}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
            <Text style={styles.calculateButtonText}>{t('calculateOptimal')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.customAlarmButton} onPress={() => setShowCustomAlarm(true)}>
            <Plus size={20} color={colors.primary} />
            <Text style={styles.customAlarmButtonText}>{t('createCustomAlarm')}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              {mode === 'sleep-to-wake' ? t('optimalWakeTimes') : t('optimalBedtimes')}
            </Text>
            <Text style={styles.resultsSubtitle}>
              {mode === 'sleep-to-wake' ? t('chooseWakeTime') : t('chooseBedtime')}
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
                    <Text style={styles.recommendedBadgeText}>{t('recommended')}</Text>
                  </View>
                )}
                <Text style={styles.suggestionTime}>{suggestion.time}</Text>
                <View style={styles.suggestionDetails}>
                  <Text style={styles.suggestionCycles}>
                    {suggestion.cycles} {t('completeCycles')}
                  </Text>
                  <Text style={styles.suggestionDuration}>
                    {suggestion.totalSleep} {t('ofSleep')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>{t('calculateAgain')}</Text>
          </TouchableOpacity>
        </>
      )}

      <Modal visible={showCustomAlarm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('customAlarmTime')}</Text>
              <TouchableOpacity onPress={() => setShowCustomAlarm(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>{t('enterTime')}</Text>
              <View style={styles.inputWrapper}>
                <Clock size={20} color={colors.primary} />
                <TextInput
                  style={styles.input}
                  value={customAlarmTime}
                  onChangeText={setCustomAlarmTime}
                  placeholder="07:30"
                  placeholderTextColor={colors.inactive}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setShowCustomAlarm(false)}>
                <Text style={styles.modalButtonSecondaryText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonPrimary} onPress={handleSaveCustomAlarm}>
                <Text style={styles.modalButtonPrimaryText}>{t('saveAlarm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 32,
    backgroundColor: colors.card,
  },
  headerIcon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
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
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  modeButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  modeButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modeButtonTextActive: {
    color: colors.primary,
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
    color: colors.text,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: colors.text,
  },
  recommendationSelector: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  recButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  recButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  recButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  recButtonTextActive: {
    color: colors.primary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primaryLight,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.primary,
    lineHeight: 20,
  },
  calculateButton: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  calculateButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  customAlarmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    marginBottom: 24,
    backgroundColor: colors.card,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    gap: 8,
  },
  customAlarmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  resultsHeader: {
    padding: 24,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  suggestionsList: {
    padding: 16,
    gap: 12,
  },
  suggestionCard: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
  },
  suggestionCardRecommended: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  recommendedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.primary,
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
    color: colors.text,
    marginBottom: 8,
  },
  suggestionDetails: {
    gap: 4,
  },
  suggestionCycles: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  suggestionDuration: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  resetButton: {
    marginHorizontal: 16,
    marginVertical: 24,
    backgroundColor: colors.card,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  resetButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalBody: {
    gap: 12,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  modalButtonSecondaryText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modalButtonPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  modalButtonPrimaryText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
