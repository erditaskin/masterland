import { useCityTheme } from "./CityThemeProvider";
import { squareTileSize } from "./PagePrimitives";
import havenBounds from "../../assets/art/haven-items-v1-bounds.json";
import { EnergyAdPanel } from "./EnergyAdPanel";
import { useEffect, useState } from "react";
import { Image, View } from "react-native";
import { Crop, Item } from "./Art";
import { ActionButton, AppChoice, Label } from "./Controls";
import { colors, art } from "./theme";
import {
  city,
  name,
  productionPlan,
  type Save,
  type Producer,
  type Action,
  type Result,
} from "../game/engine";
export function ProducerPortrait({
  index,
  size,
}: {
  index: number;
  size: number;
}) {
  if (index >= 5) {
    const b = havenBounds[36 + index - 5]!;
    return (
      <View style={{ width: size, height: size, overflow: "hidden" }}>
        <Crop
          source={require("../../assets/art/haven-items-v1.png")}
          x={b[0]!}
          y={b[1]!}
          w={b[2]!}
          h={b[3]!}
          width={size}
          height={size}
        />
      </View>
    );
  }
  return (
    <View
      style={{
        width: size,
        height: size * 0.72,
        borderRadius: size * 0.2,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.gold,
      }}
    >
      <Crop
        source={art.concept}
        x={128 + index * 130.5}
        y={400}
        w={98}
        h={68}
        width={size}
        height={size * 0.72}
      />
    </View>
  );
}
export function ProducerDetails({
  producer: p,
  index,
  save,
  dispatch,
  width,
  variant = "producer",
  onProducer,
}: {
  width: number;
  variant?: "producer" | "collection";
  onProducer: () => void;
  producer: Producer;
  index: number;
  save: Save;
  dispatch: (a: Action) => Result | null;
}) {
  const theme = useCityTheme();
  const side = squareTileSize(width, 4, 6);
  const c = city(save);
  const [selected, setSelected] = useState(
    () =>
      (variant === "collection"
        ? p.products[0]?.id
        : p.products.find((a) => !c.opened.includes(a.id))?.id) ??
      p.products.at(-1)!.id,
  );
  const a = p.products.find((a) => a.id === selected)!;
  const owned = c.owned.includes(p.id),
    opened = save.discoveries.includes(a.id);
  const [now, setNow] = useState(Date.now);
  const readyAt = c.batches[p.id]?.readyAt ?? 0;
  useEffect(() => {
    if (readyAt <= Date.now()) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [readyAt]);
  const seconds = Math.max(0, Math.ceil((readyAt - now) / 1000));
  return (
    <View style={{ gap: 8 }}>
      {variant === "producer" && owned && seconds > 0 && (
        <View
          testID="producerCooldown"
          style={{
            padding: 14,
            backgroundColor: theme.paperLight,
            borderRadius: 12,
            gap: 8,
          }}
        >
          <Label title size={22}>
            Üretici hazırlanıyor
          </Label>
          <Label size={20}>
            {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}{" "}
            sonra hazır
          </Label>
          <ActionButton
            testID="refillProducerGems"
            text="Şimdi hazırla · 3 elmas"
            onPress={() => dispatch({ type: "producer-refill", id: p.id })}
          />
          <EnergyAdPanel save={save} producerID={p.id} />
        </View>
      )}
      <Label size={12} tone="muted" style={{ textAlign: "center" }}>
        {name(save.cityID)} · Ürün alanları
      </Label>
      <View style={{ alignItems: "center", paddingVertical: 4 }}>
        {index === 0 ? (
          <Image
            source={require("../../assets/art/skara-field-hero-v2.png")}
            resizeMode="contain"
            style={{ width: 280, height: 130 }}
          />
        ) : (
          <ProducerPortrait index={index} size={125} />
        )}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {p.products.map((item) => (
          <AppChoice
            key={item.id}
            selected={item.id === selected}
            testID={"product-slot-" + item.id}
            label={
              item.name +
              (save.discoveries.includes(item.id) ? ", Açık" : ", Kilitli")
            }
            onPress={() => setSelected(item.id)}
            style={{
              width: side,
              height: side,
            }}
          >
            {save.discoveries.includes(item.id) ? (
              <Item id={item.id} size={side * 0.7} />
            ) : (
              <Label title size={side * 0.48} color={theme.mutedInk}>
                ?
              </Label>
            )}
            <Label
              size={11}
              color={
                save.discoveries.includes(item.id) ? colors.green : colors.muted
              }
            >
              {save.discoveries.includes(item.id) ? "✓" : "Kilitli"}
            </Label>
          </AppChoice>
        ))}
      </View>
      <Label title size={24} style={{ textAlign: "center", marginTop: 6 }}>
        {a.name}
      </Label>
      <Label size={12} tone="muted" style={{ textAlign: "center" }}>
        Basamak {a.tier}
      </Label>
      {variant === "collection" ? (
        <ActionButton
          testID="viewProducerFromCollection"
          text="Üreticiyi gör"
          tone="secondary"
          onPress={onProducer}
        />
      ) : !owned ? (
        <ActionButton
          testID="buyProducer"
          text={`Aç · ${p.price} altın · Seviye ${p.level}`}
          onPress={() => dispatch({ type: "buy", id: p.id })}
        />
      ) : (
        <Label
          title
          color={opened ? colors.green : colors.muted}
          style={{ textAlign: "center", padding: 12 }}
        >
          {opened
            ? "Keşfedildi ✓"
            : "İki aynı ürünü birleştirerek keşfet. İlk keşif XP ve altın verir."}
        </Label>
      )}
      {p.products[a.tier] && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 12,
            borderRadius: 14,
            backgroundColor: "#ecd5a880",
            gap: 8,
          }}
        >
          <Item id={p.products[a.tier]!.id} size={56} />
          <View style={{ flex: 1 }}>
            <Label size={11} tone="muted">
              Sonraki ürün
            </Label>
            <Label title size={16}>
              {p.products[a.tier]!.name}
            </Label>
          </View>
        </View>
      )}
      {owned && (
        <Label
          size={11}
          tone="muted"
          style={{ textAlign: "center", marginTop: 8 }}
        >
          Üretim gücü {2 ** (productionPlan(save, p).selected - 1)}x.
          Değiştirmek için tahtadaki üreticiye basılı tut.
        </Label>
      )}
    </View>
  );
}
