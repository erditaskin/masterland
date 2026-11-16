export type AdPhase =
  | "idle"
  | "consent"
  | "loading"
  | "ready"
  | "showing"
  | "earned"
  | "closed"
  | "error";
export interface RewardedHandle {
  load(): void;
  show(): Promise<void>;
  destroy(): void;
}
export interface RewardedEvents {
  loaded(): void;
  earned(): void;
  closed(): void;
  failed(): void;
}
/** One ad instance, one show, one earned receipt. Closing is never an earned event. */
export class EnergyAdController {
  private phase: AdPhase = "idle";
  private handle: RewardedHandle | null = null;
  private epoch = 0;
  private credited = false;
  constructor(
    private readonly changed: (phase: AdPhase) => void,
    private readonly credit: (receipt: string) => Promise<void>,
  ) {}
  private set(phase: AdPhase) {
    this.phase = phase;
    this.changed(phase);
  }
  getPhase() {
    return this.phase;
  }
  load(receipt: string, create: (events: RewardedEvents) => RewardedHandle) {
    this.reset();
    const epoch = this.epoch;
    const active = () => epoch === this.epoch;
    this.credited = false;
    this.set("loading");
    try {
      this.handle = create({
        loaded: () => {
          if (active() && this.phase === "loading") this.set("ready");
        },
        earned: () => {
          if (!active() || this.phase !== "showing" || this.credited) return;
          this.credited = true;
          this.set("earned");
          void this.credit(receipt).catch(() => {
            if (active()) this.set("error");
          });
        },
        closed: () => {
          if (active() && (this.phase === "showing" || this.phase === "earned"))
            this.set("closed");
        },
        failed: () => {
          if (active()) this.set("error");
        },
      });
      this.handle.load();
    } catch {
      this.set("error");
    }
  }
  async show() {
    if (this.phase !== "ready" || !this.handle) return false;
    const epoch = this.epoch;
    this.set("showing");
    try {
      await this.handle.show();
      return true;
    } catch {
      if (epoch === this.epoch) this.set("error");
      return false;
    }
  }
  reset() {
    this.epoch++;
    this.handle?.destroy();
    this.handle = null;
    this.set("idle");
  }
}
