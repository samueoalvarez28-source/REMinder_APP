import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

type Language = 'en' | 'es' | 'it' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    appTitle: 'REMinder',
    appSubtitle: 'Optimize your sleep cycles',
    calculator: 'Calculator',
    history: 'History',
    settings: 'Settings',
    sleepToWake: 'I know when I sleep',
    wakeToSleep: 'I know when I wake',
    bedtime: 'Bedtime',
    wakeUpTime: 'Wake Up Time',
    cycleInfo: 'A complete sleep cycle is 90 minutes. We\'ll add 15 minutes for you to fall asleep.',
    calculateOptimal: 'Calculate Optimal Times',
    optimalWakeTimes: 'Optimal Wake Times',
    optimalBedtimes: 'Optimal Bedtimes',
    chooseWakeTime: 'Choose a wake time that completes full REM cycles',
    chooseBedtime: 'Choose a bedtime to wake up refreshed',
    recommended: 'RECOMMENDED',
    completeCycles: 'complete cycles',
    ofSleep: 'of sleep',
    calculateAgain: 'Calculate Again',
    missingInfo: 'Missing Information',
    enterBothTimes: 'Please enter both sleep and wake times',
    enterWakeTime: 'Please enter your wake time',
    notEnoughSleep: 'Not Enough Sleep',
    timeWindowShort: 'The time window is too short for optimal REM cycles. Try going to sleep earlier or waking up later.',
    saved: 'Saved',
    savedToHistory: 'Your sleep schedule has been saved to history',
    success: 'Success',
    setAlarmFor: 'Set your alarm for',
    sleepHistory: 'Sleep History',
    records: 'records',
    historyNotAvailable: 'History Not Available',
    historyAuthOnly: 'Sleep history is only available when using authentication. You can still use the calculator without an account.',
    noRecordsYet: 'No Sleep Records Yet',
    historyWillAppear: 'Your sleep history will appear here once you start using the calculator.',
    today: 'Today',
    yesterday: 'Yesterday',
    alarmSetFor: 'Alarm set for',
    darkMode: 'Dark Mode',
    selectLanguage: 'Select Language',
    alarmSound: 'Alarm Sound',
    createCustomAlarm: 'Create Custom Alarm',
    customAlarmTime: 'Custom Alarm Time',
    saveAlarm: 'Save Alarm',
    cancel: 'Cancel',
    enterTime: 'Enter time (HH:MM)',
    classic: 'Classic',
    gentle: 'Gentle',
    nature: 'Nature',
    chimes: 'Chimes',
    digital: 'Digital',
    showRecommendations: 'Show Recommendations',
    three: '3 recommendations',
    five: '5 recommendations',
  },
  es: {
    appTitle: 'REMinder',
    appSubtitle: 'Optimiza tus ciclos de sueño',
    calculator: 'Calculadora',
    history: 'Historial',
    settings: 'Ajustes',
    sleepToWake: 'Sé cuándo duermo',
    wakeToSleep: 'Sé cuándo despierto',
    bedtime: 'Hora de dormir',
    wakeUpTime: 'Hora de despertar',
    cycleInfo: 'Un ciclo de sueño completo dura 90 minutos. Añadiremos 15 minutos para que te duermas.',
    calculateOptimal: 'Calcular horarios óptimos',
    optimalWakeTimes: 'Horas óptimas para despertar',
    optimalBedtimes: 'Horas óptimas para dormir',
    chooseWakeTime: 'Elige una hora que complete ciclos REM completos',
    chooseBedtime: 'Elige una hora para despertar descansado',
    recommended: 'RECOMENDADO',
    completeCycles: 'ciclos completos',
    ofSleep: 'de sueño',
    calculateAgain: 'Calcular de nuevo',
    missingInfo: 'Falta información',
    enterBothTimes: 'Por favor ingresa ambas horas',
    enterWakeTime: 'Por favor ingresa tu hora de despertar',
    notEnoughSleep: 'No es suficiente sueño',
    timeWindowShort: 'El tiempo es muy corto para ciclos REM óptimos. Intenta dormir más temprano o despertar más tarde.',
    saved: 'Guardado',
    savedToHistory: 'Tu horario de sueño ha sido guardado en el historial',
    success: 'Éxito',
    setAlarmFor: 'Configura tu alarma para las',
    sleepHistory: 'Historial de sueño',
    records: 'registros',
    historyNotAvailable: 'Historial no disponible',
    historyAuthOnly: 'El historial solo está disponible con autenticación. Puedes usar la calculadora sin cuenta.',
    noRecordsYet: 'Aún no hay registros',
    historyWillAppear: 'Tu historial aparecerá aquí cuando uses la calculadora.',
    today: 'Hoy',
    yesterday: 'Ayer',
    alarmSetFor: 'Alarma configurada para',
    darkMode: 'Modo oscuro',
    selectLanguage: 'Seleccionar idioma',
    alarmSound: 'Sonido de alarma',
    createCustomAlarm: 'Crear alarma personalizada',
    customAlarmTime: 'Hora de alarma personalizada',
    saveAlarm: 'Guardar alarma',
    cancel: 'Cancelar',
    enterTime: 'Ingresar hora (HH:MM)',
    classic: 'Clásico',
    gentle: 'Suave',
    nature: 'Naturaleza',
    chimes: 'Campanas',
    digital: 'Digital',
    showRecommendations: 'Mostrar recomendaciones',
    three: '3 recomendaciones',
    five: '5 recomendaciones',
  },
  it: {
    appTitle: 'REMinder',
    appSubtitle: 'Ottimizza i tuoi cicli del sonno',
    calculator: 'Calcolatrice',
    history: 'Cronologia',
    settings: 'Impostazioni',
    sleepToWake: 'So quando dormo',
    wakeToSleep: 'So quando mi sveglio',
    bedtime: 'Ora di andare a letto',
    wakeUpTime: 'Ora di sveglia',
    cycleInfo: 'Un ciclo di sonno completo dura 90 minuti. Aggiungeremo 15 minuti per addormentarsi.',
    calculateOptimal: 'Calcola orari ottimali',
    optimalWakeTimes: 'Orari ottimali per svegliarsi',
    optimalBedtimes: 'Orari ottimali per dormire',
    chooseWakeTime: 'Scegli un orario che completi cicli REM completi',
    chooseBedtime: 'Scegli un orario per svegliarti riposato',
    recommended: 'CONSIGLIATO',
    completeCycles: 'cicli completi',
    ofSleep: 'di sonno',
    calculateAgain: 'Calcola di nuovo',
    missingInfo: 'Informazioni mancanti',
    enterBothTimes: 'Inserisci entrambi gli orari',
    enterWakeTime: 'Inserisci il tuo orario di sveglia',
    notEnoughSleep: 'Sonno insufficiente',
    timeWindowShort: 'Il tempo è troppo breve per cicli REM ottimali. Prova ad andare a letto prima o svegliarti più tardi.',
    saved: 'Salvato',
    savedToHistory: 'Il tuo programma di sonno è stato salvato nella cronologia',
    success: 'Successo',
    setAlarmFor: 'Imposta la sveglia per le',
    sleepHistory: 'Cronologia del sonno',
    records: 'registrazioni',
    historyNotAvailable: 'Cronologia non disponibile',
    historyAuthOnly: 'La cronologia è disponibile solo con autenticazione. Puoi comunque usare la calcolatrice senza account.',
    noRecordsYet: 'Nessuna registrazione ancora',
    historyWillAppear: 'La tua cronologia apparirà qui quando userai la calcolatrice.',
    today: 'Oggi',
    yesterday: 'Ieri',
    alarmSetFor: 'Sveglia impostata per',
    darkMode: 'Modalità scura',
    selectLanguage: 'Seleziona lingua',
    alarmSound: 'Suono sveglia',
    createCustomAlarm: 'Crea sveglia personalizzata',
    customAlarmTime: 'Ora sveglia personalizzata',
    saveAlarm: 'Salva sveglia',
    cancel: 'Annulla',
    enterTime: 'Inserisci ora (HH:MM)',
    classic: 'Classico',
    gentle: 'Delicato',
    nature: 'Natura',
    chimes: 'Campane',
    digital: 'Digitale',
    showRecommendations: 'Mostra raccomandazioni',
    three: '3 raccomandazioni',
    five: '5 raccomandazioni',
  },
  pt: {
    appTitle: 'REMinder',
    appSubtitle: 'Otimize seus ciclos de sono',
    calculator: 'Calculadora',
    history: 'Histórico',
    settings: 'Configurações',
    sleepToWake: 'Sei quando durmo',
    wakeToSleep: 'Sei quando acordo',
    bedtime: 'Hora de dormir',
    wakeUpTime: 'Hora de acordar',
    cycleInfo: 'Um ciclo de sono completo dura 90 minutos. Vamos adicionar 15 minutos para você adormecer.',
    calculateOptimal: 'Calcular horários ideais',
    optimalWakeTimes: 'Horários ideais para acordar',
    optimalBedtimes: 'Horários ideais para dormir',
    chooseWakeTime: 'Escolha um horário que complete ciclos REM completos',
    chooseBedtime: 'Escolha um horário para acordar descansado',
    recommended: 'RECOMENDADO',
    completeCycles: 'ciclos completos',
    ofSleep: 'de sono',
    calculateAgain: 'Calcular novamente',
    missingInfo: 'Informação faltando',
    enterBothTimes: 'Por favor insira ambos os horários',
    enterWakeTime: 'Por favor insira seu horário de acordar',
    notEnoughSleep: 'Sono insuficiente',
    timeWindowShort: 'O tempo é muito curto para ciclos REM ideais. Tente dormir mais cedo ou acordar mais tarde.',
    saved: 'Salvo',
    savedToHistory: 'Seu horário de sono foi salvo no histórico',
    success: 'Sucesso',
    setAlarmFor: 'Configure seu alarme para',
    sleepHistory: 'Histórico de sono',
    records: 'registros',
    historyNotAvailable: 'Histórico não disponível',
    historyAuthOnly: 'O histórico está disponível apenas com autenticação. Você pode usar a calculadora sem conta.',
    noRecordsYet: 'Nenhum registro ainda',
    historyWillAppear: 'Seu histórico aparecerá aqui quando você usar a calculadora.',
    today: 'Hoje',
    yesterday: 'Ontem',
    alarmSetFor: 'Alarme definido para',
    darkMode: 'Modo escuro',
    selectLanguage: 'Selecionar idioma',
    alarmSound: 'Som do alarme',
    createCustomAlarm: 'Criar alarme personalizado',
    customAlarmTime: 'Hora do alarme personalizado',
    saveAlarm: 'Salvar alarme',
    cancel: 'Cancelar',
    enterTime: 'Inserir hora (HH:MM)',
    classic: 'Clássico',
    gentle: 'Suave',
    nature: 'Natureza',
    chimes: 'Sinos',
    digital: 'Digital',
    showRecommendations: 'Mostrar recomendações',
    three: '3 recomendações',
    five: '5 recomendações',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_preferences')
          .select('language')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data?.language) {
          setLanguageState(data.language as Language);
        }
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);

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
            .update({ language: lang, updated_at: new Date().toISOString() })
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('user_preferences')
            .insert({ user_id: user.id, language: lang });
        }
      }
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
