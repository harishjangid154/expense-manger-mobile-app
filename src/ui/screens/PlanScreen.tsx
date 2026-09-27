import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BoltIcon,
  PathLogo,
  PrimaryButton,
  Screen,
  SecondaryButton,
} from '../components';
import { colors, radii } from '../theme';

export function PlanScreen({
  onUpdate,
  onStrategy,
  onMilestone,
  onWarning,
  onUnassigned,
}: {
  onUpdate: () => void;
  onStrategy: () => void;
  onMilestone: () => void;
  onWarning: () => void;
  onUnassigned: () => void;
}) {
  return (
    <Screen
      footer={
        <View style={styles.footerStack}>
          <PrimaryButton label="Log savings deposit" onPress={onUnassigned} />
          <View style={styles.footerRow}>
            <SecondaryButton
              label="Update numbers"
              onPress={onUpdate}
              style={styles.footerButton}
            />
            <SecondaryButton
              label="Strategy"
              onPress={onStrategy}
              style={styles.footerButton}
            />
          </View>
        </View>
      }>
      <View style={styles.header}>
        <View style={styles.brand}>
          <PathLogo size={20} />
          <Text style={styles.brandName}>Paisa Path</Text>
        </View>
        <View style={styles.avatar}>
          <PathLogo size={22} />
        </View>
      </View>

      <Pressable style={styles.surplusCard} onPress={onUnassigned}>
        <Text style={styles.surplusKicker}>THIS MONTH'S SURPLUS</Text>
        <Text style={styles.surplusValue}>₹26,000</Text>
        <Text style={styles.surplusHint}>Ready to be directed to your goals.</Text>
      </Pressable>

      <Text style={styles.section}>Your allocation breakdown</Text>
      <View style={styles.allocRow}>
        <Text style={styles.allocLabel}>Safety Cushion buffer</Text>
        <Text style={styles.allocValue}>₹16,000</Text>
      </View>
      <View style={styles.allocRow}>
        <Text style={styles.allocLabel}>HDFC Car Loan attack</Text>
        <Text style={styles.allocValue}>₹10,000</Text>
      </View>

      <Pressable style={styles.loanCard} onPress={onMilestone}>
        <View style={styles.loanTop}>
          <View style={styles.loanTitle}>
            <BoltIcon />
            <Text style={styles.loanName}>HDFC Car Loan</Text>
          </View>
          <Text style={styles.loanDate}>October 2027 payoff</Text>
        </View>
        <View style={styles.loanMeta}>
          <Text style={styles.metaLabel}>Safety cushion status</Text>
          <Text style={styles.metaValue}>2.3 of 3 months saved</Text>
        </View>
        <View style={styles.track}>
          <View style={styles.trackFill} />
        </View>
      </Pressable>

      <View style={styles.milestone}>
        <View style={styles.dot} />
        <Text style={styles.milestoneText}>
          Next milestone: ₹12,000 more to clear personal loan.
        </Text>
      </View>

      <Pressable style={styles.alert} onPress={onWarning}>
        <BoltIcon color={colors.warningText} />
        <Text style={styles.alertText}>
          Your credit card spending has grown slightly. Consider capping this
          month's discretionary buy to keep your HDFC payoff timeline.
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandName: {
    color: colors.green,
    fontSize: 20,
    fontWeight: '700',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surplusCard: {
    backgroundColor: colors.mint,
    borderRadius: radii.card,
    padding: 18,
    marginBottom: 22,
  },
  surplusKicker: {
    color: colors.green,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  surplusValue: {
    color: colors.green,
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  surplusHint: {
    color: colors.muted,
    fontSize: 15,
    marginTop: 6,
  },
  section: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  allocRow: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  allocLabel: {
    color: colors.ink,
    fontSize: 15,
  },
  allocValue: {
    color: colors.green,
    fontSize: 16,
    fontWeight: '700',
  },
  loanCard: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: 16,
    marginTop: 8,
  },
  loanTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  loanTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  loanName: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  loanDate: {
    color: colors.muted,
    fontSize: 13,
  },
  loanMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 10,
  },
  metaLabel: {
    color: colors.muted,
    fontSize: 13,
  },
  metaValue: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  track: {
    height: 8,
    borderRadius: 99,
    backgroundColor: '#E4DFD4',
    overflow: 'hidden',
  },
  trackFill: {
    width: '76%',
    height: '100%',
    backgroundColor: colors.green,
  },
  milestone: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 16,
    marginBottom: 16,
    paddingRight: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.green,
    marginTop: 5,
  },
  milestoneText: {
    flex: 1,
    color: colors.ink,
    fontSize: 15,
    lineHeight: 21,
  },
  alert: {
    backgroundColor: colors.warningBg,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  alertText: {
    flex: 1,
    color: colors.warningText,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  footerStack: {
    gap: 10,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  footerButton: {
    flex: 1,
  },
});
