import { View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInLeft,
} from "react-native-reanimated";
export type FocusRect = readonly [number, number, number, number];

export function GuideSpotlight({
  rects,
  width,
  height,
  reduced,
}: {
  rects: readonly FocusRect[];
  width: number;
  height: number;
  reduced: boolean;
}) {
  const shade = "#071619c9";
  const rows = [
    ...new Set([0, height, ...rects.flatMap(([, y, , h]) => [y, y + h])]),
  ].sort((a, b) => a - b);
  const blocks = rows.slice(0, -1).flatMap((top, i) => {
    const bottom = rows[i + 1]!;
    const openings = rects
      .filter(([, y, , h]) => y <= top && y + h >= bottom)
      .sort((a, b) => a[0] - b[0]);
    const gaps: FocusRect[] = [];
    let left = 0;
    for (const [x, , w] of openings) {
      if (x > left) gaps.push([left, top, x - left, bottom - top]);
      left = Math.max(left, x + w);
    }
    if (left < width) gaps.push([left, top, width - left, bottom - top]);
    return gaps;
  });
  const pair = rects.length === 2;
  return (
    <>
      {blocks.map(([left, top, width, height]) => (
        <View
          key={`${left}-${top}`}
          accessible={false}
          onStartShouldSetResponder={pair ? undefined : () => true}
          pointerEvents={pair ? "none" : "auto"}
          style={{
            position: "absolute",
            left,
            top,
            width,
            height,
            backgroundColor: shade,
          }}
        />
      ))}
      {rects.map(([left, top, width, height]) => {
        const radius = 11;
        return (
          <View
            key={`${left}-${top}`}
            pointerEvents="none"
            style={{ position: "absolute", left, top, width, height }}
          >
            {[0, 1, 2, 3].map((corner) => (
              <View
                key={corner}
                style={{
                  position: "absolute",
                  width: radius,
                  height: radius,
                  [corner % 2 ? "right" : "left"]: 0,
                  [corner >= 2 ? "bottom" : "top"]: 0,
                  transform: [
                    { scaleX: corner % 2 ? -1 : 1 },
                    { scaleY: corner >= 2 ? -1 : 1 },
                  ],
                }}
              >
                {Array.from({ length: 8 }, (_, row) => {
                  const band = radius / 8;
                  const offset = radius - (row + 0.5) * band;
                  return (
                    <View
                      key={row}
                      style={{
                        position: "absolute",
                        top: row * band,
                        height: band,
                        left: 0,
                        width: radius - Math.sqrt(radius ** 2 - offset ** 2),
                        backgroundColor: shade,
                      }}
                    />
                  );
                })}
              </View>
            ))}
            <Animated.View
              entering={reduced ? undefined : FadeIn.duration(190)}
              exiting={reduced ? undefined : FadeOut.duration(120)}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: radius,
                borderColor: "#ffdc85",
                borderWidth: 2,
              }}
            />
          </View>
        );
      })}
      {pair &&
        (() => {
          const [[x1, y1, w1, h1], [x2, y2, w2, h2]] = rects as readonly [
            FocusRect,
            FocusRect,
          ];
          const dx = x2 + w2 / 2 - x1 - w1 / 2;
          const dy = y2 + h2 / 2 - y1 - h1 / 2;
          const length = Math.hypot(dx, dy);
          return (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: x1 + w1 / 2 + dx / 2 - length / 2,
                top: y1 + h1 / 2 + dy / 2 - 2,
                width: length,
                height: 4,
                transform: [{ rotate: `${Math.atan2(dy, dx)}rad` }],
              }}
            >
              <Animated.View
                entering={reduced ? undefined : SlideInLeft.duration(350)}
                style={{
                  position: "absolute",
                  left: 12,
                  right: 16,
                  top: 0,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "#ffdc85dd",
                }}
              />
              <View
                style={{
                  position: "absolute",
                  right: 10,
                  top: -4,
                  borderLeftWidth: 9,
                  borderLeftColor: "#ffdc85",
                  borderTopWidth: 6,
                  borderBottomWidth: 6,
                  borderTopColor: "transparent",
                  borderBottomColor: "transparent",
                }}
              />
            </View>
          );
        })()}
    </>
  );
}
