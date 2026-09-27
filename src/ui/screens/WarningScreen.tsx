import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Chip, PageHeader, PrimaryButton, Radio, Screen, TextLink } from '../components';
import { colors, radii } from '../theme';

const LEVELS = ['Zero', 'Deficit (₹4,500)', 'Thin'] as const;

const OPTIONS = [
  {
    id: 'consolidate',
    title: 'A. Consolidate EMI',
    body: 'Consider wrapping your credit outstanding into a longer, lower-interest personal loan. This directly lowers your active monthly obligations.',
  },
  {
    id: 'pause',
    title: 'B. Pause & Trim',
    body: 'Reduce non-essential allocations by ₹4,500 this month, or temporarily pause contributions to your safety buffer until things settle.',
  },
];

export function WarningScreen({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState<(typeof LEVELS)[number]>('Deficit (₹4,500)');
  const [choice, setChoice] = useState<string | null>(null);

  return (
    <Screen
      footer={
        <View>
          <PrimaryButton label="Apply chosen strategy" onPress={onBack} />
          <View style={styles.backLink}>
            <TextLink label="Back to plan" onPress={onBack} muted />
          </View>
        </View>
      }>
      <PageHeader title="Surplus Warning" onBack={onBack} />
      <View style={styles.chips}>
        {LEVELS.map(item => (
          <Chip
            key={item}
            label={item}
            selected={level === item}
            onPress={() => setLevel(item)}
          />
        ))}
      </View>
      <Text style={styles.headline}>
        You're spending ₹4,500 more than you earn.
      </Text>
      <Text style={styles.body}>
        Your planned monthly outgoings exceed your take-home pay. Select an
        approach to balance your monthly map.
      </Text>
      {OPTIONS.map(option => {
        const selected = choice === option.id;
        return (
          <Pressable
            key={option.id}
            onPress={() => setChoice(option.id)}
            style={[styles.card, selected && styles.cardOn]}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{option.title}</Text>
              <Radio selected={selected} />
            </View>
            <Text style={styles.cardBody}>{option.body}</Text>
          </Pressable>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 22,
  },
  headline: {
    color: colors.ink,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginBottom: 12,
  },
  body: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 18,
  },
  card: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radii.card,
    backgroundColor: colors.white,
    padding: 16,
    marginBottom: 12,
  },
  cardOn: {
    borderColor: colors.green,
    backgroundColor: colors.mint,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  cardBody: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  backLink: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 4,
  },
});
