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
import { Item, Crop } from "./Art";
import { BoardFrame } from "./Skin";
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
    cellWidth,
    cellHeight,
    selected,
    drag,
    reduced,
  }: {
    tile: Tile;
    index: number;
    cellWidth: number;
    cellHeight: number;
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
            (index % 6) * cellWidth +
            (drag.id.get() === tile.id ? drag.x.get() : 0),
        },
        {
          translateY:
            Math.floor(index / 6) * cellHeight +
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
            width: cellWidth,
            height: cellHeight,
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
              borderColor: "#ffe895",
              borderRadius: 5,
              backgroundColor: "#fff0ad40",
              shadowColor: "#ffd057",
              shadowOpacity: 0.95,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 0 },
            }}
          />
        )}
        <Item
          id={tile.item}
          size={Math.min(cellWidth, cellHeight) * 0.9}
          width={cellWidth * 0.9}
          height={cellHeight * 0.94}
        />
      </Animated.View>
    );
  },
  (a, b) =>
    a.tile.id === b.tile.id &&
    a.tile.item === b.tile.item &&
    a.index === b.index &&
    a.cellWidth === b.cellWidth &&
    a.cellHeight === b.cellHeight &&
    a.selected === b.selected &&
    a.reduced === b.reduced,
);
const BoardGrid = memo(function BoardGrid({
  cellWidth,
  cellHeight,
}: {
  cellWidth: number;
  cellHeight: number;
}) {
  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { borderRadius: 7, overflow: "hidden" }]}
    >
      {Array.from({ length: 54 }, (_, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: (i % 6) * cellWidth,
            top: Math.floor(i / 6) * cellHeight,
            width: cellWidth,
            height: cellHeight,
          }}
        >
          <Crop
            source={require("../../assets/art/skara-ui-chrome-v1.png")}
            x={316}
            y={1060}
            w={104}
            h={84}
            width={cellWidth}
            height={cellHeight}
          />
          <View
            style={{
              position: "absolute",
              inset: 0,
              borderWidth: 0.5,
              borderColor: "#ffedcd",
              borderRadius: 5,
            }}
          />
        </View>
      ))}
    </View>
  );
});
export const Board = memo(function Board({
  board,
  cellWidth,
  cellHeight,
  frameInset,
  selected,
  reduced,
  onSelect,
  onTap,
  onMove,
  onInfo,
}: {
  board: (Tile | null)[];
  cellWidth: number;
  cellHeight: number;
  frameInset: number;
  selected: number | null;
  reduced: boolean;
  onSelect: (i: number) => void;
  onTap: (i: number) => void;
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
  const current = useRef({ onSelect, onTap, onMove, onInfo });
  useLayoutEffect(() => {
    current.current = { onSelect, onTap, onMove, onInfo };
  }, [onSelect, onTap, onMove, onInfo]);
  useLayoutEffect(() => {
    ids.set(board.map((t) => t?.id ?? ""));
    if (id.get() && !board.some((t) => t?.id === id.get())) {
      id.set("");
      x.set(0);
      y.set(0);
    }
  }, [board, id, ids, x, y]);
  const select = useCallback((i: number) => current.current.onSelect(i), []);
  const tapCell = useCallback((i: number) => current.current.onTap(i), []);
  const info = useCallback((i: number) => current.current.onInfo(i), []);
  const commit = useCallback(
    (from: number, to: number, expected: string, gestureEpoch: number) => {
      const result = current.current.onMove(from, to, expected);
      // A delayed JS settlement must not clear a newer UI-thread drag.
      if (
        epoch.get() !== gestureEpoch ||
        (id.get() !== expected && id.get() !== "")
      )
        return;
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
        origin.set(hitCell(e.x, e.y, cellWidth, cellHeight) ?? -1);
      })
      .onStart(() => {
        "worklet";
        if (origin.get() >= 0 && origin.get() < 54) {
          const picked = ids.get()[origin.get()] ?? "";
          id.set(picked);
          if (picked) scheduleOnRN(select, origin.get());
        }
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
        // The pointer's release position determines the destination. Using the
        // source cell centre plus translation misroutes off-centre grabs.
        const target = hitCell(e.x, e.y, cellWidth, cellHeight) ?? -1;
        scheduleOnRN(commit, origin.get(), target, id.get(), epoch.get());
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
          const i = hitCell(e.x, e.y, cellWidth, cellHeight);
          if (i !== null) scheduleOnRN(tapCell, i);
        }
      });
    const long = Gesture.LongPress()
      .minDuration(450)
      .maxDistance(5)
      .onEnd((e, success) => {
        "worklet";
        const i = hitCell(e.x, e.y, cellWidth, cellHeight);
        if (success && i !== null && ids.get()[i]) scheduleOnRN(info, i);
      });
    // Holding an item must not prevent a subsequent drag. Show details only
    // after a stationary hold is released; movement cancels the long press.
    return Gesture.Simultaneous(pan, Gesture.Exclusive(long, tap));
  }, [
    cellWidth,
    cellHeight,
    commit,
    select,
    tapCell,
    info,
    id,
    ids,
    x,
    y,
    epoch,
    origin,
  ]);
  return (
    <View
      testID="mergeBoard"
      style={{
        width: cellWidth * 6 + 2 * frameInset,
        height: cellHeight * 9 + 2 * frameInset,
        padding: frameInset,
        shadowColor: "#51321c",
        shadowOpacity: 0.16,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <BoardFrame
        width={cellWidth * 6 + 2 * frameInset}
        height={cellHeight * 9 + 2 * frameInset}
      />
      <View
        style={{
          width: cellWidth * 6,
          height: cellHeight * 9,
          backgroundColor: "transparent",
        }}
      >
        <BoardGrid cellWidth={cellWidth} cellHeight={cellHeight} />
        {board.map((t, i) =>
          t ? (
            <Piece
              key={t.id}
              tile={t}
              index={i}
              cellWidth={cellWidth}
              cellHeight={cellHeight}
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
                accessibilityValue={{
                  text: selected === i ? "Seçili" : "",
                }}
                testID={"cell-" + i}
                onAccessibilityTap={() => onTap(i)}
                onAccessibilityEscape={() => onSelect(-1)}
                style={{
                  position: "absolute",
                  left: (i % 6) * cellWidth,
                  top: Math.floor(i / 6) * cellHeight,
                  width: cellWidth,
                  height: cellHeight,
                }}
              />
            ))}
          </View>
        </GestureDetector>
      </View>
    </View>
  );
});
