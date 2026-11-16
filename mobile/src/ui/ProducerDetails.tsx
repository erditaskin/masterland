import havenBounds from "../../assets/art/haven-items-v1-bounds.json";
import { useState } from "react";
import { Image, View } from "react-native";
import { Crop, Item } from "./Art";
import { ActionButton, AppChoice, Label } from "./Controls";
import { colors, art } from "./theme";
import {
  city,
  level,
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
}: {
  producer: Producer;
  index: number;
  save: Save;
  dispatch: (a: Action) => Result | null;
}) {
  const c = city(save);
  const [selected, setSelected] = useState(
    () =>
      p.products.find((a) => !c.opened.includes(a.id))?.id ??
      p.products.at(-1)!.id,
  );
  const a = p.products.find((a) => a.id === selected)!;
  const owned = c.owned.includes(p.id),
    opened = c.opened.includes(a.id),
    eligible = level(save) >= a.level;
  return (
    <View style={{ gap: 8 }}>
      <Label size={12} color={colors.muted} style={{ textAlign: "center" }}>
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
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
        {p.products.map((item) => (
          <AppChoice
            key={item.id}
            selected={item.id === selected}
            testID={"product-slot-" + item.id}
            label={
              item.name + (c.opened.includes(item.id) ? ", Açık" : ", Kilitli")
            }
            onPress={() => setSelected(item.id)}
            style={{
              width: "23%",
              height: 72,
            }}
          >
            <View style={{ opacity: c.opened.includes(item.id) ? 1 : 0.45 }}>
              <Item id={item.id} size={46} />
            </View>
            <Label
              size={11}
              color={c.opened.includes(item.id) ? colors.green : colors.muted}
            >
              {c.opened.includes(item.id) ? "✓" : "Kilitli"}
            </Label>
          </AppChoice>
        ))}
      </View>
      <Label title size={24} style={{ textAlign: "center", marginTop: 6 }}>
        {a.name}
      </Label>
      <Label size={12} color={colors.muted} style={{ textAlign: "center" }}>
        Basamak {a.tier}
      </Label>
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 8 }}>
        <View
          style={{
            padding: 9,
            backgroundColor: eligible ? "#e1e9b3" : "#ecd5a8",
            borderRadius: 18,
          }}
        >
          <Label size={13}>
            Seviye {a.level}
            {eligible ? " ✓" : ""}
          </Label>
        </View>
        {!opened && (
          <View
            style={{ padding: 9, backgroundColor: "#f5d9a2", borderRadius: 18 }}
          >
            <Label size={13}>{a.price} altın</Label>
          </View>
        )}
      </View>
      {!owned ? (
        <ActionButton
          testID="buyProducer"
          text={`Aç · ${p.price} altın · Seviye ${p.level}`}
          onPress={() => dispatch({ type: "buy", id: p.id })}
        />
      ) : opened ? (
        <Label
          title
          size={17}
          color={colors.green}
          style={{ textAlign: "center", padding: 12 }}
        >
          Ürün alanı açık ✓
        </Label>
      ) : (
        <ActionButton
          testID={"unlock-" + a.id}
          text={`${a.price} altınla aç`}
          onPress={() => {
            const result = dispatch({ type: "unlock", id: a.id });
            if (result && result.kind !== "blocked") {
              const next = p.products[a.tier];
              if (next) setSelected(next.id);
            }
          }}
        />
      )}
      <Label size={12} color={colors.muted} style={{ textAlign: "center" }}>
        Açıldıktan sonra birleştirerek elde et.
      </Label>
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
            <Label size={11} color={colors.muted}>
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
          color={colors.muted}
          style={{ textAlign: "center", marginTop: 8 }}
        >
          Üretim gücü {productionPlan(save, p).selected}x. Değiştirmek için
          tahtadaki üreticiye basılı tut.
        </Label>
      )}
    </View>
  );
}
