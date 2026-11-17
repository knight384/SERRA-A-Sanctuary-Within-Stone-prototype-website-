export const clamp = (v: number, min = 0, max = 1): number =>
  Math.max(min, Math.min(max, v));

export const smooth = (a: number, b: number, v: number): number => {
  if (a === b) return v >= a ? 1 : 0;
  const x = clamp((v - a) / (b - a));
  return x * x * (3 - 2 * x);
};
