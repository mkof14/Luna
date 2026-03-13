import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { fetchDailyMirror } from '../services/api';
import { colors, shadow } from '../theme/tokens';

type ReflectionMode = 'idle' | 'recording' | 'done';

type TodayContext = {
  cycleSummary: string;
  energy: string;
  mood: string;
  sleep: string;
};

const prompts = [
  'What stayed with you today?',
  'What felt the heaviest today?',
  'What gave you a little energy today?',
  'How does your body feel tonight?',
];

const fallbackContext: TodayContext = {
  cycleSummary: 'Day 17 · Luteal phase',
  energy: 'Lower today',
  mood: 'Sensitive',
  sleep: '6h 20m',
};

export function TodayMirrorScreen() {
  const [context, setContext] = useState<TodayContext>(fallbackContext);
  const [loadingContext, setLoadingContext] = useState(false);
  const [mode, setMode] = useState<ReflectionMode>('idle');
  const [timer, setTimer] = useState(0);
  const [note, setNote] = useState('');
  const [responseVisible, setResponseVisible] = useState(false);

  const prompt = useMemo(() => {
    const index = new Date().getDate() % prompts.length;
    return prompts[index];
  }, []);

  async function loadContext() {
    try {
      setLoadingContext(true);
      const data = await fetchDailyMirror();
      setContext(data);
    } catch {
      Alert.alert('Luna', 'Could not refresh today context. Showing latest available view.');
    } finally {
      setLoadingContext(false);
    }
  }

  function startRecording() {
    setMode('recording');
    setResponseVisible(false);
    setTimer(0);
    const startedAt = Date.now();
    const intervalId = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      setTimer(elapsed);
      if (elapsed >= 60) {
        clearInterval(intervalId);
        finishRecording();
      }
    }, 1000);

    setTimeout(() => clearInterval(intervalId), 62000);
  }

  function finishRecording() {
    setMode('done');
    setResponseVisible(true);
  }

  function saveReflection() {
    Alert.alert('Luna', 'Reflection saved.');
  }

  function shareReflection() {
    Alert.alert('Luna', 'Share options will open here.');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerBlock}>
          <Text style={styles.greeting}>Good evening, Anna</Text>
          <Text style={styles.subline}>Today with Luna</Text>
          <Text style={styles.explainer}>
            Today may feel a little slower. Sleep was shorter last night, and your body is in the luteal phase.
          </Text>
        </View>

        <View style={[styles.card, shadow.card]}>
          <Text style={styles.cardTitle}>Evening reflection</Text>
          <Text style={styles.question}>{prompt}</Text>
          <View style={styles.actionsRow}>
            {mode === 'recording' ? (
              <Pressable onPress={finishRecording} style={[styles.primaryButton, styles.recordingButton]}>
                <Text style={styles.primaryButtonText}>Stop recording · {String(timer).padStart(2, '0')}s</Text>
              </Pressable>
            ) : (
              <Pressable onPress={startRecording} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Speak</Text>
              </Pressable>
            )}
            <Pressable onPress={() => setMode('idle')} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Skip today</Text>
            </Pressable>
          </View>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Write a few words if you prefer text"
            placeholderTextColor="#9a8ca3"
            multiline
            style={styles.input}
          />
        </View>

        <View style={[styles.card, shadow.card]}>
          <View style={styles.inlineRow}>
            <Text style={styles.cardTitle}>Today context</Text>
            <Pressable onPress={loadContext} style={styles.inlineRefresh}>
              <Text style={styles.inlineRefreshText}>Refresh</Text>
            </Pressable>
          </View>
          {loadingContext ? <ActivityIndicator color={colors.accentStrong} /> : null}
          <View style={styles.pillsRow}>
            <View style={styles.pill}>
              <Text style={styles.pillLabel}>Cycle</Text>
              <Text style={styles.pillValue}>{context.cycleSummary}</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillLabel}>Energy</Text>
              <Text style={styles.pillValue}>{context.energy}</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillLabel}>Mood</Text>
              <Text style={styles.pillValue}>{context.mood}</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillLabel}>Sleep</Text>
              <Text style={styles.pillValue}>{context.sleep}</Text>
            </View>
          </View>
        </View>

        {responseVisible ? (
          <View style={[styles.card, shadow.card]}>
            <Text style={styles.cardTitle}>Here is your reflection</Text>
            <Text style={styles.responseText}>You sounded a little tired today.</Text>
            <Text style={styles.responseText}>You mentioned pressure at work.</Text>
            <Text style={styles.responseText}>A slower evening may help you reset.</Text>
            <View style={styles.actionsRow}>
              <Pressable onPress={saveReflection} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Save reflection</Text>
              </Pressable>
              <Pressable onPress={shareReflection} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Share</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.page },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  headerBlock: {
    gap: 6,
  },
  greeting: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  subline: {
    color: colors.accentStrong,
    fontSize: 16,
    fontWeight: '600',
  },
  explainer: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 620,
  },
  card: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    gap: 12,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 19,
    fontWeight: '700',
  },
  question: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 22,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  primaryButton: {
    backgroundColor: colors.accentStrong,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  recordingButton: {
    backgroundColor: '#b24c67',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryButton: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardStrong,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    minHeight: 94,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff8ff',
    color: colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: 'top',
  },
  inlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inlineRefresh: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 11,
    paddingVertical: 7,
    backgroundColor: colors.cardStrong,
  },
  inlineRefreshText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    minWidth: 150,
    borderRadius: 14,
    paddingHorizontal: 11,
    paddingVertical: 9,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.border,
    flexGrow: 1,
  },
  pillLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
  pillValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  responseText: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
});
