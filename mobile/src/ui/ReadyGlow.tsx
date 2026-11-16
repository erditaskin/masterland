import { useEffect } from "react";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

/** One UI-thread clock serves every ready cell and order; only opacity animates. */
export function useReadyPulse(enabled: boolean, reduced: boolean) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    cancelAnimation(pulse);
    pulse.set(0);
    if (enabled && !reduced)
      pulse.set(
        withRepeat(
          withSequence(
            withTiming(1, { duration: 550 }),
            withTiming(0, { duration: 1850 }),
          ),
          -1,
          false,
        ),
      );
    return () => cancelAnimation(pulse);
  }, [enabled, reduced, pulse]);
  return pulse;
}
export function ReadyGlow({
  pulse,
  inset = 0,
  radius = 7,
}: {
  pulse: SharedValue<number>;
  inset?: number;
  radius?: number;
}) {
  const style = useAnimatedStyle(() => ({
    opacity: 0.25 + pulse.get() * 0.5,
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          inset,
          borderRadius: radius,
          borderWidth: 2,
          borderColor: "#bfff8e",
          shadowColor: "#9bdd65",
          shadowOpacity: 0.28,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 0 },
        },
        style,
      ]}
    />
  );
}
