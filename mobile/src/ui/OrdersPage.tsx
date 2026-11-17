import { View } from "react-native";
import { canDeliver, count, name, orders, type Save } from "../game/engine";
import { Item, Sprite } from "./Art";
import { AppButton, Label } from "./Controls";
import { PaperCard } from "./PagePrimitives";
import { semanticColors } from "./cityTheme";

export function OrdersPage({
  save,
  onDeliver,
  onGuide,
}: {
  save: Save;
  onDeliver: (id: string) => void;
  onGuide: (id: string) => void;
}) {
  return (
    <>
      {orders(save).map((order) => {
        const ready = canDeliver(save, order);
        const title = name(order.id);
        return (
          <PaperCard
            key={order.id}
            style={
              ready
                ? {
                    borderColor: semanticColors.success,
                    borderWidth: 2,
                    backgroundImage: `linear-gradient(135deg, #f4fad8 0%, ${semanticColors.successLight} 100%)`,
                  }
                : undefined
            }
          >
            <Label title size={20}>
              {title === order.id ? "Şehir siparişi" : title}
            </Label>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                gap: 8,
              }}
            >
              {order.requirements.map((requirement) => (
                <View
                  key={requirement.item_id}
                  style={{ alignItems: "center", flex: 1, gap: 5 }}
                >
                  <Item id={requirement.item_id} size={62} />
                  <Label
                    title
                    size={16}
                    color={
                      count(save, requirement.item_id) >= requirement.quantity
                        ? semanticColors.success
                        : semanticColors.danger
                    }
                  >
                    {Math.min(
                      count(save, requirement.item_id),
                      requirement.quantity,
                    )}
                    /{requirement.quantity}
                  </Label>
                </View>
              ))}
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Sprite kind="icons" index={6} size={24} />
              <Label title>{order.gold}</Label>
              <Label title color="#178cc4">
                XP {order.xp}
              </Label>
            </View>
            <AppButton
              testID={`order-detail-${order.id}`}
              text={ready ? "✓ Ver" : "Nasıl elde edilir?"}
              tone={ready ? "primary" : "secondary"}
              onPress={() => (ready ? onDeliver(order.id) : onGuide(order.id))}
            />
          </PaperCard>
        );
      })}
    </>
  );
}
