import React, { useState } from 'react';
import {
  Body,
  Field,
  Headline,
  PrimaryButton,
  Screen,
  WizardHeader,
} from '../components';

export function ObligationsScreen({
  onBack,
  onContinue,
}: {
  onBack: () => void;
  onContinue: () => void;
}) {
  const [rent, setRent] = useState('22,000');
  const [household, setHousehold] = useState('12,000');
  const [personal, setPersonal] = useState('6,500');
  const [family, setFamily] = useState('4,000');
  const [misc, setMisc] = useState('2,000');

  return (
    <Screen footer={<PrimaryButton label="Continue" onPress={onContinue} />}>
      <WizardHeader step={4} title="Monthly Obligations" onBack={onBack} />
      <Headline>Monthly obligations</Headline>
      <Body>
        What does it cost to run your life every month? Estimate your typical
        non-negotiable costs.
      </Body>
      <Field label="Rent / housing" prefix="₹" value={rent} onChangeText={setRent} />
      <Field
        label="Household expenses (groceries, bills)"
        prefix="₹"
        value={household}
        onChangeText={setHousehold}
      />
      <Field
        label="Personal needs & dining out"
        prefix="₹"
        value={personal}
        onChangeText={setPersonal}
      />
      <Field
        label="Family obligations & school fees"
        prefix="₹"
        value={family}
        onChangeText={setFamily}
      />
      <Field label="Miscellaneous" prefix="₹" value={misc} onChangeText={setMisc} />
    </Screen>
  );
}
