import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';

const motivationalQuotes = [
  "Discipline is the bridge between goals and accomplishment.",
  "Your future is created by what you do today, not tomorrow.",
  "Success is the sum of small efforts repeated day in and day out.",
  "The only way to do great work is to love what you do.",
  "Focus on being productive instead of busy.",
  "Excellence is not a skill, it's an attitude.",
];

interface HeaderProps {
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({ userName = "Harish" }) => {
  const [greeting, setGreeting] = useState("");
  const [quote, setQuote] = useState("");
  
  const greetingOpacity = useSharedValue(0);
  const quoteOpacity = useSharedValue(0);

  useEffect(() => {
    const hour = new Date().getHours();
    let greetingText = "";
    
    if (hour < 12) {
      greetingText = "Good Morning";
    } else if (hour < 17) {
      greetingText = "Good Afternoon";
    } else {
      greetingText = "Good Evening";
    }
    
    setGreeting(greetingText);
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    
    greetingOpacity.value = withDelay(300, withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) }));
    quoteOpacity.value = withDelay(800, withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) }));
  }, []);

  const greetingAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: greetingOpacity.value,
      transform: [
        { translateY: interpolate(greetingOpacity.value, [0, 1], [20, 0]) }
      ],
    };
  });

  const quoteAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: quoteOpacity.value,
      transform: [
        { translateY: interpolate(quoteOpacity.value, [0, 1], [20, 0]) }
      ],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.greeting, greetingAnimatedStyle]}>
        {greeting}, <Text style={styles.userName}>{userName}</Text>
      </Animated.Text>
      <Animated.Text style={[styles.quote, quoteAnimatedStyle]}>
        "{quote}"
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textShadowColor: '#ff00ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  userName: {
    color: '#00ffff',
    textShadowColor: '#00ffff',
  },
  quote: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
    lineHeight: 24,
    marginLeft: 4,
  },
});
