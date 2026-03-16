import React from 'react';
import { StyleSheet, View } from 'react-native';
import { languageOptions, MobileLang } from '../i18n/mobileCopy';
import { LunaButton } from './LunaButton';

export function LanguageSelector({
  lang,
  setLang,
}: {
  lang: MobileLang;
  setLang: (lang: MobileLang) => void;
}) {
  return (
    <View style={styles.wrap}>
      {languageOptions.map((item) => (
        <View key={item.key} style={styles.item}>
          <LunaButton variant={lang === item.target && item.key === item.target ? 'primary' : 'secondary'} onPress={() => setLang(item.target)}>
            {item.label}
          </LunaButton>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  item: {
    minWidth: 88,
  },
});
