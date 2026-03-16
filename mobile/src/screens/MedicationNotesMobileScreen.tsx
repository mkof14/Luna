import React, { useEffect, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';
import { MobileLang } from '../i18n/mobileCopy';
import { loadSectionState, saveSectionState } from '../services/mobileState';

type Entry = { id: string; medicine: string; note: string };

export function MedicationNotesMobileScreen({ onBack, lang }: { onBack: () => void; lang: MobileLang }) {
  const copy = {
    en: { title: 'Medication Notes', subtitle: 'Simple notes for medicine and supplements.' },
    ru: { title: 'Medication Notes', subtitle: 'Простые заметки о лекарствах и добавках.' },
    es: { title: 'Notas de medicacion', subtitle: 'Notas simples sobre medicina y suplementos.' },
  }[lang];

  const [medicine, setMedicine] = useState('Magnesium');
  const [note, setNote] = useState('Taken after dinner. Felt calmer.');
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    void (async () => {
      const loaded = await loadSectionState('medication_notes', {
        medicine: 'Magnesium',
        note: 'Taken after dinner. Felt calmer.',
        entries: [],
      });
      setMedicine(typeof loaded.medicine === 'string' ? loaded.medicine : 'Magnesium');
      setNote(typeof loaded.note === 'string' ? loaded.note : 'Taken after dinner. Felt calmer.');
      if (Array.isArray(loaded.entries)) {
        const next = loaded.entries
          .map((item) => {
            if (!item || typeof item !== 'object') return null;
            const raw = item as Partial<Entry>;
            if (!raw.id || !raw.medicine || !raw.note) return null;
            return { id: String(raw.id), medicine: String(raw.medicine), note: String(raw.note) };
          })
          .filter(Boolean) as Entry[];
        setEntries(next.slice(0, 10));
      }
    })();
  }, []);

  useEffect(() => {
    void saveSectionState('medication_notes', { medicine, note, entries });
  }, [medicine, note, entries]);

  function addEntry() {
    if (!medicine.trim() || !note.trim()) return;
    setEntries((current) => [{ id: String(Date.now()), medicine: medicine.trim(), note: note.trim() }, ...current].slice(0, 10));
    setNote('');
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/bg-soft-2.webp')} imageStyle={styles.heroImage} style={styles.heroCard}>
        <MobileScreenHeader title={copy.title} subtitle={copy.subtitle} onBack={onBack} tone="light" />
      </ImageBackground>

      <SurfaceCard>
        <TextInput value={medicine} onChangeText={setMedicine} placeholder="Medicine or supplement" placeholderTextColor={colors.textMuted} style={styles.input} />
        <TextInput value={note} onChangeText={setNote} placeholder="How did it feel?" placeholderTextColor={colors.textMuted} style={[styles.input, styles.bigInput]} multiline />
        <LunaButton onPress={addEntry}>Add note</LunaButton>
      </SurfaceCard>

      {entries.length > 0 ? (
        <SurfaceCard style={styles.cardAlt}>
          <Text style={styles.cardTitle}>Recent notes</Text>
          <View style={styles.stack}>
            {entries.map((entry) => (
              <View key={entry.id} style={styles.entry}>
                <Text style={styles.entryTitle}>{entry.medicine}</Text>
                <Text style={styles.entryText}>{entry.note}</Text>
              </View>
            ))}
          </View>
        </SurfaceCard>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  heroCard: { minHeight: 132, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, padding: 14, justifyContent: 'center' },
  heroImage: { resizeMode: 'cover' },
  input: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardStrong,
    paddingHorizontal: 12,
    color: colors.textPrimary,
    fontSize: 14,
  },
  bigInput: { minHeight: 90, paddingTop: 10, textAlignVertical: 'top' },
  cardTitle: { fontSize: 18, color: colors.textPrimary, fontWeight: '700' },
  stack: { gap: 8 },
  entry: { borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cardStrong, padding: 10, gap: 2 },
  entryTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  entryText: { fontSize: 14, lineHeight: 20, color: colors.textSecondary },
  cardAlt: { backgroundColor: 'rgba(248, 239, 255, 0.82)' },
});
