import { BOARD_ROWS } from "../game/grid";
import { displayText } from "../i18n/display";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Image,
  View,
  StyleSheet,
  type GestureResponderEvent,
} from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { boardItemArtwork } from "./Art";
import { standardArtForCity } from "./standardCityArt";
import { cityArt } from "./cityArt";
import { ReadyGlow, ReadyIcon } from "./ReadyGlow";
import { DesignImage, DesignSpace, DesignSurface } from "./DesignSpace";
import { MaterialFrame } from "./DesignMaterial";
import { useCityTheme } from "./CityThemeProvider";
import { hitCell } from "../game/boardInput";
import { product, type Tile, type Result } from "../game/engine";
function PieceImage({
  item,
  width,
  height,
}: {
  item: string;
  width: number;
  height: number;
}) {
  const artwork = boardItemArtwork(item);
  const size = Math.min(width, height) * 0.79;
  return (
    <DesignSpace scale={1}>
      <DesignImage
        source={artwork.source}
        crop={artwork.crop}
        rect={[(width - size) / 2, (height - size) / 2, size, size]}
        fit
      />
    </DesignSpace>
  );
}

const DragPreview = memo(function DragPreview({
  item,
  index,
  columns,
  width,
  height,
  offset,
}: {
  item: string;
  index: number;
  columns: number;
  width: number;
  height: number;
  offset: SharedValue<{ x: number; y: number }>;
}) {
  const style = useAnimatedStyle(() => {
    const { x, y } = offset.get();
    return { transform: [{ translateX: x }, { translateY: y }] };
  });
  return (
    <Animated.View
      pointerEvents="none"
      testID="board-drag-preview"
      style={[
        {
          position: "absolute",
          left: (index % columns) * width,
          top: Math.floor(index / columns) * height,
          width,
          height,
          zIndex: 10,
        },
        style,
      ]}
    >
      <PieceImage item={item} width={width} height={height} />
    </Animated.View>
  );
});

const Piece = memo(
  function Piece({
    tile,
    index,
    columns,
    cellWidth,
    cellHeight,
    selected,
    dragID,
    reduced,
    ready,
    readyPulse,
  }: {
    tile: Tile;
    index: number;
    columns: number;
    cellWidth: number;
    cellHeight: number;
    selected: boolean;
    dragID: SharedValue<string>;
    reduced: boolean;
    ready: boolean;
    readyPulse: SharedValue<number>;
  }) {
    const opacity = useSharedValue(reduced ? 1 : 0);
    useEffect(() => {
      opacity.set(withTiming(1, { duration: reduced ? 0 : 130 }));
    }, [opacity, reduced]);
    const style = useAnimatedStyle(() => ({
      opacity: dragID.get() === tile.id ? 0 : opacity.get(),
    }));
    const selectionStyle = useAnimatedStyle(() => ({
      opacity: dragID.get() === tile.id ? 0 : 1,
    }));
    return (
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            left: (index % columns) * cellWidth,
            top: Math.floor(index / columns) * cellHeight,
            width: cellWidth,
            height: cellHeight,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        {selected && (
          <Animated.View
            style={[
              {
                position: "absolute",
                inset: 3,
                borderWidth: 1.8,
                borderColor: "#98c86b",
                borderRadius: 5,
                backgroundColor: "#dcebb580",
              },
              selectionStyle,
            ]}
          />
        )}
        <Animated.View style={style}>
          <ReadyIcon
            pulse={readyPulse}
            active={ready && !reduced}
            dragID={dragID}
            tileID={tile.id}
            testID={`ready-icon-cell-${index}`}
          >
            <View style={{ width: cellWidth, height: cellHeight }}>
              <PieceImage
                item={tile.item}
                width={cellWidth}
                height={cellHeight}
              />
            </View>
          </ReadyIcon>
        </Animated.View>
      </Animated.View>
    );
  },
  (a, b) =>
    a.tile.id === b.tile.id &&
    a.tile.item === b.tile.item &&
    a.index === b.index &&
    a.columns === b.columns &&
    a.cellWidth === b.cellWidth &&
    a.cellHeight === b.cellHeight &&
    a.selected === b.selected &&
    a.reduced === b.reduced &&
    a.ready === b.ready &&
    a.readyPulse === b.readyPulse &&
    a.dragID === b.dragID,
);
function OrderHighlight({
  index,
  ready,
  readyPulse,
  tileID,
  dragID,
}: {
  index: number;
  ready: boolean;
  readyPulse: SharedValue<number>;
  tileID: string;
  dragID: SharedValue<string>;
}) {
  const visibility = useAnimatedStyle(() => ({
    opacity: dragID.get() === tileID ? 0 : 1,
  }));
  return (
    <Animated.View
      testID={(ready ? "ready-order-cell-" : "partial-order-cell-") + index}
      collapsable={false}
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          inset: 1.5,
          borderRadius: 8,
          backgroundColor: ready
            ? "rgba(157, 255, 72, 0.33)"
            : "rgba(29, 72, 37, 0.43)",
          backgroundImage: ready
            ? "linear-gradient(135deg, rgba(109, 232, 46, 0.36) 0%, rgba(187, 255, 120, 0.20) 50%, rgba(109, 232, 46, 0.36) 100%)"
            : undefined,
          borderWidth: ready ? 1.1 : 0.6,
          borderColor: ready ? "#96f23b" : "#496e39",
        },
        visibility,
      ]}
    >
      {ready && <ReadyGlow pulse={readyPulse} radius={7} />}
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
                rotate: ["0deg", "90deg", "270deg", "180deg"][corner]!,
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
    </Animated.View>
  );
}

const BoardGrid = memo(function BoardGrid({
  board,
  readyOrderItems,
  partialOrderItems,
  readyPulse,
  dragID,
  columns,
  paintedGrid,
  cellWidth,
  cellHeight,
}: {
  board: (Tile | null)[];
  readyOrderItems: ReadonlySet<string>;
  partialOrderItems: ReadonlySet<string>;
  readyPulse: SharedValue<number>;
  dragID: SharedValue<string>;
  columns: number;
  paintedGrid: boolean;
  cellWidth: number;
  cellHeight: number;
}) {
  const theme = useCityTheme();
  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        !paintedGrid && { backgroundColor: theme.paper },
      ]}
    >
      {Array.from({ length: columns * BOARD_ROWS }, (_, i) => {
        const tile = board[i];
        const item = tile?.item;
        const ready = item !== undefined && readyOrderItems.has(item);
        const partial = item !== undefined && partialOrderItems.has(item);
        if (paintedGrid && !ready && !partial) return null;
        return (
          <View
            key={i}
            style={{
              position: "absolute",
              left: (i % columns) * cellWidth,
              top: Math.floor(i / columns) * cellHeight,
              width: cellWidth,
              height: cellHeight,
            }}
          >
            {!paintedGrid &&
              (cityArt[theme.id]!.board ? (
                <Image
                  source={cityArt[theme.id]!.board!.cell}
                  resizeMode="stretch"
                  fadeDuration={0}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: cellWidth,
                    height: cellHeight,
                  }}
                />
              ) : (
                <View
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: (cellWidth * 10) / 164,
                    backgroundColor: theme.paperLight,
                    backgroundImage: `linear-gradient(135deg, ${theme.paperLight} 0%, ${theme.paper} 100%)`,
                    borderWidth: (cellWidth * 2) / 164,
                    borderColor: "#fff2d7",
                  }}
                />
              ))}
            {tile && (ready || partial) && (
              <OrderHighlight
                index={i}
                ready={ready}
                readyPulse={readyPulse}
                tileID={tile.id}
                dragID={dragID}
              />
            )}
          </View>
        );
      })}
    </View>
  );
});
export const Board = memo(function Board({
  board,
  readyOrderItems,
  partialOrderItems,
  readyPulse,
  columns,
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
  readyOrderItems: ReadonlySet<string>;
  partialOrderItems: ReadonlySet<string>;
  readyPulse: SharedValue<number>;
  language?: string;
  columns: number;
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
  const theme = useCityTheme();
  const paintedBoard =
    columns === 6 ? standardArtForCity(theme.id)?.board : undefined;
  const paintedGrid = Boolean(paintedBoard);
  const frameScale =
    theme.id === "city1" ? (cellWidth * columns) / (7 * 164) : cellWidth / 164;
  const dragID = useSharedValue("");
  const offset = useSharedValue({ x: 0, y: 0 });
  const epoch = useRef(0);
  const [dragged, setDragged] = useState<{
    index: number;
    item: string;
  } | null>(null);
  const touch = useRef<{
    index: number;
    pageX: number;
    pageY: number;
    localX: number;
    localY: number;
    startedAt: number;
    tile: Tile | null;
    moving: boolean;
  } | null>(null);

  const clearDrag = useCallback(
    (token: number) => {
      if (epoch.current !== token) return;
      dragID.set("");
      offset.set({ x: 0, y: 0 });
      setDragged(null);
    },
    [dragID, offset],
  );

  const returnToSource = () => {
    const token = epoch.current;
    if (reduced) {
      clearDrag(token);
      return;
    }
    offset.set(
      withTiming({ x: 0, y: 0 }, { duration: 140 }, (finished) => {
        if (finished) scheduleOnRN(clearDrag, token);
      }),
    );
  };

  const trackTouchStart = (index: number, event: GestureResponderEvent) => {
    const token = ++epoch.current;
    cancelAnimation(offset);
    clearDrag(token);
    if (event.nativeEvent.touches.length !== 1) {
      touch.current = null;
      return;
    }
    const { pageX, pageY, locationX, locationY, timestamp } = event.nativeEvent;
    touch.current = {
      index,
      pageX,
      pageY,
      localX: (index % columns) * cellWidth + locationX,
      localY: Math.floor(index / columns) * cellHeight + locationY,
      startedAt: timestamp,
      tile: board[index] ?? null,
      moving: false,
    };
  };

  const trackTouchMove = (event: GestureResponderEvent) => {
    const input = touch.current;
    if (!input?.tile) return;
    const x = event.nativeEvent.pageX - input.pageX;
    const y = event.nativeEvent.pageY - input.pageY;
    if (!input.moving) {
      if (x * x + y * y < 25) return;
      input.moving = true;
      dragID.set(input.tile.id);
      setDragged({ index: input.index, item: input.tile.item });
    }
    offset.set({ x, y });
  };

  const trackTouchEnd = (event: GestureResponderEvent) => {
    const input = touch.current;
    touch.current = null;
    if (!input) return;
    const x = event.nativeEvent.pageX - input.pageX;
    const y = event.nativeEvent.pageY - input.pageY;
    if (input.moving || x * x + y * y >= 25) {
      if (!input.tile) return;
      const to = hitCell(
        input.localX + x,
        input.localY + y,
        cellWidth,
        cellHeight,
        columns,
      );
      const result =
        to !== null && to !== input.index
          ? onMove(input.index, to, input.tile.id)
          : null;
      if (result?.kind === "merge" || result?.kind === "move")
        clearDrag(epoch.current);
      else returnToSource();
    } else if (input.tile && event.nativeEvent.timestamp - input.startedAt >= 450) {
      onInfo(input.index);
    } else {
      onTap(input.index);
    }
  };

  const cancelTouch = () => {
    touch.current = null;
    returnToSource();
  };

  return (
    <View
      testID="mergeBoard"
      style={{
        width: cellWidth * columns + 2 * frameInset,
        height: cellHeight * BOARD_ROWS + 2 * frameInset,
        padding: frameInset,
        backgroundColor: "transparent",
      }}
    >
      {paintedGrid ? (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Image
            source={paintedBoard}
            resizeMode="stretch"
            fadeDuration={0}
            accessible={false}
            style={{
              width: cellWidth * columns + 2 * frameInset,
              height: cellHeight * BOARD_ROWS + 2 * frameInset,
            }}
          />
        </View>
      ) : (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <DesignSpace scale={cellWidth / 164}>
            <DesignSurface
              rect={[
                0,
                0,
                ((cellWidth * columns + 2 * frameInset) * 164) / cellWidth,
                ((cellHeight * BOARD_ROWS + 2 * frameInset) * 164) / cellWidth,
              ]}
              fill={theme.paper}
              radius={30}
            />
          </DesignSpace>
        </View>
      )}
      <View
        style={{
          width: cellWidth * columns,
          height: cellHeight * BOARD_ROWS,
          backgroundColor: "transparent",
        }}
      >
        <BoardGrid
          board={board}
          columns={columns}
          paintedGrid={paintedGrid}
          readyOrderItems={readyOrderItems}
          partialOrderItems={partialOrderItems}
          readyPulse={readyPulse}
          dragID={dragID}
          cellWidth={cellWidth}
          cellHeight={cellHeight}
        />
        {board.map((t, i) =>
          t ? (
            <Piece
              key={t.id}
              ready={readyOrderItems.has(t.item)}
              readyPulse={readyPulse}
              tile={t}
              index={i}
              columns={columns}
              cellWidth={cellWidth}
              cellHeight={cellHeight}
              selected={selected === i}
              dragID={dragID}
              reduced={reduced}
            />
          ) : null,
        )}
        <View
          collapsable={false}
          style={StyleSheet.absoluteFill}
          onTouchMove={trackTouchMove}
          onTouchEnd={trackTouchEnd}
          onTouchCancel={cancelTouch}
        >
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
              onTouchStart={(event) => trackTouchStart(i, event)}
              onAccessibilityTap={() => onTap(i)}
              onAccessibilityEscape={() => onSelect(-1)}
              style={{
                position: "absolute",
                left: (i % columns) * cellWidth,
                top: Math.floor(i / columns) * cellHeight,
                width: cellWidth,
                height: cellHeight,
              }}
            />
          ))}
        </View>
        {dragged && (
          <DragPreview
            item={dragged.item}
            index={dragged.index}
            columns={columns}
            width={cellWidth}
            height={cellHeight}
            offset={offset}
          />
        )}
      </View>
      {!paintedGrid && (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <DesignSpace scale={frameScale}>
            <MaterialFrame
              rect={[
                0,
                0,
                (cellWidth * columns + 2 * frameInset) / frameScale,
                (cellHeight * BOARD_ROWS + 2 * frameInset) / frameScale,
              ]}
              paper={false}
              purpose="board"
            />
          </DesignSpace>
        </View>
      )}
    </View>
  );
});
