import { useState } from "react";
import { ScrollView, View } from "react-native";
import {
  city,
  count,
  orders,
  producers,
  product,
  type Save,
} from "../game/engine";
import { Button, Label } from "./Controls";
import { Item } from "./Art";
import { ProducerPortrait } from "./ProducerDetails";
export function OrderGuide({ id, save }: { id: string; save: Save }) {
  const order = orders(save).find((o) => o.id === id);
  const [selected, setSelected] = useState(0);
  if (!order) return <Label>Bu ilan teslim edildi.</Label>;
  const requirement = order.requirements[selected] ?? order.requirements[0]!;
  const target = product(requirement.item_id),
    producer = producers[target.producer]!;
  return (
    <View testID="orderGuide" style={{ gap: 16 }}>
      <Label title size={20}>
        Nasıl elde edilir?
      </Label>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {order.requirements.map((r, i) => (
          <Button
            key={r.item_id}
            label={product(r.item_id).name}
            selected={i === selected}
            onPress={() => setSelected(i)}
            style={{
              width: 90,
              minHeight: 92,
              padding: 6,
              marginRight: 8,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: i === selected ? "#75a33c" : "#e3cb99",
              backgroundColor: "#ffefcb",
            }}
          >
            <Item id={r.item_id} size={52} />
            <Label size={12}>
              {Math.min(count(save, r.item_id), r.quantity)}/{r.quantity}
            </Label>
          </Button>
        ))}
      </ScrollView>
      <View style={{ alignItems: "center", gap: 8 }}>
        <ProducerPortrait index={target.producer} size={84} />
        <Label title>{producer.name}</Label>
        <Label size={12}>Dokunarak ilk ürünü çıkar.</Label>
      </View>
      {producer.products.slice(0, target.tier).map((p, i) => (
        <View
          key={p.id}
          style={{
            backgroundColor: "#ffedc9",
            borderRadius: 12,
            padding: 10,
            borderWidth: 1,
            borderColor: "#dbc18d",
            gap: 5,
          }}
        >
          {i === 0 ? (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Item id={p.id} size={48} />
              <Label style={{ flex: 1 }}>{p.name}</Label>
              <Label size={12}>Üretici</Label>
            </View>
          ) : (
            <>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-around",
                }}
              >
                <Item id={producer.products[i - 1]!.id} size={43} />
                <Label title>+</Label>
                <Item id={producer.products[i - 1]!.id} size={43} />
                <Label title>=</Label>
                <Item id={p.id} size={50} />
              </View>
              <Label size={13} style={{ textAlign: "center" }}>
                {p.name}{" "}
                {city(save).opened.includes(p.id)
                  ? ""
                  : `· Seviye ${p.level}, ${p.price} altın`}
              </Label>
            </>
          )}
        </View>
      ))}
      <Label size={12} style={{ textAlign: "center" }}>
        Yalnızca iki aynı ürün birleşir. İlanda {requirement.quantity} adet{" "}
        {target.name} gerekiyor.
      </Label>
    </View>
  );
}
