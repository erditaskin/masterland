import type { ReactNode } from "react";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export function ModalCard({
  children,
  reduced,
  compact = false,
}: {
  children: ReactNode;
  reduced: boolean;
  compact?: boolean;
}) {
  return (
    <Animated.View
      entering={reduced ? undefined : FadeInDown.duration(230)}
      style={{
        width: "100%",
        alignItems: "stretch",
        gap: compact ? 8 : 12,
        padding: compact ? 14 : 21,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "#ce9a52",
        backgroundColor: "#fff0d3",
        backgroundImage: "linear-gradient(150deg, #fff9e9 0%, #ffe5b6 100%)",
        shadowColor: "#201407",
        shadowOpacity: 0.32,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 7 },
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          inset: 4,
          borderWidth: 1,
          borderRadius: 15,
          borderColor: "#fff8e5",
        }}
      />
      {children}
    </Animated.View>
  );
}
