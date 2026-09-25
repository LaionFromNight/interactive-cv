function parseHex(hex: string) {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((char) => char + char)
          .join("")
      : value;

  return [0, 2, 4].map((offset) => parseInt(full.slice(offset, offset + 2), 16));
}

function toHex(channels: number[]) {
  return `#${channels
    .map((channel) =>
      Math.round(Math.min(255, Math.max(0, channel)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`.toUpperCase();
}

/** Linear blend of two hex colors. `amount` = 0 returns `from`, 1 returns `to`. */
export function mix(from: string, to: string, amount: number) {
  const a = parseHex(from);
  const b = parseHex(to);

  return toHex(a.map((channel, index) => channel + (b[index] - channel) * amount));
}

function relativeLuminance(hex: string) {
  const [r, g, b] = parseHex(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);

  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Lightens `color` towards white until it reaches the requested contrast on `background`. */
export function ensureContrast(color: string, background: string, ratio = 4.5) {
  const target = relativeLuminance(background) < 0.5 ? "#FFFFFF" : "#000000";
  let result = color;

  for (let step = 1; step <= 10 && contrastRatio(result, background) < ratio; step += 1) {
    result = mix(color, target, step / 10);
  }

  return result;
}
