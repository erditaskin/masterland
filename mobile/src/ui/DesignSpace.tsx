import {
  createContext,
  memo,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  Image,
  Platform,
  View,
  type ImageSourcePropType,
  type ViewStyle,
} from "react-native";
import { I18nText } from "./I18nText";
import { fonts } from "./theme";
import { useCityTheme } from "./CityThemeProvider";

export type DesignRect = readonly [number, number, number, number];
const Space = createContext({ scale: 1 / 3, x: 0, y: 0 });

/** Coordinates belong to the design, not a device or an operating system. */
export function DesignSpace({
  scale,
  x = 0,
  y = 0,
  children,
}: {
  scale: number;
  x?: number;
  y?: number;
  children: ReactNode;
}) {
  const space = useMemo(() => ({ scale, x, y }), [scale, x, y]);
  return <Space value={space}>{children}</Space>;
}
export function useDesignSpace() {
  return useContext(Space);
}
export function useDesignRect(rect: DesignRect): ViewStyle {
  const { scale, x, y } = useDesignSpace();
  const fixed = rect.map((value) => Math.round(value * 1000) / 1000);
  return {
    position: "absolute",
    left: (fixed[0]! - x) * scale,
    top: (fixed[1]! - y) * scale,
    width: fixed[2]! * scale,
    height: fixed[3]! * scale,
  };
}
export function DesignBox({
  rect,
  children,
  style,
  testID,
  local = false,
}: {
  rect: DesignRect;
  children?: ReactNode;
  style?: ViewStyle;
  testID?: string;
  local?: boolean;
}) {
  const { scale } = useDesignSpace();
  return (
    <View testID={testID} style={[useDesignRect(rect), style]}>
      {local ? <DesignSpace scale={scale}>{children}</DesignSpace> : children}
    </View>
  );
}
export const DesignSurface = memo(function DesignSurface({
  rect,
  fill,
  end,
  stroke,
  radius = 24,
  line = 3,
}: {
  rect: DesignRect;
  fill?: string;
  end?: string;
  stroke?: string;
  radius?: number;
  line?: number;
}) {
  const { scale } = useDesignSpace();
  return (
    <View
      pointerEvents="none"
      style={[
        useDesignRect(rect),
        {
          borderRadius: radius * scale,
          backgroundColor: fill,
          borderColor: stroke,
          borderWidth: stroke ? line * scale : 0,
          backgroundImage:
            fill && end
              ? `linear-gradient(135deg, ${fill} 0%, ${end} 100%)`
              : undefined,
        },
      ]}
    />
  );
});
export const DesignText = memo(function DesignText({
  rect,
  children,
  size = 44,
  bold = false,
  color,
  align = "left",
  font,
  accessible = true,
  testID,
  fit = false,
}: {
  rect: DesignRect;
  children: ReactNode;
  size?: number;
  bold?: boolean;
  color?: string;
  align?: "left" | "center" | "right";
  font?: string;
  accessible?: boolean;
  testID?: string;
  fit?: boolean;
}) {
  const { scale } = useDesignSpace();
  const theme = useCityTheme();
  return (
    <View
      pointerEvents="none"
      style={[
        useDesignRect(rect),
        { justifyContent: "center", overflow: "hidden" },
      ]}
    >
      <I18nText
        numberOfLines={fit ? 1 : undefined}
        adjustsFontSizeToFit={fit}
        minimumFontScale={fit ? 0.45 : undefined}
        accessible={accessible}
        testID={testID}
        allowFontScaling={false}
        style={{
          fontFamily: font ?? (bold ? fonts.title : fonts.body),
          fontSize: size * scale,
          fontWeight: Platform.OS === "android" && bold ? "700" : undefined,
          color: color ?? theme.ink,
          textAlign: align,
          includeFontPadding: false,
        }}
      >
        {children}
      </I18nText>
    </View>
  );
});

/** Painted layers are independent from text, hit targets and game state. */
export const DesignImage = memo(function DesignImage({
  source,
  rect,
  crop,
  fit = false,
  radius = 0,
}: {
  source: ImageSourcePropType;
  rect: DesignRect;
  crop?: DesignRect;
  fit?: boolean;
  radius?: number;
}) {
  const { scale } = useDesignSpace();
  const style = useDesignRect(rect);
  const meta = Image.resolveAssetSource(source);
  if (!meta?.width || !meta.height) throw Error("Eksik görsel boyutu.");
  const [sx, sy, sw, sh] = crop ?? [0, 0, meta.width, meta.height];
  const [, , w, h] = rect;
  const factor = Math.min(w / sw, h / sh);
  const dw = fit ? sw * factor : w,
    dh = fit ? sh * factor : h;
  return (
    <View
      pointerEvents="none"
      accessible={false}
      style={[style, { overflow: "hidden", borderRadius: radius * scale }]}
    >
      <View
        style={{
          position: "absolute",
          left: ((w - dw) * scale) / 2,
          top: ((h - dh) * scale) / 2,
          width: dw * scale,
          height: dh * scale,
          overflow: "hidden",
        }}
      >
        <Image
          source={source}
          fadeDuration={0}
          resizeMode="stretch"
          style={{
            position: "absolute",
            left: ((-sx * dw) / sw) * scale,
            top: ((-sy * dh) / sh) * scale,
            width: ((meta.width * dw) / sw) * scale,
            height: ((meta.height * dh) / sh) * scale,
          }}
        />
      </View>
    </View>
  );
});
