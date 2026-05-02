import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnimatedBackground } from './AnimatedBackground';
import { CommonLayout } from './CommonLayout';
import { GlassCard } from './GlassCard';

interface PlaceholderScreenProps {
  title: string;
  subtitle: string;
}

const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({
  title,
  subtitle,
}) => {
  return (
    <AnimatedBackground>
      <CommonLayout>
        <View style={styles.container}>
          <GlassCard style={styles.card} opacity={0.1}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </GlassCard>
        </View>
      </CommonLayout>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 15,
    lineHeight: 22,
  },
});

export default PlaceholderScreen;
