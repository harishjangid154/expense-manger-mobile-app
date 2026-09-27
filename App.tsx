import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from './src/ui/theme';
import { WelcomeScreen } from './src/ui/screens/WelcomeScreen';
import { IncomeScreen } from './src/ui/screens/IncomeScreen';
import { DebtsScreen } from './src/ui/screens/DebtsScreen';
import { CardsScreen } from './src/ui/screens/CardsScreen';
import { ObligationsScreen } from './src/ui/screens/ObligationsScreen';
import { SavingsScreen } from './src/ui/screens/SavingsScreen';
import { ReviewScreen } from './src/ui/screens/ReviewScreen';
import { StrategyScreen } from './src/ui/screens/StrategyScreen';
import { PlanScreen } from './src/ui/screens/PlanScreen';
import { MilestoneScreen } from './src/ui/screens/MilestoneScreen';
import { WarningScreen } from './src/ui/screens/WarningScreen';
import { UnassignedScreen } from './src/ui/screens/UnassignedScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Income: undefined;
  Debts: undefined;
  Cards: undefined;
  Obligations: undefined;
  Savings: undefined;
  Review: undefined;
  Strategy: undefined;
  Plan: undefined;
  Milestone: undefined;
  Warning: undefined;
  Unassigned: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Welcome"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: 'slide_from_right',
            }}>
            <Stack.Screen name="Welcome">
              {({ navigation }) => (
                <WelcomeScreen onSetup={() => navigation.navigate('Income')} />
              )}
            </Stack.Screen>
            <Stack.Screen name="Income">
              {({ navigation }) => (
                <IncomeScreen
                  onBack={() => navigation.goBack()}
                  onContinue={() => navigation.navigate('Debts')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Debts">
              {({ navigation }) => (
                <DebtsScreen
                  onBack={() => navigation.goBack()}
                  onContinue={() => navigation.navigate('Cards')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Cards">
              {({ navigation }) => (
                <CardsScreen
                  onBack={() => navigation.goBack()}
                  onContinue={() => navigation.navigate('Obligations')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Obligations">
              {({ navigation }) => (
                <ObligationsScreen
                  onBack={() => navigation.goBack()}
                  onContinue={() => navigation.navigate('Savings')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Savings">
              {({ navigation }) => (
                <SavingsScreen
                  onBack={() => navigation.goBack()}
                  onContinue={() => navigation.navigate('Review')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Review">
              {({ navigation }) => (
                <ReviewScreen
                  onEdit={() => navigation.navigate('Income')}
                  onContinue={() => navigation.navigate('Strategy')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Strategy">
              {({ navigation }) => (
                <StrategyScreen
                  onBack={() => navigation.goBack()}
                  onStart={() => navigation.navigate('Plan')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Plan">
              {({ navigation }) => (
                <PlanScreen
                  onUpdate={() => navigation.navigate('Income')}
                  onStrategy={() => navigation.navigate('Strategy')}
                  onMilestone={() => navigation.navigate('Milestone')}
                  onWarning={() => navigation.navigate('Warning')}
                  onUnassigned={() => navigation.navigate('Unassigned')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Milestone">
              {({ navigation }) => (
                <MilestoneScreen onBack={() => navigation.navigate('Plan')} />
              )}
            </Stack.Screen>
            <Stack.Screen name="Warning">
              {({ navigation }) => (
                <WarningScreen onBack={() => navigation.navigate('Plan')} />
              )}
            </Stack.Screen>
            <Stack.Screen name="Unassigned">
              {({ navigation }) => (
                <UnassignedScreen onBack={() => navigation.navigate('Plan')} />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
