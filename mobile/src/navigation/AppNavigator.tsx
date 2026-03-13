import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { BottomTabs } from '../components/BottomTabs';
import { ReflectionResultScreen } from '../screens/ReflectionResultScreen';
import { TodayScreen } from '../screens/TodayScreen';
import { VoiceReflectionScreen } from '../screens/VoiceReflectionScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { RhythmScreen } from '../screens/RhythmScreen';
import { YouScreen } from '../screens/YouScreen';
import { YourStoryScreen } from '../screens/YourStoryScreen';
import { colors } from '../theme/tokens';
import { AppView, TabKey } from '../types';

export function AppNavigator() {
  const [view, setView] = useState<AppView>({ type: 'onboarding' });
  const [reflectionCount, setReflectionCount] = useState(0);

  function openTab(tab: TabKey) {
    setView({ type: 'tabs', tab });
  }

  function openVoice() {
    setView({ type: 'voice' });
  }

  function openResult() {
    setReflectionCount((count) => count + 1);
    setView({ type: 'result' });
  }

  function handleQuickCheckIn() {
    Alert.alert('Luna', 'Quick check-in is prepared for the next phase.');
  }

  function handleWrite() {
    Alert.alert('Luna', 'Write flow is prepared for the next phase.');
  }

  function handleSkip() {
    Alert.alert('Luna', 'Skipped for today.');
  }

  function handleSave() {
    Alert.alert('Luna', 'Reflection saved.');
  }

  function handleShare() {
    Alert.alert('Luna', 'Share flow is prepared for the next phase.');
  }

  const activeTab = useMemo<TabKey>(() => {
    if (view.type === 'tabs') return view.tab;
    return 'today';
  }, [view]);

  const tabScreen = useMemo(() => {
    if (view.type !== 'tabs') return null;

    if (view.tab === 'today') {
      return <TodayScreen onSpeak={openVoice} onQuickCheckIn={handleQuickCheckIn} onWrite={handleWrite} onSkip={handleSkip} />;
    }

    if (view.tab === 'story') {
      return <YourStoryScreen />;
    }

    if (view.tab === 'rhythm') {
      return <RhythmScreen />;
    }

    return <YouScreen />;
  }, [view]);

  if (view.type === 'onboarding') {
    return <OnboardingScreen onBegin={() => openTab('today')} />;
  }

  if (view.type === 'voice') {
    return <VoiceReflectionScreen onBack={() => openTab('today')} onFinish={openResult} />;
  }

  if (view.type === 'result') {
    return (
      <ReflectionResultScreen
        onSeeRhythm={() => openTab('rhythm')}
        onSave={handleSave}
        onShare={handleShare}
        onBackToday={() => openTab('today')}
        hasPattern={reflectionCount >= 7}
      />
    );
  }

  return (
    <View style={styles.layout}>
      <View style={styles.content}>{tabScreen}</View>
      <BottomTabs activeTab={activeTab} onSelect={openTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 10,
  },
  content: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: colors.pageAlt,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
});
