import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider } from './src/Context/AppContext';
import { LifeTrackerHome } from './src/Components/LifeTrackerHome';
import UniversalInputScreen from './src/Components/UniversalInputScreen';
import FinancialDashboard from './src/Components/FinancialDashboard';
import HealthDisciplineScreen from './src/Components/HealthDisciplineScreen';
import GoalManagementScreen from './src/Components/GoalManagementScreen';
import SettingsScreen from './src/Components/SettingsScreen';
import React, { useEffect } from 'react';
import { SqLiteHandler } from './src/Utils/sqlite';
import { ToastProvider } from './src/Context/ToastContext';
// Create the navigation stack
const Stack = createNativeStackNavigator();

export default function App() {
  const [dbInitialized, setDbInitialized] = React.useState(false);
  const [sqliteHandler, setSqliteHandler] =
    React.useState<SqLiteHandler | null>(null);

  const onDbInitComplete = (instance: SqLiteHandler) => {
    if (instance) {
      console.log('Database initialized successfully');
      setDbInitialized(true);
      setSqliteHandler(instance);
    } else {
      console.log('Database initialization failed');
    }
  };

  useEffect(() => {
    new SqLiteHandler({
      onInitialized: onDbInitComplete,
    });
  }, []);

  if (!dbInitialized || !sqliteHandler) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <Text>Initializing database...</Text>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <AppProvider dbInitalized={true} sqliteHandler={sqliteHandler}>
          <ToastProvider>
            <Stack.Navigator>
              <Stack.Screen
                name="Home"
                component={LifeTrackerHome}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Finance"
                component={FinancialDashboard}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Health"
                component={HealthDisciplineScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Goals"
                component={GoalManagementScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="UniversalInput"
                component={UniversalInputScreen}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          </ToastProvider>
        </AppProvider>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
