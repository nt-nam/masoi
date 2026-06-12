import type { RoleId } from './ids.js';

export const MIN_PLAYERS = 5;
export const MAX_PLAYERS = 18;

/** Bảng số Sói chuẩn theo dải người (Mục 4 luật). */
export function wolfCount(n: number): number {
  if (n <= 7) return 1;
  if (n <= 11) return 2;
  if (n <= 15) return 3;
  if (n <= 18) return 4;
  return Math.max(1, Math.floor(n / 4));
}

/**
 * Bộ vai tự gợi ý theo số người (GĐ1, 6 vai core):
 * Tiên tri luôn có; Bảo vệ + Phù thủy từ 8; Thợ săn từ 10; còn lại Dân.
 */
export function buildRoleSet(n: number): RoleId[] {
  if (n < MIN_PLAYERS || n > MAX_PLAYERS) {
    throw new Error(`Số người chơi phải từ ${MIN_PLAYERS} đến ${MAX_PLAYERS}`);
  }
  const roles: RoleId[] = [];
  for (let i = 0; i < wolfCount(n); i++) roles.push('werewolf');
  roles.push('seer');
  if (n >= 8) roles.push('guard', 'witch');
  if (n >= 10) roles.push('hunter');
  while (roles.length < n) roles.push('villager');
  return roles;
}

export type TimerPresetId = 'fast' | 'standard' | 'slow';

/** Thời lượng (giây) cho từng loại bước/pha. */
export interface TimerPreset {
  roleReveal: number;
  wolvesReveal: number;
  nightStep: number; // seer, guard
  wolves: number;
  witch: number;
  announce: number;
  hunter: number;
  speak: number; // mỗi lượt nói
  vote: number;
  voteResult: number;
}

export const TIMER_PRESETS: Record<TimerPresetId, TimerPreset> = {
  fast: { roleReveal: 8, wolvesReveal: 8, nightStep: 20, wolves: 35, witch: 25, announce: 6, hunter: 20, speak: 20, vote: 30, voteResult: 7 },
  standard: { roleReveal: 10, wolvesReveal: 12, nightStep: 30, wolves: 60, witch: 30, announce: 9, hunter: 30, speak: 35, vote: 45, voteResult: 8 },
  slow: { roleReveal: 15, wolvesReveal: 15, nightStep: 45, wolves: 90, witch: 45, announce: 12, hunter: 45, speak: 60, vote: 60, voteResult: 10 },
};

export interface GameConfig {
  playerCount: number;
  roles: RoleId[];
  timers: TimerPreset;
}

export interface RoomConfig {
  maxPlayers: number; // 5..18
  timerPreset: TimerPresetId;
  isPublic: boolean;
}
