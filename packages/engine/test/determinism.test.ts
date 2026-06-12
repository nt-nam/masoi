import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { buildRoleSet, TIMER_PRESETS, type GameConfig } from '@masoi/shared';
import {
  advance,
  buildView,
  createGame,
  currentActors,
  submitAction,
  type EngineState,
} from '../src/index.js';

/**
 * Driver tự chơi deterministic: mọi lựa chọn suy ra từ (seed, vòng lặp, ghế).
 * Dùng cho 2 property: (1) ván luôn kết thúc, không deadlock pha; (2) cùng seed → cùng kết quả.
 */
function autoPlay(seed: number): EngineState {
  const n = 10;
  const config: GameConfig = { playerCount: n, roles: buildRoleSet(n), timers: TIMER_PRESETS.fast };
  let s = createGame(
    config,
    Array.from({ length: n }, (_, i) => ({ name: `P${i}`, avatar: i, isBot: true })),
    seed,
  );
  for (let i = 0; i < 800 && s.phase.kind !== 'gameOver'; i++) {
    for (const seat of currentActors(s)) {
      const prompt = buildView(s, seat).you?.prompt;
      if (!prompt) continue;
      const pick = (arr: number[]) => (arr.length ? arr[(seed + i + seat) % arr.length]! : null);
      let r: ReturnType<typeof submitAction> | null = null;
      switch (prompt.step) {
        case 'seer':
          if (prompt.chosen == null) r = submitAction(s, { type: 'seer', seat, target: pick(prompt.validTargets)! });
          break;
        case 'guard':
          r = submitAction(s, { type: 'guard', seat, target: pick(prompt.validTargets)! });
          break;
        case 'wolves':
          // bầy thống nhất: mọi Sói cùng chọn mục tiêu đầu danh sách
          r = submitAction(s, { type: 'wolfVote', seat, target: prompt.validTargets[0]! });
          break;
        case 'witch':
          if (prompt.witch && !(prompt.witch.save || prompt.witch.poisonTarget !== null)) {
            r = submitAction(s, { type: 'witch', seat, save: prompt.witch.canSave, poisonTarget: null });
          }
          break;
        case 'vote':
          r = submitAction(s, { type: 'vote', seat, target: prompt.validTargets[0]! });
          break;
        case 'hunterShoot':
          r = submitAction(s, { type: 'hunterShoot', seat, target: pick(prompt.validTargets) });
          break;
        case 'speak':
          r = submitAction(s, { type: 'speakDone', seat });
          break;
      }
      if (r) {
        if (r.error) throw new Error(`auto-play lỗi: ${r.error} (step ${prompt.step})`);
        s = r.state;
      }
      if ((s.phase.kind as string) === 'gameOver') break;
    }
    if (s.phase.kind !== 'gameOver') s = advance(s); // đường timeout của server
  }
  return s;
}

describe('Determinism & kết thúc ván (PLAN §6.5, case 18)', () => {
  it('cùng seed → cùng toàn bộ diễn biến và kết quả', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100000 }), (seed) => {
        const a = autoPlay(seed);
        const b = autoPlay(seed);
        expect(a.phase.kind).toBe('gameOver');
        expect(JSON.stringify(a)).toBe(JSON.stringify(b));
      }),
      { numRuns: 20 },
    );
  });

  it('ván random luôn kết thúc trong giới hạn (không deadlock pha)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100000 }), (seed) => {
        expect(autoPlay(seed).winner).not.toBeNull();
      }),
      { numRuns: 20 },
    );
  });

  it('chia vai phụ thuộc seed (xáo trộn có seed)', () => {
    const n = 10;
    const config: GameConfig = { playerCount: n, roles: buildRoleSet(n), timers: TIMER_PRESETS.fast };
    const seats = Array.from({ length: n }, (_, i) => ({ name: `P${i}`, avatar: i, isBot: false }));
    const a = createGame(config, seats, 1);
    const b = createGame(config, seats, 1);
    const c = createGame(config, seats, 2);
    expect(a.players.map((p) => p.role)).toEqual(b.players.map((p) => p.role));
    expect(
      [1, 2, 3, 4, 5].some((seed) => {
        const d = createGame(config, seats, seed);
        return JSON.stringify(d.players.map((p) => p.role)) !== JSON.stringify(c.players.map((p) => p.role));
      }),
    ).toBe(true);
  });
});
