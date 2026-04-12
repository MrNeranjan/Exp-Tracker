import Ionicons from '@expo/vector-icons/Ionicons';
import { useIsFocused } from '@react-navigation/native';
import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

type FloatingAddButtonProps = {
  onPress: () => void;
  accessibilityLabel?: string;
  delay?: number;
};

export function FloatingAddButton({
  onPress,
  accessibilityLabel = 'Add expense entry',
  delay = 0,
}: FloatingAddButtonProps) {
  const isFocused = useIsFocused();
  const pulseScale = useSharedValue(1);
  const pressScale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    if (!isFocused) {
      opacity.value = 0;
      translateY.value = 16;
      pulseScale.value = 1;
      return;
    }

    opacity.value = withDelay(delay, withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 420, easing: Easing.out(Easing.cubic) }));

    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [isFocused, opacity, pulseScale, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }, { scale: pulseScale.value * pressScale.value }],
    };
  });

  return (
    <Animated.View style={[styles.fabContainer, animatedStyle]}>
      <Pressable
        style={styles.fabButton}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        onPressIn={() => {
          pressScale.value = withTiming(0.93, { duration: 90 });
        }}
        onPressOut={() => {
          pressScale.value = withTiming(1, { duration: 120 });
        }}>
        <Ionicons name="add" size={38} color="#FFFFFF" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    right: 18,
    bottom: 20,
  },
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2FC95E',
    shadowColor: '#2FC95E',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 9,
  },
});
