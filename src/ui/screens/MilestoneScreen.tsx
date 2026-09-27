import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PageHeader, PrimaryButton, Screen, ShieldIcon } from '../components';
import { colors, radii } from '../theme';

export function MilestoneScreen({ onBack }: { onBack: () => void }) {
  return (
    <Screen footer={<PrimaryButton label="Back to your plan" onPress={onBack} />}>
      <PageHeader title="Milestone Met" onBack={onBack} />
      <View style={styles.badge}>
        <ShieldIcon size={42} />
      </View>
      <Text style={styles.headline}>HDFC Car Loan fully cleared.</Text>
      <Text style={styles.body}>
        You have successfully wiped out this high-interest burden. This
        achievement shifts your entire trajectory forward.
      </Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Monthly cash flow impact</Text>
          <Text style={styles.rowValue}>Frees up{'\n'}₹12,500/mo</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Safety cushion buffer goal</Text>
          <Text style={styles.rowValueDark}>Reduced to 2{'\n'}months</Text>
        </View>
      </View>
      <Text style={styles.footerNote}>
        This means future surpluses can focus entirely on wealth building,
        since you carry much lower monthly risk.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.mint,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 28,
  },
  headline: {
    color: colors.ink,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 14,
  },
  body: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  rowLabel: {
    flex: 1,
    color: colors.muted,
    fontSize: 15,
  },
  rowValue: {
    color: colors.green,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    textAlign: 'right',
  },
  rowValueDark: {
    color: colors.ink,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#E4DFD4',
  },
  footerNote: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 22,
  },
});
