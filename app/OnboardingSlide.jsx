import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    key: '1',
    lottie: require('../assets/images/coch.json'),
    title: 'Welcome to Gym Manager',
    description: 'Transform the way you train and Track.',
  },
  {
    key: '2',
    lottie: require('../assets/images/Fitness.json'),
    title: 'Track Payments',
    description: 'Visualize income, dues, and financial insights.',
  },
  {
    key: '3',
    lottie: require('../assets/images/coch.json'),
    title: 'Smart Notifications',
    description: 'Get alerts for dues, renewals, and more.',
  },
];

export default function OnboardingSlide({ item }) {
  return (
    <View style={styles.slide}>
      <LottieView
        source={item.lottie}
        autoPlay
        loop
        style={styles.lottie}
      />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.desc}>{item.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lottie: {
    width: 300,
    height: 300,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '00',
    color: '#010101ff',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 1.2,
    fontFamily: 'sans-serif-condensed',
    textShadowColor: '#ebdbfbff',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  desc: {
    fontSize: 18,
    color: '#5a5a5a',
    textAlign: 'center',
    marginHorizontal: 10,
    fontFamily: 'sans-serif',
    lineHeight: 26,
    marginBottom: 10,
  },
});
