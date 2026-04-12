import { useIsFocused } from '@react-navigation/native';
import { ReactNode, useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from 'react-native-reanimated';

type RevealProps = {
  children: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
};

export function Reveal({ children, delay = 0, style }: RevealProps) {
  const isFocused = useIsFocused();
  const translateY = useSharedValue(10);

  useEffect(() => {
    if (!isFocused) {
      translateY.value = 10;
      return;
    }

    translateY.value = withDelay(delay, withTiming(0, { duration: 360, easing: Easing.out(Easing.cubic) }));
  }, [delay, isFocused, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
