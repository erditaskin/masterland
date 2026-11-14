/* eslint-disable react-hooks/immutability -- Expo Audio player handles expose documented mutable native volume properties. */
import {
  memo,
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
import { useFonts } from "expo-font";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";
import { Board } from "./ui/Board";
import { ProducerButton } from "./ui/ProducerButton";
import { Button, Label, ActionButton } from "./ui/Controls";
import { Item, Reference, Sprite } from "./ui/Art";
import { Pages, type Page } from "./ui/Pages";
import { art, colors, fonts } from "./ui/theme";
import { gameStore } from "./state/store";
import {
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
const noop = () => {};
const navigation = [
  ["Tahta", "board"],
  ["Koleksiyon", "collection"],
  ["Şehirler", "cities"],
  ["Depo", "storage"],
  ["Pazar", "market"],
] as const;
const ProducerCard = memo(
  function ProducerCard({
    p,
    index,
    size,
    save,
    dispatch,
    open,
  }: {
    p: Producer;
    index: number;
    size: number;
    save: Save;
    dispatch: (a: Action) => void;
    open: (p: Page) => void;
  }) {
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
    return (
      <ProducerButton
        testID={p.id}
        label={`${p.name}, üretmek için dokun, geliştirmek için basılı tut`}
        onPress={() =>
          owned
            ? dispatch({ type: "produce", id: p.id })
            : open({ kind: "producer", index })
        }
        onLongPress={() => open({ kind: "producer", index })}
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
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            bottom: 2,
            left: 3,
            right: 3,
            height: 15,
            borderRadius: 9,
            backgroundColor: colors.navy,
            borderWidth: 0.7,
            borderColor: colors.gold,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontFamily: fonts.number,
              color: colors.goldLight,
              fontSize: 10,
            }}
          >
            {!owned
              ? level(save) >= p.level
                ? `${p.price} ●`
                : `Sev. ${p.level}`
              : seconds > 0
                ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
                : "ϟ 1"}
          </Text>
        </View>
      </ProducerButton>
    );
  },
  (a, b) =>
    a.p === b.p &&
    a.index === b.index &&
    a.size === b.size &&
    a.dispatch === b.dispatch &&
    a.open === b.open &&
    level(a.save) === level(b.save) &&
    city(a.save).owned.includes(a.p.id) ===
      city(b.save).owned.includes(b.p.id) &&
    (city(a.save).batches[a.p.id]?.readyAt ?? 0) ===
      (city(b.save).batches[b.p.id]?.readyAt ?? 0),
);
const Navigation = memo(function Navigation({
  width,
  open,
  onBoard,
}: {
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
        borderColor: colors.gold,
        borderWidth: 1,
      }}
    >
      {navigation.map(([label, target], i) => (
        <Button
          key={target}
          testID={"tab-" + target}
          label={label}
          onPress={() =>
            target === "board" ? onBoard() : open({ kind: target })
          }
          style={{
            flex: 1,
            borderRadius: 17,
            backgroundColor: i === 0 ? "#d88619" : "transparent",
            shadowColor: i === 0 ? "#ffbd39" : "transparent",
            shadowOpacity: i === 0 ? 0.55 : 0,
            shadowRadius: 5,
            shadowOffset: { width: 0, height: 0 },
            borderWidth: i === 0 ? 1 : 0,
            borderColor: colors.goldLight,
          }}
        >
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
    [reduced, setReduced] = useState(false),
    [hiddenToastRevision, setHiddenToastRevision] = useState(-1);
  const tapAudio = useAudioPlayer(require("../assets/audio/tap.wav")),
    mergeAudio = useAudioPlayer(require("../assets/audio/merge.wav")),
    audioSerial = useRef(0),
    lastAudio = useRef(0);
  const uiSound = useCallback(() => {
    if (!gameStore.get().save.sound || Date.now() - lastAudio.current < 65)
      return;
    lastAudio.current = Date.now();
    const token = ++audioSerial.current;
    tapAudio.volume = 0.18;
    void tapAudio
      .seekTo(0)
      .then(() => {
        if (token === audioSerial.current && AppState.currentState === "active")
          tapAudio.play();
      })
      .catch(noop);
  }, [tapAudio]);
  const open = useCallback(
      (p: Page) => {
        uiSound();
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
    gameStore.dispatch(action);
  }, []);
  useEffect(() => {
    void Linking.getInitialURL().then((url) =>
      gameStore.load(
        url?.includes("review")
          ? "review"
          : url?.includes("qa-reset")
            ? "qa"
            : "normal",
      ),
    );
    const sub = Linking.addEventListener("url", ({ url }) => {
      if (url.includes("review")) {
        close();
        setSelected(null);
        void gameStore.load("review");
      } else if (url.includes("qa-reset")) {
        close();
        setSelected(null);
        void gameStore.load("qa");
      }
    });
    return () => sub.remove();
  }, [close]);
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduced,
    );
    return () => sub.remove();
  }, []);
  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: false,
      shouldPlayInBackground: false,
    });
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") gameStore.dispatch({ type: "tick" });
      else {
        audioSerial.current++;
        tapAudio.pause();
        mergeAudio.pause();
      }
    });
    return () => sub.remove();
  }, [tapAudio, mergeAudio]);
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
        save.stamina < 100 ? save.energyAt + 120000 : Infinity,
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
      result.kind === "reward" ? 1400 : 850,
    );
    return () => clearTimeout(timer);
  }, [result, revision]);
  useEffect(() => {
    if (
      !result ||
      !save.sound ||
      result.kind === "none" ||
      Date.now() - lastAudio.current < 65
    )
      return;
    lastAudio.current = Date.now();
    const token = ++audioSerial.current,
      p =
        result.kind === "merge" || result.kind === "reward"
          ? mergeAudio
          : tapAudio;
    p.volume = result.kind === "blocked" ? 0.12 : 0.35;
    void p
      .seekTo(0)
      .then(() => {
        if (token === audioSerial.current && AppState.currentState === "active")
          p.play();
      })
      .catch(noop);
  }, [result, revision, save.sound, tapAudio, mergeAudio]);
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
      return r;
    },
    [],
  );
  const top = Math.max(insets.top - 8, 20),
    scale = width / 390,
    boardTop = top + 224 * scale,
    navTop = height - insets.bottom - 59;
  const cell = Math.max(
      24,
      Math.min((width - 64) / 6, (navTop - 10 - boardTop - 16) / 9),
    ),
    bw = cell * 6 + 16;
  const cardWidth = (width - 44 - 16) / 3,
    producerSize = 46 * scale;
  const activeOrders = useMemo(() => orders(save), [save]);
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
                  width: 27,
                  backgroundColor: colors.navy,
                  borderWidth: 1.3,
                  borderColor: colors.gold,
                  borderRadius: 7,
                  zIndex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Label title size={23} color={colors.goldLight}>
                  {level(save)}
                </Label>
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
                value: `${save.stamina}/100`,
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
                <Label color={colors.gold} size={13} style={{ marginLeft: 3 }}>
                  +
                </Label>
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
            top: top + 69 * scale,
            alignSelf: "center",
            height: 26,
            paddingHorizontal: 20,
            borderRadius: 18,
            backgroundColor: colors.navy,
            borderWidth: 1.3,
            borderColor: colors.gold,
            justifyContent: "center",
          }}
        >
          <Label title size={21} color={colors.goldLight}>
            ‹ {name(save.cityID)} ›
          </Label>
        </View>
        <View
          style={{
            position: "absolute",
            top: top + 101 * scale,
            left: 15,
            right: 15,
            height: 60 * scale,
            paddingTop: 18 * scale,
            borderRadius: 6,
            backgroundColor: colors.wood,
            borderWidth: 1.2,
            borderColor: colors.gold,
            shadowColor: "#4e301e",
            shadowOpacity: 0.15,
            shadowRadius: 2,
            shadowOffset: { width: 0, height: 1 },
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              overflow: "hidden",
              borderRadius: 5,
            }}
          >
            <Reference
              x={90}
              y={252}
              w={260}
              h={20}
              width={width - 30}
              height={18 * scale}
            />
            <View
              style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}
            >
              <Reference
                x={550}
                y={375}
                w={270}
                h={10}
                width={width - 30}
                height={4}
              />
            </View>
          </View>
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: 18 * scale,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Label title size={15 * scale} color={colors.goldLight}>
              ◆ İlanlar ◆
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
            snapToInterval={cardWidth + 8}
            decelerationRate="fast"
            contentContainerStyle={{ gap: 8 }}
            style={{ marginHorizontal: 6, marginBottom: 4 }}
          >
            {activeOrders.map((o) => {
              const r = o.requirements[0]!;
              return (
                <Button
                  testID={"order-" + o.id}
                  key={o.id}
                  label={
                    o.requirements
                      .map((r) => `${r.quantity} ${product(r.item_id).name}`)
                      .join(", ") + `, ${o.gold} altın, ${o.xp} XP`
                  }
                  onPress={() => {
                    if (
                      o.requirements.every(
                        (r) => count(save, r.item_id) >= r.quantity,
                      )
                    )
                      dispatch({ type: "deliver", id: o.id });
                    else open({ kind: "orders" });
                  }}
                  style={{
                    width: cardWidth,
                    height: 37 * scale,
                    borderRadius: 5,
                    backgroundColor: colors.paper,
                    borderWidth: 0.7,
                    borderColor: "#d4a45e",
                    shadowColor: "#432411",
                    shadowOpacity: 0.18,
                    shadowRadius: 1,
                    shadowOffset: { width: 0, height: 1 },
                  }}
                >
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
                      <Item id={r.item_id} size={30 * scale} />
                      {o.requirements.length > 1 && (
                        <Label size={7.5} color={colors.muted}>
                          +{o.requirements.length - 1} daha
                        </Label>
                      )}
                    </View>
                    <View style={{ flex: 1, alignItems: "center" }}>
                      <Text
                        style={{
                          fontFamily: fonts.number,
                          fontSize: 10,
                          color:
                            count(save, r.item_id) >= r.quantity
                              ? colors.green
                              : colors.ink,
                        }}
                      >
                        {Math.min(count(save, r.item_id), r.quantity)}/
                        {r.quantity}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <Sprite kind="icons" index={6} size={11} />
                        <Text
                          style={{
                            fontFamily: fonts.number,
                            fontSize: 9.5,
                            color: colors.ink,
                          }}
                        >
                          {o.gold}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontFamily: fonts.body,
                          fontSize: 9,
                          color: colors.blue,
                        }}
                      >
                        XP {o.xp}
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
            top: top + 166 * scale,
            left: 20,
            right: 20,
            height: 53 * scale,
            borderRadius: 22,
            backgroundColor: colors.navy,
            borderWidth: 1,
            borderColor: colors.gold,
            justifyContent: "center",
            paddingHorizontal: 7,
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: 8,
              flexGrow: 1,
              justifyContent: "space-evenly",
              alignItems: "center",
              paddingHorizontal: 4,
            }}
          >
            {producers.map((p, i) => (
              <ProducerCard
                key={p.id}
                p={p}
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
            cell={cell}
            selected={selected}
            reduced={reduced || save.reducedMotion}
            onSelect={select}
            onMove={move}
            onInfo={info}
          />
        </View>
        <View style={{ position: "absolute", top: navTop, left: 10 }}>
          <Navigation width={width} open={open} onBoard={boardTab} />
        </View>
        {!!toast && (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: top + 39,
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
      </View>
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
        />
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
  const [loaded, error] = useFonts({
    Alegreya600: require("../assets/fonts/Alegreya-600.ttf"),
    Nunito600: require("../assets/fonts/Nunito-600.ttf"),
    Nunito800: require("../assets/fonts/Nunito-800.ttf"),
  });
  if (error)
    return (
      <View style={{ flex: 1, padding: 30, justifyContent: "center" }}>
        <Text onLayout={() => SplashScreen.hide()}>
          Yazı tipleri yüklenemedi.
        </Text>
      </View>
    );
  if (!loaded) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar hidden />
        <Game />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
