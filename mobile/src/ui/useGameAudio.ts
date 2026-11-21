/* eslint-disable react-hooks/immutability -- Expo Audio volume is a documented native handle property. */
import { useCallback, useEffect, useMemo, useRef } from "react";
import { AppState } from "react-native";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import type { Result } from "../game/engine";

/** Preloaded short cues; native handles are reused, never allocated per tap. */
export function useGameAudio(enabled: boolean) {
  const ui = useAudioPlayer(require("../../assets/audio/tap.wav"));
  const a = useAudioPlayer(require("../../assets/audio/produce-0.wav"));
  const b = useAudioPlayer(require("../../assets/audio/produce-1.wav"));
  const c = useAudioPlayer(require("../../assets/audio/produce-2.wav"));
  const merge = useAudioPlayer(require("../../assets/audio/merge.wav"));
  const reward = useAudioPlayer(require("../../assets/audio/reward.wav"));
  const gold = useAudioPlayer(require("../../assets/audio/gold.wav"));
  const achievement = useAudioPlayer(require("../../assets/audio/achievement.wav"));
  const blocked = useAudioPlayer(require("../../assets/audio/blocked.wav"));
  const players = useMemo(
    () => [ui, a, b, c, merge, reward, blocked, gold, achievement],
    [ui, a, b, c, merge, reward, blocked, gold, achievement],
  );
  const playback = useRef(new Map<typeof ui, number>());
  const serial = useRef(0);
  const lastTap = useRef(0);
  const variant = useRef(0);
  const stop = useCallback(() => {
    playback.current.clear();
    players.forEach((p) => p.pause());
  }, [players]);
  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: false,
      shouldPlayInBackground: false,
    });
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") stop();
    });
    return () => sub.remove();
  }, [stop]);
  useEffect(() => {
    if (!enabled) stop();
  }, [enabled, stop]);
  return useCallback(
    (kind: Result["kind"] | "gold" | "achievement" = "tap") => {
      if (
        !enabled ||
        kind === "none" ||
        AppState.currentState !== "active"
      )
        return;
      if (kind === "tap") {
        const now = Date.now();
        if (now - lastTap.current < 65) return;
        lastTap.current = now;
      }
      const p = {
        tap: ui,
        produce: kind === "produce" ? [a, b, c][variant.current++ % 3]! : a,
        merge,
        reward,
        unlock: reward,
        blocked,
        move: ui,
        gold,
        achievement,
      }[kind];
      const token = ++serial.current;
      playback.current.set(p, token);
      p.volume = kind === "tap" ? 0.35 : kind === "gold" || kind === "achievement" ? 0.85 : 0.65;
      void p
        .seekTo(0)
        .then(() => {
          if (token === playback.current.get(p) && AppState.currentState === "active")
            p.play();
        })
        .catch(() => {});
    },
    [enabled, ui, a, b, c, merge, reward, blocked, gold, achievement],
  );
}
