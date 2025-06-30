import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Crown, 
  X, 
  Check, 
  Sparkles, 
  Heart, 
  Shield,
  MessageCircle,
  Headphones,
  Zap,
  Star
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface PremiumModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => Promise<boolean>;
}

export default function PremiumModal({ visible, onClose, onUpgrade }: PremiumModalProps) {
  const [isUpgrading, setIsUpgrading] = React.useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const success = await onUpgrade();
      if (success) {
        onClose();
      }
    } finally {
      setIsUpgrading(false);
    }
  };

  const features = [
    {
      icon: <MessageCircle size={22} color="#4FD1C7" strokeWidth={2.5} />,
      title: 'Unlimited Chat Sessions',
      description: 'Express yourself without time limits or restrictions'
    },
    {
      icon: <Sparkles size={22} color="#B19CD9" strokeWidth={2.5} />,
      title: 'Advanced Mood Tools',
      description: 'Extended breathing exercises and personalized wellness activities'
    },
    {
      icon: <Heart size={22} color="#FFB3BA" strokeWidth={2.5} />,
      title: 'Personalized Affirmations',
      description: 'Custom daily affirmations tailored to your emotional journey'
    },
    {
      icon: <Shield size={22} color="#4FD1C7" strokeWidth={2.5} />,
      title: 'Ad-Free Experience',
      description: 'Uninterrupted emotional support and peaceful sessions'
    },
    {
      icon: <Headphones size={22} color="#B19CD9" strokeWidth={2.5} />,
      title: 'Priority Support',
      description: 'Get help faster with dedicated premium customer support'
    },
    {
      icon: <Zap size={22} color="#FFB3BA" strokeWidth={2.5} />,
      title: 'Early Access Features',
      description: 'Be the first to try new wellness tools and improvements'
    }
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={['#B19CD9', '#4FD1C7', '#FFB3BA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={20} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerContent}>
            <View style={styles.crownContainer}>
              <Crown size={40} color="#FFD700" strokeWidth={2.5} />
            </View>
            <Text style={styles.headerTitle}>Unburden PRO</Text>
            <Text style={styles.headerSubtitle}>
              Unlock unlimited emotional wellness support
            </Text>
          </View>
        </LinearGradient>

        {/* Content */}
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Features */}
          <View style={styles.featuresContainer}>
            <Text style={styles.sectionTitle}>Premium Features</Text>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  {feature.icon}
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
                <View style={styles.checkContainer}>
                  <Check size={18} color="#4FD1C7" strokeWidth={2.5} />
                </View>
              </View>
            ))}
          </View>

          {/* Pricing */}
          <View style={styles.pricingContainer}>
            <Text style={styles.sectionTitle}>Choose Your Plan</Text>
            
            {/* Monthly Plan */}
            <View style={styles.pricingCard}>
              <LinearGradient
                colors={['#B19CD9', '#4FD1C7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.pricingGradient}
              >
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>Monthly</Text>
                  <Text style={styles.planPrice}>$4.99</Text>
                  <Text style={styles.planPeriod}>per month</Text>
                </View>
              </LinearGradient>
            </View>

            {/* Yearly Plan - Popular */}
            <View style={[styles.pricingCard, styles.popularCard]}>
              <View style={styles.popularBadge}>
                <Star size={14} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.popularText}>Most Popular</Text>
              </View>
              <LinearGradient
                colors={['#FFB3BA', '#B19CD9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.pricingGradient}
              >
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>Yearly</Text>
                  <Text style={styles.planPrice}>$39.99</Text>
                  <Text style={styles.planPeriod}>per year</Text>
                  <View style={styles.savingsContainer}>
                    <Text style={styles.savings}>Save 33%</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Benefits Summary */}
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Why Choose PRO?</Text>
            <Text style={styles.benefitsText}>
              Join thousands of users who have transformed their emotional wellness journey with Unburden PRO. 
              Get unlimited access to all features and experience true peace of mind.
            </Text>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.upgradeButton, isUpgrading && styles.upgradeButtonDisabled]}
            onPress={handleUpgrade}
            disabled={isUpgrading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#B19CD9', '#4FD1C7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.upgradeGradient}
            >
              <Crown size={18} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.upgradeButtonText}>
                {isUpgrading ? 'Upgrading...' : 'Start 7-Day Free Trial'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.trialText}>
            Free trial for 7 days, then $4.99/month. Cancel anytime in your account settings.
          </Text>
          
          <Text style={styles.disclaimerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerTop: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  crownContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 12,
    borderRadius: 24,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 20,
  },
  featuresContainer: {
    padding: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
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
  featureIcon: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
    marginRight: 14,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 3,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 18,
  },
  checkContainer: {
    backgroundColor: '#F0FDF4',
    padding: 6,
    borderRadius: 10,
  },
  pricingContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  pricingCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  popularCard: {
    position: 'relative',
    transform: [{ scale: 1.02 }],
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  popularText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  pricingGradient: {
    padding: 24,
  },
  planHeader: {
    alignItems: 'center',
  },
  planName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  planPrice: {
    fontSize: 32,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  planPeriod: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  savingsContainer: {
    marginTop: 8,
  },
  savings: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFD700',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  benefitsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  benefitsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
  },
  benefitsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  upgradeButton: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#B19CD9',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  upgradeButtonDisabled: {
    opacity: 0.7,
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  trialText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
});