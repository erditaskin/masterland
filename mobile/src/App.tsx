import { EnergyTimer } from "./ui/EnergyTimer";
import { RewardCelebration } from "./ui/RewardCelebration";
import { ProducerPortrait } from "./ui/ProducerDetails";
import { testModeEnabled } from "./game/testMode";
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
import { Asset } from "expo-asset";
import { LaunchScreen } from "./ui/LaunchScreen";
import * as SplashScreen from "expo-splash-screen";
import { useGameAudio } from "./ui/useGameAudio";
import { Board } from "./ui/Board";
import { ReadyGlow, useReadyPulse } from "./ui/ReadyGlow";
import { orderItemHighlights, prioritizeOrderRail } from "./ui/orderRail";
import { fitSquareBoard } from "./ui/layout";
import { StatusIcon } from "./ui/StatusIcon";
import { CityWoodSign, WoodTray } from "./ui/Skin";
import { PowerMenu, type PowerAnchor } from "./ui/PowerMenu";
import { ProducerButton } from "./ui/ProducerButton";
import { Button, Label, ActionButton } from "./ui/Controls";
import { Crop, Item, Sprite } from "./ui/Art";
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
  cityProducers,
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
const startupAssets = [
  art.city,
  require("../assets/art/haven-surround-v1.png"),
  require("../assets/art/skara-items-v2.png"),
  require("../assets/art/haven-items-v1.png"),
  require("../assets/art/carved-city-sign-v1.png"),
  require("../assets/art/carved-wood-rail-v1.png"),
  require("../assets/art/flour-packet-v1.png"),
  art.concept,
  art.approved,
  art.products,
  art.icons,
  require("../assets/art/skara-brand-v1.png"),
  require("../assets/art/skara-route-v2.png"),
  require("../assets/art/canonical-map-clean-v1.png"),
  require("../assets/art/map-scroll-v3.png"),
  require("../assets/art/city-tabs-v4.png"),
  require("../assets/art/haven-route-v2.png"),
  require("../assets/art/cove-route-v2.png"),
  require("../assets/art/page-frame-v2.png"),
  require("../assets/art/title-plaque-v2.png"),
  require("../assets/art/route-card-v2.png"),
  require("../assets/art/route-icons-v2.png"),
  require("../assets/art/skara-field-hero-v2.png"),
];
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
            backgroundColor: "#482711",
            borderWidth: 2,
            borderTopColor: "#43210f",
            borderBottomColor: "#d19a56",
            borderColor: owned ? "#a56d32" : "#72502d",
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              inset: 2,
              overflow: "hidden",
              borderRadius: 6,
            }}
          >
            {index >= 5 ? (
              <ProducerPortrait index={index} size={size - 4} />
            ) : (
              <Crop
                source={art.concept}
                x={143 + index * 130.5}
                y={400}
                w={68}
                h={68}
                width={size - 4}
                height={size - 4}
              />
            )}
          </View>
          {owned && (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 3,
                left: 3,
                borderRadius: 6,
                paddingHorizontal: 4,
                backgroundColor: plan.effective > 1 ? "#a35d13" : "#482714",
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
              backgroundColor: "#412512",
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
  active,
}: {
  active: string;
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
        paddingHorizontal: 11,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: "transparent",
      }}
    >
      <WoodTray width={width - 20} height={55} />
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
            marginHorizontal: 2,
            borderRadius: 8,
            backgroundColor:
              active === target ? "#a86628" : "rgba(48, 23, 10, 0.38)",
            backgroundImage:
              active === target
                ? "linear-gradient(180deg, #cf9448 0%, #925021 100%)"
                : "linear-gradient(180deg, rgba(31, 15, 5, 0.32) 0%, rgba(108, 58, 24, 0.12) 100%)",
            shadowColor: active === target ? "#ffbd39" : "transparent",
            shadowOpacity: active === target ? 0.55 : 0,
            shadowRadius: 5,
            shadowOffset: { width: 0, height: 0 },
            borderWidth: 1,
            borderColor: active === target ? "#f0ca86" : "#71401f",
            borderTopColor: active === target ? "#f0ca86" : "#3f200d",
            borderBottomColor: active === target ? "#e3ab63" : "#bc8044",
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
          <Sprite kind="icons" index={i} size={29} />
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.82}
            style={{
              fontFamily: fonts.title,
              fontSize: 12,
              color: colors.goldLight,
              textAlign: "center",
              width: "100%",
              marginTop: -1,
            }}
          >
            {label}
          </Text>
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
    [hiddenToastRevision, setHiddenToastRevision] = useState(-1),
    [loadedAssets, setLoadedAssets] = useState(0),
    [assetError, setAssetError] = useState(false),
    [assetAttempt, setAssetAttempt] = useState(0),
    [launchPreview, setLaunchPreview] = useState(false);
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
      setPage(null);
      setSelected(null);
    }, [uiSound]);
  const dismissReward = useCallback(() => {
    const notice = gameStore.get().save.rewardQueue?.[0];
    if (notice) gameStore.dispatch({ type: "dismiss-reward", id: notice.id });
  }, []);
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
    let mounted = true;
    void Promise.all(
      startupAssets.map((source) =>
        Asset.fromModule(source)
          .downloadAsync()
          .then(() => {
            if (mounted) setLoadedAssets((n) => n + 1);
          }),
      ),
    ).catch(() => {
      if (mounted) setAssetError(true);
    });
    return () => {
      mounted = false;
    };
  }, [assetAttempt]);
  useEffect(() => {
    void Linking.getInitialURL().then((url) => {
      const mode =
        testModeEnabled && url?.includes("milestone-review")
          ? "milestone"
          : url?.includes("review")
            ? "review"
            : url?.includes("qa-reset")
              ? "qa"
              : "normal";
      setLaunchPreview(Boolean(url?.includes("loading-review")));
      setSelected(mode === "review" ? 0 : null);
      return gameStore.load(mode);
    });
    const sub = Linking.addEventListener("url", ({ url }) => {
      if (testModeEnabled && url.includes("milestone-review")) {
        setPage(null);
        setSelected(null);
        void gameStore.load("milestone");
      } else if (url.includes("review")) {
        setLaunchPreview(url.includes("loading-review"));
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
  const top = Math.max(insets.top, 20),
    scale = width / 390,
    sx = width / 800;
  const layout = fitSquareBoard(
    width,
    height,
    top,
    insets.bottom,
    PixelRatio.get(),
  );
  const { navTop, frameInset, boardTop } = layout,
    cellWidth = layout.cell,
    cellHeight = layout.cell,
    bw = layout.boardWidth,
    noticeWidth = width - 16 * scale,
    noticeHeight = 58 * scale,
    cardWidth = (noticeWidth - 24 * scale) / 3,
    cardHeight = 48 * scale,
    producerSize = 44 * scale;
  const activeOrders = useMemo(
    () => prioritizeOrderRail(orders(save), save),
    [save],
  );
  const { ready: readyOrderItems, partial: partialOrderItems } = useMemo(
    () => orderItemHighlights(activeOrders, save),
    [activeOrders, save],
  );
  const readyPulse = useReadyPulse(
    !page && readyOrderItems.size > 0,
    reduced || save.reducedMotion,
  );
  const producerRail = useRef<ComponentRef<typeof ScrollView>>(null),
    railOffset = useRef(0),
    railMax = useRef(0),
    railViewport = useRef(0),
    railContent = useRef(0);
  const [producerEdges, setProducerEdges] = useState({
    left: false,
    right: false,
  });
  const syncProducerEdges = useCallback(() => {
    railMax.current = Math.max(0, railContent.current - railViewport.current);
    const next = {
      left: railOffset.current > 1,
      right: railOffset.current < railMax.current - 1,
    };
    setProducerEdges((previous) =>
      previous.left === next.left && previous.right === next.right
        ? previous
        : next,
    );
  }, []);
  if (
    !ready ||
    loadedAssets < startupAssets.length ||
    assetError ||
    launchPreview
  )
    return (
      <LaunchScreen
        progress={(loadedAssets + (ready ? 1 : 0)) / (startupAssets.length + 1)}
        error={
          error ??
          (assetError ? "Görseller yüklenemedi. Uygulamayı yeniden aç." : null)
        }
        reduced={reduced || save.reducedMotion}
        preview={launchPreview}
        onContinue={() => setLaunchPreview(false)}
        onRetry={() => {
          if (assetError) {
            setLoadedAssets(0);
            setAssetError(false);
            setAssetAttempt((n) => n + 1);
          } else gameStore.retry();
        }}
      />
    );
  const [start, next] = levelRange(save),
    progress = Math.max(0, Math.min(1, (save.xp - start) / (next - start))),
    c = city(save);
  return (
    <ImageBackground
      source={
        save.cityID === "city2"
          ? require("../assets/art/haven-surround-v1.png")
          : art.city
      }
      resizeMode="cover"
      onLoadEnd={() => requestAnimationFrame(() => SplashScreen.hide())}
      style={{ flex: 1 }}
    >
      <View pointerEvents="auto" style={StyleSheet.absoluteFill}>
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
            style={{ width: 56 * scale, height: 34 }}
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
                    lineHeight: 31,
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
                value: String(save.stamina),
                icon: 5,
                width: 92,
              },
              {
                id: "gold",
                value: save.gold.toLocaleString("tr-TR"),
                icon: 6,
                width: 104,
              },
              { id: "gems", value: String(save.gems), icon: 7, width: 82 },
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
                  height: 28,
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
                  <Sprite kind="icons" index={a.icon} size={34} />
                </View>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={{
                    fontFamily: fonts.number,
                    color: colors.goldLight,
                    fontSize: 16,
                    fontVariant: ["tabular-nums"],
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
              {a.id === "stamina" && (
                <View
                  style={{ position: "absolute", top: 34, left: 0, right: 0 }}
                >
                  <EnergyTimer save={save} />
                </View>
              )}
            </Button>
          ))}
          <Button
            testID="profile-menu"
            label="Profil"
            onPress={() => open({ kind: "profile" })}
            style={{
              position: "absolute",
              right: 34,
              top: 39,
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
              position: "absolute",
              right: 0,
              top: 39,
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
        {!page && (
          <>
            <View
              style={{
                position: "absolute",
                top: top + 35 * scale,
                alignSelf: "center",
                height: 26 * scale,
                width: 180 * scale,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CityWoodSign width={180 * scale} height={26 * scale} />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5 * scale,
                }}
              >
                <Label title size={17 * scale} color={colors.goldLight}>
                  {name(save.cityID)}
                </Label>
              </View>
            </View>
            <Button
              testID="allOrders"
              label="Tüm ilanlar"
              onPress={() => open({ kind: "orders" })}
              style={{
                position: "absolute",
                top: top + 35 * scale,
                left: 10,
                width: 44,
                height: 26 * scale,
              }}
            >
              <Label title size={9} color={colors.goldLight}>
                Tümü ›
              </Label>
            </Button>
            <View
              style={{
                position: "absolute",
                top: top + 62 * scale,
                left: 8 * scale,
                width: noticeWidth,
                height: noticeHeight,
                paddingTop: 5 * scale,
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
              <ScrollView
                testID="orderRail"
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={cardWidth + 6 * scale}
                decelerationRate="fast"
                contentContainerStyle={{ gap: 6 * scale }}
                style={{
                  marginLeft: 6 * scale,
                  marginRight: 6 * scale,
                  marginBottom: 4,
                }}
              >
                {activeOrders.map((o) => {
                  const r = o.requirements[0]!;
                  const ready = o.requirements.every(
                    (r) => count(save, r.item_id) >= r.quantity,
                  );
                  const partial =
                    !ready &&
                    o.requirements.some(
                      (r) => count(save, r.item_id) >= r.quantity,
                    );
                  return (
                    <Button
                      testID={"order-" + o.id}
                      key={o.id}
                      label={
                        o.requirements
                          .map(
                            (r) => `${r.quantity} ${product(r.item_id).name}`,
                          )
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
                          const result = dispatch({
                            type: "deliver",
                            id: live.id,
                          });
                          if (result?.kind === "reward")
                            lastOrderDeliveryAt.current = Date.now();
                        } else if (
                          Date.now() - lastOrderDeliveryAt.current >
                          400
                        ) {
                          open({ kind: "order-guide", id: live.id });
                        }
                      }}
                      style={{
                        width: cardWidth,
                        height: cardHeight,
                        borderRadius: 5,
                        backgroundColor: "transparent",
                      }}
                    >
                      <WoodTray width={cardWidth} height={cardHeight} />
                      {(ready || partial) && (
                        <View
                          pointerEvents="none"
                          style={{
                            position: "absolute",
                            inset: 3,
                            borderRadius: 5,
                            borderWidth: 2,
                            borderColor: ready ? "#9cdb68" : "#42652d",
                            backgroundColor: ready ? "#91ad4e" : "#476a34",
                            backgroundImage: ready
                              ? "linear-gradient(180deg, #b4ce78 0%, #86a847 100%)"
                              : undefined,
                          }}
                        />
                      )}
                      {ready && (
                        <ReadyGlow pulse={readyPulse} inset={3} radius={5} />
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
                          style={{
                            width: cardWidth * 0.42,
                            alignItems: "center",
                          }}
                        >
                          <Item id={r.item_id} size={42 * scale} />
                          {o.requirements.length > 1 && (
                            <Label
                              size={7.5}
                              color={ready ? colors.ink : colors.goldLight}
                            >
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
                                    ? "#d9e69c"
                                    : "#ffd0a0",
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
                                color: ready ? colors.ink : colors.goldLight,
                              }}
                            >
                              {o.gold}
                            </Text>
                          </View>
                          <Text
                            style={{
                              fontFamily: fonts.number,
                              fontSize: 11.3 * scale,
                              color: ready ? "#178cc4" : "#8cddf0",
                              textShadowColor: ready ? "#fff5d9" : "#39200f",
                              textShadowOffset: { width: 0, height: 0.5 },
                              textShadowRadius: 0.5,
                            }}
                          >
                            XP{" "}
                            <Text
                              style={{
                                color: ready ? colors.ink : colors.goldLight,
                              }}
                            >
                              {o.xp}
                            </Text>
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
                top: top + 122 * scale,
                left: 8 * scale,
                right: 8 * scale,
                height: 50 * scale,
                borderRadius: 12,
                backgroundColor: "transparent",
                justifyContent: "center",
                paddingHorizontal: 0,
              }}
            >
              <WoodTray width={width - 16 * scale} height={50 * scale} />
              {producerEdges.left && (
                <Button
                  testID="producerRailPrev"
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
              )}
              {producerEdges.right && (
                <Button
                  testID="producerRailNext"
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
              )}
              <ScrollView
                ref={producerRail}
                horizontal
                onScroll={(e) => {
                  railOffset.current = e.nativeEvent.contentOffset.x;
                  syncProducerEdges();
                }}
                scrollEventThrottle={32}
                bounces={false}
                onLayout={(e) => {
                  railViewport.current = e.nativeEvent.layout.width;
                  syncProducerEdges();
                }}
                onContentSizeChange={(w) => {
                  railContent.current = w;
                  syncProducerEdges();
                }}
                style={{ marginHorizontal: 24 * scale }}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  gap: 8 * scale,
                  flexGrow: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 8 * scale,
                }}
              >
                {cityProducers(save).map((p) => (
                  <ProducerCard
                    key={p.id}
                    p={p}
                    onPowerOpen={showPowerMenu}
                    index={producers.indexOf(p)}
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
                readyOrderItems={readyOrderItems}
                partialOrderItems={partialOrderItems}
                readyPulse={readyPulse}
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
          </>
        )}
        <View style={{ position: "absolute", top: navTop, left: 10 }}>
          <Navigation
            active={
              page?.kind === "achievement"
                ? "cities"
                : page &&
                    ["collection", "cities", "storage", "market"].includes(
                      page.kind,
                    )
                  ? page.kind
                  : "board"
            }
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
      {testModeEnabled && !page && (
        <View style={{ position: "absolute", right: 10, bottom: 2 }}>
          <Button
            testID="testEnergyFill"
            label="Test: enerjiyi 100’e tamamla"
            onPress={() => dispatch({ type: "test-energy-fill" })}
            style={{
              paddingHorizontal: 8,
              height: 20,
              borderRadius: 8,
              backgroundColor: "#3c542cdd",
            }}
          >
            <Label size={9} color="#ffefc9">
              TEST · Enerjiyi doldur
            </Label>
          </Button>
        </View>
      )}
      {!!save.rewardQueue?.[0] && (
        <RewardCelebration
          notice={save.rewardQueue[0]}
          dismiss={dismissReward}
          reduced={reduced || save.reducedMotion}
        />
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
    <GestureHandlerRootView
      onLayout={() => SplashScreen.hide()}
      style={{ flex: 1 }}
    >
      <SafeAreaProvider>
        <StatusBar hidden />
        <Game />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
