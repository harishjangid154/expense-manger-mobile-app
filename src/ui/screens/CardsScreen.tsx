import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Body,
  ChoiceChip,
  Field,
  Headline,
  PrimaryButton,
  Screen,
  WizardHeader,
} from '../components';
import { colors, radii } from '../theme';

export function CardsScreen({
  onBack,
  onContinue,
}: {
  onBack: () => void;
  onContinue: () => void;
}) {
  const [spend, setSpend] = useState('18,000');
  const [payoff, setPayoff] = useState('25,000');
  const [carriesBalance, setCarriesBalance] = useState(true);

  return (
    <Screen footer={<PrimaryButton label="Continue" onPress={onContinue} />}>
      <WizardHeader step={3} title="Credit Cards" onBack={onBack} />
      <Headline>About your card spending</Headline>
      <Body>
        Credit cards can be powerful tools, or dangerous traps. Let's inspect
        how you handle them.
      </Body>
      <Field
        label="Normal monthly card spend"
        prefix="₹"
        value={spend}
        onChangeText={setSpend}
        hint="Estimate your average monthly grocery, dining, & online swipes."
      />
      <Text style={styles.question}>Do you carry a balance on any card?</Text>
      <View style={styles.choices}>
        <ChoiceChip
          label="I pay in full every month"
          selected={!carriesBalance}
          onPress={() => setCarriesBalance(false)}
        />
        <ChoiceChip
          label="I carry a balance"
          selected={carriesBalance}
          onPress={() => setCarriesBalance(true)}
        />
      </View>
      {carriesBalance ? (
        <View style={styles.alert}>
          <Text style={styles.alertKicker}>ATTENTION REQUIRED</Text>
          <Text style={styles.alertBody}>
            Unpaid credit card balances regularly charge 36%–42% interest in
            India. This is your highest-priority financial fire.
          </Text>
          <Field
            label="How much could you pay off right now?"
            prefix="₹"
            value={payoff}
            onChangeText={setPayoff}
            hint="From instantly accessible cash, if any."
          />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  question: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  choices: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  alert: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: 16,
  },
  alertKicker: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  alertBody: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
});
