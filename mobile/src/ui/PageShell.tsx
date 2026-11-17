import { useEffect, useMemo, type ReactNode } from "react";
import { Animated, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PagePaper } from "./Skin";
import { PageHeading } from "./PagePrimitives";

/** Header, safe-area geometry and material are shared; screens supply only content. */
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
}: {
  title: string;
  width: number;
  height: number;
  onClose: () => void;
  reduced: boolean;
  children: ReactNode;
  scroll?: boolean;
  routeKey: string;
  onBodyHeight?: (height: number) => void;
}) {
  const insets = useSafeAreaInsets();
  const opacity = useMemo(() => new Animated.Value(reduced ? 1 : 0), [reduced]);
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: reduced ? 0 : 130,
      useNativeDriver: true,
    }).start();
    return () => opacity.stopAnimation();
  }, [opacity, reduced]);
  const top = Math.max(insets.top, 20) + (118 * width) / 390;
  const panelWidth = width - 16;
  const panelHeight = Math.max(1, height - insets.bottom - 67 - top);
  return (
    <Animated.View
      testID="fullScreenPage"
      pointerEvents="box-none"
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        paddingTop: top,
        paddingHorizontal: 8,
      }}
    >
      <View
        style={{
          width: panelWidth,
          height: panelHeight,
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: 12,
        }}
      >
        <PagePaper width={panelWidth} height={panelHeight} />
        <PageHeading title={title} width={panelWidth - 32} onClose={onClose} />
        <View
          testID="pageContent"
          collapsable={false}
          style={{ flex: 1 }}
          onLayout={(e) => onBodyHeight?.(e.nativeEvent.layout.height)}
        >
          {scroll ? (
            <ScrollView
              key={routeKey}
              testID="pageScroll"
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingTop: 8, paddingBottom: 12 }}
            >
              {children}
            </ScrollView>
          ) : (
            children
          )}
        </View>
      </View>
    </Animated.View>
  );
}
