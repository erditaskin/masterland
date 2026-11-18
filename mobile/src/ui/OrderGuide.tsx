import { Fragment, useState } from "react";
import {
  orders,
  producers,
  product,
  type Order,
  type Save,
} from "../game/engine";
import { AppButton, Label } from "./Controls";
import { DesignContent } from "./DesignContent";
import { DesignText } from "./DesignSpace";
import { DesignItem, ProducerArt } from "./BoardChrome";
import { PaperCard } from "./PagePrimitives";

export function OrderGuide({
  id,
  save,
  onBoard,
  targetOrder,
}: {
  id: string;
  save: Save;
  onBoard: () => void;
  targetOrder?: Order;
}) {
  const order = targetOrder ?? orders(save).find((o) => o.id === id),
    [selected, setSelected] = useState(0);
  if (!order) return <Label>Bu ilan teslim edildi.</Label>;
  const requirement = order.requirements[selected] ?? order.requirements[0]!;
  const target = product(requirement.item_id),
    producer = producers[target.producer]!;
  const steps = producer.products.slice(1, target.tier);
  const extra = Math.max(0, steps.length - 1) * 420;
  return (
    <DesignContent
      end={2220 + extra + (order.requirements.length > 1 ? 170 : 0)}
      testID="orderGuide"
    >
      <PaperCard designRect={[90, 730, 1026, 250]} selected />
      <DesignItem id={target.id} rect={[120, 760, 195, 195]} />
      <DesignText rect={[350, 750, 700, 78]} size={39}>
        Hedef ürün
      </DesignText>
      <DesignText rect={[350, 835, 700, 103]} size={59} bold>
        {target.name}
      </DesignText>
      <ProducerArt index={target.producer} rect={[90, 1020, 440, 270]} />
      <DesignText rect={[570, 1030, 510, 120]} size={48} bold>
        {producer.name}
      </DesignText>
      <DesignText rect={[570, 1165, 510, 130]} size={39}>
        Dokunarak ilk ürünü çıkar.
      </DesignText>
      {steps.map((item, i) => {
        const y = 1360 + i * 420,
          previous = producer.products[item.tier - 2]!;
        return (
          <Fragment key={item.id}>
            <PaperCard designRect={[90, y, 1026, 370]} />
            <DesignItem id={previous.id} rect={[135, y + 70, 230, 230]} />
            <DesignText
              rect={[380, y + 110, 105, 120]}
              size={66}
              bold
              align="center"
            >
              +
            </DesignText>
            <DesignItem id={previous.id} rect={[490, y + 70, 230, 230]} />
            <DesignText
              rect={[728, y + 110, 105, 120]}
              size={66}
              bold
              align="center"
            >
              =
            </DesignText>
            <DesignItem id={item.id} rect={[850, y + 70, 230, 230]} />
          </Fragment>
        );
      })}
      {!steps.length && (
        <DesignItem id={target.id} rect={[400, 1390, 406, 306]} />
      )}
      <DesignText rect={[90, 1810 + extra, 1026, 110]} size={43} align="center">
        {target.tier === 1
          ? "Bu ürünü doğrudan üreticiden çıkar."
          : "Yalnız iki aynı ürün birleşir."}
      </DesignText>
      <AppButton
        designRect={[90, 2040 + extra, 1026, 132]}
        text="Tahtaya dön"
        onPress={onBoard}
      />
      {order.requirements.length > 1 &&
        order.requirements.map((r, i) => (
          <AppButton
            key={r.item_id}
            designRect={[
              90 + (i * 1026) / order.requirements.length,
              2220 + extra,
              990 / order.requirements.length,
              132,
            ]}
            text={product(r.item_id).name}
            tone="secondary"
            onPress={() => setSelected(i)}
          />
        ))}
    </DesignContent>
  );
}
