import {
  memo,
  type ComponentRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  AccessibilityInfo,
  AppState,
  BackHandler,
  ImageBackground,
  PixelRatio,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useGameAudio } from "./ui/useGameAudio";
import { Board } from "./ui/Board";
import { prioritizeOrderRail } from "./ui/orderRail";
import { fitBackdrop } from "./ui/layout";
import { StatusIcon } from "./ui/StatusIcon";
import { SkinPanel, skin } from "./ui/Skin";
import { PowerMenu, type PowerAnchor } from "./ui/PowerMenu";
import { ProducerButton } from "./ui/ProducerButton";
import { Button, Label, ActionButton } from "./ui/Controls";
import { Crop, Item, Reference, Sprite } from "./ui/Art";
import { Pages, type Page } from "./ui/Pages";
import { art, colors, fonts } from "./ui/theme";
import { gameStore } from "./state/store";
import {
  achievements,
  achievementState,
  energyCap,
  energyIntervalMs,
  productionPlan,
  city,
  count,
  level,
  levelRange,
  name,
  orders,
  producers,
  product,
  type Action,
  type Producer,
  type Result,
  type Save,
} from "./game/engine";
void SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ fade: true, duration: 180 });
const navigation = [
  ["Tahta", "board"],
  ["Koleksiyon", "collection"],
  ["Şehirler", "cities"],
  ["Depo", "storage"],
  ["Market", "market"],
] as const;
const ProducerCard = memo(
  function ProducerCard({
    p,
    index,
    size,
    save,
    dispatch,
    open,
    onPowerOpen,
  }: {
    onPowerOpen: (anchor: PowerAnchor) => void;
    p: Producer;
    index: number;
    size: number;
    save: Save;
    dispatch: (a: Action) => void;
    open: (p: Page) => void;
  }) {
    const anchor = useRef<ComponentRef<typeof View>>(null);
    const c = city(save),
      owned = c.owned.includes(p.id),
      readyAt = c.batches[p.id]?.readyAt ?? 0,
      [now, setNow] = useState(Date.now);
    useEffect(() => {
      if (readyAt <= Date.now()) return;
      const timer = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(timer);
    }, [readyAt]);
    const seconds = Math.max(0, Math.ceil((readyAt - now) / 1000));
    const plan = productionPlan(save, p);
    return (
      <View
        ref={anchor}
        collapsable={false}
        style={{ width: size, height: size }}
      >
        <ProducerButton
          testID={p.id}
          label={`${p.name}, ${plan.selected}x seçili, ${plan.effective}x etkin, ${plan.cost} enerji, güç için basılı tut`}
          onPress={() =>
            owned
              ? dispatch({ type: "produce", id: p.id })
              : open({ kind: "producer", index })
          }
          onLongPress={() => {
            if (!owned) {
              open({ kind: "producer", index });
              return;
            }
            anchor.current?.measureInWindow((x, y, width, height) =>
              onPowerOpen({ index, x, y, width, height }),
            );
          }}
          style={{
            width: size,
            height: size,
            borderRadius: 10,
            overflow: "hidden",
            borderWidth: 1.2,
            borderColor: owned ? colors.gold : colors.muted,
          }}
        >
          <Reference
            x={136 + index * 137}
            y={397}
            w={117}
            h={116}
            width={size}
            height={size}
          />
          {owned && (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 3,
                left: 3,
                borderRadius: 6,
                paddingHorizontal: 4,
                backgroundColor: plan.effective > 1 ? "#a35d13" : "#153149",
                borderWidth: 0.6,
                borderColor: colors.gold,
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.number,
                  fontSize: 9,
                  color: colors.goldLight,
                }}
              >
                {plan.selected}x
              </Text>
            </View>
          )}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              bottom: 2,
              left: 3,
              right: 3,
              height: 15,
              flexDirection: "row",
              gap: 2,
              borderRadius: 9,
              backgroundColor: colors.navy,
              borderWidth: 0.7,
              borderColor: colors.gold,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <StatusIcon
              kind={
                !owned
                  ? level(save) >= p.level
                    ? "gold"
                    : "lock"
                  : seconds > 0
                    ? "clock"
                    : "energy"
              }
            />
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
              style={{
                fontFamily: fonts.number,
                color: colors.goldLight,
                fontSize: 10,
                flexShrink: 1,
              }}
            >
              {!owned
                ? level(save) >= p.level
                  ? `${p.price}`
                  : `Lv.${p.level}`
                : seconds > 0
                  ? `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`
                  : String(plan.cost)}
            </Text>
          </View>
        </ProducerButton>
      </View>
    );
  },
  (a, b) =>
    a.p === b.p &&
    a.index === b.index &&
    a.size === b.size &&
    a.dispatch === b.dispatch &&
    a.open === b.open &&
    a.onPowerOpen === b.onPowerOpen &&
    level(a.save) === level(b.save) &&
    a.save.stamina > 100 === b.save.stamina > 100 &&
    (city(a.save).powers?.[a.p.id] ?? 1) ===
      (city(b.save).powers?.[b.p.id] ?? 1) &&
    city(a.save).owned.includes(a.p.id) ===
      city(b.save).owned.includes(b.p.id) &&
    (city(a.save).batches[a.p.id]?.readyAt ?? 0) ===
      (city(b.save).batches[b.p.id]?.readyAt ?? 0),
);
const Navigation = memo(function Navigation({
  width,
  open,
  onBoard,
  readyCount,
}: {
  readyCount: number;
  width: number;
  open: (p: Page) => void;
  onBoard: () => void;
}) {
  return (
    <View
      style={{
        width: width - 20,
        height: 55,
        flexDirection: "row",
        paddingHorizontal: 4,
        paddingVertical: 3,
        borderRadius: 22,
        backgroundColor: colors.navy,
        backgroundImage:
          "linear-gradient(180deg, #314264 0%, #1b2945 45%, #0c172e 100%)",
        borderColor: colors.gold,
        borderWidth: 1,
      }}
    >
      {navigation.map(([label, target], i) => (
        <Button
          key={target}
          testID={"tab-" + target}
          label={
            target === "cities" && readyCount
              ? `${label}, ${readyCount} ödül hazır`
              : label
          }
          onPress={() =>
            target === "board" ? onBoard() : open({ kind: target })
          }
          style={{
            flex: 1,
            borderRadius: 12,
            backgroundColor: i === 0 ? "#d88619" : "transparent",
            backgroundImage:
              i === 0
                ? "linear-gradient(180deg, #ffc347 0%, #b96512 60%, #df8f1d 100%)"
                : undefined,
            shadowColor: i === 0 ? "#ffbd39" : "transparent",
            shadowOpacity: i === 0 ? 0.55 : 0,
            shadowRadius: 5,
            shadowOffset: { width: 0, height: 0 },
            borderWidth: 1,
            borderColor: i === 0 ? colors.goldLight : "transparent",
          }}
        >
          {target === "cities" && readyCount > 0 && (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 0,
                right: 4,
                minWidth: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: "#b96716",
                borderWidth: 1,
                borderColor: colors.goldLight,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: colors.goldLight,
                  fontSize: 9,
                  fontFamily: fonts.number,
                }}
              >
                {readyCount}
              </Text>
            </View>
          )}
          <Sprite kind="icons" index={i} size={35} />
          <Label
            title
            size={12}
            color={colors.goldLight}
            style={{ textAlign: "center", marginTop: -1 }}
          >
            {label}
          </Label>
        </Button>
      ))}
    </View>
  );
});
function Game() {
  const snapshot = useSyncExternalStore(gameStore.subscribe, gameStore.get),
    { save, ready, error, result, revision, review } = snapshot;
  const { width, height } = useWindowDimensions(),
    insets = useSafeAreaInsets();
  const [page, setPage] = useState<Page | null>(null),
    [selected, setSelected] = useState<number | null>(null),
    [powerMenu, setPowerMenu] = useState<PowerAnchor | null>(null),
    [reduced, setReduced] = useState(false),
    [hiddenToastRevision, setHiddenToastRevision] = useState(-1);
  const lastOrderDeliveryAt = useRef(0);
  const playAudio = useGameAudio(save.sound);
  const uiSound = useCallback(() => playAudio("tap"), [playAudio]);
  const open = useCallback(
      (p: Page) => {
        uiSound();
        setPowerMenu(null);
        setPage(p);
      },
      [uiSound],
    ),
    close = useCallback(() => {
      uiSound();
      setPage(null);
    }, [uiSound]),
    boardTab = useCallback(() => {
      uiSound();
      setSelected(null);
    }, [uiSound]);
  const dispatch = useCallback((action: Action) => {
    return gameStore.dispatch(action);
  }, []);
  const showPowerMenu = useCallback(
    (anchor: PowerAnchor) => {
      uiSound();
      setPowerMenu(anchor);
    },
    [uiSound],
  );
  useEffect(() => {
    void Linking.getInitialURL().then((url) => {
      const mode = url?.includes("review")
        ? "review"
        : url?.includes("qa-reset")
          ? "qa"
          : "normal";
      setSelected(mode === "review" ? 0 : null);
      return gameStore.load(mode);
    });
    const sub = Linking.addEventListener("url", ({ url }) => {
      if (url.includes("review")) {
        setPage(null);
        setSelected(0);
        void gameStore.load("review");
      } else if (url.includes("qa-reset")) {
        setPage(null);
        setSelected(null);
        void gameStore.load("qa");
      }
    });
    return () => sub.remove();
  }, []);
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduced,
    );
    return () => sub.remove();
  }, []);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") gameStore.dispatch({ type: "tick" });
    });
    return () => sub.remove();
  }, []);
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (page) {
        close();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [page, close]);
  useEffect(() => {
    if (!ready) return;
    const c = city(save),
      next = [
        save.stamina < energyCap(save)
          ? save.energyAt + energyIntervalMs
          : Infinity,
        ...Object.values(c.batches).map((b) =>
          b.readyAt > Date.now() ? b.readyAt : Infinity,
        ),
      ].reduce((a, b) => Math.min(a, b), Infinity);
    if (!Number.isFinite(next)) return;
    const timer = setTimeout(
      () => gameStore.dispatch({ type: "tick" }),
      Math.max(25, next - Date.now() + 10),
    );
    return () => clearTimeout(timer);
  }, [ready, save]);
  useEffect(() => {
    if (!result?.message) return;
    const timer = setTimeout(
      () => setHiddenToastRevision(revision),
      result.kind === "blocked" ? 2400 : result.kind === "reward" ? 1400 : 850,
    );
    return () => clearTimeout(timer);
  }, [result, revision]);
  useEffect(() => {
    if (result) playAudio(result.kind);
  }, [result, revision, playAudio]);
  useEffect(() => {
    if (error) SplashScreen.hide();
  }, [error]);
  const toast = revision !== hiddenToastRevision ? (result?.message ?? "") : "";
  const select = useCallback(
    (i: number) => {
      const s = gameStore.get().save;
      if (i >= 0 && city(s).board[i]) uiSound();
      setSelected(i >= 0 && city(s).board[i] ? i : null);
    },
    [uiSound],
  );
  const info = useCallback(
    (i: number) => {
      setSelected(i);
      open({ kind: "info", index: i });
    },
    [open],
  );
  const move = useCallback(
    (from: number, to: number, expected: string): Result | null => {
      const current = gameStore.get().save;
      if (city(current).board[from]?.id !== expected) return null;
      const r = gameStore.dispatch({ type: "move", from, to });
      if (r?.kind === "merge" || r?.kind === "move") setSelected(to);
      const a = city(current).board[from],
        b = city(current).board[to];
      if (r?.kind === "blocked" && a && b && a.item === b.item && from !== to) {
        const p = product(a.item),
          producer = producers[p.producer]!;
        const next = producer.products[p.tier];
        if (next && !city(current).opened.includes(next.id)) {
          open({ kind: "producer", index: p.producer });
        } else if (!next) {
          open({ kind: "info", index: from });
        }
      }
      return r;
    },
    [open],
  );
  const tapCell = useCallback(
    (i: number) => {
      const board = city(gameStore.get().save).board;
      const source = selected === null ? null : board[selected];
      if (source && selected !== i && board[i]?.item === source.item) {
        move(selected!, i, source.id);
      } else {
        select(i);
      }
    },
    [selected, move, select],
  );
  const top = Math.max(insets.top - 8, 20),
    scale = width / 390,
    sx = width / 800,
    pixelScale = PixelRatio.get(),
    navTop = height - insets.bottom - 59,
    frameInset = PixelRatio.roundToNearestPixel(16 * sx),
    baseBoardTop = top + 492 * sx;
  const rawCellWidth = Math.max(
      24,
      Math.min(
        (777 * sx - 2 * frameInset) / 6,
        ((navTop - 10 - baseBoardTop - 2 * frameInset) / 9) * skin.cellAspect,
      ),
    ),
    cellWidth = Math.floor(rawCellWidth * pixelScale) / pixelScale,
    cellHeight =
      Math.round((cellWidth / skin.cellAspect) * pixelScale) / pixelScale,
    bw = cellWidth * 6 + 2 * frameInset,
    boardTop = navTop - 10 - (cellHeight * 9 + 2 * frameInset),
    sceneExtra = Math.max(0, boardTop - baseBoardTop),
    noticeWidth = 748 * sx,
    noticeHeight = 174 * sx,
    cardWidth = 211 * sx,
    cardHeight = 106 * sx,
    producerSize = 108 * sx;
  const activeOrders = useMemo(
    () => prioritizeOrderRail(orders(save), save),
    [save],
  );
  const backdrop = useMemo(
    () => fitBackdrop(width, height, top),
    [width, height, top],
  );
  const producerRail = useRef<ComponentRef<typeof ScrollView>>(null),
    railOffset = useRef(0),
    railMax = useRef(0);
  if (!ready)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.navy,
          justifyContent: "center",
          padding: 28,
        }}
      >
        <Label title size={28} color={colors.goldLight}>
          {name("app1")}
        </Label>
        <Label color={colors.paper}>{error ?? "Yolculuk hazırlanıyor…"}</Label>
        {error && <ActionButton text="Tekrar dene" onPress={gameStore.retry} />}
      </View>
    );
  const [start, next] = levelRange(save),
    progress = Math.max(0, Math.min(1, (save.xp - start) / (next - start))),
    c = city(save);
  return (
    <ImageBackground
      source={art.city}
      imageStyle={backdrop}
      resizeMode="cover"
      onLoadEnd={() => requestAnimationFrame(() => SplashScreen.hide())}
      style={{ flex: 1 }}
    >
      <View
        pointerEvents={page ? "none" : "auto"}
        accessibilityElementsHidden={!!page}
        importantForAccessibility={page ? "no-hide-descendants" : "auto"}
        style={StyleSheet.absoluteFill}
      >
        <View
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            top,
            height: 34,
            flexDirection: "row",
            gap: 4,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            testID="profile"
            label={`Seviye ${level(save)}, profil`}
            onPress={() => open({ kind: "profile" })}
            style={{ width: 76 * scale, height: 34 }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                width: "100%",
              }}
            >
              <View
                style={{
                  height: 31,
                  width: 29,
                  zIndex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: 29,
                    height: 31,
                    alignItems: "center",
                  }}
                >
                  <Crop
                    source={require("../assets/art/level-shield-v11.png")}
                    x={161}
                    y={85}
                    w={930}
                    h={1050}
                    width={(31 * 930) / 1050}
                    height={31}
                  />
                </View>
                <Text
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 29,
                    height: 31,
                    lineHeight: 24,
                    textAlign: "center",
                    fontFamily: fonts.number,
                    fontSize: 15,
                    color: colors.goldLight,
                  }}
                >
                  {level(save)}
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  height: 12,
                  marginLeft: -2,
                  borderRadius: 7,
                  borderWidth: 1,
                  borderColor: colors.gold,
                  backgroundColor: "#102437",
                  padding: 1,
                }}
              >
                <View
                  style={{
                    width: `${progress * 100}%`,
                    height: "100%",
                    backgroundColor: "#60c8df",
                    backgroundImage:
                      "linear-gradient(180deg, #b5fbff 0%, #26b8ff 45%, #218cd1 100%)",
                    borderRadius: 5,
                  }}
                />
              </View>
            </View>
          </Button>
          {(
            [
              {
                id: "stamina",
                value: `${save.stamina}/${energyCap(save)}`,
                icon: 5,
                width: 76,
              },
              {
                id: "gold",
                value: save.gold.toLocaleString("tr-TR"),
                icon: 6,
                width: 67,
              },
              { id: "gems", value: String(save.gems), icon: 7, width: 56 },
            ] as const
          ).map((a) => (
            <Button
              key={a.id}
              testID={a.id}
              label={String(a.value)}
              onPress={() =>
                open({ kind: a.id === "stamina" ? "energy" : "market" })
              }
              style={{ width: a.width * scale, height: 32 }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  height: 23,
                  borderRadius: 12,
                  backgroundColor: colors.navy,
                  backgroundImage:
                    "linear-gradient(180deg, #273d60 0%, #0c1b32 100%)",
                  borderColor: colors.gold,
                  borderWidth: 1,
                  width: "100%",
                  paddingRight: 4,
                }}
              >
                <View style={{ marginLeft: -5, marginRight: 1 }}>
                  <Sprite kind="icons" index={a.icon} size={29} />
                </View>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={{
                    fontFamily: fonts.number,
                    color: colors.goldLight,
                    fontSize: 12,
                    flex: 1,
                    textAlign: "center",
                  }}
                >
                  {a.value}
                </Text>
                <View
                  style={{
                    marginLeft: 3,
                    width: 15,
                    height: 15,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.gold,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundImage:
                      "linear-gradient(180deg, #35557f 0%, #12233c 100%)",
                  }}
                >
                  <Label
                    color={colors.goldLight}
                    size={13}
                    style={{ lineHeight: 15 }}
                  >
                    +
                  </Label>
                </View>
              </View>
            </Button>
          ))}
          <Button
            testID="profile-menu"
            label="Profil"
            onPress={() => open({ kind: "profile" })}
            style={{
              width: 29,
              height: 29,
              borderRadius: 15,
              backgroundColor: colors.navy,
              borderWidth: 1,
              borderColor: colors.gold,
            }}
          >
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: colors.goldLight,
                marginBottom: 2,
              }}
            />
            <View
              style={{
                width: 14,
                height: 7,
                borderTopLeftRadius: 7,
                borderTopRightRadius: 7,
                backgroundColor: colors.goldLight,
              }}
            />
          </Button>
          <Button
            testID="info"
            label="Eşya bilgisi"
            onPress={() => open({ kind: "info", index: selected ?? undefined })}
            style={{
              width: 29,
              height: 29,
              borderRadius: 15,
              backgroundColor: colors.navy,
              borderWidth: 1,
              borderColor: colors.gold,
            }}
          >
            <Label title size={23} color={colors.goldLight}>
              i
            </Label>
          </Button>
        </View>
        <View
          style={{
            position: "absolute",
            top: top + 138 * sx + sceneExtra,
            alignSelf: "center",
            height: 43 * sx,
            width: 215 * sx,
            alignItems: "center",
            borderRadius: 18,
            backgroundColor: colors.navy,
            borderWidth: 1.3,
            borderColor: colors.gold,
            justifyContent: "center",
          }}
        >
          <SkinPanel
            rect={skin.plaque}
            width={215 * sx}
            height={43 * sx}
            inset={10}
            center={false}
            fill="#142b42"
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5 * scale,
            }}
          >
            <Label size={6 * scale} color={colors.gold}>
              ◆
            </Label>
            <Label title size={14 * scale} color={colors.goldLight}>
              {name(save.cityID)}
            </Label>
            <Label size={6 * scale} color={colors.gold}>
              ◆
            </Label>
          </View>
        </View>
        <View
          style={{
            position: "absolute",
            top: top + 183 * sx + sceneExtra,
            left: 25 * sx,
            width: noticeWidth,
            height: noticeHeight,
            paddingTop: 51 * sx,
            borderRadius: 6,
            backgroundColor: "transparent",
            shadowColor: "#4e301e",
            shadowOpacity: 0.15,
            shadowRadius: 2,
            shadowOffset: { width: 0, height: 1 },
          }}
        >
          <Image
            pointerEvents="none"
            accessible={false}
            source={require("../assets/art/notice-board-v11.png")}
            resizeMode="stretch"
            style={{
              position: "absolute",
              left: (-noticeWidth * 18) / 2136,
              top: (-noticeHeight * 63) / 599,
              width: (noticeWidth * 2172) / 2136,
              height: (noticeHeight * 724) / 599,
            }}
          />
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: 47 * sx,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Label title size={26 * sx} color={colors.goldLight}>
              İlanlar
            </Label>
            <Button
              label="Tüm ilanlar"
              onPress={() => open({ kind: "orders" })}
              style={{
                position: "absolute",
                right: 0,
                top: -6,
                height: 32,
                width: 57,
              }}
            >
              <Label title size={12} color={colors.goldLight}>
                Tümü ›
              </Label>
            </Button>
          </View>
          <ScrollView
            testID="orderRail"
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={cardWidth + 19 * sx}
            decelerationRate="fast"
            contentContainerStyle={{ gap: 19 * sx }}
            style={{
              marginLeft: 40 * sx,
              marginRight: 37 * sx,
              marginBottom: 4,
            }}
          >
            {activeOrders.map((o) => {
              const r = o.requirements[0]!;
              const ready = o.requirements.every(
                (r) => count(save, r.item_id) >= r.quantity,
              );
              return (
                <Button
                  testID={"order-" + o.id}
                  key={o.id}
                  label={
                    o.requirements
                      .map((r) => `${r.quantity} ${product(r.item_id).name}`)
                      .join(", ") +
                    `, ${o.gold} altın, ${o.xp} XP${ready ? ", Hazır, Ver" : ""}`
                  }
                  onPress={() => {
                    const current = gameStore.get().save;
                    const live = orders(current).find(
                      (order) => order.id === o.id,
                    );
                    if (!live) return;
                    if (
                      live.requirements.every(
                        (r) => count(current, r.item_id) >= r.quantity,
                      )
                    ) {
                      const result = dispatch({ type: "deliver", id: live.id });
                      if (result?.kind === "reward")
                        lastOrderDeliveryAt.current = Date.now();
                    } else if (Date.now() - lastOrderDeliveryAt.current > 400) {
                      open({ kind: "orders" });
                    }
                  }}
                  style={{
                    width: cardWidth,
                    height: cardHeight,
                    borderRadius: 5,
                    backgroundColor: "transparent",
                  }}
                >
                  <Image
                    pointerEvents="none"
                    accessible={false}
                    source={require("../assets/art/order-card-v11.png")}
                    resizeMode="stretch"
                    style={{
                      position: "absolute",
                      left: (-cardWidth * 106) / 1557,
                      top: (-cardHeight * 110) / 685,
                      width: (cardWidth * 1774) / 1557,
                      height: (cardHeight * 887) / 685,
                    }}
                  />
                  {ready && (
                    <View
                      pointerEvents="none"
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 6,
                        borderWidth: 2,
                        borderColor: "#4a9155",
                        backgroundColor: "#8bd17338",
                      }}
                    />
                  )}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      width: "100%",
                      height: "100%",
                      paddingHorizontal: 3,
                    }}
                  >
                    <View
                      style={{ width: cardWidth * 0.42, alignItems: "center" }}
                    >
                      <Item id={r.item_id} size={42 * scale} />
                      {o.requirements.length > 1 && (
                        <Label size={7.5} color={colors.muted}>
                          +{o.requirements.length - 1} daha
                        </Label>
                      )}
                    </View>
                    <View style={{ flex: 1, alignItems: "center" }}>
                      <View
                        style={
                          ready
                            ? {
                                backgroundColor: "#377b46",
                                borderRadius: 8,
                                paddingHorizontal: 9,
                                paddingVertical: 1,
                              }
                            : undefined
                        }
                      >
                        <Text
                          style={{
                            fontFamily: fonts.number,
                            fontSize: 11 * scale,
                            color: ready
                              ? "#fff4d5"
                              : count(save, r.item_id) >= r.quantity
                                ? colors.green
                                : "#a52b22",
                          }}
                        >
                          {ready
                            ? "Ver ✓"
                            : `${Math.min(count(save, r.item_id), r.quantity)}/${r.quantity}`}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <Sprite kind="icons" index={6} size={32 * sx} />
                        <Text
                          style={{
                            fontFamily: fonts.number,
                            fontSize: 11 * scale,
                            color: colors.ink,
                          }}
                        >
                          {o.gold}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontFamily: fonts.number,
                          fontSize: 11.3 * scale,
                          color: "#178cc4",
                          textShadowColor: "#fff5d9",
                          textShadowOffset: { width: 0, height: 0.5 },
                          textShadowRadius: 0.5,
                        }}
                      >
                        XP <Text style={{ color: colors.ink }}>{o.xp}</Text>
                      </Text>
                    </View>
                  </View>
                </Button>
              );
            })}
          </ScrollView>
        </View>
        <View
          style={{
            position: "absolute",
            top: top + 356 * sx + sceneExtra,
            left: 8 * scale,
            right: 8 * scale,
            height: 138 * sx,
            borderRadius: 30,
            backgroundColor: colors.navy,
            backgroundImage:
              "linear-gradient(180deg, #263655 0%, #10213d 55%, #1c2a46 100%)",
            borderWidth: 1,
            borderColor: colors.gold,
            justifyContent: "center",
            paddingHorizontal: 0,
          }}
        >
          <Button
            label="Önceki üreticiler"
            onPress={() => {
              uiSound();
              producerRail.current?.scrollTo({
                x: Math.max(0, railOffset.current - producerSize * 3),
                animated: true,
              });
            }}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 24,
            }}
          >
            <Label title size={30} color={colors.goldLight}>
              ‹
            </Label>
          </Button>
          <Button
            label="Sonraki üreticiler"
            onPress={() => {
              uiSound();
              producerRail.current?.scrollTo({
                x: Math.min(
                  railMax.current,
                  railOffset.current + producerSize * 3,
                ),
                animated: true,
              });
            }}
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: 24,
            }}
          >
            <Label title size={30} color={colors.goldLight}>
              ›
            </Label>
          </Button>
          <ScrollView
            ref={producerRail}
            horizontal
            onScroll={(e) => {
              railOffset.current = e.nativeEvent.contentOffset.x;
            }}
            onContentSizeChange={(w) => {
              railMax.current = Math.max(0, w - (width - 76 * scale));
            }}
            style={{ marginHorizontal: 30 * scale }}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: 8 * scale,
              flexGrow: 1,
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 0,
            }}
          >
            {producers.map((p, i) => (
              <ProducerCard
                key={p.id}
                p={p}
                onPowerOpen={showPowerMenu}
                index={i}
                size={producerSize}
                save={save}
                dispatch={dispatch}
                open={open}
              />
            ))}
          </ScrollView>
        </View>
        <View
          style={{
            position: "absolute",
            top: boardTop,
            left: (width - bw) / 2,
          }}
        >
          <Board
            board={c.board}
            cellWidth={cellWidth}
            cellHeight={cellHeight}
            frameInset={frameInset}
            selected={selected}
            reduced={reduced || save.reducedMotion}
            onSelect={select}
            onTap={tapCell}
            onMove={move}
            onInfo={info}
          />
        </View>
        <View style={{ position: "absolute", top: navTop, left: 10 }}>
          <Navigation
            width={width}
            open={open}
            onBoard={boardTab}
            readyCount={
              achievements.filter((a) => achievementState(save, a) === "ready")
                .length
            }
          />
        </View>
      </View>
      {powerMenu && !page && (
        <PowerMenu
          anchor={powerMenu}
          width={width}
          height={height}
          save={save}
          dispatch={dispatch}
          close={() => setPowerMenu(null)}
          details={() => open({ kind: "producer", index: powerMenu.index })}
        />
      )}
      {page && (
        <Pages
          page={page}
          save={save}
          width={width}
          height={height}
          close={close}
          dispatch={dispatch}
          open={open}
          reduced={reduced || save.reducedMotion}
          onInteract={uiSound}
        />
      )}
      {!!toast && (
        <View
          pointerEvents="none"
          testID="actionFeedback"
          accessible
          accessibilityRole="alert"
          accessibilityLabel={toast}
          style={{
            position: "absolute",
            top: page ? top + 80 : top + 39,
            left: 50,
            right: 50,
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff0d6ee",
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Label size={11} style={{ textAlign: "center" }}>
              {toast}
            </Label>
          </View>
        </View>
      )}
      {!!error && (
        <View
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            bottom: insets.bottom + 62,
            backgroundColor: colors.paper,
            padding: 8,
            borderRadius: 8,
          }}
        >
          <Label>{error}</Label>
          <ActionButton text="Tekrar dene" onPress={gameStore.retry} />
        </View>
      )}
      {review && (
        <Text
          pointerEvents="none"
          style={{
            position: "absolute",
            right: 8,
            bottom: 3,
            fontSize: 8,
            color: colors.ink,
            fontFamily: fonts.body,
          }}
        >
          Görsel inceleme
        </Text>
      )}
    </ImageBackground>
  );
}
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar hidden />
        <Game />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
