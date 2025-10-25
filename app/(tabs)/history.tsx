import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Clock, Calendar, Trash2, Moon } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useFocusEffect } from '@react-navigation/native';

interface SleepRecord {
  id: string;
  sleep_time: string;
  wake_time: string;
  selected_alarm: string | null;
  created_at: string;
}

export default function HistoryScreen() {
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
      return 'Today';
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <Moon size={48} color="#d1d5db" />
        <Text style={styles.emptyTitle}>History Not Available</Text>
        <Text style={styles.emptyText}>
          Sleep history is only available when using authentication. You can still use the calculator without an account.
        </Text>
      </View>
    );
  }

  if (records.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Moon size={48} color="#d1d5db" />
        <Text style={styles.emptyTitle}>No Sleep Records Yet</Text>
        <Text style={styles.emptyText}>
          Your sleep history will appear here once you start using the calculator.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sleep History</Text>
        <Text style={styles.subtitle}>{records.length} records</Text>
      </View>

      <View style={styles.recordsList}>
        {records.map((record) => (
          <View key={record.id} style={styles.recordCard}>
            <View style={styles.recordHeader}>
              <View style={styles.dateContainer}>
                <Calendar size={16} color="#6b7280" />
                <Text style={styles.dateText}>{formatDate(record.created_at)}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(record.id)} style={styles.deleteButton}>
                <Trash2 size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>

            <View style={styles.recordBody}>
              <View style={styles.timeRow}>
                <View style={styles.timeContainer}>
                  <View style={styles.timeIconWrapper}>
                    <Moon size={16} color="#6366f1" />
                  </View>
                  <View>
                    <Text style={styles.timeLabel}>Bedtime</Text>
                    <Text style={styles.timeValue}>{record.sleep_time}</Text>
                  </View>
                </View>

                <View style={styles.timeContainer}>
                  <View style={styles.timeIconWrapper}>
                    <Clock size={16} color="#10b981" />
                  </View>
                  <View>
                    <Text style={styles.timeLabel}>Wake Time</Text>
                    <Text style={styles.timeValue}>{record.wake_time}</Text>
                  </View>
                </View>
              </View>

              {record.selected_alarm && (
                <View style={styles.alarmBadge}>
                  <Text style={styles.alarmBadgeText}>Alarm set for {record.selected_alarm}</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  recordsList: {
    padding: 16,
    gap: 12,
  },
  recordCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
  },
  dateText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
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
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  alarmBadge: {
    backgroundColor: '#eef2ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  alarmBadgeText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
    textAlign: 'center',
  },
});
