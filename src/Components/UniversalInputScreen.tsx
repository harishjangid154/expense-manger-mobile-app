import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { GlassCard } from './GlassCard';
import { CommonLayout } from './CommonLayout';
import { AnimatedBackground } from './AnimatedBackground';
import { LifeTrackerParseResult, parseWithAI } from '../Utils/aiParser';

const UniversalInputScreen: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [parsedData, setParsedData] = useState<LifeTrackerParseResult | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const aiAnimationScale = useSharedValue(1);
  const aiAnimationOpacity = useSharedValue(0.3);

  const handleProcess = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    aiAnimationScale.value = withTiming(1.1, {
      duration: 1000,
      easing: Easing.inOut(Easing.ease),
    });
    aiAnimationOpacity.value = withTiming(0.8, {
      duration: 1000,
      easing: Easing.inOut(Easing.ease),
    });

    try {
      const parsed = await parseWithAI(inputText);
      setParsedData(parsed);
    } catch (error) {
      console.error('Unable to parse input', error);
    } finally {
      setIsProcessing(false);
      aiAnimationScale.value = withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      });
      aiAnimationOpacity.value = withTiming(0.3, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      });
    }
  };

  const handleConfirm = () => {
    if (parsedData) {
      console.log('Confirmed:', parsedData);
      // Here you would save the data or navigate
    }
  };

  const handleEdit = () => {
    setInputText(String(parsedData?.data.description || ''));
    setParsedData(null);
  };

  const handleCancel = () => {
    setInputText('');
    setParsedData(null);
  };

  const aiAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: aiAnimationScale.value }],
      opacity: aiAnimationOpacity.value,
    };
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'expense':
        return '💸';
      case 'health':
        return '💪';
      case 'goal':
        return '🎯';
      default:
        return '📝';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'expense':
        return '#00ffff';
      case 'health':
        return '#00ff00';
      case 'goal':
        return '#ff00ff';
      default:
        return '#ffffff';
    }
  };

  return (
    <AnimatedBackground>
      <CommonLayout>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <Text style={styles.title}>Universal Input</Text>

            {/* Input Section */}
            <View style={styles.inputSection}>
              <TextInput
                style={styles.textInput}
                placeholder="Type naturally... (e.g., 'Spent 500 on food', 'Did 20 pushups')"
                value={inputText}
                onChangeText={setInputText}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                autoFocus={true}
              />

              {isProcessing && (
                <Animated.View
                  style={[styles.processingOverlay, aiAnimatedStyle]}
                >
                  <View style={styles.aiIndicator}>
                    <Text style={styles.aiText}>🤖 AI Processing...</Text>
                  </View>
                </Animated.View>
              )}
            </View>

            {/* Parsed Output Preview */}
            {parsedData && (
              <View style={styles.outputSection}>
                <Text style={styles.outputTitle}>Parsed Data</Text>
                <GlassCard style={styles.outputCard}>
                  <View style={styles.outputHeader}>
                    <Text style={styles.outputIcon}>
                      {getTypeIcon(parsedData.type)}
                    </Text>
                    <Text
                      style={[
                        styles.outputType,
                        { color: getTypeColor(parsedData.type) },
                      ]}
                    >
                      {parsedData.type.toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.outputContent}>
                    {typeof parsedData.data.amount === 'number' && (
                      <Text style={styles.outputAmount}>
                        {parsedData.type === 'expense' ? '$' : ''}
                        {parsedData.data.amount}
                      </Text>
                    )}
                    {parsedData.data.category && (
                      <Text style={styles.outputCategory}>
                        Category: {String(parsedData.data.category)}
                      </Text>
                    )}
                    <Text style={styles.outputDescription}>
                      {String(parsedData.data.description || '')}
                    </Text>
                  </View>
                </GlassCard>
              </View>
            )}

            {/* Action Buttons */}

            <View style={styles.buttonSection}>
              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={handleProcess}
              >
                <Text style={styles.buttonText}>Parse</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleConfirm}
              >
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={handleEdit}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </CommonLayout>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 30,
    textAlign: 'center',
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  inputSection: {
    marginBottom: 30,
  },
  textInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
    borderRadius: 20,
    fontSize: 18,
    color: '#ffffff',
    padding: 20,
    minHeight: 140,
    textAlignVertical: 'top',
    fontFamily: 'System',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
  },
  aiIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: '#00ffff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  aiText: {
    fontSize: 18,
    color: '#00ffff',
    marginTop: 8,
    fontWeight: '600',
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  outputSection: {
    marginBottom: 30,
  },
  outputTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  outputCard: {
    padding: 25,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
    borderRadius: 20,
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  outputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderRadius: 12,
  },
  outputIcon: {
    fontSize: 28,
    marginRight: 12,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  outputType: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  outputContent: {
    flex: 1,
  },
  outputAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00ffff',
    marginBottom: 8,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  outputCategory: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    fontWeight: '500',
  },
  outputDescription: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
    fontWeight: '400',
  },
  buttonSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 25,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 25,
    minWidth: 110,
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  confirmButton: {
    backgroundColor: 'rgba(0, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: '#00ffff',
  },
  editButton: {
    backgroundColor: 'rgba(255, 0, 255, 0.9)',
    borderWidth: 1,
    borderColor: '#ff00ff',
  },
  cancelButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});

export default UniversalInputScreen;
