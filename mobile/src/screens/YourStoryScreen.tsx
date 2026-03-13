import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SurfaceCard } from '../components/SurfaceCard';
import { StoryEntry } from '../types';
import { colors } from '../theme/tokens';

export function YourStoryScreen({ entries }: { entries: StoryEntry[] }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your story with Luna</Text>
      <Text style={styles.subtitle}>A short thread from your latest reflections.</Text>
      <SurfaceCard>
        {entries.length === 0 ? (
          <Text style={styles.empty}>Your story with Luna is just beginning.</Text>
        ) : (
          entries.slice(0, 4).map((entry, index) => (
            <View key={entry.id} style={[styles.item, index === Math.min(entries.length, 4) - 1 && styles.lastItem]}>
              <Text style={styles.itemLabel}>{entry.label}</Text>
              <Text style={styles.itemText}>{entry.text}</Text>
            </View>
          ))
        )}
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  title: {
    fontSize: 27,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 11,
    marginBottom: 11,
    gap: 3,
  },
  lastItem: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  itemLabel: {
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: colors.textMuted,
    fontWeight: '700',
  },
  itemText: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  empty: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
});
