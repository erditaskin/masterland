import { View } from "react-native";
import type { ReactNode } from "react";
import { useDesignSpace } from "./DesignSpace";

/** Explicit content extent preserves readable controls and allows long pages to scroll. */
export function DesignContent({
  end,
  children,
  testID,
}: {
  end: number;
  children: ReactNode;
  testID?: string;
}) {
  const { scale, x, y } = useDesignSpace();
  return (
    <View
      testID={testID}
      style={{
        width: (1206 - 2 * x) * scale,
        height: Math.max(1, end - y) * scale,
      }}
    >
      {children}
    </View>
  );
}
