import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, radii } from './theme';

export function Screen({
  children,
  footer,
  scroll = true,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
  scroll?: boolean;
}) {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={styles.staticContent}>{children}</View>
      )}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

export function PrimaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
      <Text style={styles.primaryLabel}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  style,
}: {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryButton,
        style,
        pressed && styles.pressed,
      ]}>
      <Text style={styles.secondaryLabel}>{label}</Text>
    </Pressable>
  );
}

export function TextLink({
  label,
  onPress,
  muted = false,
}: {
  label: string;
  onPress: () => void;
  muted?: boolean;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8}>
      <Text style={[styles.link, muted && styles.linkMuted]}>{label}</Text>
    </Pressable>
  );
}

export function WizardHeader({
  step,
  title,
  onBack,
}: {
  step: 1 | 2 | 3 | 4 | 5;
  title: string;
  onBack: () => void;
}) {
  const percent = step * 20;
  return (
    <View>
      <View style={styles.stepRow}>
        <Text style={styles.stepLabel}>STEP {step} OF 5</Text>
        <Text style={styles.stepPercent}>{percent}% complete</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.trackFill, { width: `${percent}%` }]} />
      </View>
      <View style={styles.titleRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          style={styles.backButton}>
          <BackIcon />
        </Pressable>
        <Text style={styles.screenTitle}>{title}</Text>
      </View>
    </View>
  );
}

export function PageHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <View style={styles.titleRow}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={onBack}
        style={styles.backButton}>
        <BackIcon />
      </Pressable>
      <Text style={styles.screenTitle}>{title}</Text>
    </View>
  );
}

export function Headline({ children }: { children: string }) {
  return <Text style={styles.headline}>{children}</Text>;
}

export function Body({ children }: { children: string }) {
  return <Text style={styles.body}>{children}</Text>;
}

export function Field({
  label,
  value,
  onChangeText,
  hint,
  prefix,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  hint?: string;
  prefix?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputShell}>
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          style={styles.input}
          placeholderTextColor={colors.muted}
        />
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable style={styles.inputShell} onPress={() => setOpen(current => !current)}>
        <Text style={styles.selectValue}>{value}</Text>
        <ChevronIcon />
      </Pressable>
      {open ? (
        <View style={styles.menu}>
          {options.map(option => (
            <Pressable
              key={option}
              onPress={() => {
                onChange(option);
                setOpen(false);
              }}
              style={styles.menuItem}>
              <Text
                style={[
                  styles.menuLabel,
                  option === value && styles.menuLabelActive,
                ]}>
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function CheckRow({
  label,
  checked,
  onPress,
}: {
  label: string;
  checked: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.checkRow} onPress={onPress}>
      <View style={[styles.checkbox, checked && styles.checkboxOn]}>
        {checked ? <CheckIcon color={colors.white} /> : null}
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected ? styles.chipOn : styles.chipOff]}>
      <Text style={[styles.chipLabel, selected && styles.chipLabelOn]}>{label}</Text>
    </Pressable>
  );
}

export function ChoiceChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.choice, selected ? styles.choiceOn : styles.choiceOff]}>
      <Text style={[styles.choiceLabel, selected && styles.choiceLabelOn]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Radio({ selected }: { selected: boolean }) {
  return (
    <View style={[styles.radio, selected && styles.radioOn]}>
      {selected ? <View style={styles.radioDot} /> : null}
    </View>
  );
}

export function PathLogo({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Path
        d="M7 23c3.2-.4 4.8-3.6 6.4-6.2 1.5-2.4 2.6-3.2 4.4-4.4 2.2-1.5 3.4-4.6 7.2-5.2"
        stroke={colors.green}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <Circle cx="25.2" cy="7.2" r="3.1" fill={colors.green} />
      <Circle cx="7.2" cy="23.4" r="1.7" fill={colors.green} />
    </Svg>
  );
}

export function BackIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M11.5 3.5 6 9l5.5 5.5"
        stroke={colors.ink}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ShieldIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3.5 19 6.2v5.4c0 4.2-2.8 7.2-7 8.9-4.2-1.7-7-4.7-7-8.9V6.2L12 3.5Z"
        stroke={colors.green}
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
      <Path
        d="m8.8 12.1 2.2 2.2 4.3-4.6"
        stroke={colors.green}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function LeafIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 5s-7.2-.4-11 3.6C4.4 12.4 5 19 5 19s6.4.2 10.2-3.6C18.8 12 19 5 19 5Z"
        stroke={colors.green}
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
      <Path
        d="M9 15c2-2 4.2-4.2 6.5-6"
        stroke={colors.green}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function BoltIcon({ color = colors.green }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path d="M10 1.5 3.5 10h4.2L7.2 16.5 14.5 8H10.2L10 1.5Z" fill={color} />
    </Svg>
  );
}

export function TrashIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M4 5.5h10M7 5.2V3.8h4v1.4M6 5.5l.6 9h4.8l.6-9"
        stroke={colors.muted}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path
        d="m4 6 4 4 4-4"
        stroke={colors.muted}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckIcon({ color }: { color: string }) {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
      <Path
        d="m2 6.2 2.4 2.4L10 3.4"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function WelcomeMark() {
  return (
    <View style={styles.heroCard}>
      <View style={styles.heroCircle}>
        <Svg width={92} height={72} viewBox="0 0 92 72" fill="none">
          <Path
            d="M8 52c8 2 12-8 18-14 6-6 8-4 14-10 7-7 10-16 20-18"
            stroke={colors.green}
            strokeWidth={2.2}
            strokeLinecap="round"
          />
          <Path
            d="M18 58c10-1 14-6 22-6 6 0 8 4 16 4 6 0 10-3 16-2"
            stroke="#C9B59A"
            strokeWidth={1.6}
            strokeLinecap="round"
          />
          <Circle cx="62" cy="12" r="8" fill="#F4C56A" />
          <Circle cx="62" cy="12" r="5.2" stroke={colors.green} strokeWidth={1.3} />
          <Path d="M62 8.2v4.2l2.4 1.4" stroke={colors.green} strokeWidth={1.2} strokeLinecap="round" />
        </Svg>
      </View>
      <Text style={styles.kicker}>YOUR SURPLUSES, DIRECTED.</Text>
      <Text style={styles.heroCaption}>No algorithms. Just solid rules.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
  },
  staticContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: colors.background,
  },
  primaryButton: {
    height: 58,
    borderRadius: radii.button,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButton: {
    height: 54,
    borderRadius: radii.button,
    borderWidth: 1.5,
    borderColor: '#D9D3C8',
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  secondaryLabel: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.86,
  },
  link: {
    color: colors.green,
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  linkMuted: {
    color: colors.muted,
    fontWeight: '500',
  },
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  stepPercent: {
    color: colors.green,
    fontSize: 13,
    fontWeight: '600',
  },
  track: {
    height: 6,
    borderRadius: 99,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    backgroundColor: colors.green,
    borderRadius: 99,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 22,
    gap: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '700',
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
    marginBottom: 22,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputShell: {
    minHeight: 56,
    borderRadius: radii.input,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prefix: {
    color: colors.ink,
    fontSize: 18,
  },
  input: {
    flex: 1,
    color: colors.ink,
    fontSize: 18,
    paddingVertical: 14,
  },
  selectValue: {
    flex: 1,
    color: colors.ink,
    fontSize: 17,
  },
  hint: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
  menu: {
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuLabel: {
    color: colors.ink,
    fontSize: 16,
  },
  menuLabelActive: {
    color: colors.green,
    fontWeight: '600',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  checkboxOn: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  checkLabel: {
    color: colors.ink,
    fontSize: 15,
  },
  chip: {
    borderRadius: radii.chip,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chipOn: {
    backgroundColor: colors.green,
  },
  chipOff: {
    backgroundColor: colors.card,
  },
  chipLabel: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '600',
  },
  chipLabelOn: {
    color: colors.white,
  },
  choice: {
    flex: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  choiceOn: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.green,
  },
  choiceOff: {
    backgroundColor: colors.card,
  },
  choiceLabel: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  choiceLabelOn: {
    color: colors.green,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#C9C3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {
    borderColor: colors.green,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.green,
  },
  heroCard: {
    backgroundColor: colors.card,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: 'center',
  },
  heroCircle: {
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: colors.peach,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  kicker: {
    color: colors.green,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  heroCaption: {
    color: colors.muted,
    fontSize: 14,
  },
});
