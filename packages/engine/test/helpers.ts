import { TIMER_PRESETS, type GameConfig, type RoleId } from '@masoi/shared';
import {
  advance,
  createGame,
  currentNightStep,
  submitAction,
  type EngineAction,
  type EngineState,
} from '../src/index.js';

/** Tạo ván với vai GÁN CỐ ĐỊNH theo thứ tự ghế (bỏ qua xáo trộn) để test dễ đọc. */
export function makeGame(roles: RoleId[], seed = 42): EngineState {
  const config: GameConfig = {
    playerCount: roles.length,
    roles,
    timers: TIMER_PRESETS.standard,
  };
  const state = createGame(
    config,
    roles.map((_, i) => ({ name: `P${i}`, avatar: i, isBot: false })),
    seed,
  );
  state.players.forEach((p, i) => {
    p.role = roles[i]!;
    p.faction = roles[i] === 'werewolf' ? 'wolves' : 'village';
  });
  return state;
}

export function mustSubmit(state: EngineState, action: EngineAction): EngineState {
  const r = submitAction(state, action);
  if (r.error) throw new Error(`submit ${action.type} lỗi: ${r.error}`);
  return r.state;
}

/** Advance cho tới khi thoả điều kiện (mô phỏng server hết giờ liên tiếp). */
export function advanceUntil(
  state: EngineState,
  pred: (s: EngineState) => boolean,
  max = 60,
): EngineState {
  let s = state;
  for (let i = 0; i < max; i++) {
    if (pred(s)) return s;
    if (s.phase.kind === 'gameOver') throw new Error('Ván đã kết thúc trước khi đạt điều kiện');
    s = advance(s);
  }
  throw new Error('advanceUntil vượt giới hạn — có thể deadlock pha');
}

/** Từ đầu ván chạy thẳng tới bước đêm cụ thể của Đêm 1. */
export function toNight1Step(state: EngineState, step: string): EngineState {
  return advanceUntil(state, (s) => s.nightNumber === 1 && currentNightStep(s) === step);
}

/** Chạy qua hết pha thảo luận hiện tại (skip mọi lượt nói). */
export function skipDiscuss(state: EngineState): EngineState {
  return advanceUntil(state, (s) => s.phase.kind !== 'dayDiscuss');
}
