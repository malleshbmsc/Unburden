import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { MessageCircle, Heart, Sparkles, Star, Zap, Shield } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePremium } from '@/hooks/usePremium';

const { width, height } = Dimensions.get('window');

const testimonials = [
  {
    id: 1,
    text: "Unburden helped me process my emotions in a safe space. It's like having a caring friend who's always there to listen.",
    author: "Sarah M.",
    image: "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2"
  },
  {
    id: 2,
    text: "This app has been a lifesaver during my tough times. The AI responses feel so genuine and understanding.",
    author: "Michael R.",
    image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2"
  },
  {
    id: 3,
    text: "I love how private and judgment-free this space is. It's helped me work through so many difficult feelings.",
    author: "Emma L.",
    image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2"
  },
  {
    id: 4,
    text: "The mood tools are incredible! The breathing exercises have become part of my daily routine.",
    author: "David K.",
    image: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2"
  },
  {
    id: 5,
    text: "Finally, an app that truly understands mental health. It's like therapy in your pocket, available 24/7.",
    author: "Jessica T.",
    image: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2"
  }
];

export default function HomeScreen() {
  const router = useRouter();
  const { premiumFeatures } = usePremium();
  
  const breathingScale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const sparkleRotation = useSharedValue(0);
  const floatingY = useSharedValue(0);

  useEffect(() => {
    // Breathing animation
    breathingScale.value = withRepeat(
      withSequence(
        withTiming(1.15, {
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, {
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      false
    );

    // Fade in animation
    opacity.value = withTiming(1, {
      duration: 2000,
      easing: Easing.out(Easing.ease),
    });

    // Sparkle rotation
    sparkleRotation.value = withRepeat(
      withTiming(360, {
        duration: 8000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Floating animation
    floatingY.value = withRepeat(
      withSequence(
        withTiming(-10, {
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(10, {
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      false
    );
  }, []);

  const breathingAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: breathingScale.value }],
    };
  });

  const fadeInAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const sparkleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${sparkleRotation.value}deg` }],
    };
  });

  const floatingAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: floatingY.value }],
    };
  });

  const handleStartVenting = () => {
    router.push('/chat');
  };

  const renderTestimonial = (testimonial: typeof testimonials[0], index: number) => (
    <View key={testimonial.id} style={styles.testimonialCard}>
      <Image
        source={{ uri: testimonial.image }}
        style={styles.testimonialImage}
      />
      <Text style={styles.testimonialText}>
        "{testimonial.text}"
      </Text>
      <Text style={styles.testimonialAuthor}>— {testimonial.author}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#B19CD9', '#4FD1C7', '#FFB3BA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Breathing Animation Circle */}
          <Animated.View style={[styles.breathingContainer, breathingAnimatedStyle]}>
            <View style={styles.breathingCircle}>
              <Heart size={40} color="#FFFFFF" strokeWidth={1.5} />
              <Animated.View style={[styles.sparkleOverlay, sparkleAnimatedStyle]}>
                <Sparkles size={20} color="rgba(255, 255, 255, 0.6)" strokeWidth={1} />
              </Animated.View>
            </View>
          </Animated.View>

          <Animated.View style={[styles.contentContainer, fadeInAnimatedStyle]}>
            {/* Welcome Message */}
            <View style={styles.welcomeContainer}>
              <Text style={styles.appTitle}>Unburden</Text>
              <Text style={styles.welcomeText}>
                Your safe haven for emotional wellness.{'\n'}
                Express yourself freely, without judgment.
              </Text>
              <Text style={styles.subtitleText}>
                I'm here to listen and support you through whatever you're feeling. 
                Take a deep breath and let it all out.
              </Text>
            </View>

            {/* Start Venting Button */}
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartVenting}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F8F9FA']}
                style={styles.buttonGradient}
              >
                <MessageCircle size={24} color="#B19CD9" strokeWidth={2} />
                <Text style={styles.buttonText}>Start Venting</Text>
                <View style={styles.buttonShine} />
              </LinearGradient>
            </TouchableOpacity>

            {/* Features */}
            <View style={styles.featuresContainer}>
              <View style={styles.featureGrid}>
                <View style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Heart size={20} color="#FF6B9D" strokeWidth={2} />
                  </View>
                  <Text style={styles.featureText}>Completely private</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Shield size={20} color="#4FD1C7" strokeWidth={2} />
                  </View>
                  <Text style={styles.featureText}>No judgment zone</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Zap size={20} color="#FFB3BA" strokeWidth={2} />
                  </View>
                  <Text style={styles.featureText}>Available 24/7</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Star size={20} color="#B19CD9" strokeWidth={2} />
                  </View>
                  <Text style={styles.featureText}>AI-powered support</Text>
                </View>
              </View>
            </View>

            {/* Testimonials Section */}
            <View style={styles.testimonialsSection}>
              <Text style={styles.testimonialsTitle}>What Our Users Say</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.testimonialsContainer}
                snapToInterval={width - 80}
                decelerationRate="fast"
              >
                {testimonials.map((testimonial, index) => renderTestimonial(testimonial, index))}
              </ScrollView>
            </View>

            {/* AdMob Banner Placeholder */}
            {!premiumFeatures.adFree && (
              <View style={styles.adContainer}>
                <Text style={styles.adPlaceholder}>AdMob Banner</Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    paddingBottom: 120, // Account for bottom tab bar
  },
  breathingContainer: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  breathingCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#FFFFFF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  sparkleOverlay: {
    position: 'absolute',
    top: 10,
    right: 15,
  },
  contentContainer: {
    alignItems: 'center',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  appTitle: {
    fontSize: 48,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -2,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  welcomeText: {
    fontSize: 22,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  subtitleText: {
    fontSize: 17,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  startButton: {
    width: width - 48,
    marginBottom: 40,
    borderRadius: 30,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 32,
    position: 'relative',
  },
  buttonText: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#B19CD9',
    marginLeft: 12,
  },
  buttonShine: {
    position: 'absolute',
    top: 0,
    left: -100,
    width: 50,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
  },
  featuresContainer: {
    marginBottom: 40,
    width: '100%',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 20,
  },
  testimonialsSection: {
    marginBottom: 40,
    width: '100%',
  },
  testimonialsTitle: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  testimonialsContainer: {
    paddingHorizontal: 12,
  },
  testimonialCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 8,
    width: width - 80,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  testimonialImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  testimonialText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  adContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  adPlaceholder: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});