import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Body,
  Field,
  Headline,
  PrimaryButton,
  Screen,
  ShieldIcon,
  WizardHeader,
} from '../components';
import { colors } from '../theme';

export function IncomeScreen({
  onBack,
  onContinue,
}: {
  onBack: () => void;
  onContinue: () => void;
}) {
  const [income, setIncome] = useState('85,000');

  return (
    <Screen footer={<PrimaryButton label="Continue" onPress={onContinue} />}>
      <WizardHeader step={1} title="Monthly Income" onBack={onBack} />
      <Headline>What's your monthly take-home?</Headline>
      <Body>
        Enter your actual in-hand salary, business profit, or regular income
        that hits your account each month.
      </Body>
      <Field
        label="In-hand monthly income"
        prefix="₹"
        value={income}
        onChangeText={setIncome}
        hint="Exclude any dynamic annual bonuses or one-off payouts."
      />
      <View style={styles.note}>
        <ShieldIcon />
        <Text style={styles.noteText}>
          This value remains on your device. We never sync your personal
          financial data to a cloud.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: {
    marginTop: 8,
    backgroundColor: colors.card,
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
