import { centeredHitRect } from "./layout";
import { displayText } from "../i18n/display";
import { languageStore } from "../i18n/locale";
import { I18nText as Text } from "./I18nText";
import React, { useMemo, useSyncExternalStore } from "react";
import {
  Animated,
  Platform,
  Pressable,
  TextInput,
  type TextInputProps,
  type AccessibilityRole,
  View,
  type ViewStyle,
  type StyleProp,
  type TextStyle,
} from "react-native";
import { colors, fonts, parchment } from "./theme";
import { useCityTheme } from "./CityThemeProvider";
import { semanticColors } from "./cityTheme";
import {
  DesignSurface,
  DesignText,
  useDesignRect,
  useDesignSpace,
  type DesignRect,
} from "./DesignSpace";
export function Label({
  children,
  title = false,
  size = 14,
  color,
  tone = "default",
  style,
}: {
  children: React.ReactNode;
  title?: boolean;
  size?: number;
  color?: string;
  tone?: "default" | "muted" | "success";
  style?: StyleProp<TextStyle>;
}) {
  const theme = useCityTheme();
  return (
    <Text
      allowFontScaling
      maxFontSizeMultiplier={1.15}
      style={[
        {
          fontFamily: title ? fonts.title : fonts.body,
          fontWeight: Platform.OS === "android" && title ? "700" : undefined,
          fontSize: size,
          color:
            color ??
            (tone === "muted"
              ? theme.mutedInk
              : tone === "success"
                ? semanticColors.success
                : theme.ink),
          includeFontPadding: false,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Button({
  children,
  onPress,
  onLongPress,
  label,
  testID,
  style,
  disabled = false,
  selected,
  role = "button",
  checked,
  feedbackFrame,
}: {
  children: React.ReactNode;
  onPress: () => void;
  onLongPress?: () => void;
  label: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  selected?: boolean;
  role?: AccessibilityRole;
  checked?: boolean;
  feedbackFrame?: {
    left: number;
    top: number;
    width: number;
    height: number;
    borderRadius: number;
  };
}) {
  const language = useSyncExternalStore(
    languageStore.subscribe,
    languageStore.get,
  );
  const opacity = useMemo(() => new Animated.Value(1), []);
  return (
    <Pressable
      testID={testID}
      accessibilityRole={role}
      accessibilityLabel={displayText(label, language)}
      accessibilityState={{ selected, disabled, checked }}
      disabled={disabled}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={450}
      onPressIn={() =>
        Animated.timing(opacity, {
          toValue: 0.84,
          duration: 65,
          useNativeDriver: true,
        }).start()
      }
      onPressOut={() =>
        Animated.timing(opacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }).start()
      }
      style={style}
    >
      <Animated.View
        style={{
          opacity: feedbackFrame ? undefined : opacity,
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
        }}
      >
        {children}
        {feedbackFrame && (
          <Animated.View
            pointerEvents="none"
            style={[
              { position: "absolute", backgroundColor: "#000000" },
              feedbackFrame,
              {
                opacity: opacity.interpolate({
                  inputRange: [0.84, 1],
                  outputRange: [0.16, 0],
                  extrapolate: "clamp",
                }),
              },
            ]}
          />
        )}
      </Animated.View>
    </Pressable>
  );
}
const paperButtonSurface: ViewStyle = {
  borderRadius: parchment.radius,
  backgroundColor: parchment.paper,
  backgroundImage: parchment.gradient,
  borderWidth: 1,
  borderBottomWidth: 2,
  borderColor: parchment.edge,
};
/** Non-interactive face for a button already owned by its surrounding achievement card. */
export function AppButtonStamp({ text }: { text: string }) {
  const theme = useCityTheme();
  return (
    <View
      style={[
        paperButtonSurface,
        {
          paddingHorizontal: 10,
          paddingVertical: 3,
          backgroundColor: theme.paper,
          borderColor: theme.edge,
        },
      ]}
    >
      <Label title size={12} color={parchment.greenInk}>
        {text}
      </Label>
    </View>
  );
}
export function AppProgress({
  value,
  total,
  label,
}: {
  value: number;
  total: number;
  label?: string;
}) {
  const theme = useCityTheme();
  const fraction = total > 0 ? Math.max(0, Math.min(1, value / total)) : 0;
  return (
    <View
      style={{
        height: label ? 18 : 10,
        width: "100%",
        borderRadius: 5,
        borderWidth: 1,
        borderColor: theme.edge,
        backgroundColor: theme.paper,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: `${fraction * 100}%`,
          backgroundColor: semanticColors.success,
        }}
      />
      {label && (
        <Label title size={11} style={{ textAlign: "center" }}>
          {label}
        </Label>
      )}
    </View>
  );
}
/** Parchment controls share their surfaces, typography and press feedback. */
export function AppButton({
  text,
  onPress,
  testID,
  tone = "primary",
  style,
  disabled = false,
  designRect,
  selected,
}: {
  text: string;
  onPress: () => void;
  testID?: string;
  tone?: "primary" | "secondary" | "muted" | "danger";
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  designRect?: DesignRect;
  selected?: boolean;
}) {
  const theme = useCityTheme();
  const space = useDesignSpace();
  const hit = designRect
    ? centeredHitRect(designRect, space.scale)
    : ([0, 0, 0, 0] as const);
  const placement = useDesignRect(hit);
  const primary = tone === "primary";
  const fill = disabled
    ? semanticColors.disabled
    : primary
      ? theme.primary
      : theme.paper;
  const top = disabled
    ? "#c6c8c4"
    : primary
      ? theme.primaryLight
      : theme.paperLight;
  if (designRect) {
    const [x, y, w, h] = designRect;
    const ink = disabled
      ? "#f5f4ef"
      : primary
        ? theme.onPrimary
        : tone === "danger"
          ? semanticColors.danger
          : theme.ink;
    return (
      <>
        <DesignSurface rect={[x, y + 6, w, h]} fill="#9c6e38" radius={h / 2} />
        <DesignSurface
          rect={designRect}
          fill={disabled ? "#d0d1cd" : top}
          end={fill}
          stroke={theme.edge}
          radius={h / 2}
        />
        <DesignSurface
          rect={[x + 6, y + 6, w - 12, h - 12]}
          stroke="#fff0c5"
          radius={h / 2 - 6}
          line={2}
        />
        <DesignText
          rect={[x + 18, y + 4, w - 36, h - 8]}
          size={44}
          bold
          color={ink}
          align="center"
          accessible={false}
        >
          {text}
        </DesignText>
        <Button
          label={text}
          testID={testID}
          onPress={onPress}
          disabled={disabled}
          selected={selected}
          style={[placement, style]}
          feedbackFrame={{
            left: (x - hit[0]) * space.scale,
            top: (y - hit[1]) * space.scale,
            width: w * space.scale,
            height: h * space.scale,
            borderRadius: (h * space.scale) / 2,
          }}
        >
          <View />
        </Button>
      </>
    );
  }
  return (
    <Button
      label={text}
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      selected={selected}
      style={[
        paperButtonSurface,
        {
          minHeight: parchment.controlHeight,
          paddingHorizontal: 14,
          paddingVertical: 9,
          marginVertical: 4,
          opacity: 1,
          borderColor: disabled ? "#999b95" : theme.edge,
          borderRadius: 18,
          backgroundColor: fill,
          backgroundImage: `linear-gradient(180deg, ${top} 0%, ${fill} 100%)`,
        },
        style,
      ]}
    >
      <Label
        title
        size={parchment.fontSize}
        color={
          disabled
            ? semanticColors.disabledInk
            : primary
              ? theme.onPrimary
              : tone === "muted"
                ? theme.mutedInk
                : tone === "danger"
                  ? semanticColors.danger
                  : theme.ink
        }
        style={{ textAlign: "center", lineHeight: 19 }}
      >
        {text}
      </Label>
    </Button>
  );
}
// Existing call sites inherit the common parchment button rather than a second design.
export const ActionButton = AppButton;

export function AppCheckbox({
  label,
  checked,
  onChange,
  testID,
  designRect,
  checkPosition = "right",
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  testID?: string;
  designRect?: DesignRect;
  checkPosition?: "left" | "right";
}) {
  const theme = useCityTheme();
  const space = useDesignSpace();
  const hit = designRect
    ? centeredHitRect(designRect, space.scale)
    : ([0, 0, 0, 0] as const);
  const placement = useDesignRect(hit);
  if (designRect) {
    const [x, y] = designRect;
    const left = checkPosition === "left",
      box: DesignRect = left ? [x, y + 50, 75, 75] : [x + 830, y + 15, 72, 72];
    return (
      <>
        <DesignText
          rect={left ? [x + 115, y, 830, 220] : [x, y, 770, 105]}
          size={left ? 45 : 44}
          accessible={false}
        >
          {label}
        </DesignText>
        <DesignSurface
          rect={box}
          fill={theme.paperLight}
          stroke={theme.edge}
          radius={10}
        />
        {checked && (
          <DesignText
            rect={left ? [x - 5, y + 45, 84, 84] : [x + 825, y + 10, 84, 84]}
            size={61}
            bold
            color="#34852b"
            align="center"
            accessible={false}
          >
            ✓
          </DesignText>
        )}
        <Button
          label={label}
          role="checkbox"
          checked={checked}
          testID={testID}
          onPress={onChange}
          style={placement}
          feedbackFrame={{
            left: (box[0] - hit[0]) * space.scale,
            top: (box[1] - hit[1]) * space.scale,
            width: box[2] * space.scale,
            height: box[3] * space.scale,
            borderRadius: 10 * space.scale,
          }}
        >
          <View />
        </Button>
      </>
    );
  }
  return (
    <Button
      label={label}
      role="checkbox"
      checked={checked}
      testID={testID}
      onPress={onChange}
      style={{ minHeight: 48, marginVertical: 2 }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          gap: 12,
        }}
      >
        <View
          style={{
            width: 25,
            height: 25,
            borderWidth: 1.5,
            borderColor: theme.edge,
            borderRadius: 4,
            transform: [{ rotate: "-3deg" }],
            backgroundColor: "#f0cf8c44",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {checked && (
            <Label
              size={27}
              color={parchment.greenInk}
              style={{ fontStyle: "italic", lineHeight: 29 }}
            >
              ✓
            </Label>
          )}
        </View>
        <Label size={15} style={{ flex: 1, fontStyle: "italic" }}>
          {label}
        </Label>
      </View>
    </Button>
  );
}

export function AppInput({ style, ...props }: TextInputProps) {
  const theme = useCityTheme();
  return (
    <TextInput
      placeholderTextColor={theme.mutedInk}
      selectionColor={theme.primary}
      {...props}
      style={[
        {
          minHeight: parchment.controlHeight,
          borderBottomWidth: 1,
          borderColor: parchment.edge,
          backgroundColor: "#f0cf8c33",
          paddingHorizontal: 10,
          paddingVertical: 8,
          borderRadius: 5,
          color: theme.ink,
          fontFamily: fonts.body,
          fontSize: 15,
          fontStyle: "italic",
        },
        style,
      ]}
    />
  );
}

export function AppChoice({
  selected,
  style,
  ...props
}: React.ComponentProps<typeof Button>) {
  const theme = useCityTheme();
  return (
    <Button
      {...props}
      selected={selected}
      style={[
        {
          borderRadius: parchment.radius,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? theme.primary : theme.edge,
          backgroundColor: selected ? theme.selected : theme.paper,
        },
        style,
      ]}
    />
  );
}

export function AppCloseButton({
  onPress,
  testID,
}: {
  onPress: () => void;
  testID?: string;
}) {
  const theme = useCityTheme();
  return (
    <Button
      label="Bitti"
      testID={testID}
      onPress={onPress}
      style={{ width: 44, height: 44 }}
    >
      <View
        pointerEvents="none"
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.paper,
          borderColor: theme.edge,
          borderWidth: 1,
        }}
      >
        <Label size={23} color={parchment.ink} style={{ lineHeight: 27 }}>
          ×
        </Label>
      </View>
    </Button>
  );
}
export function Divider() {
  return (
    <View
      style={{ height: 1, backgroundColor: colors.outline, marginVertical: 12 }}
    />
  );
}
