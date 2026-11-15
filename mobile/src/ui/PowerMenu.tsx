import { Pressable, View } from "react-native";
import {
  city,
  productionPlan,
  productionPowerCosts,
  type Save,
  type Action,
  type Result,
  producers,
} from "../game/engine";
import { Button, Label } from "./Controls";
import { StatusIcon } from "./StatusIcon";
import { colors } from "./theme";
export interface PowerAnchor {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
}
/** Local anchored popover; never a native Modal or full-screen page. */
export function PowerMenu({
  anchor,
  width,
  height,
  save,
  dispatch,
  close,
  details,
}: {
  anchor: PowerAnchor;
  width: number;
  height: number;
  save: Save;
  dispatch: (a: Action) => Result | null;
  close: () => void;
  details: () => void;
}) {
  const p = producers[anchor.index]!,
    selected = productionPlan(save, p).selected;
  const menuWidth = 119,
    menuHeight = 270;
  const right = anchor.x + anchor.width + 6 + menuWidth <= width - 8;
  const left = Math.max(
    8,
    Math.min(
      width - menuWidth - 8,
      right ? anchor.x + anchor.width + 6 : anchor.x - menuWidth - 6,
    ),
  );
  const top = Math.max(28, Math.min(anchor.y, height - menuHeight - 65));
  const tones = ["#31506d", "#276c55", "#67488c", "#9b6519"];
  return (
    <>
      <Pressable
        testID="dismissPowerMenu"
        accessibilityLabel="Güç menüsünü kapat"
        onPress={close}
        style={{ position: "absolute", inset: 0 }}
      />
      <View
        testID="producerPowerMenu"
        style={{
          position: "absolute",
          left,
          top,
          width: menuWidth,
          padding: 6,
          borderRadius: 12,
          borderWidth: 1.2,
          borderColor: colors.gold,
          backgroundColor: colors.navy,
          shadowColor: "#000",
          shadowOpacity: 0.35,
          shadowRadius: 7,
          shadowOffset: { width: 0, height: 3 },
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 14,
            ...(right
              ? { left: -7, borderRightWidth: 7, borderRightColor: colors.gold }
              : {
                  right: -7,
                  borderLeftWidth: 7,
                  borderLeftColor: colors.gold,
                }),
            borderTopWidth: 6,
            borderBottomWidth: 6,
            borderTopColor: "transparent",
            borderBottomColor: "transparent",
            width: 0,
            height: 0,
          }}
        />
        <Label
          title
          size={10}
          color={colors.goldLight}
          style={{ textAlign: "center", marginBottom: 5 }}
        >
          {p.name}
        </Label>
        <Label
          size={8.5}
          color="#cad9e2"
          style={{ textAlign: "center", marginBottom: 5 }}
        >
          2x–4x: 100 üzeri enerji
        </Label>
        {[1, 2, 3, 4].map((mode) => {
          const locked = !city(save).opened.includes(p.products[mode - 1]!.id);
          return (
            <Button
              key={mode}
              testID={`power-${mode}`}
              label={`${mode}x, ${productionPowerCosts[mode - 1]} enerji${locked ? ", ürün alanı kilitli" : ""}`}
              onPress={() => {
                const r = dispatch({ type: "power", id: p.id, mode });
                if (r?.kind === "tap") close();
              }}
              style={{
                height: 44,
                marginBottom: 4,
                paddingHorizontal: 7,
                borderRadius: 8,
                borderWidth: selected === mode ? 1.5 : 0.5,
                borderColor: selected === mode ? colors.goldLight : "#6b7a87",
                backgroundColor: tones[mode - 1],
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  width: "100%",
                  justifyContent: "space-between",
                }}
              >
                <View>
                  <Label title size={16} color={colors.goldLight}>
                    {mode}x
                  </Label>
                  <Label size={9} color={colors.goldLight}>
                    {productionPowerCosts[mode - 1]} enerji
                  </Label>
                </View>
                {locked ? (
                  <StatusIcon kind="lock" />
                ) : selected === mode ? (
                  <Label size={15} color={colors.goldLight}>
                    ✓
                  </Label>
                ) : null}
              </View>
            </Button>
          );
        })}
        <Button
          testID="powerProductDetails"
          label="Ürün alanları"
          onPress={details}
          style={{ height: 32, borderRadius: 6, backgroundColor: "#243d52" }}
        >
          <Label size={10} color={colors.goldLight}>
            Ürün alanları ›
          </Label>
        </Button>
      </View>
    </>
  );
}
