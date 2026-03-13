import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { TodayMirrorScreen } from './src/screens/TodayMirrorScreen';

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <TodayMirrorScreen />
    </>
  );
}
