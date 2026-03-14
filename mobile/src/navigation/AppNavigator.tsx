import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { BottomTabs } from '../components/BottomTabs';
import { QuickCheckInScreen } from '../screens/QuickCheckInScreen';
import { ReflectionResultScreen } from '../screens/ReflectionResultScreen';
import { TodayScreen } from '../screens/TodayScreen';
import { VoiceReflectionScreen } from '../screens/VoiceReflectionScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { PublicHomeScreen } from '../screens/PublicHomeScreen';
import { RhythmScreen } from '../screens/RhythmScreen';
import { YouScreen } from '../screens/YouScreen';
import { YourStoryScreen } from '../screens/YourStoryScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { colors } from '../theme/tokens';
import { AppView, TabKey } from '../types';
import { useLunaState } from '../state/useLunaState';
import { useRemoteLunaData } from '../state/useRemoteLunaData';
import { useMobileAuth } from '../state/useMobileAuth';

export function AppNavigator() {
  const auth = useMobileAuth();
  const [view, setView] = useState<AppView>({ type: 'onboarding' });
  const [preAuthScreen, setPreAuthScreen] = useState<'public' | 'auth'>('public');
  const { reflectionCount, insightStage, addReflection } = useLunaState();
  const { today, reflection, thread, loading, remoteError, refresh, syncReflection } = useRemoteLunaData();

  function openTab(tab: TabKey) {
    setView({ type: 'tabs', tab });
  }

  function openVoice() {
    setView({ type: 'voice' });
  }

  function openQuickCheckIn() {
    setView({ type: 'quickCheckIn' });
  }

  function openResult(entry: string) {
    addReflection(entry);
    void syncReflection('voice', entry);
    setView({ type: 'result' });
  }

  function handleQuickCheckIn(entry: string) {
    addReflection(entry);
    void syncReflection('quick_checkin', entry);
    setView({ type: 'result' });
  }

  function handleWrite() {
    const entry = 'Written note: today felt heavier than expected, and you asked for a calmer evening.';
    addReflection(entry);
    void syncReflection('write', entry);
    setView({ type: 'result' });
  }

  function handleSkip() {
    Alert.alert('Luna', 'Skipped for today. You can return tonight.');
  }

  function handleSave() {
    Alert.alert('Luna', 'Reflection saved.');
  }

  function handleShare() {
    Alert.alert('Luna', 'Share flow is prepared for next phase.');
  }

  const activeTab = useMemo<TabKey>(() => {
    if (view.type === 'tabs') return view.tab;
    return 'today';
  }, [view]);

  const tabScreen = useMemo(() => {
    if (view.type !== 'tabs') return null;

    if (view.tab === 'today') {
      return (
        <TodayScreen
          userName={auth.session?.name || today.userName}
          title={today.title}
          explanation={today.explanation}
          continuity={today.continuity}
          context={today.context}
          remoteError={remoteError}
          loading={loading}
          onRefresh={refresh}
          onSpeak={openVoice}
          onQuickCheckIn={openQuickCheckIn}
          onWrite={handleWrite}
          onSkip={handleSkip}
        />
      );
    }

    if (view.tab === 'story') {
      return <YourStoryScreen entries={thread} />;
    }

    if (view.tab === 'rhythm') {
      return <RhythmScreen stage={insightStage} />;
    }

    return (
      <YouScreen
        dayOfMonth={new Date().getDate()}
        onSignOut={async () => {
          await auth.signOut();
          setPreAuthScreen('public');
        }}
      />
    );
  }, [view, today, remoteError, loading, refresh, thread, insightStage, auth.signOut]);

  if (auth.loading) {
    return <PublicHomeScreen onOpenAuth={() => setPreAuthScreen('auth')} onOpenAboutFlow={() => setPreAuthScreen('auth')} loading />;
  }

  if (!auth.session) {
    if (preAuthScreen === 'public') {
      return <PublicHomeScreen onOpenAuth={() => setPreAuthScreen('auth')} onOpenAboutFlow={() => setPreAuthScreen('auth')} />;
    }
    return (
      <AuthScreen
        onSignIn={async (email, password) => {
          try {
            await auth.signIn(email, password);
            setPreAuthScreen('public');
          } catch (error) {
            auth.setError(error instanceof Error ? error.message : 'Sign in failed.');
          }
        }}
        onSignUp={async (name, email, password) => {
          try {
            await auth.signUp(name, email, password);
            setPreAuthScreen('public');
          } catch (error) {
            auth.setError(error instanceof Error ? error.message : 'Sign up failed.');
          }
        }}
        error={auth.error}
      />
    );
  }

  if (view.type === 'onboarding') {
    return <OnboardingScreen onBeginVoice={openVoice} onComplete={() => openTab('today')} />;
  }

  if (view.type === 'voice') {
    return <VoiceReflectionScreen onBack={() => openTab('today')} onFinish={openResult} />;
  }

  if (view.type === 'quickCheckIn') {
    return <QuickCheckInScreen onBack={() => openTab('today')} onSubmit={handleQuickCheckIn} />;
  }

  if (view.type === 'result') {
    return (
      <ReflectionResultScreen
        userName={auth.session.name || today.userName}
        reflection={reflection}
        context={today.context}
        recentEntries={thread}
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
