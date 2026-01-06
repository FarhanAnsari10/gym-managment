import colors from "@/assets/colors";
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import Foundation from '@expo/vector-icons/Foundation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { moderateScale } from "react-native-size-matters";
import { useTheme } from '../../context/ThemeContext';

// Animated tab icon component for smooth transitions
function AnimatedTabIcon({ focused, children }) {
  const scaleAnim = useRef(new Animated.Value(focused ? 1.1 : 1)).current;
  const bgAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;
  
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.1 : 1,
      useNativeDriver: false,
      friction: 6,
    }).start();
    Animated.timing(bgAnim, {
      toValue: focused ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [focused]);
  
  const bgColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', colors.gwhite],
  });
  
  return (
    <Animated.View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 22,
        backgroundColor: bgColor,
        width: 44,
        height: 44,
        transform: [{ scale: scaleAnim }],
        // Removed alignSelf to allow parent to center
      }}
    >
      {children}
    </Animated.View>
  );
}

export default function Layout() {
  const { isDarkMode } = useTheme();
  return (
    <Tabs
      screenOptions={{
            // sceneContainerStyle: { backgroundColor: isDarkMode ? '#121212' : '#fff' },
        animationEnabled: false,
        headerShown: false,
        tabBarActiveTintColor: colors.wblack,
        tabBarInactiveTintColor: colors.lgrey,
        tabBarShowLabel: false,
        backgroundColor: isDarkMode ? '#181818' : '#fff' ,
         cardStyle: {
          backgroundColor: isDarkMode ? '#121212' : '#FFFFFF', // dark theme bg
         },
        tabBarStyle: {
          backgroundColor: colors.wblack,
          position: 'absolute',
          // bottom: 60,
          height: moderateScale(80),
          // marginHorizontal: 10,
          // borderRadius: 50,
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-around',
          // borderWidth: 0.4,
          borderColor: colors.twhite,
          // elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          paddingTop: moderateScale(10),
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center', // Center the circle container vertically
          paddingVertical: 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          // animation:'none',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <Entypo name="home" size={22} color={focused ? colors.wblack : color} />
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="member"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <MaterialIcons name="people" size={22} color={focused ? colors.wblack : color} />
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="addmember"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <Feather name="plus" size={22} color={focused ? colors.wblack : color} />
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <Foundation name="graph-pie" size={22} color={focused ? colors.wblack : color} />
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <Feather name="user" size={22} color={focused ? colors.wblack : color} />
            </AnimatedTabIcon>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({});
