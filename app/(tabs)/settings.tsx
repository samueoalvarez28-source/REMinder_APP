import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Settings as SettingsIcon, Moon, Sun, Globe, Volume2, Check } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';

type AlarmSound = 'classic' | 'gentle' | 'nature' | 'chimes' | 'digital';

export default function SettingsScreen() {
  const { theme, toggleTheme, colors } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [selectedSound, setSelectedSound] = useState<AlarmSound>('classic');

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
          setSelectedSound(data.alarm_sound as AlarmSound);
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleSoundChange = async (sound: AlarmSound) => {
    setSelectedSound(sound);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: existing } = await supabase
          .from('user_preferences')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('user_preferences')
            .update({ alarm_sound: sound, updated_at: new Date().toISOString() })
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('user_preferences')
            .insert({ user_id: user.id, alarm_sound: sound });
        }
      }
    } catch (error) {
      console.error('Error saving sound:', error);
    }
  };

  const languages = [
    { code: 'en' as const, name: 'English', flag: '🇬🇧' },
    { code: 'es' as const, name: 'Español', flag: '🇪🇸' },
    { code: 'it' as const, name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt' as const, name: 'Português', flag: '🇵🇹' },
  ];

  const sounds: { id: AlarmSound; name: string }[] = [
    { id: 'classic', name: t('classic') },
    { id: 'gentle', name: t('gentle') },
    { id: 'nature', name: t('nature') },
    { id: 'chimes', name: t('chimes') },
    { id: 'digital', name: t('digital') },
  ];

  const styles = createStyles(colors);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <SettingsIcon size={32} color={colors.primary} />
        </View>
        <Text style={styles.title}>{t('settings')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('darkMode')}</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            {theme === 'light' ? (
              <Sun size={24} color={colors.primary} />
            ) : (
              <Moon size={24} color={colors.primary} />
            )}
            <Text style={styles.settingLabel}>
              {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
            </Text>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.card}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('selectLanguage')}</Text>
        <View style={styles.optionsGrid}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.optionCard,
                language === lang.code && styles.optionCardActive,
              ]}
              onPress={() => setLanguage(lang.code)}>
              <Text style={styles.flagEmoji}>{lang.flag}</Text>
              <Text style={[
                styles.optionText,
                language === lang.code && styles.optionTextActive,
              ]}>
                {lang.name}
              </Text>
              {language === lang.code && (
                <View style={styles.checkIcon}>
                  <Check size={16} color={colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('alarmSound')}</Text>
        <View style={styles.soundsList}>
          {sounds.map((sound) => (
            <TouchableOpacity
              key={sound.id}
              style={[
                styles.soundCard,
                selectedSound === sound.id && styles.soundCardActive,
              ]}
              onPress={() => handleSoundChange(sound.id)}>
              <Volume2
                size={20}
                color={selectedSound === sound.id ? colors.primary : colors.textSecondary}
              />
              <Text style={[
                styles.soundText,
                selectedSound === sound.id && styles.soundTextActive,
              ]}>
                {sound.name}
              </Text>
              {selectedSound === sound.id && (
                <View style={styles.checkIconSmall}>
                  <Check size={16} color={colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    position: 'relative',
  },
  optionCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  flagEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  optionTextActive: {
    color: colors.primary,
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  soundsList: {
    gap: 8,
  },
  soundCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  soundCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  soundText: {
    flex: 1,
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  soundTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  checkIconSmall: {
    marginLeft: 'auto',
  },
});
