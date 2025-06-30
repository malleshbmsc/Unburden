import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send, Mic, MicOff, MessageCircle, Smile, Sparkles, Heart as ThoughtBubble } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { usePremium } from '@/hooks/usePremium';
import { geminiService } from '@/services/geminiService';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

interface MoodOption {
  id: string;
  text: string;
  action: 'better' | 'distract' | 'reflect';
  icon: React.ReactNode;
  color: string;
}

export default function ChatScreen() {
  const router = useRouter();
  const { isPremium, premiumFeatures } = usePremium();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi there 💜 I'm here to listen with an open heart. Share whatever is on your mind - there's no judgment here, just genuine support and understanding.",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showMoodOptions, setShowMoodOptions] = useState(false);
  const [sessionStartTime] = useState(new Date());
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isAITyping, setIsAITyping] = useState(false);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);
  const pulseScale = useSharedValue(1);
  const typingOpacity = useSharedValue(0.3);

  const moodOptions: MoodOption[] = [
    {
      id: 'better',
      text: 'I feel better now',
      action: 'better',
      icon: <Smile size={20} color="#4FD1C7" strokeWidth={2} />,
      color: '#4FD1C7',
    },
    {
      id: 'distract',
      text: 'Distract me please',
      action: 'distract',
      icon: <Sparkles size={20} color="#FFB3BA" strokeWidth={2} />,
      color: '#FFB3BA',
    },
    {
      id: 'reflect',
      text: 'Help me reflect',
      action: 'reflect',
      icon: <ThoughtBubble size={20} color="#B19CD9" strokeWidth={2} />,
      color: '#B19CD9',
    },
  ];

  // Auto-scroll to bottom when messages change or keyboard appears
  const scrollToBottom = (animated: boolean = true) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
    }, 100);
  };

  useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.1, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    // Typing indicator animation
    typingOpacity.value = withRepeat(
      withTiming(1, {
        duration: 800,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    // Track session duration
    const interval = setInterval(() => {
      const currentTime = new Date();
      const duration = (currentTime.getTime() - sessionStartTime.getTime()) / 1000 / 60;
      setSessionDuration(duration);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const pulseAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
    };
  });

  const typingAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: typingOpacity.value,
    };
  });

  // Get conversation history for context
  const getConversationHistory = (): { text: string; isUser: boolean }[] => {
    return messages
      .filter(msg => !msg.isTyping && msg.text.trim() !== '')
      .map(msg => ({
        text: msg.text,
        isUser: msg.isUser
      }));
  };

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    try {
      setIsGeneratingResponse(true);
      const conversationHistory = getConversationHistory();
      const response = await geminiService.generateResponse(userMessage, conversationHistory);
      return response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      // Fallback response
      return "I'm here with you, and I want you to know that your feelings are completely valid. Sometimes I need a moment to find the right words, but please know that I'm listening with care. 💜";
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  const simulateTypingResponse = async (userMessage: string, messageId: string) => {
    setIsAITyping(true);
    
    // Add typing indicator message
    const typingMessage: Message = {
      id: messageId,
      text: '',
      isUser: false,
      timestamp: new Date(),
      isTyping: true,
    };
    
    setMessages(prev => [...prev, typingMessage]);

    try {
      // Generate AI response
      const responseText = await generateAIResponse(userMessage);
      
      // Simulate realistic typing delay based on response length
      const typingDelay = Math.min(Math.max(responseText.length * 30, 1500), 4000);
      
      setTimeout(() => {
        // Replace typing message with actual response
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, text: responseText, isTyping: false }
              : msg
          )
        );
        setIsAITyping(false);
        
        // Keep focus on input after AI responds (like WhatsApp)
        setTimeout(() => {
          textInputRef.current?.focus();
        }, 300);
      }, typingDelay);
      
    } catch (error) {
      console.error('Error in typing simulation:', error);
      // Handle error case
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { 
                  ...msg, 
                  text: "I'm having a moment of difficulty, but I'm still here for you. Your feelings matter, and I want to support you through this. 💜", 
                  isTyping: false 
                }
              : msg
          )
        );
        setIsAITyping(false);
        setTimeout(() => {
          textInputRef.current?.focus();
        }, 300);
      }, 1500);
    }
  };

  const handleSendMessage = () => {
    if (inputText.trim() === '' || isAITyping || isGeneratingResponse) return;

    // Check session limits for free users
    if (!isPremium && sessionDuration >= 10) {
      Alert.alert(
        'Session Limit Reached',
        'Free users can chat for 10 minutes. Upgrade to PRO for unlimited sessions.',
        [
          { text: 'Maybe Later', style: 'cancel' },
          { text: 'Upgrade Now', onPress: () => router.push('/(tabs)/settings') },
        ]
      );
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    const currentInput = inputText.trim();
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Keep keyboard open and maintain focus (like WhatsApp)
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 50);

    // Generate AI response with typing simulation
    const aiMessageId = (Date.now() + 1).toString();
    simulateTypingResponse(currentInput, aiMessageId);
  };

  const handleMoodOption = async (option: MoodOption) => {
    setShowMoodOptions(false);
    
    const messageId = Date.now().toString();
    setIsAITyping(true);
    
    // Add typing indicator
    const typingMessage: Message = {
      id: messageId,
      text: '',
      isUser: false,
      timestamp: new Date(),
      isTyping: true,
    };
    
    setMessages(prev => [...prev, typingMessage]);

    try {
      // Generate mood-specific response using Gemini
      const conversationHistory = getConversationHistory();
      const responseText = await geminiService.generateMoodResponse(option.action, conversationHistory);
      
      // Simulate typing delay
      const typingDelay = Math.min(Math.max(responseText.length * 25, 1200), 3000);
      
      setTimeout(() => {
        // Replace typing message with actual response
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, text: responseText, isTyping: false }
              : msg
          )
        );
        setIsAITyping(false);
        
        // Handle special case for "better" option
        if (option.action === 'better') {
          setTimeout(() => {
            Alert.alert(
              'Session Complete',
              'Take a deep breath and carry this feeling with you. You did great today. 💜',
              [{ text: 'Thank You', onPress: () => router.back() }]
            );
          }, 3000);
        }
      }, typingDelay);
      
    } catch (error) {
      console.error('Error generating mood response:', error);
      
      // Fallback responses
      const fallbacks = {
        better: "I'm so glad you're feeling better! 🌟 You've shown incredible strength and resilience today. Take care of yourself, and remember - I'm always here whenever you need support.",
        distract: "Here's something beautiful to think about: Every small step you take toward healing matters, even when you can't see the progress. You're doing better than you know. ✨",
        reflect: "Looking at our conversation, I see someone who had the courage to reach out and be honest about their feelings. That vulnerability is actually a sign of tremendous strength. 💜"
      };
      
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, text: fallbacks[option.action], isTyping: false }
              : msg
          )
        );
        setIsAITyping(false);
      }, 1500);
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      Alert.alert('Voice Input', 'Voice input would be implemented here with speech-to-text API');
    }
  };

  const renderTypingIndicator = () => (
    <View style={styles.typingContainer}>
      <Animated.View style={[styles.typingDot, typingAnimatedStyle]} />
      <Animated.View style={[styles.typingDot, typingAnimatedStyle, { animationDelay: 200 }]} />
      <Animated.View style={[styles.typingDot, typingAnimatedStyle, { animationDelay: 400 }]} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#B19CD9', '#4FD1C7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerText}>Unburden AI</Text>
            <Text style={styles.headerSubtext}>
              {isAITyping ? 'Thinking...' : isGeneratingResponse ? 'Processing...' : 'Your safe space'}
            </Text>
          </View>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionText}>
              {isPremium ? '∞' : `${Math.max(0, 10 - Math.floor(sessionDuration))}m`}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Chat Container with Keyboard Avoiding View */}
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <View style={styles.chatContainer}>
          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10,
            }}
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.isUser ? styles.userMessageContainer : styles.aiMessageContainer,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    message.isUser ? styles.userBubble : styles.aiBubble,
                  ]}
                >
                  {message.isTyping ? (
                    renderTypingIndicator()
                  ) : (
                    <Text
                      style={[
                        styles.messageText,
                        message.isUser ? styles.userText : styles.aiText,
                      ]}
                    >
                      {message.text}
                    </Text>
                  )}
                </View>
              </View>
            ))}
            {/* Extra padding to ensure last message is always visible */}
            <View style={styles.bottomSpacer} />
          </ScrollView>

          {/* Input Container */}
          <View style={styles.inputContainer}>
            <View style={styles.inputContent}>
              {/* How are you feeling button */}
              <TouchableOpacity
                style={[styles.moodButton, (isAITyping || isGeneratingResponse) && styles.disabledButton]}
                onPress={() => !(isAITyping || isGeneratingResponse) && setShowMoodOptions(true)}
                disabled={isAITyping || isGeneratingResponse}
                activeOpacity={0.8}
              >
                <View style={styles.moodButtonContent}>
                  <MessageCircle size={18} color={(isAITyping || isGeneratingResponse) ? '#9CA3AF' : '#B19CD9'} strokeWidth={2} />
                  <Text style={[styles.moodButtonText, (isAITyping || isGeneratingResponse) && styles.disabledText]}>
                    How are you feeling?
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Input Row */}
              <View style={styles.inputRow}>
                <View style={[styles.textInputContainer, (isAITyping || isGeneratingResponse) && styles.disabledInputContainer]}>
                  <TextInput
                    ref={textInputRef}
                    style={[styles.textInput, (isAITyping || isGeneratingResponse) && styles.disabledText]}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder={(isAITyping || isGeneratingResponse) ? "Please wait..." : "Share what's on your mind..."}
                    placeholderTextColor={(isAITyping || isGeneratingResponse) ? '#D1D5DB' : '#9CA3AF'}
                    multiline
                    maxLength={500}
                    returnKeyType="send"
                    onSubmitEditing={handleSendMessage}
                    blurOnSubmit={false}
                    editable={!(isAITyping || isGeneratingResponse)}
                    onFocus={() => scrollToBottom()}
                    autoFocus={false}
                  />
                </View>
                
                <TouchableOpacity
                  style={[styles.micButton, (isAITyping || isGeneratingResponse) && styles.disabledButton]}
                  onPress={toggleListening}
                  disabled={isAITyping || isGeneratingResponse}
                  activeOpacity={0.7}
                >
                  {isListening ? (
                    <Animated.View style={pulseAnimatedStyle}>
                      <MicOff size={22} color="#FF6B6B" strokeWidth={2} />
                    </Animated.View>
                  ) : (
                    <Mic size={22} color={(isAITyping || isGeneratingResponse) ? '#D1D5DB' : '#6B7280'} strokeWidth={2} />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    inputText.trim() && !(isAITyping || isGeneratingResponse) ? styles.sendButtonActive : null,
                    (isAITyping || isGeneratingResponse) && styles.disabledButton,
                  ]}
                  onPress={handleSendMessage}
                  disabled={inputText.trim() === '' || isAITyping || isGeneratingResponse}
                  activeOpacity={0.8}
                >
                  <Send
                    size={18}
                    color={inputText.trim() && !(isAITyping || isGeneratingResponse) ? '#FFFFFF' : '#9CA3AF'}
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Mood Options Modal */}
      <Modal
        visible={showMoodOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMoodOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>How are you feeling right now?</Text>
            <Text style={styles.modalSubtitle}>
              Take a moment to check in with yourself
            </Text>
            
            {moodOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.moodOptionButton, { borderLeftColor: option.color }]}
                onPress={() => handleMoodOption(option)}
                activeOpacity={0.8}
              >
                <View style={[styles.moodOptionIcon, { backgroundColor: option.color + '20' }]}>
                  {option.icon}
                </View>
                <Text style={styles.moodOptionText}>{option.text}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowMoodOptions(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Maybe later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerText: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 2,
  },
  sessionInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 50,
    alignItems: 'center',
  },
  sessionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 24,
  },
  userBubble: {
    backgroundColor: '#B19CD9',
    borderBottomRightRadius: 8,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: '#374151',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#B19CD9',
    marginHorizontal: 2,
  },
  bottomSpacer: {
    height: 20,
  },
  inputContainer: {
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  moodButton: {
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  moodButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
  },
  moodButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#B19CD9',
    marginLeft: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    maxHeight: 100,
    minHeight: 20,
    textAlignVertical: 'center',
    lineHeight: 22,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#B19CD9',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledInputContainer: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
  disabledText: {
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  moodOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  moodOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  moodOptionText: {
    fontSize: 17,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    flex: 1,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  }
});