/* eslint-disable react-hooks/refs -- Refs are read by touch callbacks after render; native gestures hold stable handler references. */
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { View, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { Item, Reference } from "./Art";
import { colors } from "./theme";
import { hitCell } from "../game/boardInput";
import { product, type Tile, type Result } from "../game/engine";
interface Drag {
  id: SharedValue<string>;
  x: SharedValue<number>;
  y: SharedValue<number>;
  epoch: SharedValue<number>;
}
const Piece = memo(
  function Piece({
    tile,
    index,
    cell,
    selected,
    drag,
    reduced,
  }: {
    tile: Tile;
    index: number;
    cell: number;
    selected: boolean;
    drag: Drag;
    reduced: boolean;
  }) {
    const opacity = useSharedValue(reduced ? 1 : 0);
    useEffect(() => {
      opacity.set(withTiming(1, { duration: reduced ? 0 : 130 }));
    }, [opacity, reduced]);
    const style = useAnimatedStyle(() => ({
      opacity: opacity.get(),
      zIndex: drag.id.get() === tile.id ? 10 : 1,
      transform: [
        {
          translateX:
            (index % 6) * cell + (drag.id.get() === tile.id ? drag.x.get() : 0),
        },
        {
          translateY:
            Math.floor(index / 6) * cell +
            (drag.id.get() === tile.id ? drag.y.get() : 0),
        },
      ],
    }));
    return (
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            width: cell,
            height: cell,
            alignItems: "center",
            justifyContent: "center",
          },
          style,
        ]}
      >
        {selected && (
          <View
            style={{
              position: "absolute",
              inset: 3,
              borderWidth: 1.8,
              borderColor: colors.gold,
              borderRadius: 5,
              backgroundColor: "#fff2ba35",
            }}
          />
        )}
        <Item id={tile.item} size={cell * 0.9} />
      </Animated.View>
    );
  },
  (a, b) =>
    a.tile.id === b.tile.id &&
    a.tile.item === b.tile.item &&
    a.index === b.index &&
    a.cell === b.cell &&
    a.selected === b.selected &&
    a.reduced === b.reduced,
);
export function WoodFrame({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const c = 15;
  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", left: 0, top: 0, width, height }}
    >
      <View style={{ position: "absolute", left: c, right: c, top: 0 }}>
        <Reference
          x={135}
          y={535}
          w={650}
          h={18}
          width={width - 2 * c}
          height={8}
        />
      </View>
      <View style={{ position: "absolute", left: c, right: c, bottom: 0 }}>
        <Reference
          x={135}
          y={1533}
          w={650}
          h={20}
          width={width - 2 * c}
          height={8}
        />
      </View>
      <View style={{ position: "absolute", left: 0, top: c }}>
        <Reference
          x={98}
          y={575}
          w={18}
          h={900}
          width={8}
          height={height - 2 * c}
        />
      </View>
      <View style={{ position: "absolute", right: 0, top: c }}>
        <Reference
          x={817}
          y={575}
          w={18}
          h={900}
          width={8}
          height={height - 2 * c}
        />
      </View>
      {[
        [98, 535, 0, 0],
        [800, 535, width - c, 0],
        [98, 1517, 0, height - c],
        [800, 1517, width - c, height - c],
      ].map(([x, y, l, t], i) => (
        <View key={i} style={{ position: "absolute", left: l, top: t }}>
          <Reference x={x!} y={y!} w={36} h={36} width={c} height={c} />
        </View>
      ))}
    </View>
  );
}
export const Board = memo(function Board({
  board,
  cell,
  selected,
  reduced,
  onSelect,
  onMove,
  onInfo,
}: {
  board: (Tile | null)[];
  cell: number;
  selected: number | null;
  reduced: boolean;
  onSelect: (i: number) => void;
  onMove: (from: number, to: number, expected: string) => Result | null;
  onInfo: (i: number) => void;
}) {
  const id = useSharedValue(""),
    x = useSharedValue(0),
    y = useSharedValue(0),
    epoch = useSharedValue(0),
    origin = useSharedValue(-1),
    ids = useSharedValue(board.map((t) => t?.id ?? ""));
  const drag = useMemo(() => ({ id, x, y, epoch }), [id, x, y, epoch]);
  const current = useRef({ onSelect, onMove, onInfo });
  useLayoutEffect(() => {
    current.current = { onSelect, onMove, onInfo };
  }, [onSelect, onMove, onInfo]);
  useLayoutEffect(() => {
    ids.set(board.map((t) => t?.id ?? ""));
    if (id.get() && !board.some((t) => t?.id === id.get())) {
      id.set("");
      x.set(0);
      y.set(0);
    }
  }, [board, id, ids, x, y]);
  const select = useCallback((i: number) => current.current.onSelect(i), []);
  const info = useCallback((i: number) => current.current.onInfo(i), []);
  const commit = useCallback(
    (from: number, to: number, expected: string) => {
      const result = current.current.onMove(from, to, expected);
      if (result && result.kind !== "blocked") {
        id.set("");
        x.set(0);
        y.set(0);
      } else {
        const token = epoch.get();
        x.set(withTiming(0, { duration: reduced ? 0 : 140 }));
        y.set(
          withTiming(0, { duration: reduced ? 0 : 140 }, (finished) => {
            if (finished && epoch.get() === token) id.set("");
          }),
        );
      }
    },
    [id, x, y, epoch, reduced],
  );
  const gestures = useMemo(() => {
    const pan = Gesture.Pan()
      .minDistance(5)
      .maxPointers(1)
      .onBegin((e) => {
        "worklet";
        epoch.set(epoch.get() + 1);
        cancelAnimation(x);
        cancelAnimation(y);
        x.set(0);
        y.set(0);
        origin.set(hitCell(e.x, e.y, cell) ?? -1);
      })
      .onStart(() => {
        "worklet";
        if (origin.get() >= 0 && origin.get() < 54)
          id.set(ids.get()[origin.get()] ?? "");
      })
      .onUpdate((e) => {
        "worklet";
        if (id.get()) {
          x.set(e.translationX);
          y.set(e.translationY);
        }
      })
      .onEnd((e) => {
        "worklet";
        if (!id.get()) return;
        const col = Math.floor(
            (((origin.get() % 6) + 0.5) * cell + e.translationX) / cell,
          ),
          row = Math.floor(
            ((Math.floor(origin.get() / 6) + 0.5) * cell + e.translationY) /
              cell,
          );
        const target =
          col >= 0 && col < 6 && row >= 0 && row < 9 ? row * 6 + col : -1;
        scheduleOnRN(commit, origin.get(), target, id.get());
      })
      .onFinalize((_, success) => {
        "worklet";
        if (!success) {
          const token = epoch.get();
          x.set(withTiming(0, { duration: 140 }));
          y.set(
            withTiming(0, { duration: 140 }, (finished) => {
              if (finished && token === epoch.get()) id.set("");
            }),
          );
        }
      });
    const tap = Gesture.Tap()
      .maxDistance(5)
      .onEnd((e, success) => {
        "worklet";
        if (success) {
          const i = hitCell(e.x, e.y, cell);
          if (i !== null) scheduleOnRN(select, i);
        }
      });
    const long = Gesture.LongPress()
      .minDuration(450)
      .maxDistance(5)
      .onStart((e) => {
        "worklet";
        const i = hitCell(e.x, e.y, cell);
        if (i !== null && ids.get()[i]) scheduleOnRN(info, i);
      });
    return Gesture.Race(pan, Gesture.Exclusive(long, tap));
  }, [cell, commit, select, info, id, ids, x, y, epoch, origin]);
  return (
    <View
      testID="mergeBoard"
      style={{
        width: cell * 6 + 16,
        height: cell * 9 + 16,
        padding: 8,
        shadowColor: "#51321c",
        shadowOpacity: 0.16,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <WoodFrame width={cell * 6 + 16} height={cell * 9 + 16} />
      <View
        style={{
          width: cell * 6,
          height: cell * 9,
          backgroundColor: colors.paper,
        }}
      >
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Reference
            x={140}
            y={930}
            w={65}
            h={55}
            width={cell * 6}
            height={cell * 9}
          />
          {Array.from({ length: 54 }, (_, i) => (
            <View
              key={i}
              style={{
                position: "absolute",
                left: (i % 6) * cell,
                top: Math.floor(i / 6) * cell,
                width: cell,
                height: cell,
                backgroundColor:
                  (Math.floor(i / 6) + (i % 6)) % 2
                    ? "rgba(219,179,115,0.19)"
                    : "rgba(255,245,219,0.08)",
                borderRightWidth: StyleSheet.hairlineWidth,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderColor: colors.outline,
              }}
            />
          ))}
        </View>
        {board.map((t, i) =>
          t ? (
            <Piece
              key={t.id}
              tile={t}
              index={i}
              cell={cell}
              selected={selected === i}
              drag={drag}
              reduced={reduced}
            />
          ) : null,
        )}
        <GestureDetector gesture={gestures}>
          <View collapsable={false} style={StyleSheet.absoluteFill}>
            {board.map((t, i) => (
              <View
                key={i}
                accessible
                accessibilityRole="button"
                accessibilityLabel={t ? product(t.item).name : "Boş hücre"}
                accessibilityValue={{ text: selected === i ? "Seçili" : "" }}
                testID={"cell-" + i}
                onAccessibilityTap={() => onSelect(i)}
                onAccessibilityEscape={() => onSelect(-1)}
                style={{
                  position: "absolute",
                  left: (i % 6) * cell,
                  top: Math.floor(i / 6) * cell,
                  width: cell,
                  height: cell,
                }}
              />
            ))}
          </View>
        </GestureDetector>
      </View>
    </View>
  );
});
