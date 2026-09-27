import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton, Screen, TextLink } from '../components';
import { colors, radii } from '../theme';

const ROWS = [
  ['Rent / Housing', '− ₹22,000'],
  ['Household Bills', '− ₹12,000'],
  ['Personal Needs', '− ₹6,500'],
  ['Family Obligations', '− ₹4,000'],
  ['Minimum Car Loan EMI', '− ₹12,500'],
  ['Other Obligations', '− ₹2,000'],
];

export function ReviewScreen({
  onEdit,
  onContinue,
}: {
  onEdit: () => void;
  onContinue: () => void;
}) {
  return (
    <Screen
      footer={<PrimaryButton label="Choose your strategy" onPress={onContinue} />}>
      <Text style={styles.kicker}>Review Your Surplus</Text>
      <Text style={styles.headline}>Here's what we see</Text>
      <Text style={styles.body}>
        We subtract your active monthly obligations and minimum debt repayments
        from your take-home income.
      </Text>
      <View style={styles.card}>
        <View style={styles.topRow}>
          <Text style={styles.topLabel}>Monthly take-home</Text>
          <Text style={styles.topValue}>₹85,000</Text>
        </View>
        {ROWS.map(([label, value]) => (
          <View key={label} style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowValue}>{value}</Text>
          </View>
        ))}
        <View style={styles.surplusRow}>
          <Text style={styles.surplusLabel}>Your Monthly Surplus</Text>
          <Text style={styles.surplusValue}>₹26,000</Text>
        </View>
      </View>
      <View style={styles.editRow}>
        <Text style={styles.editPrompt}>Does this look right? </Text>
        <TextLink label="Edit numbers" onPress={onEdit} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 28,
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
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E4DFD4',
  },
  topLabel: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  topValue: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 11,
  },
  rowLabel: {
    color: colors.ink,
    fontSize: 15,
  },
  rowValue: {
    color: colors.muted,
    fontSize: 15,
  },
  surplusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E4DFD4',
    marginTop: 8,
    paddingTop: 16,
  },
  surplusLabel: {
    color: colors.green,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    paddingRight: 12,
  },
  surplusValue: {
    color: colors.green,
    fontSize: 22,
    fontWeight: '700',
  },
  editRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  editPrompt: {
    color: colors.muted,
    fontSize: 16,
  },
});
