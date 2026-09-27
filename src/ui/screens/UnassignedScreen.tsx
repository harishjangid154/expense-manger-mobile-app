import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  PageHeader,
  PrimaryButton,
  Screen,
  SecondaryButton,
  TextLink,
} from '../components';
import { colors, radii } from '../theme';

export function UnassignedScreen({ onBack }: { onBack: () => void }) {
  return (
    <Screen
      footer={
        <View style={styles.footerLink}>
          <TextLink label="Back to plan" onPress={onBack} muted />
        </View>
      }>
      <PageHeader title="Unassigned Cash" onBack={onBack} />
      <View style={styles.card}>
        <Text style={styles.kicker}>✦  Opportunity Alert</Text>
        <Text style={styles.headline}>
          ₹18,000 sitting unassigned in your savings.
        </Text>
        <Text style={styles.body}>
          This money is not mapped to any active shield or goal. Pointing it to
          a target boosts your trajectory speed.
        </Text>
      </View>
      <Text style={styles.prompt}>WHERE WOULD YOU LIKE TO DIRECT THIS?</Text>
      <PrimaryButton label="Add to safety cushion" onPress={onBack} />
      <View style={styles.gap} />
      <SecondaryButton label="Put toward HDFC Car Loan debt" onPress={onBack} />
      <View style={styles.later}>
        <TextLink label="Decide later" onPress={onBack} />
        <Text style={styles.laterHint}>No rush — it's already saved.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: 18,
    marginBottom: 26,
  },
  kicker: {
    color: colors.green,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14,
  },
  headline: {
    color: colors.ink,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginBottom: 12,
  },
  body: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 23,
  },
  prompt: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  gap: {
    height: 12,
  },
  later: {
    alignItems: 'center',
    marginTop: 28,
    gap: 8,
  },
  laterHint: {
    color: colors.muted,
    fontSize: 14,
  },
  footerLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
});
