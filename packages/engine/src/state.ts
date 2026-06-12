import type {
  DeathCause,
  Faction,
  GameConfig,
  NightStepId,
  RoleId,
  VoteTarget,
  Winner,
} from '@masoi/shared';

export interface EnginePlayer {
  seat: number;
  name: string;
  avatar: number;
  isBot: boolean;
  role: RoleId;
  faction: Faction;
  alive: boolean;
  connected: boolean;
  deathCause: DeathCause | null;
}

export type AfterDeathsResume = 'afterAnnounce' | 'afterVote';

export type EnginePhase =
  | { kind: 'roleReveal' }
  | { kind: 'night'; stepIndex: number }
  | { kind: 'dayAnnounce' }
  | { kind: 'hunterShot'; hunterSeat: number; resume: AfterDeathsResume }
  | { kind: 'dayDiscuss'; speakIndex: number }
  | { kind: 'dayVote' }
  | { kind: 'voteResult' }
  | { kind: 'gameOver'; winner: Winner };

export interface NightContext {
  seerTarget: number | null;
  guardTarget: number | null;
  /** Phiếu nội bộ Sói: seat sói → seat mục tiêu. */
  wolfVotes: Record<number, number>;
  /** Nạn nhân chốt theo đa số khi đóng bước Sói (hòa/không phiếu → null). */
  wolfVictim: number | null;
  witchSave: boolean;
  witchPoisonTarget: number | null;
  witchDone: boolean;
}

export interface EngineState {
  config: GameConfig;
  seed: number;
  rng: number;
  players: EnginePlayer[];
  /** Đêm hiện tại/vừa qua (Đêm 0 = khởi tạo). */
  nightNumber: number;
  /** Ngày hiện tại (Ngày d theo sau Đêm d-1). 0 = chưa tới ngày nào. */
  dayNumber: number;
  phase: EnginePhase;
  /** Các bước của đêm hiện tại — dựng từ CONFIG (không từ aliveness) để thời lượng không tố cáo ai chết. */
  nightPlan: NightStepId[];
  night: NightContext;
  potions: { heal: boolean; poison: boolean };
  /** Người Bảo vệ đã giữ ĐÊM LIỀN TRƯỚC (luật không giữ 1 người 2 đêm liền). */
  lastGuardTarget: number | null;
  seerResults: Array<{ night: number; seat: number; isWolf: boolean }>;
  speakOrder: number[];
  spoken: number[];
  votes: Record<number, VoteTarget | null>;
  lastBallots: Array<{ voter: number; target: VoteTarget | null }>;
  lastLynched: number | null;
  /** Danh sách chết chờ công bố sáng nay (gộp 1 danh sách — Mục 7.1). */
  pendingAnnounce: Array<{ seat: number; cause: DeathCause }>;
  /** Thợ săn chết chưa bắn — xử lý interrupt theo thứ tự. */
  pendingHunters: number[];
  accusals: Record<number, number>;
  winner: Winner | null;
}

export function emptyNight(): NightContext {
  return {
    seerTarget: null,
    guardTarget: null,
    wolfVotes: {},
    wolfVictim: null,
    witchSave: false,
    witchPoisonTarget: null,
    witchDone: false,
  };
}

export function alivePlayers(state: EngineState): EnginePlayer[] {
  return state.players.filter((p) => p.alive);
}

export function aliveSeats(state: EngineState): number[] {
  return alivePlayers(state).map((p) => p.seat);
}

export function playerAt(state: EngineState, seat: number): EnginePlayer {
  const p = state.players[seat];
  if (!p) throw new Error(`Seat ${seat} không tồn tại`);
  return p;
}

export function aliveWolves(state: EngineState): EnginePlayer[] {
  return state.players.filter((p) => p.alive && p.faction === 'wolves');
}

export function aliveWithRole(state: EngineState, role: RoleId): EnginePlayer[] {
  return state.players.filter((p) => p.alive && p.role === role);
}
