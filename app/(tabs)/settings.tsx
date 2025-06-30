import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Settings as SettingsIcon, 
  Bell, 
  BellOff, 
  Shield, 
  CircleHelp as HelpCircle, 
  ExternalLink, 
  Trash2,
  Crown,
  Star,
  Heart,
  Clock,
  Calendar,
  Moon,
  Sunrise,
  Coffee,
  Zap
} from 'lucide-react-native';
import { usePremium } from '@/hooks/usePremium';
import PremiumModal from '@/components/PremiumModal';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
} from 'react-native-reanimated';

interface SettingItem {
  id: string;
  title: string;
  description: string;
  type: 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  icon: React.ReactNode;
  isPremium?: boolean;
}

interface ReminderSettings {
  dailyCheckIn: boolean;
  morningMotivation: boolean;
  afternoonBreak: boolean;
  eveningReflection: boolean;
  weeklyGoals: boolean;
  breathingReminder: boolean;
  gratitudePractice: boolean;
  selfCareReminder: boolean;
}

export default function SettingsScreen() {
  const { isPremium, premiumFeatures, upgradeToPremium } = usePremium();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [adPersonalization, setAdPersonalization] = useState(true);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    dailyCheckIn: false,
    morningMotivation: false,
    afternoonBreak: false,
    eveningReflection: false,
    weeklyGoals: false,
    breathingReminder: false,
    gratitudePractice: false,
    selfCareReminder: false,
  });

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 100],
      [0, -120],
      'clamp'
    );
    
    const opacity = interpolate(
      scrollY.value,
      [0, 50, 100],
      [1, 0.5, 0],
      'clamp'
    );

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  const handleReminderToggle = (key: keyof ReminderSettings, value: boolean) => {
    setReminderSettings(prev => ({ ...prev, [key]: value }));
    
    if (value) {
      // Show confirmation that reminder is set
      const reminderMessages = {
        dailyCheckIn: 'Daily check-in reminder set for 8:00 PM',
        morningMotivation: 'Morning motivation reminder set for 8:00 AM',
        afternoonBreak: 'Afternoon break reminder set for 2:00 PM',
        eveningReflection: 'Evening reflection reminder set for 9:00 PM',
        weeklyGoals: 'Weekly goals reminder set for Monday 10:00 AM',
        breathingReminder: 'Breathing exercise reminder set for 12:00 PM',
        gratitudePractice: 'Gratitude practice reminder set for 7:00 PM',
        selfCareReminder: 'Self-care reminder set for 6:00 PM',
      };
      
      Alert.alert(
        'Reminder Set',
        reminderMessages[key],
        [{ text: 'OK' }]
      );
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear Chat History',
      'This will permanently delete all your chat messages. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Chat history has been cleared.');
          },
        },
      ]
    );
  };

  const showPrivacyPolicy = () => {
    Alert.alert(
      'Privacy Policy',
      'Your privacy is our top priority. All conversations are processed locally and not stored on our servers. We only collect anonymous usage data to improve the app.',
      [{ text: 'OK' }]
    );
  };

  const showSupport = () => {
    Alert.alert(
      'Support',
      'Need help or have feedback? Contact us at support@unburden.app',
      [{ text: 'OK' }]
    );
  };

  const handleRateApp = () => {
    Alert.alert(
      'Rate Unburden',
      'Help others discover this app by leaving a review on the Play Store!',
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'Rate Now', onPress: () => console.log('Open Play Store') },
      ]
    );
  };

  const handleUpgradeSuccess = async () => {
    const success = await upgradeToPremium();
    if (success) {
      setShowPremiumModal(false);
      Alert.alert(
        'Welcome to PRO!',
        'You now have access to all premium features. Enjoy unlimited sessions and advanced tools!',
        [{ text: 'Great!', style: 'default' }]
      );
    }
    return success;
  };

  const reminderItems: SettingItem[] = [
    {
      id: 'daily-checkin',
      title: 'Daily Check-in',
      description: 'Gentle reminder to check in with your feelings (8:00 PM)',
      type: 'toggle',
      value: reminderSettings.dailyCheckIn,
      onToggle: (value) => handleReminderToggle('dailyCheckIn', value),
      icon: <Calendar size={24} color="#4FD1C7" strokeWidth={2} />,
    },
    {
      id: 'morning-motivation',
      title: 'Morning Motivation',
      description: 'Start your day with positive affirmations (8:00 AM)',
      type: 'toggle',
      value: reminderSettings.morningMotivation,
      onToggle: (value) => handleReminderToggle('morningMotivation', value),
      icon: <Sunrise size={24} color="#FFB3BA" strokeWidth={2} />,
    },
    {
      id: 'afternoon-break',
      title: 'Afternoon Mindfulness',
      description: 'Take a mindful break during your day (2:00 PM)',
      type: 'toggle',
      value: reminderSettings.afternoonBreak,
      onToggle: (value) => handleReminderToggle('afternoonBreak', value),
      icon: <Coffee size={24} color="#F6AD55" strokeWidth={2} />,
    },
    {
      id: 'evening-reflection',
      title: 'Evening Reflection',
      description: 'Peaceful time for gratitude and reflection (9:00 PM)',
      type: 'toggle',
      value: reminderSettings.eveningReflection,
      onToggle: (value) => handleReminderToggle('eveningReflection', value),
      icon: <Moon size={24} color="#B19CD9" strokeWidth={2} />,
    },
    {
      id: 'weekly-goals',
      title: 'Weekly Wellness Goals',
      description: 'Set intentions for your wellness journey (Monday 10:00 AM)',
      type: 'toggle',
      value: reminderSettings.weeklyGoals,
      onToggle: (value) => handleReminderToggle('weeklyGoals', value),
      icon: <Star size={24} color="#68D391" strokeWidth={2} />,
    },
    {
      id: 'breathing-reminder',
      title: 'Breathing Exercise',
      description: 'Reminder to practice breathing exercises (12:00 PM)',
      type: 'toggle',
      value: reminderSettings.breathingReminder,
      onToggle: (value) => handleReminderToggle('breathingReminder', value),
      icon: <Zap size={24} color="#4FD1C7" strokeWidth={2} />,
    },
    {
      id: 'gratitude-practice',
      title: 'Gratitude Practice',
      description: 'Daily reminder to practice gratitude (7:00 PM)',
      type: 'toggle',
      value: reminderSettings.gratitudePractice,
      onToggle: (value) => handleReminderToggle('gratitudePractice', value),
      icon: <Heart size={24} color="#F687B3" strokeWidth={2} />,
    },
    {
      id: 'self-care-reminder',
      title: 'Self-Care Time',
      description: 'Reminder to take care of yourself (6:00 PM)',
      type: 'toggle',
      value: reminderSettings.selfCareReminder,
      onToggle: (value) => handleReminderToggle('selfCareReminder', value),
      icon: <Heart size={24} color="#FFB3BA" strokeWidth={2} />,
    },
  ];

  const otherSettings: SettingItem[] = [
    {
      id: 'ad-personalization',
      title: 'Ad Personalization',
      description: 'Show relevant ads based on your interests',
      type: 'toggle',
      value: adPersonalization,
      onToggle: setAdPersonalization,
      icon: <Shield size={24} color="#B19CD9" strokeWidth={2} />,
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      description: 'Learn how we protect your data',
      type: 'action',
      onPress: showPrivacyPolicy,
      icon: <Shield size={24} color="#6B7280" strokeWidth={2} />,
    },
    {
      id: 'support',
      title: 'Help & Support',
      description: 'Get help or send feedback',
      type: 'action',
      onPress: showSupport,
      icon: <HelpCircle size={24} color="#6B7280" strokeWidth={2} />,
    },
    {
      id: 'rate',
      title: 'Rate Unburden',
      description: 'Share your experience with others',
      type: 'action',
      onPress: handleRateApp,
      icon: <Star size={24} color="#FFD700" strokeWidth={2} />,
    },
    {
      id: 'clear-data',
      title: 'Clear Chat History',
      description: 'Delete all conversation data',
      type: 'action',
      onPress: handleClearData,
      icon: <Trash2 size={24} color="#FF6B6B" strokeWidth={2} />,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Auto-hiding Custom Header */}
      <Animated.View style={[styles.customHeader, headerAnimatedStyle]}>
        <LinearGradient
          colors={['#B19CD9', '#4FD1C7', '#FFB3BA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <View style={styles.headerIconBackground}>
                <SettingsIcon size={28} color="#FFFFFF" strokeWidth={2.5} />
              </View>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Settings</Text>
              <Text style={styles.headerSubtitle}>
                Customize your Unburden experience
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Premium Status */}
        {isPremium ? (
          <View style={styles.premiumStatusCard}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.premiumGradient}
            >
              <Crown size={24} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.premiumStatusText}>PRO Member</Text>
              <Text style={styles.premiumStatusSubtext}>
                Thank you for supporting Unburden! 💜
              </Text>
            </LinearGradient>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.upgradeCard}
            onPress={() => setShowPremiumModal(true)}
          >
            <LinearGradient
              colors={['#B19CD9', '#4FD1C7']}
              style={styles.upgradeGradient}
            >
              <Crown size={24} color="#FFFFFF" strokeWidth={2} />
              <View style={styles.upgradeText}>
                <Text style={styles.upgradeTitle}>Upgrade to PRO</Text>
                <Text style={styles.upgradeSubtitle}>
                  Unlock unlimited sessions and premium features
                </Text>
              </View>
              <ExternalLink size={20} color="#FFFFFF" strokeWidth={2} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Gentle Reminders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gentle Reminders</Text>
          <Text style={styles.sectionDescription}>
            Set caring reminders to support your mental wellness journey. These gentle notifications will help you stay connected with your emotional well-being throughout the day.
          </Text>
          {reminderItems.map((setting) => (
            <View key={setting.id} style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIconContainer}>
                  {setting.icon}
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>{setting.title}</Text>
                  <Text style={styles.settingDescription}>
                    {setting.description}
                  </Text>
                </View>
              </View>
              <Switch
                value={setting.value}
                onValueChange={setting.onToggle}
                trackColor={{ false: '#E5E7EB', true: '#B19CD9' }}
                thumbColor={setting.value ? '#FFFFFF' : '#F9FAFB'}
              />
            </View>
          ))}
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIconContainer}>
                {otherSettings[0].icon}
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>{otherSettings[0].title}</Text>
                <Text style={styles.settingDescription}>
                  {otherSettings[0].description}
                </Text>
              </View>
            </View>
            <Switch
              value={otherSettings[0].value}
              onValueChange={otherSettings[0].onToggle}
              trackColor={{ false: '#E5E7EB', true: '#B19CD9' }}
              thumbColor={otherSettings[0].value ? '#FFFFFF' : '#F9FAFB'}
            />
          </View>
        </View>

        {/* Support & Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & Information</Text>
          {otherSettings.slice(1, 4).map((setting) => (
            <TouchableOpacity
              key={setting.id}
              style={styles.settingItem}
              onPress={setting.onPress}
            >
              <View style={styles.settingLeft}>
                <View style={styles.settingIconContainer}>
                  {setting.icon}
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>{setting.title}</Text>
                  <Text style={styles.settingDescription}>
                    {setting.description}
                  </Text>
                </View>
              </View>
              <ExternalLink size={20} color="#9CA3AF" strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <TouchableOpacity
            style={[styles.settingItem, styles.dangerItem]}
            onPress={otherSettings[4].onPress}
          >
            <View style={styles.settingLeft}>
              <View style={styles.settingIconContainer}>
                {otherSettings[4].icon}
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, styles.dangerText]}>
                  {otherSettings[4].title}
                </Text>
                <Text style={styles.settingDescription}>
                  {otherSettings[4].description}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Info Text Only */}
        <View style={styles.appInfoSection}>
          <Heart size={32} color="#B19CD9" strokeWidth={2} />
          <Text style={styles.appName}>Unburden</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            A safe space for emotional support and self-care.
            Your privacy and well-being are our priority.
          </Text>
        </View>

        {/* AdMob Banner Placeholder */}
        {!premiumFeatures.adFree && (
          <View style={styles.adContainer}>
            <Text style={styles.adPlaceholder}>AdMob Banner</Text>
          </View>
        )}
      </Animated.ScrollView>

      <PremiumModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onUpgrade={handleUpgradeSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  customHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 44, // Account for status bar
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerGradient: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    marginRight: 16,
  },
  headerIconBackground: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'left',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'left',
    lineHeight: 20,
  },
  content: {
    flex: 1,
    paddingTop: 120, // Account for header height
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120, // Account for bottom tab bar
  },
  premiumStatusCard: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
  },
  premiumGradient: {
    padding: 20,
    alignItems: 'center',
  },
  premiumStatusText: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  premiumStatusSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  upgradeCard: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  upgradeText: {
    flex: 1,
    marginLeft: 16,
  },
  upgradeTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'left',
  },
  upgradeSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'left',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4,
    textAlign: 'left',
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 16,
    marginLeft: 4,
    textAlign: 'left',
    lineHeight: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 4,
    textAlign: 'left',
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
    textAlign: 'left',
  },
  dangerItem: {
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  dangerText: {
    color: '#FF6B6B',
  },
  appInfoSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  appName: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#B19CD9',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  appVersion: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  appDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
  },
  adContainer: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  adPlaceholder: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
});