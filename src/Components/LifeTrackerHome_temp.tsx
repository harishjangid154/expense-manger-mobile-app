import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedBackground } from './AnimatedBackground';
import { Header } from './Header';
import { SummaryCards } from './SummaryCards';
import { ProgressSection } from './CircularProgress';
import { RadialMenu } from './RadialMenu';
import { BottomNavigation } from './BottomNavigation';

export const LifeTrackerHome: React.FC = () => {
  return (
    <AnimatedBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Header userName="Harish" />
          <SummaryCards />
          <ProgressSection />
          
          <View style={styles.spacer} />
        </ScrollView>
        
        <RadialMenu 
          actions={[
            {
              id: 'expense',
              icon: '¥',
              label: 'Expense',
              color: '#00ffff',
              onPress: () => console.log('Add Expense pressed'),
            },
            {
              id: 'goal',
              icon: '¥',
              label: 'Goal',
              color: '#00ff00',
              onPress: () => console.log('Add Goal pressed'),
            },
            {
              id: 'activity',
              icon: '¥',
              label: 'Activity',
              color: '#ff00ff',
              onPress: () => console.log('Log Activity pressed'),
            },
          ]}
        />
        <BottomNavigation />
      </SafeAreaView>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  spacer: {
    height: 20,
  },
});
