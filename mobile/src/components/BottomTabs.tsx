import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TabKey } from '../types';
import { colors } from '../theme/tokens';

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: 'today', label: 'Today' },
  { key: 'story', label: 'Story' },
  { key: 'rhythm', label: 'Rhythm' },
  { key: 'you', label: 'You' },
];

export function BottomTabs({
  activeTab,
  onSelect,
  onOpenMenu,
  onOpenMember,
  onOpenFooter,
  onOpenAdmin,
}: {
  activeTab: TabKey;
  onSelect: (tab: TabKey) => void;
  onOpenMenu?: () => void;
  onOpenMember?: () => void;
  onOpenFooter?: () => void;
  onOpenAdmin?: () => void;
}) {
  return (
    <View style={styles.shell}>
      <View style={styles.wrap}>
        {tabs.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <Pressable key={tab.key} onPress={() => onSelect(tab.key)} style={[styles.tab, active && styles.tabActive]}>
              <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.shortcuts}>
        <Pressable onPress={onOpenMenu} style={styles.shortcutBtn}>
          <Text style={styles.shortcutText}>Menu</Text>
        </Pressable>
        <Pressable onPress={onOpenMember} style={styles.shortcutBtn}>
          <Text style={styles.shortcutText}>Member</Text>
        </Pressable>
        <Pressable onPress={onOpenFooter} style={styles.shortcutBtn}>
          <Text style={styles.shortcutText}>Footer</Text>
        </Pressable>
        <Pressable onPress={onOpenAdmin} style={styles.shortcutBtn}>
          <Text style={styles.shortcutText}>Admin</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    gap: 8,
  },
  wrap: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255, 248, 255, 0.82)',
    padding: 8,
  },
  tab: {
    flex: 1,
    minHeight: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#f2dcfb',
    borderWidth: 1,
    borderColor: '#dec4e8',
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  labelActive: {
    color: colors.textPrimary,
  },
  shortcuts: {
    flexDirection: 'row',
    gap: 8,
  },
  shortcutBtn: {
    flex: 1,
    minHeight: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(215,188,234,0.74)',
    backgroundColor: 'rgba(255, 248, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutText: {
    color: '#5d4a72',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
