import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BoltIcon,
  PageHeader,
  PrimaryButton,
  Radio,
  Screen,
  ShieldIcon,
} from '../components';
import { colors, radii } from '../theme';

const STRATEGIES = [
  {
    id: 'safety',
    title: 'Safety first',
    icon: 'shield' as const,
    body: 'Build your emergency buffer before attacking loans aggressively. Keeps you protected from unexpected setbacks.',
    timelineLabel: 'PROJECTED TIMELINE',
    timeline:
      '3-month Emergency Fund ready by June 2026.',
  },
  {
    id: 'aggressive',
    title: 'Aggressive debt payoff',
    icon: 'bolt' as const,
    body: 'Throw all surplus at HDFC Car Loan first to eliminate interest burden as quickly as possible.',
    timelineLabel: 'PROJECTED TIMELINE',
    timeline:
      'HDFC Car Loan fully paid off by October 2027 (saving ₹34,200 interest).',
  },
];

export function StrategyScreen({
  onBack,
  onStart,
}: {
  onBack: () => void;
  onStart: () => void;
}) {
  const [selected, setSelected] = useState('aggressive');

  return (
    <Screen footer={<PrimaryButton label="Start my plan" onPress={onStart} />}>
      <PageHeader title="Select Strategy" onBack={onBack} />
      <Text style={styles.headline}>Pick your approach</Text>
      <Text style={styles.body}>
        Select how to allocate your ₹26,000 monthly surplus. Choose the pace
        that lets you sleep best at night.
      </Text>
      {STRATEGIES.map(strategy => {
        const active = selected === strategy.id;
        return (
          <Pressable
            key={strategy.id}
            onPress={() => setSelected(strategy.id)}
            style={[styles.card, active ? styles.cardOn : styles.cardOff]}>
            <View style={styles.cardTop}>
              <View style={styles.titleWrap}>
                {strategy.icon === 'shield' ? <ShieldIcon /> : <BoltIcon />}
                <Text style={styles.cardTitle}>{strategy.title}</Text>
              </View>
              <Radio selected={active} />
            </View>
            <Text style={styles.cardBody}>{strategy.body}</Text>
            <View style={[styles.timeline, active && styles.timelineOn]}>
              <Text style={styles.timelineLabel}>{strategy.timelineLabel}</Text>
              <Text style={styles.timelineText}>{strategy.timeline}</Text>
            </View>
          </Pressable>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
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
    borderRadius: radii.card,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 14,
  },
  cardOff: {
    backgroundColor: colors.white,
    borderColor: colors.line,
  },
  cardOn: {
    backgroundColor: colors.mint,
    borderColor: colors.green,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
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
    marginBottom: 14,
  },
  timeline: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
  },
  timelineOn: {
    backgroundColor: colors.white,
  },
  timelineLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  timelineText: {
    color: colors.ink,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
});
