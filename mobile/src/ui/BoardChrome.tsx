import { useEffect, useRef, useState, type ComponentRef } from "react";
import { ScrollView, View } from "react-native";
import {
  city,
  cityProducers,
  count,
  level,
  name,
  productionPlan,
  producers,
  type Action,
  type Order,
  type Producer,
  type Save,
} from "../game/engine";
import { AppButton, Button } from "./Controls";
import {
  DesignBox,
  DesignImage,
  DesignSpace,
  DesignSurface,
  DesignText,
  useDesignRect,
  useDesignSpace,
  type DesignRect,
} from "./DesignSpace";
import { MaterialPlaque, MaterialTray } from "./DesignMaterial";
import { PaperCard } from "./PagePrimitives";
import { itemArtwork } from "./Art";
import { ProducerButton } from "./ProducerButton";
import { ProducerPortrait } from "./ProducerPortrait";
import { useCityTheme } from "./CityThemeProvider";
import { art } from "./theme";
import type { Page } from "./Pages";
import type { PowerAnchor } from "./PowerMenu";

export function DesignItem({ id, rect }: { id: string; rect: DesignRect }) {
  const { source, crop } = itemArtwork(id);
  return <DesignImage source={source} crop={crop} rect={rect} fit />;
}
export function ProducerArt({
  index,
  rect,
}: {
  index: number;
  rect: DesignRect;
}) {
  const { scale } = useDesignSpace();
  return index < 5 ? (
    <DesignImage
      source={art.concept}
      rect={rect}
      crop={[128 + index * 130.5, 400, 98, 68]}
    />
  ) : (
    <DesignBox rect={rect}>
      <ProducerPortrait
        index={index}
        size={Math.min(rect[2], rect[3]) * scale}
      />
    </DesignBox>
  );
}

function ProductionTile({
  p,
  rect,
  save,
  dispatch,
  open,
  onPowerOpen,
}: {
  p: Producer;
  rect: DesignRect;
  save: Save;
  dispatch: (a: Action) => void;
  open: (page: Page) => void;
  onPowerOpen: (anchor: PowerAnchor) => void;
}) {
  const theme = useCityTheme(),
    space = useDesignSpace();
  const placement = useDesignRect(rect);
  const anchor = useRef<ComponentRef<typeof View>>(null);
  const c = city(save),
    owned = c.owned.includes(p.id),
    plan = productionPlan(save, p);
  const readyAt = c.batches[p.id]?.readyAt ?? 0,
    [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (readyAt <= Date.now()) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [readyAt]);
  const seconds = Math.max(0, Math.ceil((readyAt - now) / 1000)),
    index = producers.indexOf(p);
  const details = () => open({ kind: "producer", index });
  const label = !owned
    ? level(save) < p.level
      ? `Lv.${p.level}`
      : `${p.price} altın`
    : seconds
      ? `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`
      : `${plan.cost} enerji`;
  return (
    <View
      ref={anchor}
      collapsable={false}
      style={[placement, { height: Math.max(44, rect[3] * space.scale) }]}
    >
      <ProducerButton
        testID={p.id}
        label={`${p.name}, ${label}, güç için basılı tut`}
        style={{ flex: 1 }}
        onPress={() =>
          !owned || seconds
            ? details()
            : save.stamina < plan.cost
              ? open({ kind: "energy" })
              : dispatch({ type: "produce", id: p.id })
        }
        onLongPress={() =>
          !owned
            ? details()
            : anchor.current?.measureInWindow((x, y, width, height) =>
                onPowerOpen({ index, x, y, width, height }),
              )
        }
      >
        <DesignSpace scale={space.scale}>
          <DesignSurface
            rect={[0, 0, 192, 125]}
            fill={theme.heading}
            stroke={theme.edge}
            radius={23}
          />
          <ProducerArt index={index} rect={[6, 5, 180, 85]} />
          <DesignText
            rect={[5, 84, 182, 36]}
            size={28}
            bold
            color="#fff0c2"
            align="center"
          >
            {label}
          </DesignText>
        </DesignSpace>
      </ProducerButton>
    </View>
  );
}

export function BoardChrome({
  width,
  top = 0,
  save,
  orders,
  dispatch,
  open,
  onPowerOpen,
  onDeliver,
}: {
  width: number;
  top?: number;
  save: Save;
  orders: Order[];
  dispatch: (a: Action) => void;
  open: (page: Page) => void;
  onPowerOpen: (anchor: PowerAnchor) => void;
  onDeliver: (id: string) => void;
}) {
  const scale = width / 1206,
    cityList = cityProducers(save);
  return (
    <View
      pointerEvents="box-none"
      style={{ position: "absolute", inset: 0, top }}
    >
      <DesignSpace scale={scale}>
        <MaterialPlaque rect={[270, 365, 666, 102]} title={name(save.cityID)} />
        <AppButton
          designRect={[48, 367, 198, 100]}
          text="Tümü"
          tone="secondary"
          testID="allOrders"
          onPress={() => open({ kind: "orders" })}
        />
        <AppButton
          designRect={[1008, 367, 132, 100]}
          text="●"
          tone="secondary"
          testID="profile-menu"
          onPress={() => open({ kind: "profile" })}
        />
        <DesignBox rect={[48, 481, 1110, 145]}>
          <ScrollView
            testID="orderRail"
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 18 * scale }}
          >
            {orders.map((order) => {
              const ready = order.requirements.every(
                (r) => count(save, r.item_id) >= r.quantity,
              );
              const w = 358 + Math.max(0, order.requirements.length - 1) * 110;
              return (
                <Button
                  key={order.id}
                  testID={"order-" + order.id}
                  label={`${order.requirements.map((r) => r.quantity + " " + r.item_id).join(", ")}, ${order.gold} altın, ${order.xp} XP${ready ? ", Hazır, Ver" : ""}`}
                  onPress={() => onDeliver(order.id)}
                  style={{ width: w * scale, height: 145 * scale }}
                >
                  <View
                    pointerEvents="none"
                    style={{ position: "absolute", inset: 0 }}
                  >
                    <DesignSpace scale={scale} x={0} y={-5}>
                      <PaperCard designRect={[0, 0, w, 132]} selected={ready} />
                      {order.requirements.map((r, i) => (
                        <View
                          key={r.item_id}
                          pointerEvents="none"
                          style={{ position: "absolute", inset: 0 }}
                        >
                          <DesignItem
                            id={r.item_id}
                            rect={[14 + i * 110, 10, 101, 101]}
                          />
                          <DesignText
                            rect={[24 + i * 110, 91, 100, 32]}
                            size={26}
                            bold
                          >
                            {Math.min(count(save, r.item_id), r.quantity)}/
                            {r.quantity}
                          </DesignText>
                        </View>
                      ))}
                      <DesignText
                        rect={[w - 230, -1, 212, 47]}
                        size={35}
                        bold
                        color={ready ? "#34852b" : undefined}
                        align="center"
                      >
                        {ready ? "Ver ✓" : "Eksik"}
                      </DesignText>
                      <DesignText rect={[w - 226, 46, 200, 37]} size={30} bold>
                        {order.gold} altın
                      </DesignText>
                      <DesignText
                        rect={[w - 226, 88, 200, 36]}
                        size={29}
                        bold
                        color="#178cc4"
                      >
                        XP {order.xp}
                      </DesignText>
                    </DesignSpace>
                  </View>
                </Button>
              );
            })}
          </ScrollView>
        </DesignBox>
        <MaterialTray rect={[48, 632, 1110, 150]} />
        <DesignBox rect={[84, 644, 1038, 125]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={{
              width: Math.max(1038, cityList.length * 210 - 18) * scale,
              height: 125 * scale,
            }}
          >
            <DesignSpace scale={scale}>
              {cityList.map((p, i) => (
                <ProductionTile
                  key={p.id}
                  p={p}
                  rect={[i * 210, 0, 192, 125]}
                  save={save}
                  dispatch={dispatch}
                  open={open}
                  onPowerOpen={onPowerOpen}
                />
              ))}
            </DesignSpace>
          </ScrollView>
        </DesignBox>
      </DesignSpace>
    </View>
  );
}
