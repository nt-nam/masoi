// PRNG mulberry32 — deterministic theo seed (PLAN §6: cấm Math.random trong engine).
// State là 1 số nguyên 32-bit, lưu trong EngineState để cùng seed + cùng log → cùng kết quả.

export function rngNext(state: number): { value: number; next: number } {
  const next = (state + 0x6d2b79f5) | 0;
  let t = next;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { value, next };
}

export function rngInt(state: number, maxExclusive: number): { value: number; next: number } {
  const r = rngNext(state);
  return { value: Math.floor(r.value * maxExclusive), next: r.next };
}

export function rngShuffle<T>(state: number, input: readonly T[]): { value: T[]; next: number } {
  const arr = [...input];
  let s = state;
  for (let i = arr.length - 1; i > 0; i--) {
    const r = rngInt(s, i + 1);
    s = r.next;
    const tmp = arr[i]!;
    arr[i] = arr[r.value]!;
    arr[r.value] = tmp;
  }
  return { value: arr, next: s };
}

export function rngPick<T>(state: number, arr: readonly T[]): { value: T; next: number } {
  const r = rngInt(state, arr.length);
  return { value: arr[r.value]!, next: r.next };
}
