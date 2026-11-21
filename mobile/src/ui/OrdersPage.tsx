import { DesignRewardAmounts } from "./RewardAmounts";
import { fulfilledRequirementColor, fulfilledRequirementBorder } from "../game/orderProgress";
import { Fragment } from "react";
import { accountText } from "../i18n/locale";
import {
  orders,
  name,
  type Order,
  type Save,
} from "../game/engine";
import { DesignContent } from "./DesignContent";
import { DesignBox, DesignSurface, DesignText } from "./DesignSpace";
import { DesignItem } from "./BoardChrome";
import { PaperCard } from "./PagePrimitives";
import { AppButton, Button } from "./Controls";
import { ordersByProgress } from "./orderRail";

export function OrdersPage({
  save,
  onDeliver,
  onGuide,
  items,
}: {
  save: Save;
  onDeliver: (id: string) => void;
  onGuide: (id: string, itemID?: string) => void;
  items?: (Order & { title?: string })[];
}) {
  const list = ordersByProgress<Order & { title?: string }>(
    items ?? orders(save),
    save,
  );
  return (
    <DesignContent end={750 + list.length * 600}>
      {list.map(({ order, ready, requirements }, index) => {
        const y = 730 + index * 600;
        const step = 880 / Math.max(1, order.requirements.length);
        const orderName = name(order.id);
        const title =
          order.title ??
          (orderName === `${order.id}_name`
            ? accountText(`İlan ${index + 1}`, `Order ${index + 1}`)
            : orderName);
        return (
          <Fragment key={order.id}>
            <PaperCard
              designRect={[90, y, 1026, 570]}
              selected={ready}
              variant="order"
            />
            <DesignText rect={[125, y + 20, 950, 90]} size={57} bold>
              {title}
            </DesignText>
            {requirements.map(({ item_id, quantity, available }, i) => {
              const x = 220 + i * step;
              return (
                <Fragment key={item_id}>
                  {!ready && available === quantity && (
                    <DesignSurface rect={[x - 8, y + 109, 186, 240]} radius={14}
                      fill={fulfilledRequirementColor} stroke={fulfilledRequirementBorder} line={1}
                    />
                  )}
                  <DesignItem id={item_id} rect={[x, y + 115, 170, 170]} />
                  <DesignText
                    rect={[x, y + 292, 170, 60]}
                    size={40}
                    bold
                    color={available >= quantity ? "#34852b" : "#a93929"}
                    align="center"
                  >
                    {available}/{quantity}
                  </DesignText>
                  <DesignBox rect={[x - 8, y + 109, 186, 240]}>
                    <Button label={name(item_id)} children={null} testID={`order-item-${order.id}-${item_id}`}
                      style={{ flex: 1 }} onPress={() => ready ? onDeliver(order.id) : onGuide(order.id, item_id)} />
                  </DesignBox>
                </Fragment>
              );
            })}
            <DesignRewardAmounts rect={[120, y + 352, 956, 58]} size={39} reward={order} />
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
