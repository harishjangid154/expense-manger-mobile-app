import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  PathLogo,
  PrimaryButton,
  Screen,
  WelcomeMark,
} from '../components';
import { colors } from '../theme';

export function WelcomeScreen({ onSetup }: { onSetup: () => void }) {
  return (
    <Screen
      scroll={false}
      footer={
        <View>
          <PrimaryButton label="Set up your plan" onPress={onSetup} />
          <Text style={styles.caption}>
            Takes about 3 minutes to draft your path
          </Text>
        </View>
      }>
      <View style={styles.brand}>
        <PathLogo />
        <Text style={styles.brandName}>Paisa Path</Text>
      </View>
      <WelcomeMark />
      <Text style={styles.headline}>
        You tell us your numbers.{'\n'}We tell you what to do{'\n'}with them.
      </Text>
      <Text style={styles.body}>
        Absolutely no bank linking or automated tracking. Keep absolute privacy
        and stay in full control.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 28,
    marginBottom: 28,
  },
  brandName: {
    color: colors.green,
    fontSize: 26,
    fontWeight: '700',
  },
  headline: {
    color: colors.ink,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginTop: 36,
  },
  body: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 16,
  },
  caption: {
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 6,
  },
});
