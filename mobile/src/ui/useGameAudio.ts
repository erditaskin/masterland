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
  const blocked = useAudioPlayer(require("../../assets/audio/blocked.wav"));
  const players = useMemo(
    () => [ui, a, b, c, merge, reward, blocked],
    [ui, a, b, c, merge, reward, blocked],
  );
  const active = useRef<typeof ui | null>(null);
  const last = useRef(0),
    serial = useRef(0),
    variant = useRef(0);
  const stop = useCallback(() => {
    serial.current++;
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
    (kind: Result["kind"] = "tap") => {
      if (
        !enabled ||
        kind === "none" ||
        AppState.currentState !== "active" ||
        Date.now() - last.current < 65
      )
        return;
      last.current = Date.now();
      const p =
        kind === "produce"
          ? [a, b, c][variant.current++ % 3]!
          : kind === "merge"
            ? merge
            : kind === "reward" || kind === "unlock"
              ? reward
              : kind === "blocked"
                ? blocked
                : ui;
      const token = ++serial.current;
      // At most one short cue is audible. A rapid action replaces the previous cue.
      if (active.current && active.current !== p) active.current.pause();
      active.current = p;
      p.volume =
        kind === "produce"
          ? 0.5
          : kind === "blocked"
            ? 0.45
            : kind === "reward"
              ? 0.7
              : 0.6;
      void p
        .seekTo(0)
        .then(() => {
          if (token === serial.current && AppState.currentState === "active")
            p.play();
        })
        .catch(() => {});
    },
    [enabled, ui, a, b, c, merge, reward, blocked],
  );
}
