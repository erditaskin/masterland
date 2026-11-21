import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Animated, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppButton } from "./Controls";
import { DesignSpace } from "./DesignSpace";
import { MaterialFrame, MaterialPlaque } from "./DesignMaterial";

/** The same material, viewport and scroll origin serve every live page. */
export function PageShell({
  title,
  width,
  height,
  onClose,
  reduced,
  children,
  scroll = true,
  routeKey,
  onBodyHeight,
  dimmed = false,
}: {
  title: string;
  width: number;
  height: number;
  onClose: () => void;
  reduced: boolean;
  children: ReactNode;
  scroll?: boolean;
  dimmed?: boolean;
  routeKey: string;
  onBodyHeight?: (height: number) => void;
}) {
  const insets = useSafeAreaInsets(),
    scale = width / 1206;
  const [settled, setSettled] = useState(reduced);
  const opacity = useMemo(() => new Animated.Value(reduced ? 1 : 0), [reduced]);
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: reduced ? 0 : 130,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setSettled(true);
    });
    return () => opacity.stopAnimation();
  }, [opacity, reduced]);
  const panelEnd = (height - insets.bottom) / scale - 196;
  const bodyHeight = Math.max(1, panelEnd - 728) * scale;
  return (
    <Animated.View
      testID="fullScreenPage"
      pointerEvents={dimmed ? "auto" : "box-none"}
      style={{
        position: "absolute",
        inset: 0,
        opacity: settled ? undefined : opacity,
        backgroundColor: dimmed ? "#071619bb" : undefined,
      }}
    >
      <DesignSpace scale={scale}>
        <MaterialFrame rect={[48, 664, 1110, Math.max(200, panelEnd - 664)]} />
        <MaterialPlaque rect={[180, 550, 846, 120]} title={title} />
        <AppButton
          text="×"
          tone="secondary"
          designRect={[1038, 552, 132, 132]}
          testID="closePage"
          onPress={onClose}
        />
      </DesignSpace>
      <View
        testID="pageContent"
        collapsable={false}
        style={{
          position: "absolute",
          left: 72 * scale,
          top: 712 * scale,
          width: 1062 * scale,
          height: bodyHeight,
          overflow: "hidden",
        }}
        onLayout={(event) => onBodyHeight?.(event.nativeEvent.layout.height)}
      >
        <DesignSpace scale={scale} x={72} y={712}>
          {scroll ? (
            <ScrollView
              key={routeKey}
              testID="pageScroll"
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 0 }}
            >
              {children}
            </ScrollView>
          ) : (
            children
          )}
        </DesignSpace>
      </View>
    </Animated.View>
  );
}
