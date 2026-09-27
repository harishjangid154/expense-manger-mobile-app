import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Body,
  CheckRow,
  Field,
  Headline,
  PrimaryButton,
  Screen,
  SelectField,
  TrashIcon,
  WizardHeader,
} from '../components';
import { colors, radii } from '../theme';

const LOAN_TYPES = [
  'Car loan',
  'Personal loan',
  'Home loan',
  'Education loan',
  'Other',
];

type Debt = {
  id: string;
  name: string;
  outstanding: string;
  apr: string;
  payment: string;
  type: string;
  prepaid: boolean;
};

const starter: Debt = {
  id: 'debt-1',
  name: 'HDFC Car Loan',
  outstanding: '4,20,000',
  apr: '9.2',
  payment: '12,500',
  type: 'Car loan',
  prepaid: true,
};

export function DebtsScreen({
  onBack,
  onContinue,
}: {
  onBack: () => void;
  onContinue: () => void;
}) {
  const [debts, setDebts] = useState<Debt[]>([starter]);

  const update = (id: string, patch: Partial<Debt>) => {
    setDebts(current =>
      current.map(debt => (debt.id === id ? { ...debt, ...patch } : debt)),
    );
  };

  return (
    <Screen footer={<PrimaryButton label="Continue" onPress={onContinue} />}>
      <WizardHeader step={2} title="Loans & Debts" onBack={onBack} />
      <Headline>Any loans or active debts?</Headline>
      <Body>
        Listing your debts helps Paisa Path prioritize where to throw your extra
        money.
      </Body>
      {debts.map((debt, index) => (
        <View key={debt.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.debtLabel}>DEBT #{index + 1}</Text>
            <Pressable
              style={styles.remove}
              onPress={() =>
                setDebts(current => current.filter(item => item.id !== debt.id))
              }>
              <TrashIcon />
              <Text style={styles.removeLabel}>Remove</Text>
            </Pressable>
          </View>
          <Field
            label="Debt name"
            value={debt.name}
            onChangeText={name => update(debt.id, { name })}
          />
          <View style={styles.split}>
            <View style={styles.splitItem}>
              <Field
                label="Outstanding"
                prefix="₹"
                value={debt.outstanding}
                onChangeText={outstanding => update(debt.id, { outstanding })}
              />
            </View>
            <View style={styles.splitItem}>
              <Field
                label="APR / Interest"
                prefix="%"
                value={debt.apr}
                onChangeText={apr => update(debt.id, { apr })}
              />
            </View>
          </View>
          <Field
            label="Min. monthly payment"
            prefix="₹"
            value={debt.payment}
            onChangeText={payment => update(debt.id, { payment })}
          />
          <SelectField
            label="Loan Type"
            value={debt.type}
            options={LOAN_TYPES}
            onChange={type => update(debt.id, { type })}
          />
          <CheckRow
            label="Can be prepaid / foreclosed"
            checked={debt.prepaid}
            onPress={() => update(debt.id, { prepaid: !debt.prepaid })}
          />
        </View>
      ))}
      <Pressable
        style={styles.add}
        onPress={() =>
          setDebts(current => [
            ...current,
            {
              id: `debt-${current.length + 1}`,
              name: '',
              outstanding: '',
              apr: '',
              payment: '',
              type: 'Personal loan',
              prepaid: false,
            },
          ])
        }>
        <Text style={styles.addLabel}>+ Add another debt</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  debtLabel: {
    color: colors.green,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  remove: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  removeLabel: {
    color: colors.muted,
    fontSize: 14,
  },
  split: {
    flexDirection: 'row',
    gap: 12,
  },
  splitItem: {
    flex: 1,
  },
  add: {
    height: 56,
    borderRadius: radii.input,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  addLabel: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '600',
  },
});
