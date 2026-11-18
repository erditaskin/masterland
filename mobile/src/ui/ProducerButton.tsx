import { displayText } from "../i18n/display";
import { languageStore } from "../i18n/locale";
import { useSyncExternalStore } from "react";
/* eslint-disable react-hooks/refs -- Native gesture callbacks read the latest JS handler after render, never during render. */
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

/** Production taps are recognised on the UI runtime, independently of React press-state rendering. */
export function ProducerButton({
  children,
  onPress,
  onLongPress,
  label,
  testID,
  style,
}: {
  children: ReactNode;
  onPress: () => void;
  onLongPress: () => void;
  label: string;
  testID: string;
  style: StyleProp<ViewStyle>;
}) {
  const language = useSyncExternalStore(
    languageStore.subscribe,
    languageStore.get,
  );
  const handlers = useRef({ onPress, onLongPress });
  useLayoutEffect(() => {
    handlers.current = { onPress, onLongPress };
  }, [onPress, onLongPress]);
  const press = useCallback(() => handlers.current.onPress(), []);
  const long = useCallback(() => handlers.current.onLongPress(), []);
  const opacity = useSharedValue(1);
  const gesture = useMemo(() => {
    const tap = Gesture.Tap()
      .maxDuration(400)
      .maxDistance(8)
      .onBegin(() => {
        "worklet";
        opacity.set(withTiming(0.86, { duration: 55 }));
      })
      .onEnd((_, success) => {
        "worklet";
        if (success) scheduleOnRN(press);
      })
      .onFinalize(() => {
        "worklet";
        opacity.set(withTiming(1, { duration: 85 }));
      });
    const hold = Gesture.LongPress()
      .minDuration(450)
      .maxDistance(8)
      .onStart(() => {
        "worklet";
        scheduleOnRN(long);
      })
      .onFinalize(() => {
        "worklet";
        opacity.set(withTiming(1, { duration: 85 }));
      });
    return Gesture.Exclusive(hold, tap);
  }, [opacity, press, long]);
  const feedback = useAnimatedStyle(() => ({ opacity: 1 - opacity.get() }));
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        collapsable={false}
        accessible
        accessibilityRole="button"
        accessibilityLabel={displayText(label, language)}
        testID={testID}
        onAccessibilityTap={press}
        accessibilityActions={[{ name: "longpress", label: "Geliştir" }]}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === "longpress") long();
        }}
        style={[
          style,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        {children}
        <Animated.View pointerEvents="none" style={[{ position: "absolute", inset: 0, borderRadius: 8, backgroundColor: "#000000" }, feedback]} />
      </Animated.View>
    </GestureDetector>
  );
}
