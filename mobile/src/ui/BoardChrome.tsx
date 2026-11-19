import { memo, useEffect, useMemo, useRef, useState, type ComponentRef } from "react";
import { PixelRatio, ScrollView, View, type ImageSourcePropType } from "react-native";
import {
  canDeliver,
  city,
  cityProducers,
  count,
  level,
  name,
  productionPlan,
  producerCatalog as producers,
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
import { StatusIcon } from "./StatusIcon";
import { ProducerButton } from "./ProducerButton";
import { approvedDesignRect, approvedLayout } from "./layout";
import { ChromeSprite } from "./GameChrome";
import havenBounds from "../../assets/art/haven-items-v1-bounds.json";
import { useCityTheme } from "./CityThemeProvider";
import {
  belenyakaLayout,
  belenyakaRect,
  producerFaceRect,
  producerTileMetrics,
} from "./belenyakaLayout";
import { standardArtForCity } from "./standardCityArt";
import { cityArt } from "./cityArt";
import type { Page } from "./Pages";
import type { PowerAnchor } from "./PowerMenu";

export function DesignItem({ id, rect }: { id: string; rect: DesignRect }) {
  const { source, crop } = itemArtwork(id);
  return <DesignImage source={source} crop={crop} rect={rect} fit />;
}
const approvedProducerPortraits = [
  require("../../assets/art/approved-iphone-v1/city1-producer-field.png"),
  require("../../assets/art/approved-iphone-v1/city1-producer-mill.png"),
  require("../../assets/art/approved-iphone-v1/city1-producer-oven.png"),
  require("../../assets/art/approved-iphone-v1/city1-producer-barn.png"),
  require("../../assets/art/approved-iphone-v1/city1-producer-orchard.png"),
];
export function ProducerArt({
  index,
  rect,
  shelfSize = false,
}: {
  index: number;
  rect: DesignRect;
  shelfSize?: boolean;
}) {
  const producer = producers[index];
  if (producer) {
    const cityIndex =
      index - producers.findIndex((p) => p.cityID === producer.cityID);
    const source = standardArtForCity(producer.cityID)?.producers[cityIndex];
    if (source)
      return (
        <DesignImage
          source={source}
          rect={rect}
          fit={!shelfSize}
          testID={shelfSize ? "detail-producer-face" : undefined}
          radius={shelfSize ? 20 : 15}
        />
      );
  }
  return index < 5 ? (
    <DesignImage
      source={approvedProducerPortraits[index]!}
      rect={rect}
      fit
      radius={15}
    />
  ) : (
    <DesignImage
      source={require("../../assets/art/haven-items-v1.png")}
      rect={rect}
      crop={havenBounds[36 + index - 5] as unknown as DesignRect}
      fit
    />
  );
}

function ProductionTile({
  p,
  face,
  rect,
  save,
  dispatch,
  open,
  onPowerOpen,
}: {
  p: Producer;
  face?: ImageSourcePropType;
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
    if (readyAt <= 0) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const update = () => {
      const current = Date.now();
      setNow(current);
      const remaining = readyAt - current;
      if (remaining > 0)
        timer = setTimeout(update, remaining % 1000 || 1000);
    };
    update();
    return () => clearTimeout(timer);
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
  const [x, y, w, h] = rect;
  const standard = Boolean(standardArtForCity(theme.id));
  const statusTop = y + h * (standard ? 0.73 : 0.63);
  const statusHeight = h * (standard ? 0.22 : 0.3);
  const statusIconSize = h * (standard ? 0.16 : 0.21);
  const statusIconTop = statusTop + (statusHeight - statusIconSize) / 2;
  return (
    <>
      <DesignSurface
        rect={rect}
        fill={theme.heading}
        stroke={theme.edge}
        radius={23}
      />
      {face ? (
        <DesignImage
          source={face}
          rect={producerFaceRect(rect, standard)}
          testID={`shelf-face-${p.id}`}
          radius={20}
        />
      ) : (
        <ProducerArt
          index={index}
          rect={
            index < 5
              ? [x + w * 0.03, y + h * 0.025, w * 0.94, h * 0.7]
              : [x + w * 0.12, y + h * 0.025, w * 0.76, h * 0.7]
          }
        />
      )}
      <DesignSurface
        rect={
          face
            ? [x + w * 0.12, statusTop, w * 0.76, statusHeight]
            : [x + w * 0.02, statusTop, w * 0.96, statusHeight]
        }
        fill="#765015"
        end="#51340b"
        stroke={face ? undefined : "#e4b43f"}
        radius={statusHeight / 2}
        line={3}
      />
      {owned && index === 0 && (c.powers?.[p.id] ?? 1) > 1 && (
        <>
          <DesignSurface
            rect={[x + w * 0.03, y + h * 0.02, w * 0.4, h * 0.23]}
            fill="#62400e"
            stroke="#e9c679"
            radius={22}
          />
          <DesignText
            rect={[x + w * 0.04, y + h * 0.02, w * 0.38, h * 0.23]}
            size={31}
            bold
            color="#fff0c2"
            align="center"
            accessible={false}
          >
            {String(c.powers?.[p.id] ?? 1)}
          </DesignText>
        </>
      )}
      {!owned && (
        <>
          <DesignSurface
            rect={[
              x + w * 0.19,
              statusTop + statusHeight * 0.18,
              w * 0.08,
              statusHeight * 0.38,
            ]}
            stroke="#fff0c2"
            radius={11}
            line={4}
          />
          <DesignSurface
            rect={[
              x + w * 0.17,
              statusTop + statusHeight * 0.46,
              w * 0.12,
              statusHeight * 0.34,
            ]}
            fill="#fff0c2"
            radius={4}
          />
        </>
      )}
      <DesignText
        rect={[
          x + w * (!owned ? 0.31 : seconds ? (standard ? 0.34 : 0.03) : 0.47),
          statusTop,
          w * (!owned ? 0.51 : seconds ? (standard ? 0.48 : 0.94) : 0.28),
          statusHeight,
        ]}
        size={Math.min(
          standard ? 29 : 32,
          (w * (!owned ? 0.66 : 0.94)) / Math.max(1, label.length * 0.56),
        )}
        bold
        fit
        color="#fff0c2"
        align="center"
        accessible={false}
      >
        {!owned ? label : seconds ? label : String(plan.cost)}
      </DesignText>
      {standard && owned && seconds > 0 && (
        <DesignBox
          rect={[x + w * 0.17, statusTop, w * 0.18, statusHeight]}
          style={{ alignItems: "center", justifyContent: "center" }}
          testID={`producer-clock-${p.id}`}
        >
          <View style={{ transform: [{ scale: 0.76 }] }}>
            <StatusIcon kind="clock" />
          </View>
        </DesignBox>
      )}
      {owned && !seconds && (
        <ChromeSprite
          index={5}
          rect={[x + w * 0.29, statusIconTop, statusIconSize, statusIconSize]}
        />
      )}
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
          <View />
        </ProducerButton>
      </View>
    </>
  );
}

export const BoardChrome = memo(function BoardChrome({
  width,
  height,
  top = 0,
  producerOffset = 0,
  save,
  orders,
  dispatch,
  open,
  onPowerOpen,
  onDeliver,
}: {
  language: string;
  width: number;
  height: number;
  top?: number;
  producerOffset?: number;
  save: Save;
  orders: Order[];
  dispatch: (a: Action) => void;
  open: (page: Page) => void;
  onPowerOpen: (anchor: PowerAnchor) => void;
  onDeliver: (id: string) => void;
}) {
  const orderScroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const readyIDs = useMemo(
    () =>
      new Set(
        orders
          .filter((order) => canDeliver(save, order))
          .map((order) => order.id),
      ),
    [orders, save],
  );
  const previousReady = useRef<ReadonlySet<string>>(new Set());
  useEffect(() => {
    if ([...readyIDs].some((id) => !previousReady.current.has(id)))
      orderScroll.current?.scrollTo({ x: 0, animated: false });
    previousReady.current = readyIDs;
  }, [readyIDs]);
  const scale = width / 1206,
    cityList = cityProducers(save);
  const theme = useCityTheme();
  const r = (box: readonly number[]) => approvedDesignRect(box, width, height);
  const standardArt = standardArtForCity(theme.id);
  const b = (box: readonly number[]) => belenyakaRect(box, width, height);
  const baseShelf = standardArt
    ? b(belenyakaLayout.shelf)
    : r(approvedLayout.producer_shelf);
  const shelf: DesignRect = [
    baseShelf[0],
    baseShelf[1] + producerOffset / scale,
    baseShelf[2],
    baseShelf[3],
  ];
  const baseInner = standardArt ? baseShelf : r(approvedLayout.producer_inner);
  const inner: DesignRect = [
    baseInner[0],
    baseInner[1] + producerOffset / scale,
    baseInner[2],
    baseInner[3],
  ];
  const orderRail = standardArt
    ? b(belenyakaLayout.orders)
    : r(approvedLayout.orders);
  const filter = standardArt
    ? b(belenyakaLayout.filter)
    : r(approvedLayout.order_filter);
  const heading = standardArt
    ? b(belenyakaLayout.heading)
    : r(approvedLayout.city_heading);
  const account = standardArt
    ? b(belenyakaLayout.profile)
    : r(approvedLayout.account);
  const orderGap = standardArt ? 8 : 18;
  const seamOverlap = 2 / (PixelRatio.get() * scale);
  const orderUnit = (orderRail[2] - 2 * orderGap) / 3.75;
  const {
    inset: tileInset,
    gap: tileGap,
    top: tileTop,
    width: tileWidth,
    height: tileHeight,
  } = producerTileMetrics(inner, cityList.length, Boolean(standardArt));
  const producerTiles = (
    <DesignSpace scale={scale}>
      {cityList.map((p, i) => (
        <ProductionTile
          key={p.id}
          p={p}
          face={standardArt ? standardArt.producers[i] : undefined}
          rect={[
            tileInset + i * (tileWidth + tileGap),
            tileTop,
            tileWidth,
            tileHeight,
          ]}
          save={save}
          dispatch={dispatch}
          open={open}
          onPowerOpen={onPowerOpen}
        />
      ))}
    </DesignSpace>
  );
  return (
    <View
      pointerEvents="box-none"
      style={{ position: "absolute", inset: 0, top }}
    >
      <DesignSpace scale={scale}>
        {standardArt && (
          <DesignImage
            source={standardArt.upperPanel}
            rect={b(belenyakaLayout.upperPanel)}
          />
        )}
        {standardArt ? (
          <>
            <DesignImage source={standardArt.heading} rect={heading} />
            <DesignText
              rect={heading}
              size={62}
              bold
              color="#fff0d5"
              align="center"
              fit
            >
              {name(save.cityID)}
            </DesignText>
          </>
        ) : (
          <MaterialPlaque rect={heading} title={name(save.cityID)} />
        )}
        {standardArt ? (
          <>
            <DesignImage source={standardArt.filter} rect={filter} />
            <DesignText
              rect={filter}
              size={39}
              bold
              color="#fff0d5"
              align="center"
              fit
            >
              Tümü ⌄
            </DesignText>
            <DesignBox
              rect={[
                filter[0],
                filter[1] - (Math.max(132, filter[3]) - filter[3]) / 2,
                filter[2],
                Math.max(132, filter[3]),
              ]}
            >
              <Button
                label="Tümü"
                testID="allOrders"
                onPress={() => open({ kind: "orders" })}
                style={{ flex: 1 }}
                feedbackFrame={{
                  left: 0,
                  top: ((Math.max(132, filter[3]) - filter[3]) / 2) * scale,
                  width: filter[2] * scale,
                  height: filter[3] * scale,
                  borderRadius: 10 * scale,
                }}
              >
                <View />
              </Button>
            </DesignBox>
          </>
        ) : (
          <AppButton
            designRect={filter}
            text="Tümü⌄"
            tone="secondary"
            testID="allOrders"
            onPress={() => open({ kind: "orders" })}
          />
        )}
        <>
          {standardArt ? (
            <DesignImage source={standardArt.profile} rect={account} />
          ) : (
            <DesignSurface
              rect={account}
              fill={theme.profileFill}
              stroke="#e4b65d"
              radius={58}
              line={4}
            />
          )}
          <DesignSurface
            rect={[
              account[0] + account[2] * 0.36,
              account[1] + account[3] * 0.16,
              account[2] * 0.28,
              account[3] * 0.3,
            ]}
            fill="#ffe7b0"
            radius={18}
          />
          <DesignSurface
            rect={[
              account[0] + account[2] * 0.2,
              account[1] + account[3] * 0.51,
              account[2] * 0.6,
              account[3] * 0.32,
            ]}
            fill="#ffe7b0"
            radius={28}
          />
        </>
        <DesignBox
          rect={[
            account[0],
            account[1],
            Math.max(132, account[2]),
            Math.max(132, account[3]),
          ]}
        >
          <Button
            label="Hesap"
            testID="profile-menu"
            onPress={() => open({ kind: "profile" })}
            style={{ flex: 1 }}
          >
            <View />
          </Button>
        </DesignBox>
        <DesignBox rect={orderRail}>
          <ScrollView
            ref={orderScroll}
            testID="orderRail"
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: orderGap * scale }}
          >
            {orders.map((order) => {
              const ready = readyIDs.has(order.id);
              const w = standardArt
                ? orderUnit *
                  (1 + 0.25 * Math.max(0, order.requirements.length - 1))
                : (orderRail[2] - 36) / 3 +
                  Math.max(0, order.requirements.length - 1) * 120;
              const cardHeight = standardArt ? orderRail[3] : orderRail[3] - 5;
              const infoX = w - (standardArt ? 148 : 185);
              const productCount = Math.max(1, order.requirements.length);
              const slotWidth = standardArt
                ? Math.min(110, (infoX - 16) / productCount)
                : 120;
              const itemWidth = standardArt ? Math.min(100, slotWidth) : 125;
              const itemLeft = standardArt
                ? (infoX - slotWidth * productCount + slotWidth - itemWidth) / 2
                : 38;
              const badge = [
                infoX,
                cardHeight * (standardArt ? 0.1 : 0.08),
                standardArt ? 128 : 170,
                cardHeight * 0.28,
              ] as const;
              const cardArt = ready
                ? standardArt?.order
                : standardArt?.orderMissing;
              return (
                <Button
                  key={order.id}
                  testID={"order-" + order.id}
                  label={`${order.requirements.map((r) => r.quantity + " " + name(r.item_id)).join(", ")}, ${order.gold} altın, ${order.xp} XP${ready ? ", Hazır, Ver" : ""}`}
                  onPress={() => onDeliver(order.id)}
                  style={{ width: w * scale, height: orderRail[3] * scale }}
                >
                  <View
                    pointerEvents="none"
                    style={{ position: "absolute", inset: 0 }}
                  >
                    <DesignSpace scale={scale} x={0} y={0}>
                      {cardArt ? (
                        <>
                          <DesignImage
                            source={cardArt[1]}
                            rect={[
                              49 - seamOverlap,
                              0,
                              w - 98 + 2 * seamOverlap,
                              cardHeight,
                            ]}
                          />
                          <DesignImage
                            source={cardArt[0]}
                            rect={[0, 0, 49, cardHeight]}
                          />
                          <DesignImage
                            source={cardArt[2]}
                            rect={[w - 49, 0, 49, cardHeight]}
                          />
                        </>
                      ) : (
                        <PaperCard
                          designRect={[0, 0, w, cardHeight]}
                          selected={ready}
                          variant="order"
                        />
                      )}
                      {order.requirements.map((r, i) => (
                        <View
                          key={r.item_id}
                          pointerEvents="none"
                          style={{ position: "absolute", inset: 0 }}
                        >
                          <DesignItem
                            id={r.item_id}
                            rect={[
                              itemLeft + i * slotWidth,
                              cardHeight * (standardArt ? 0.12 : 0.08),
                              itemWidth,
                              cardHeight * (standardArt ? 0.52 : 0.61),
                            ]}
                          />
                          <DesignText
                            rect={[
                              itemLeft + i * slotWidth,
                              cardHeight * (standardArt ? 0.69 : 0.72),
                              itemWidth,
                              cardHeight * (standardArt ? 0.22 : 0.25),
                            ]}
                            size={standardArt ? 31 : 38}
                            fit={Boolean(standardArt)}
                            align="center"
                            bold
                          >
                            {Math.min(count(save, r.item_id), r.quantity)}/
                            {r.quantity}
                          </DesignText>
                        </View>
                      ))}
                      {ready &&
                        (standardArt ? (
                          <DesignImage source={standardArt.give} rect={badge} />
                        ) : (
                          <DesignSurface
                            rect={[
                              infoX,
                              cardHeight * 0.08,
                              170,
                              cardHeight * 0.28,
                            ]}
                            fill={theme.orderBadgeFill}
                            radius={24}
                          />
                        ))}
                      <DesignText
                        rect={badge}
                        size={standardArt ? 29 : 35}
                        bold
                        color={ready ? "#fff8e3" : undefined}
                        align="center"
                      >
                        {ready ? "Ver ✓" : "Eksik"}
                      </DesignText>
                      <ChromeSprite
                        index={6}
                        rect={[
                          infoX + (standardArt ? 22 : 40),
                          cardHeight * 0.39,
                          standardArt ? 35 : 44,
                          cardHeight * (standardArt ? 0.23 : 0.27),
                        ]}
                      />
                      <DesignText
                        rect={[
                          infoX + (standardArt ? 61 : 100),
                          cardHeight * 0.38,
                          standardArt ? 72 : 70,
                          cardHeight * 0.28,
                        ]}
                        size={standardArt ? 36 : 44}
                        fit={Boolean(standardArt)}
                        bold
                      >
                        {order.gold}
                      </DesignText>
                      <DesignText
                        rect={[
                          infoX + (standardArt ? 22 : 40),
                          cardHeight * (standardArt ? 0.66 : 0.7),
                          standardArt ? 56 : 95,
                          cardHeight * 0.27,
                        ]}
                        size={standardArt ? 33 : 40}
                        bold
                        color="#178cc4"
                      >
                        XP
                      </DesignText>
                      <DesignText
                        rect={[
                          infoX + (standardArt ? 82 : 128),
                          cardHeight * (standardArt ? 0.66 : 0.7),
                          standardArt ? 53 : 60,
                          cardHeight * 0.27,
                        ]}
                        size={standardArt ? 33 : 40}
                        fit={Boolean(standardArt)}
                        bold
                      >
                        {order.xp}
                      </DesignText>
                    </DesignSpace>
                  </View>
                </Button>
              );
            })}
          </ScrollView>
        </DesignBox>
        {standardArt ? (
          <DesignImage source={standardArt.shelf} rect={shelf} />
        ) : cityArt[theme.id]!.shelfFrame ? (
          <DesignImage source={cityArt[theme.id]!.shelfFrame!} rect={shelf} />
        ) : (
          <MaterialTray rect={shelf} />
        )}
        <DesignBox rect={inner}>
          {cityList.length <= 6 ? (
            producerTiles
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              bounces={false}
              contentContainerStyle={{
                width:
                  (2 * tileInset +
                    cityList.length * (tileWidth + tileGap) -
                    tileGap) *
                  scale,
                height: inner[3] * scale,
              }}
            >
              {producerTiles}
            </ScrollView>
          )}
        </DesignBox>
      </DesignSpace>
    </View>
  );
});
