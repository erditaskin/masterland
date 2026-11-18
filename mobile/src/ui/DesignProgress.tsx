import { DesignSurface, DesignText, type DesignRect } from "./DesignSpace";
import { useCityTheme } from "./CityThemeProvider";

export function DesignProgress({
  rect,
  value,
  total,
}: {
  rect: DesignRect;
  value: number;
  total: number;
}) {
  const theme = useCityTheme(),
    [x, y, w] = rect;
  const fraction = total > 0 ? Math.max(0, Math.min(1, value / total)) : 0;
  return (
    <>
      <DesignSurface
        rect={[x, y, w, 52]}
        fill="#dfc397"
        stroke={theme.edge}
        radius={26}
      />
      <DesignSurface
        rect={[x + 4, y + 4, (w - 8) * fraction, 44]}
        fill="#83b23e"
        end="#3b851e"
        radius={22}
      />
      <DesignText
        rect={[x, y, w, 52]}
        size={34}
        bold
        color="#fff7db"
        align="center"
      >
        {value} / {total}
      </DesignText>
    </>
  );
}
