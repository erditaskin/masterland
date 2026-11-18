import { Fragment } from "react";
import { count, orders, name, type Order, type Save } from "../game/engine";
import { DesignContent } from "./DesignContent";
import { DesignText } from "./DesignSpace";
import { DesignItem } from "./BoardChrome";
import { PaperCard } from "./PagePrimitives";
import { AppButton } from "./Controls";

export function OrdersPage({
  save,
  onDeliver,
  onGuide,
  items,
}: {
  save: Save;
  onDeliver: (id: string) => void;
  onGuide: (id: string) => void;
  items?: (Order & { title?: string })[];
}) {
  const list: (Order & { title?: string })[] = items ?? orders(save);
  return (
    <DesignContent end={750 + list.length * 600}>
      {list.map((order, index) => {
        const y = 730 + index * 600;
        const ready = order.requirements.every(
          (r) => count(save, r.item_id) >= r.quantity,
        );
        const step = 880 / Math.max(1, order.requirements.length);
        return (
          <Fragment key={order.id}>
            <PaperCard designRect={[90, y, 1026, 570]} selected={ready} />
            <DesignText rect={[125, y + 20, 950, 90]} size={57} bold>
              {order.title ??
                (name(order.id) === order.id
                  ? `İlan ${index + 1}`
                  : name(order.id))}
            </DesignText>
            {order.requirements.map((r, i) => {
              const x = 220 + i * step,
                available = Math.min(count(save, r.item_id), r.quantity);
              return (
                <Fragment key={r.item_id}>
                  <DesignItem id={r.item_id} rect={[x, y + 115, 170, 170]} />
                  <DesignText
                    rect={[x, y + 292, 170, 60]}
                    size={40}
                    bold
                    color={available >= r.quantity ? "#34852b" : "#a93929"}
                    align="center"
                  >
                    {available}/{r.quantity}
                  </DesignText>
                </Fragment>
              );
            })}
            <DesignText
              rect={[120, y + 352, 956, 58]}
              size={39}
              bold
              align="center"
            >{`${order.gold} altın  ·  XP ${order.xp}`}</DesignText>
            <AppButton
              designRect={[120, y + 410, 966, 132]}
              text={ready ? "✓ Ver" : "Nasıl elde edilir?"}
              tone={ready ? "primary" : "secondary"}
              testID={"order-detail-" + order.id}
              onPress={() => (ready ? onDeliver(order.id) : onGuide(order.id))}
            />
          </Fragment>
        );
      })}
    </DesignContent>
  );
}
