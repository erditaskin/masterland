import { useEffect, useState } from "react";
import { energyCountdown, type Save } from "../game/engine";
import { Label } from "./Controls";
export function EnergyTimer({ save }: { save: Save }) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (save.stamina >= 100) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [save.stamina, save.energyAt]);
  const countdown = energyCountdown(save, now);
  return countdown ? (
    <Label size={9} color="#fff2ca" style={{ textAlign: "center" }}>
      100’e {countdown}
    </Label>
  ) : null;
}
