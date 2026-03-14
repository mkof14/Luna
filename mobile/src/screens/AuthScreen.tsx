import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';

export function AuthScreen({
  onSignIn,
  onSignUp,
  onBack,
  error,
}: {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (name: string, email: string, password: string) => Promise<void>;
  onBack?: () => void;
  error?: string;
}) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('Anna');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    try {
      if (mode === 'signin') {
        await onSignIn(email, password);
      } else {
        await onSignUp(name, email, password);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        {onBack ? (
          <LunaButton variant="ghost" onPress={onBack}>← Back</LunaButton>
        ) : null}
        <View style={styles.heroGlowTop} />
        <View style={styles.heroGlowBottom} />
        <Text style={styles.eyebrow}>Luna Access</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to keep your daily story and insights across devices.</Text>
      </View>

      <SurfaceCard>
        <View style={styles.modeRow}>
          <LunaButton variant={mode === 'signin' ? 'primary' : 'secondary'} onPress={() => setMode('signin')}>Sign in</LunaButton>
          <LunaButton variant={mode === 'signup' ? 'primary' : 'secondary'} onPress={() => setMode('signup')}>Sign up</LunaButton>
        </View>

        {mode === 'signup' ? (
          <TextInput value={name} onChangeText={setName} placeholder="Name" style={styles.input} placeholderTextColor={colors.textMuted} />
        ) : null}
        <TextInput value={email} onChangeText={setEmail} placeholder="Email" style={styles.input} placeholderTextColor={colors.textMuted} autoCapitalize="none" keyboardType="email-address" />
        <TextInput value={password} onChangeText={setPassword} placeholder="Password" style={styles.input} placeholderTextColor={colors.textMuted} secureTextEntry />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <LunaButton onPress={submit}>{submitting ? 'Please wait...' : mode === 'signin' ? 'Continue' : 'Create account'}</LunaButton>
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  hero: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#f8eef8',
    padding: 16,
    gap: 6,
  },
  heroGlowTop: {
    position: 'absolute',
    width: 150,
    height: 150,
    top: -42,
    right: -36,
    borderRadius: 999,
    backgroundColor: '#efd9ff',
    opacity: 0.55,
  },
  heroGlowBottom: {
    position: 'absolute',
    width: 190,
    height: 130,
    bottom: -54,
    left: -42,
    borderRadius: 999,
    backgroundColor: '#fbdde8',
    opacity: 0.5,
  },
  eyebrow: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '700',
    color: colors.textMuted,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardStrong,
    paddingHorizontal: 12,
    color: colors.textPrimary,
  },
  error: {
    color: '#b64d67',
    fontSize: 13,
  },
});
