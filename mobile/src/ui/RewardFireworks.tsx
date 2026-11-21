import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

const palette = ["#ffdb84", "#82dbf7", "#f49182", "#fff5d5"];

function Spark({
  index,
  radius,
  progress,
}: {
  index: number;
  radius: number;
  progress: SharedValue<number>;
}) {
  const angle = (index * Math.PI) / 6;
  const distance = radius * (index % 2 ? 0.66 : 1);
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;
  const style = useAnimatedStyle(() => {
    const t = progress.get();
    const spread = 1 - (1 - t) ** 2.4;
    return {
      opacity: Math.min(t * 12, (1 - t) * 2.3),
      transform: [
        { translateX: x * spread },
        { translateY: y * spread + 14 * t ** 2 },
        { rotate: `${angle + Math.PI / 2}rad` },
        { scale: 1 - t * 0.65 },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: -2,
          top: -5,
          width: 4,
          height: index % 2 ? 6 : 10,
          borderRadius: 2,
          backgroundColor: palette[index % palette.length],
        },
        style,
      ]}
    />
  );
}

function Burst({
  delay,
  left,
  top,
  radius,
}: {
  delay: number;
  left: number;
  top: number;
  radius: number;
}) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.set(
      withDelay(delay, withTiming(1, { duration: 920, easing: Easing.linear })),
    );
    return () => cancelAnimation(progress);
  }, [delay, progress]);
  const flash = useAnimatedStyle(() => {
    const t = progress.get();
    return {
      opacity: Math.min(t * 24, Math.max(0, 1 - t * 5)),
      transform: [{ scale: 0.4 + t * 2 }],
    };
  });
  return (
    <View style={{ position: "absolute", left, top }}>
      <Animated.View
        style={[
          {
            position: "absolute",
            width: 12,
            height: 12,
            left: -6,
            top: -6,
            borderRadius: 6,
            backgroundColor: "#fff0a7",
          },
          flash,
        ]}
      />
      {Array.from({ length: 12 }, (_, index) => (
        <Spark key={index} index={index} radius={radius} progress={progress} />
      ))}
    </View>
  );
}

export function RewardFireworks({ width }: { width: number }) {
  const radius = Math.min(60, width * 0.17);
  return (
    <View
      pointerEvents="none"
      accessible={false}
      style={{ position: "absolute", inset: 0 }}
    >
      <Burst delay={120} left={width * 0.18} top={4} radius={radius} />
      <Burst delay={320} left={width * 0.78} top={-5} radius={radius * 0.9} />
      <Burst delay={560} left={width * 0.49} top={-26} radius={radius * 0.75} />
    </View>
  );
}
