import { Tabs } from 'expo-router';
import { Chrome as Home, Sparkles, Settings } from 'lucide-react-native';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function TabLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 0,
            paddingTop: 12,
            paddingBottom: Platform.OS === 'ios' ? 28 : 16,
            height: Platform.OS === 'ios' ? 88 : 76,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 10,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
          },
          tabBarActiveTintColor: '#B19CD9',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarLabelStyle: {
            fontFamily: 'Inter-SemiBold',
            fontSize: 12,
            marginTop: 6,
            textAlign: 'center',
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ size, color, focused }) => (
              <Home 
                size={focused ? 26 : 24} 
                color={color} 
                strokeWidth={focused ? 2.5 : 2}
                fill={focused ? color : 'transparent'}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="mood-tools"
          options={{
            title: 'Mood Tools',
            tabBarIcon: ({ size, color, focused }) => (
              <Sparkles 
                size={focused ? 26 : 24} 
                color={color} 
                strokeWidth={focused ? 2.5 : 2}
                fill={focused ? color : 'transparent'}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ size, color, focused }) => (
              <Settings 
                size={focused ? 26 : 24} 
                color={color} 
                strokeWidth={focused ? 2.5 : 2}
                fill={focused ? color : 'transparent'}
              />
            ),
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}