import { boardColumns } from "../game/grid";
import { useEffect, useMemo, useState } from "react";
import { AppState, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  cancelAnimation,
} from "react-native-reanimated";
import { idleHint } from "../game/idleHint";
import { type Save } from "../game/engine";
import { Item } from "./Art";
import { Label } from "./Controls";
/** One timeout and one UI-thread animation. No game action is dispatched. */
export function IdleHint({
  save,
  enabled,
  reduced,
  activity,
  touching,
  cell,
  cellHeight = cell,
  inset,
  width,
}: {
  save: Save;
  enabled: boolean;
  reduced: boolean;
  activity: number;
  touching: boolean;
  cell: number;
  cellHeight?: number;
  inset: number;
  width: number;
}) {
  const [activation, setActivation] = useState<{
      activity: number;
      at: number;
    } | null>(null),
    [foreground, setForeground] = useState(AppState.currentState === "active");
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) =>
      setForeground(s === "active"),
    );
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (!enabled || touching || !foreground) return;
    const t = setTimeout(
      () => setActivation({ activity, at: Date.now() }),
      2800,
    );
    return () => clearTimeout(t);
  }, [enabled, activity, touching, foreground]);
  const columns = boardColumns(save.cityID);
  const visible =
    enabled && !touching && foreground && activation?.activity === activity;
  const hint = useMemo(
    () => (visible && activation ? idleHint(save, activation.at) : null),
    [visible, activation, save],
  );
  const hasHint = !!hint;
  const phase = useSharedValue(0);
  const from = hint && "from" in hint ? hint.from : 0,
    to = hint && "to" in hint ? hint.to : 0;

  useEffect(() => {
    phase.set(0);
    if (hasHint && !reduced && from !== to)
      phase.set(
        withRepeat(
          withSequence(
            withTiming(0, { duration: 350 }),
            withTiming(1, { duration: 1000 }),
            withTiming(1, { duration: 300 }),
            withTiming(0, { duration: 180 }),
          ),
          3,
          false,
        ),
      );
    return () => cancelAnimation(phase);
  }, [from, to, hasHint, phase, reduced]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.65 * (1 - phase.get() * 0.4),
    transform: [
      {
        translateX: ((to % columns) - (from % columns)) * cell * phase.get(),
      },
      {
        translateY:
          (Math.floor(to / columns) - Math.floor(from / columns)) *
          cellHeight *
          phase.get(),
      },
    ],
  }));
  if (!hint) return null;
  return (
    <View
      pointerEvents="none"
      testID="idleHint"
      style={{ position: "absolute", inset: 0 }}
    >
      {"from" in hint ? (
        reduced ? (
          [from, to].map((index) => (
            <View
              key={index}
              pointerEvents="none"
              style={{
                position: "absolute",
                left: inset + (index % columns) * cell,
                top: inset + Math.floor(index / columns) * cellHeight,
                width: cell,
                height: cellHeight,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: "#ffe39a",
              }}
            />
          ))
        ) : (
          <Animated.View
            collapsable={false}
            testID="idleMergeMotion"
            style={[
              {
                position: "absolute",
                left: inset + (from % columns) * cell,
                top: inset + Math.floor(from / columns) * cellHeight,
                width: cell,
                height: cellHeight,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 10,
                borderWidth: 2,
                borderColor: "#ffe39a",
                backgroundColor: "#fff3cd44",
              },
              style,
            ]}
          >
            <Item id={hint.item} size={Math.min(cell, cellHeight) * 0.79} />
          </Animated.View>
        )
      ) : (
        <View
          style={{
            position: "absolute",
            top: inset + 4,
            left: 0,
            width,
            alignItems: "center",
          }}
        >
          <Label
            title
            size={11}
            color="#593a24"
            style={{
              backgroundColor: "#ffe9b9ed",
              borderRadius: 8,
              padding: 6,
            }}
          >
            ↑ Üretim için kutuları kullan
          </Label>
        </View>
      )}
    </View>
  );
}
