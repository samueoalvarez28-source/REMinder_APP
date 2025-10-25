import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Clock, Calendar, Trash2, Moon, Volume2 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface SleepRecord {
  id: string;
  sleep_time: string;
  wake_time: string;
  selected_alarm: string | null;
  alarm_sound: string | null;
  is_custom: boolean;
  created_at: string;
}

export default function HistoryScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadRecords = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);

      const { data, error } = await supabase
        .from('sleep_records')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setRecords(data || []);
    } catch (error) {
      console.error('Error loading records:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadRecords();
    }, [])
  );

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('sleep_records').delete().eq('id', id);

      if (error) throw error;

      setRecords(records.filter((record) => record.id !== id));
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return t('today');
    } else if (diffInHours < 48) {
      return t('yesterday');
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const styles = createStyles(colors);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <Moon size={48} color={colors.inactive} />
        <Text style={styles.emptyTitle}>{t('historyNotAvailable')}</Text>
        <Text style={styles.emptyText}>{t('historyAuthOnly')}</Text>
      </View>
    );
  }

  if (records.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Moon size={48} color={colors.inactive} />
        <Text style={styles.emptyTitle}>{t('noRecordsYet')}</Text>
        <Text style={styles.emptyText}>{t('historyWillAppear')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('sleepHistory')}</Text>
        <Text style={styles.subtitle}>
          {records.length} {t('records')}
        </Text>
      </View>

      <View style={styles.recordsList}>
        {records.map((record) => (
          <View key={record.id} style={styles.recordCard}>
            <View style={styles.recordHeader}>
              <View style={styles.dateContainer}>
                <Calendar size={16} color={colors.textSecondary} />
                <Text style={styles.dateText}>{formatDate(record.created_at)}</Text>
                {record.is_custom && (
                  <View style={styles.customBadge}>
                    <Text style={styles.customBadgeText}>Custom</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity onPress={() => handleDelete(record.id)} style={styles.deleteButton}>
                <Trash2 size={18} color={colors.error} />
              </TouchableOpacity>
            </View>

            <View style={styles.recordBody}>
              <View style={styles.timeRow}>
                <View style={styles.timeContainer}>
                  <View style={styles.timeIconWrapper}>
                    <Moon size={16} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.timeLabel}>{t('bedtime')}</Text>
                    <Text style={styles.timeValue}>{record.sleep_time}</Text>
                  </View>
                </View>

                <View style={styles.timeContainer}>
                  <View style={styles.timeIconWrapper}>
                    <Clock size={16} color={colors.success} />
                  </View>
                  <View>
                    <Text style={styles.timeLabel}>{t('wakeUpTime')}</Text>
                    <Text style={styles.timeValue}>{record.wake_time}</Text>
                  </View>
                </View>
              </View>

              {record.selected_alarm && (
                <View style={styles.alarmInfo}>
                  <Text style={styles.alarmText}>
                    {t('alarmSetFor')} {record.selected_alarm}
                  </Text>
                  {record.alarm_sound && (
                    <View style={styles.soundBadge}>
                      <Volume2 size={12} color={colors.primary} />
                      <Text style={styles.soundText}>{t(record.alarm_sound)}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: colors.card,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  recordsList: {
    padding: 16,
    gap: 12,
  },
  recordCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  dateText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  customBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  customBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
  },
  deleteButton: {
    padding: 4,
  },
  recordBody: {
    gap: 12,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 16,
  },
  timeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  alarmInfo: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alarmText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  soundBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  soundText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '500',
  },
});
