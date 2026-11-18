import { PresentationPage } from "./ui/PresentationPage";
import { BoardChrome } from "./ui/BoardChrome";
import { CityBackdrop, WalletHUD, GameNavigation } from "./ui/GameChrome";
import { presentationReview, visualReviewCity } from "./ui/visualReview";
import { CityThemeProvider } from "./ui/CityThemeProvider";
import { startCloudSync } from "./account/cloudSync";
import { IdleHint } from "./ui/IdleHint";
import { cityScenes } from "./ui/cityScenes";
import { DeletionRecovery } from "./ui/DeletionRecovery";
import { deletionStore } from "./account/deletion";
import { energyAds } from "./ads/service";
import { I18nText as Text } from "./ui/I18nText";
import { languageStore } from "./i18n/locale";
import { loadLanguage } from "./i18n/preferences";
import { RewardCelebration } from "./ui/RewardCelebration";
import {
  testModeEnabled,
  testFlightBeta,
  productionRelease,
} from "./game/testMode";
import {
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
  PixelRatio,
  Linking,
  StyleSheet,
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
import { useReadyPulse } from "./ui/ReadyGlow";
import { orderItemHighlights, prioritizeOrderRail } from "./ui/orderRail";
import { fitSquareBoard } from "./ui/layout";
import { PowerMenu, type PowerAnchor } from "./ui/PowerMenu";
import { Button, Label, ActionButton } from "./ui/Controls";
import { Pages, type Page } from "./ui/Pages";
import { art, colors, fonts } from "./ui/theme";
import { gameStore } from "./state/store";
import {
  energyCap,
  energyIntervalMs,
  city,
  count,
  name,
  orders,
  producers,
  product,
  type Action,
  type Result,
} from "./game/engine";
function presentationPage(view: string): Page | null {
  if (view === "board") return null;
  if (view === "item") return { kind: "info", index: 7 };
  if (view.startsWith("storage")) return { kind: "storage" };
  if (view.startsWith("account-")) return { kind: "profile" };
  if (view === "cloud-choice") return { kind: "cloud" };
  if (view === "collection-chain")
    return { kind: "producer", index: 0, variant: "collection" };
  if (view === "producer-cooldown") return { kind: "producer", index: 0 };
  if (view === "achievements") return { kind: "cities" };
  if (view === "order-guide")
    return { kind: "order-guide", id: "presentation-order" };
  if (view === "achievement")
    return { kind: "achievement", id: "achievement3" };
  return {
    kind: view as "collection" | "market" | "cities" | "energy" | "orders",
  };
}
void SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ fade: true, duration: 180 });
const startupAssets = [
  cityScenes.city1!.source,
  require("../assets/art/skara-items-v2.png"),
  require("../assets/art/haven-items-v1.png"),
  require("../assets/art/flour-packet-v1.png"),
  art.concept,
  art.approved,
  art.products,
  art.icons,
  require("../assets/art/skara-brand-v1.png"),
  require("../assets/art/route-icons-v2.png"),
  require("../assets/art/skara-field-hero-v2.png"),
];
function Game({
  themeCityID,
  onPreviewTheme,
}: {
  themeCityID: string;
  onPreviewTheme: (id: string | null) => void;
}) {
  useEffect(() => startCloudSync(), []);
  const [deletionPreview, setDeletionPreview] = useState(false);
  const [presentation, setPresentation] = useState<string | null>(null);
  const language = useSyncExternalStore(
    languageStore.subscribe,
    languageStore.get,
  );
  useEffect(() => {
    void loadLanguage().catch(() => undefined);
  }, []);
  const snapshot = useSyncExternalStore(gameStore.subscribe, gameStore.get),
    { save, ready, error, result, revision, review } = snapshot;
  useEffect(() => {
    if (ready && !review) {
      void energyAds.start();
      void deletionStore.recover();
    }
  }, [ready, review]);
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
  const [activity, setActivity] = useState(0),
    [touching, setTouching] = useState(false);
  const lastOrderDeliveryAt = useRef(0);
  const playAudio = useGameAudio(save.sound);
  const uiSound = useCallback(() => playAudio("tap"), [playAudio]);
  const open = useCallback(
      (p: Page) => {
        uiSound();
        setPowerMenu(null);
        setPage(p);
        setPresentation((value) => (value ? "board" : null));
      },
      [uiSound],
    ),
    close = useCallback(() => {
      uiSound();
      setPage(null);
      setPresentation((value) => (value ? "board" : null));
    }, [uiSound]),
    boardTab = useCallback(() => {
      uiSound();
      setPage(null);
      setSelected(null);
      setPresentation((value) => (value ? "board" : null));
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
    void Linking.getInitialURL().then((incoming) => {
      const url = incoming ? incoming.split(/[?#]/)[0] : null;
      onPreviewTheme(
        visualReviewCity(
          incoming,
          testModeEnabled,
          process.env.EXPO_PUBLIC_DISTRIBUTION_CHANNEL,
        ),
      );
      setDeletionPreview(
        testModeEnabled &&
          !testFlightBeta &&
          !productionRelease &&
          Boolean(url?.includes("deletion-recovery-review")),
      );
      const presentation = presentationReview(
        incoming,
        testModeEnabled,
        process.env.EXPO_PUBLIC_DISTRIBUTION_CHANNEL,
      );
      setPresentation(presentation);
      if (presentation) {
        setSelected(null);
        setPage(presentationPage(presentation));
        return gameStore.load(
          presentation === "storage-board-full"
            ? "presentation-full"
            : "presentation",
          presentation,
        );
      }
      const mode =
        testFlightBeta || productionRelease
          ? "normal"
          : testModeEnabled && url?.includes("milestone-review")
            ? "milestone"
            : url?.includes("review")
              ? "review"
              : url?.includes("qa-reset")
                ? "qa"
                : "normal";
      setLaunchPreview(
        !testFlightBeta &&
          !productionRelease &&
          Boolean(url?.includes("loading-review")),
      );
      setSelected(mode === "review" ? 0 : null);
      return gameStore.load(mode);
    });
    const sub = Linking.addEventListener("url", ({ url: incoming }) => {
      const url = incoming.split(/[?#]/)[0]!;
      if (
        testFlightBeta ||
        productionRelease ||
        url.startsWith("masterland://auth/")
      )
        return;
      const presentation = presentationReview(
        incoming,
        testModeEnabled,
        process.env.EXPO_PUBLIC_DISTRIBUTION_CHANNEL,
      );
      setPresentation(presentation);
      if (presentation) {
        onPreviewTheme(null);
        setSelected(null);
        setPage(presentationPage(presentation));
        void gameStore.load(
          presentation === "storage-board-full"
            ? "presentation-full"
            : "presentation",
          presentation,
        );
        return;
      }
      onPreviewTheme(
        visualReviewCity(
          incoming,
          testModeEnabled,
          process.env.EXPO_PUBLIC_DISTRIBUTION_CHANNEL,
        ),
      );
      setDeletionPreview(
        testModeEnabled && url.includes("deletion-recovery-review"),
      );
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
  }, [onPreviewTheme]);
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
      if (state === "active") {
        gameStore.dispatch({ type: "tick" });
        if (gameStore.get().ready && !gameStore.get().review)
          void deletionStore.recover();
      }
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
  const top = Math.max(insets.top, 20);
  const layout = fitSquareBoard(
    width,
    height,
    top,
    insets.bottom,
    PixelRatio.get(),
  );
  const { frameInset, boardTop } = layout,
    cellWidth = layout.cell,
    cellHeight = layout.cell,
    bw = layout.boardWidth;
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
  const c = city(save);
  return (
    <View
      style={{ flex: 1 }}
      onLayout={() => requestAnimationFrame(() => SplashScreen.hide())}
    >
      <CityBackdrop width={width} height={height} />
      <View
        pointerEvents="auto"
        style={StyleSheet.absoluteFill}
        onTouchStart={() => {
          setTouching(true);
          setActivity((n) => n + 1);
        }}
        onTouchEnd={() => {
          setTouching(false);
          setActivity((n) => n + 1);
        }}
        onTouchCancel={() => setTouching(false)}
      >
        <WalletHUD save={save} width={width} open={open} />
        {!page && (
          <>
            <BoardChrome
              width={width}
              save={save}
              orders={activeOrders}
              dispatch={dispatch}
              open={open}
              onPowerOpen={showPowerMenu}
              onDeliver={(id) => {
                const current = gameStore.get().save;
                const order = orders(current).find((o) => o.id === id);
                if (!order) return;
                if (
                  order.requirements.every(
                    (r) => count(current, r.item_id) >= r.quantity,
                  )
                ) {
                  const outcome = dispatch({ type: "deliver", id });
                  if (outcome?.kind === "reward")
                    lastOrderDeliveryAt.current = Date.now();
                } else if (Date.now() - lastOrderDeliveryAt.current > 400)
                  open({ kind: "order-guide", id });
              }}
            />
            <View
              style={{
                position: "absolute",
                top: boardTop,
                left: (width - bw) / 2,
              }}
            >
              <Board
                board={c.board}
                language={language}
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
              <IdleHint
                save={save}
                enabled={
                  !page &&
                  !powerMenu &&
                  !(reduced || save.reducedMotion) &&
                  !save.rewardQueue?.length
                }
                activity={activity}
                touching={touching}
                cell={cellWidth}
                inset={frameInset}
                width={bw}
              />
            </View>
          </>
        )}
        <GameNavigation
          active={
            page?.kind === "producer" && page.variant === "collection"
              ? "collection"
              : page?.kind === "achievement"
                ? "cities"
                : page &&
                    ["collection", "cities", "storage", "market"].includes(
                      page.kind,
                    )
                  ? page.kind
                  : "board"
          }
          width={width}
          height={height}
          bottom={insets.bottom}
          open={open}
          onBoard={boardTab}
        />
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
      {presentation &&
      [
        "account-guest",
        "account-registered",
        "cloud-choice",
        "account-deletion",
        "energy",
        "orders",
        "order-guide",
        "producer-cooldown",
        "achievement",
      ].includes(presentation) ? (
        <PresentationPage
          key={presentation}
          view={presentation}
          save={save}
          width={width}
          height={height}
          close={close}
          dispatch={dispatch}
        />
      ) : (
        page && (
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
            presentationView={presentation}
          />
        )
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
      {testModeEnabled && !page && !presentation && (
        <View
          style={{
            position: "absolute",
            left: 10,
            right: 10,
            bottom: 3,
            flexDirection: "row",
            gap: 5,
          }}
        >
          {[
            {
              id: "testEnergyFill",
              label: "Test: enerjiyi 100’e tamamla",
              text: "TEST · Enerji 100",
              type: "test-energy-fill",
            },
            {
              id: "testGoldAdd",
              label: "Test: 10.000 altın ekle",
              text: "+10.000 altın",
              type: "test-gold-add",
            },
            {
              id: "testGemsAdd",
              label: "Test: 100 elmas ekle",
              text: "+100 elmas",
              type: "test-gems-add",
            },
            {
              id: "testLevelUp",
              label: "Test: bir seviye atla",
              text: "+1 seviye",
              type: "test-level-up",
            },
          ].map((control) => (
            <Button
              key={control.id}
              testID={control.id}
              label={control.label}
              onPress={() =>
                dispatch({
                  type: control.type as
                    | "test-energy-fill"
                    | "test-gold-add"
                    | "test-gems-add"
                    | "test-level-up",
                })
              }
              style={{
                flex: 1,
                height: 25,
                borderRadius: 5,
                borderWidth: 1,
                borderColor: "#bda26b",
                backgroundColor: "#3c542cee",
              }}
            >
              <Label size={9} color="#ffefc9">
                {control.text}
              </Label>
            </Button>
          ))}
        </View>
      )}
      {!!save.rewardQueue?.[0] && (
        <RewardCelebration
          notice={save.rewardQueue[0]}
          dismiss={dismissReward}
          reduced={reduced || save.reducedMotion}
        />
      )}
      <DeletionRecovery preview={deletionPreview} />
      {review && !presentation && (
        <Text
          testID="visualReviewMarker"
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
          {themeCityID === save.cityID
            ? "Görsel inceleme"
            : `${name(themeCityID)} · Tema önizlemesi`}
        </Text>
      )}
    </View>
  );
}
const currentThemeCity = () => gameStore.get().save.cityID;
function GameTheme() {
  const cityID = useSyncExternalStore(gameStore.subscribe, currentThemeCity);
  const [preview, setPreview] = useState<string | null>(null);
  const themeCityID = preview ?? cityID;
  return (
    <CityThemeProvider cityID={themeCityID}>
      <Game themeCityID={themeCityID} onPreviewTheme={setPreview} />
    </CityThemeProvider>
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
        <GameTheme />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
