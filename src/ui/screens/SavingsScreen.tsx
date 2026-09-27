import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Body,
  Chip,
  Field,
  Headline,
  LeafIcon,
  PrimaryButton,
  Screen,
  WizardHeader,
} from '../components';
import { colors } from '../theme';

const TAGS = ['Emergency fund', 'General savings', 'Other'] as const;

export function SavingsScreen({
  onBack,
  onContinue,
}: {
  onBack: () => void;
  onContinue: () => void;
}) {
  const [savings, setSavings] = useState('45,000');
  const [tag, setTag] = useState<(typeof TAGS)[number]>('Emergency fund');

  return (
    <Screen footer={<PrimaryButton label="See your plan" onPress={onContinue} />}>
      <WizardHeader step={5} title="Existing Savings" onBack={onBack} />
      <Headline>Any existing savings?</Headline>
      <Body>
        This is the cash you have sitting in bank accounts, FDs, or liquid
        funds. Exclude lock-in EPF or long-term mutual funds.
      </Body>
      <Field
        label="Total liquid savings"
        prefix="₹"
        value={savings}
        onChangeText={setSavings}
      />
      <Text style={styles.question}>How is this currently tagged?</Text>
      <View style={styles.tags}>
        {TAGS.map(item => (
          <Chip
            key={item}
            label={item}
            selected={tag === item}
            onPress={() => setTag(item)}
          />
        ))}
      </View>
      <View style={styles.note}>
        <LeafIcon />
        <Text style={styles.noteText}>
          Even ₹0 is a fine starting point. Everyone begins exactly where they
          are.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  question: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 22,
  },
  note: {
    backgroundColor: colors.mint,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  noteText: {
    flex: 1,
    color: colors.ink,
    fontSize: 15,
    lineHeight: 22,
  },
});
