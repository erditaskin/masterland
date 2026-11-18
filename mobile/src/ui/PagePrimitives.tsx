import { memo, type ReactNode } from "react";
import {
  PixelRatio,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { semanticColors } from "./cityTheme";
import { useCityTheme } from "./CityThemeProvider";
import { TitlePlaque } from "./Skin";
import { AppCloseButton, Label } from "./Controls";
import { DesignBox, DesignSurface, type DesignRect } from "./DesignSpace";

/** Composition slots keep data and actions outside the visual material layer. */
export const PaperCard = memo(function PaperCard({
  children,
  header,
  footer,
  selected = false,
  style,
  testID,
  designRect,
  danger = false,
  variant = "paper",
}: {
  children?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  designRect?: DesignRect;
  danger?: boolean;
  variant?: "paper" | "order";
}) {
  const theme = useCityTheme();
  if (designRect) {
    const [x, y, w, h] = designRect;
    return (
      <>
        <DesignSurface
          rect={[x, y + 5, w, h]}
          fill="#c99a59"
          radius={variant === "order" ? 24 : 36}
        />
        <DesignSurface
          rect={designRect}
          fill={
            variant === "order" && selected
              ? semanticColors.successLight
              : theme.paperLight
          }
          end={
            variant === "order" && selected
              ? "#accd65"
              : selected
                ? theme.id === "city3"
                  ? theme.paper
                  : "#e6f3ba"
                : theme.paper
          }
          stroke={
            danger
              ? "#a83929"
              : selected && variant !== "order"
                ? theme.id === "city3"
                  ? theme.primary
                  : "#36872c"
                : theme.edge
          }
          radius={variant === "order" ? 24 : 36}
          line={selected ? 4 : 3}
        />
        <DesignSurface
          rect={[x + 8, y + 8, w - 16, h - 16]}
          stroke="#fff3d4"
          radius={variant === "order" ? 20 : 29}
        />
        {children && (
          <DesignBox rect={designRect} testID={testID}>
            {header}
            {children}
            {footer}
          </DesignBox>
        )}
      </>
    );
  }
  return (
    <View
      testID={testID}
      style={[
        styles.card,
        {
          backgroundColor: theme.paper,
          backgroundImage: `linear-gradient(135deg, ${theme.paperLight} 0%, ${theme.paper} 100%)`,
          borderColor: selected ? theme.primary : theme.edge,
          borderWidth: selected ? 2 : 1,
        },
        style,
      ]}
    >
      {header}
      {children}
      {footer}
    </View>
  );
});

export const PageHeading = memo(function PageHeading({
  title,
  onClose,
  width,
}: {
  title: string;
  onClose: () => void;
  width: number;
}) {
  const theme = useCityTheme();
  return (
    <View style={styles.headingRow}>
      <View style={[styles.plaque, { width: Math.max(0, width - 56) }]}>
        <TitlePlaque width={Math.max(0, width - 56)} height={44} />
        <Label title size={23} color={theme.onHeading} style={styles.center}>
          {title}
        </Label>
      </View>
      <AppCloseButton testID="closePage" onPress={onClose} />
    </View>
  );
});

/** Every row shares an exact physical-pixel square pitch, including the last row. */
export function squareTileSize(
  width: number,
  columns = 4,
  gap = 6,
  pixels = PixelRatio.get(),
) {
  return Math.max(
    0,
    Math.floor(((width - gap * (columns - 1)) / columns) * pixels) / pixels,
  );
}

const styles = StyleSheet.create({
  card: { padding: 12, borderRadius: 16, marginBottom: 10, gap: 10 },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    minHeight: 44,
  },
  plaque: {
    minHeight: 44,
    borderRadius: 23,
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  center: { textAlign: "center" },
});
