import type { DeathCause, GameConfig, NightStepId, Winner } from '@masoi/shared';
import { MERCY } from '@masoi/shared';
import { clone } from './clone.js';
import { rngShuffle } from './rng.js';
import {
  alivePlayers,
  aliveSeats,
  aliveWolves,
  emptyNight,
  playerAt,
  type AfterDeathsResume,
  type EngineState,
} from './state.js';

export interface SeatInfo {
  name: string;
  avatar: number;
  isBot: boolean;
}

export function createGame(config: GameConfig, seats: SeatInfo[], seed: number): EngineState {
  if (seats.length !== config.playerCount || config.roles.length !== config.playerCount) {
    throw new Error('Số ghế / số vai không khớp playerCount');
  }
  const shuffled = rngShuffle(seed | 0, config.roles);
  return {
    config,
    seed,
    rng: shuffled.next,
    players: seats.map((s, i) => {
      const role = shuffled.value[i]!;
      return {
        seat: i,
        name: s.name,
        avatar: s.avatar,
        isBot: s.isBot,
        role,
        faction: role === 'werewolf' ? ('wolves' as const) : ('village' as const),
        alive: true,
        connected: true,
        deathCause: null,
      };
    }),
    nightNumber: 0,
    dayNumber: 0,
    phase: { kind: 'roleReveal' },
    nightPlan: [],
    night: emptyNight(),
    potions: { heal: true, poison: true },
    lastGuardTarget: null,
    seerResults: [],
    speakOrder: [],
    spoken: [],
    votes: {},
    lastBallots: [],
    lastLynched: null,
    pendingAnnounce: [],
    pendingHunters: [],
    accusals: {},
    winner: null,
  };
}

/** Dựng plan đêm từ CONFIG (không từ aliveness) — thời lượng đêm không tố cáo vai nào đã chết. */
export function buildNightPlan(config: GameConfig, nightNumber: number): NightStepId[] {
  if (nightNumber === 0) return ['wolvesReveal']; // Đêm 0 chỉ khởi tạo (Mục 5 luật)
  const plan: NightStepId[] = [];
  if (config.roles.includes('seer')) plan.push('seer');
  if (config.roles.includes('guard')) plan.push('guard');
  plan.push('wolves');
  if (config.roles.includes('witch')) plan.push('witch');
  return plan;
}

export function currentNightStep(state: EngineState): NightStepId | null {
  if (state.phase.kind !== 'night') return null;
  return state.nightPlan[state.phase.stepIndex] ?? null;
}

export function currentSpeaker(state: EngineState): number | null {
  if (state.phase.kind !== 'dayDiscuss') return null;
  return state.speakOrder[state.phase.speakIndex] ?? null;
}

/** Ghế phải hành động ở pha/bước hiện tại (để server gửi action:required + đánh thức bot). */
export function currentActors(state: EngineState): number[] {
  const step = currentNightStep(state);
  if (step) {
    switch (step) {
      case 'wolvesReveal':
        return [];
      case 'seer':
        return state.players.filter((p) => p.alive && p.role === 'seer').map((p) => p.seat);
      case 'guard':
        return state.players.filter((p) => p.alive && p.role === 'guard').map((p) => p.seat);
      case 'wolves':
        return aliveWolves(state).map((p) => p.seat);
      case 'witch':
        return state.players.filter((p) => p.alive && p.role === 'witch').map((p) => p.seat);
    }
  }
  switch (state.phase.kind) {
    case 'hunterShot':
      return [state.phase.hunterSeat];
    case 'dayDiscuss': {
      const s = currentSpeaker(state);
      return s === null ? [] : [s];
    }
    case 'dayVote':
      return aliveSeats(state);
    default:
      return [];
  }
}

/** Key tra thời lượng trong TimerPreset cho pha hiện tại (null = không hẹn giờ). */
export function durationKey(
  state: EngineState,
):
  | 'roleReveal'
  | 'wolvesReveal'
  | 'nightStep'
  | 'wolves'
  | 'witch'
  | 'announce'
  | 'hunter'
  | 'speak'
  | 'vote'
  | 'voteResult'
  | null {
  switch (state.phase.kind) {
    case 'roleReveal':
      return 'roleReveal';
    case 'night': {
      const step = currentNightStep(state);
      if (step === 'wolvesReveal') return 'wolvesReveal';
      if (step === 'wolves') return 'wolves';
      if (step === 'witch') return 'witch';
      return 'nightStep';
    }
    case 'dayAnnounce':
      return 'announce';
    case 'hunterShot':
      return 'hunter';
    case 'dayDiscuss':
      return 'speak';
    case 'dayVote':
      return 'vote';
    case 'voteResult':
      return 'voteResult';
    case 'gameOver':
      return null;
  }
}

/** Pha hiện tại đã đủ input để chốt sớm chưa (server vẫn cộng đệm nhỏ trước khi advance). */
export function readyToAdvance(state: EngineState): boolean {
  const step = currentNightStep(state);
  if (step) {
    const actors = currentActors(state);
    if (step === 'wolvesReveal') return false;
    if (actors.length === 0) return true; // vai chết/không có → bỏ qua (server cộng đệm 3–6s)
    switch (step) {
      case 'seer':
        return state.night.seerTarget !== null;
      case 'guard':
        return state.night.guardTarget !== null;
      case 'wolves':
        return actors.every((seat) => state.night.wolfVotes[seat] !== undefined);
      case 'witch':
        return state.night.witchDone;
      default:
        return false;
    }
  }
  return false;
}

export function checkWin(state: EngineState): Winner | null {
  const wolves = aliveWolves(state).length;
  const others = alivePlayers(state).length - wolves;
  if (wolves === 0) return 'village';
  if (wolves >= others) return 'wolves';
  return null;
}

/** Đánh dấu chết + xếp hàng Thợ săn. KHÔNG kiểm thắng ở đây (luật vàng: hết dây chuyền mới kiểm). */
export function applyDeaths(
  state: EngineState,
  deaths: Array<{ seat: number; cause: DeathCause }>,
): Array<{ seat: number; cause: DeathCause }> {
  const applied: Array<{ seat: number; cause: DeathCause }> = [];
  for (const d of deaths) {
    const p = playerAt(state, d.seat);
    if (!p.alive) continue;
    p.alive = false;
    p.deathCause = d.cause;
    applied.push(d);
    // Thợ săn chết vì BẤT KỲ lý do gì đều được bắn — trừ khi chính họ rời ván (vắng mặt = bỏ lượt, Mục 11.3)
    if (p.role === 'hunter' && d.cause !== 'leave') {
      state.pendingHunters.push(p.seat);
    }
  }
  return applied;
}

export function startNight(state: EngineState, nightNumber: number): void {
  state.nightNumber = nightNumber;
  state.lastGuardTarget = state.night.guardTarget;
  state.night = emptyNight();
  state.nightPlan = buildNightPlan(state.config, nightNumber);
  state.phase = { kind: 'night', stepIndex: 0 };
}

function startDiscuss(state: EngineState): void {
  const shuffled = rngShuffle(state.rng, aliveSeats(state));
  state.rng = shuffled.next;
  state.speakOrder = shuffled.value;
  state.spoken = [];
  state.phase = { kind: 'dayDiscuss', speakIndex: 0 };
}

/**
 * Luật vàng (Mục 9): xử lý HẾT dây chuyền (Thợ săn bắn) rồi mới kiểm thắng,
 * thứ tự kiểm: độc lập → Sói → Dân (GĐ1 chưa có phe độc lập).
 */
export function proceedAfterDeaths(state: EngineState, resume: AfterDeathsResume): void {
  const hunter = state.pendingHunters.shift();
  if (hunter !== undefined) {
    state.phase = { kind: 'hunterShot', hunterSeat: hunter, resume };
    return;
  }
  const winner = checkWin(state);
  if (winner) {
    state.winner = winner;
    state.phase = { kind: 'gameOver', winner };
    return;
  }
  if (resume === 'afterAnnounce') startDiscuss(state);
  else startNight(state, state.nightNumber + 1);
}

export function computeWolfVictim(state: EngineState): number | null {
  const votes = Object.entries(state.night.wolfVotes)
    .filter(([seat]) => {
      const p = state.players[Number(seat)];
      return p?.alive && p.faction === 'wolves';
    })
    .map(([, target]) => target);
  if (votes.length === 0) return null;
  const counts = new Map<number, number>();
  for (const t of votes) counts.set(t, (counts.get(t) ?? 0) + 1);
  let best: number | null = null;
  let bestCount = 0;
  let tie = false;
  for (const [seat, c] of counts) {
    if (c > bestCount) {
      best = seat;
      bestCount = c;
      tie = false;
    } else if (c === bestCount) {
      tie = true;
    }
  }
  return tie ? null : best; // hòa/không phiếu → đêm đó không ai bị cắn (Mục 6)
}

/** Pipeline xử lý đêm — thứ tự cố định theo PLAN §6.3. */
function resolveNight(state: EngineState): void {
  const deaths: Array<{ seat: number; cause: DeathCause }> = [];
  const victim = state.night.wolfVictim;
  if (victim !== null && playerAt(state, victim).alive) {
    const blockedByGuard = state.night.guardTarget === victim;
    const savedByWitch = state.night.witchSave; // bình đã tiêu lúc submit, kể cả khi nạn nhân được Bảo vệ chặn (O7)
    if (!blockedByGuard && !savedByWitch) deaths.push({ seat: victim, cause: 'night' });
  }
  const poison = state.night.witchPoisonTarget;
  if (poison !== null && playerAt(state, poison).alive && !deaths.some((d) => d.seat === poison)) {
    deaths.push({ seat: poison, cause: 'night' }); // Độc xuyên Bảo vệ (Mục 9)
  }
  const applied = applyDeaths(state, deaths);
  state.pendingAnnounce = applied;
  state.dayNumber = state.nightNumber + 1;
  state.accusals = {};
  state.votes = {};
  state.phase = { kind: 'dayAnnounce' };
}

function tallyVotes(state: EngineState): void {
  const ballots = aliveSeats(state).map((seat) => ({
    voter: seat,
    target: state.votes[seat] ?? null,
  }));
  let mercyCount = 0;
  const seatCounts = new Map<number, number>();
  for (const b of ballots) {
    if (b.target === null || b.target === MERCY) mercyCount++; // không bỏ phiếu = phiếu trắng = Tha (Mục 7.3)
    else seatCounts.set(b.target, (seatCounts.get(b.target) ?? 0) + 1);
  }
  let leader: number | null = null;
  let leaderCount = 0;
  let tie = false;
  for (const [seat, c] of seatCounts) {
    if (c > leaderCount) {
      leader = seat;
      leaderCount = c;
      tie = false;
    } else if (c === leaderCount) {
      tie = true;
    }
  }
  // Treo khi: có người dẫn đầu duy nhất VÀ nhiều phiếu hơn "Tha" (hòa với Tha cũng là hòa → không treo)
  const lynched = leader !== null && !tie && leaderCount > mercyCount ? leader : null;
  state.lastBallots = ballots;
  state.lastLynched = lynched;
  if (lynched !== null) applyDeaths(state, [{ seat: lynched, cause: 'lynch' }]);
  state.phase = { kind: 'voteResult' };
}

function nextSpeaker(state: EngineState): void {
  if (state.phase.kind !== 'dayDiscuss') return;
  const cur = currentSpeaker(state);
  if (cur !== null) state.spoken.push(cur);
  let idx = state.phase.speakIndex + 1;
  while (idx < state.speakOrder.length && !playerAt(state, state.speakOrder[idx]!).alive) idx++;
  if (idx < state.speakOrder.length) {
    state.phase = { kind: 'dayDiscuss', speakIndex: idx };
    return;
  }
  // Hết lượt nói → Ngày 1 không biểu quyết (Mục 7.3), từ Ngày 2 mới vote
  if (state.dayNumber >= 2) {
    state.votes = {};
    state.phase = { kind: 'dayVote' };
  } else {
    startNight(state, state.nightNumber + 1);
  }
}

/** Server gọi khi hết giờ pha/bước (hoặc sau khi readyToAdvance + đệm). Trả về state MỚI. */
export function advance(state: EngineState): EngineState {
  const s = clone(state);
  switch (s.phase.kind) {
    case 'roleReveal':
      startNight(s, 0);
      return s;
    case 'night': {
      const step = s.nightPlan[s.phase.stepIndex];
      if (step === 'wolves') s.night.wolfVictim = computeWolfVictim(s);
      const nextIndex = s.phase.stepIndex + 1;
      if (nextIndex >= s.nightPlan.length) {
        // đảm bảo victim được chốt cả khi plan không có bước witch
        if (s.night.wolfVictim === null && step !== 'wolves' && s.nightPlan.includes('wolves')) {
          s.night.wolfVictim = computeWolfVictim(s);
        }
        if (s.nightNumber === 0) {
          // Đêm 0: KHÔNG ai chết (Mục 5)
          s.dayNumber = 1;
          s.accusals = {};
          s.pendingAnnounce = [];
          s.phase = { kind: 'dayAnnounce' };
        } else {
          resolveNight(s);
        }
      } else {
        s.phase = { kind: 'night', stepIndex: nextIndex };
      }
      return s;
    }
    case 'dayAnnounce':
      proceedAfterDeaths(s, 'afterAnnounce');
      return s;
    case 'hunterShot':
      // hết giờ chưa bắn = bỏ lượt (Mục 11.3)
      proceedAfterDeaths(s, s.phase.resume);
      return s;
    case 'dayDiscuss':
      nextSpeaker(s);
      return s;
    case 'dayVote':
      tallyVotes(s);
      return s;
    case 'voteResult':
      proceedAfterDeaths(s, 'afterVote');
      return s;
    case 'gameOver':
      return s;
  }
}

export { nextSpeaker };
