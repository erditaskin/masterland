import { displayText } from "../i18n/display";
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
import { ReadyGlow, ReadyIcon } from "./ReadyGlow";
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
    ready,
    readyPulse,
  }: {
    tile: Tile;
    index: number;
    cellWidth: number;
    cellHeight: number;
    selected: boolean;
    drag: Drag;
    reduced: boolean;
    ready: boolean;
    readyPulse: SharedValue<number>;
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
        <ReadyIcon
          pulse={readyPulse}
          testID={`ready-icon-cell-${index}`}
          active={ready && !reduced}
          dragID={drag.id}
          tileID={tile.id}
        >
          <Item
            id={tile.item}
            size={Math.min(cellWidth, cellHeight) * 0.9}
            width={cellWidth * 0.9}
            height={cellHeight * 0.94}
          />
        </ReadyIcon>
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
    a.reduced === b.reduced &&
    a.ready === b.ready &&
    a.readyPulse === b.readyPulse,
);
const BoardGrid = memo(function BoardGrid({
  board,
  readyOrderItems,
  partialOrderItems,
  readyPulse,
  cellWidth,
  cellHeight,
}: {
  board: (Tile | null)[];
  readyOrderItems: ReadonlySet<string>;
  partialOrderItems: ReadonlySet<string>;
  readyPulse: SharedValue<number>;
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
          {board[i] &&
            (readyOrderItems.has(board[i]!.item) ||
              partialOrderItems.has(board[i]!.item)) && (
              <View
                testID={
                  (readyOrderItems.has(board[i]!.item)
                    ? "ready-order-cell-"
                    : "partial-order-cell-") + i
                }
                collapsable={false}
                pointerEvents="none"
                style={{
                  position: "absolute",
                  inset: 1.5,
                  borderRadius: 8,
                  backgroundColor: readyOrderItems.has(board[i]!.item)
                    ? "rgba(123, 158, 68, 0.15)"
                    : "rgba(45, 86, 31, 0.28)",
                  backgroundImage: readyOrderItems.has(board[i]!.item)
                    ? "linear-gradient(135deg, rgba(91, 139, 49, 0.24) 0%, rgba(150, 184, 88, 0.08) 50%, rgba(91, 139, 49, 0.24) 100%)"
                    : undefined,
                  borderWidth: readyOrderItems.has(board[i]!.item) ? 1.1 : 0.6,
                  borderColor: readyOrderItems.has(board[i]!.item)
                    ? "#a3d969"
                    : "rgba(57, 89, 35, 0.5)",
                }}
              >
                {readyOrderItems.has(board[i]!.item) && (
                  <ReadyGlow pulse={readyPulse} radius={7} />
                )}
                {[0, 1, 2, 3].map((corner) => (
                  <View
                    key={corner}
                    style={{
                      position: "absolute",
                      width: 12,
                      height: 12,
                      left: corner % 2 === 0 ? 1 : undefined,
                      right: corner % 2 === 1 ? 1 : undefined,
                      top: corner < 2 ? 1 : undefined,
                      bottom: corner >= 2 ? 1 : undefined,
                      transform: [
                        {
                          rotate: ["0deg", "90deg", "270deg", "180deg"][
                            corner
                          ]!,
                        },
                      ],
                    }}
                  >
                    <View
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: 10,
                        height: 10,
                        borderTopWidth: 1,
                        borderLeftWidth: 1,
                        borderTopLeftRadius: 7,
                        borderColor: "rgba(71, 112, 34, 0.58)",
                      }}
                    />
                    <View
                      style={{
                        position: "absolute",
                        left: 3,
                        top: 3,
                        width: 3,
                        height: 5,
                        borderTopLeftRadius: 3,
                        borderBottomRightRadius: 3,
                        backgroundColor: "rgba(112, 144, 48, 0.46)",
                        transform: [{ rotate: "-45deg" }],
                      }}
                    />
                  </View>
                ))}
              </View>
            )}
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
  readyOrderItems,
  partialOrderItems,
  readyPulse,
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
  language?: string;
  readyOrderItems: ReadonlySet<string>;
  partialOrderItems: ReadonlySet<string>;
  readyPulse: SharedValue<number>;
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
        <BoardGrid
          board={board}
          readyOrderItems={readyOrderItems}
          partialOrderItems={partialOrderItems}
          readyPulse={readyPulse}
          cellWidth={cellWidth}
          cellHeight={cellHeight}
        />
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
              ready={readyOrderItems.has(t.item)}
              readyPulse={readyPulse}
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
                accessibilityLabel={displayText(
                  t ? product(t.item).name : "Boş hücre",
                )}
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
