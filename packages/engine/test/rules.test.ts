import { describe, expect, it } from 'vitest';
import { MERCY, type RoleId } from '@masoi/shared';
import { advance, checkWin, currentNightStep, submitAction } from '../src/index.js';
import { advanceUntil, makeGame, mustSubmit, skipDiscuss, toNight1Step } from './helpers.js';

// Ghế: 0=Sói, 1=Tiên tri, 2=Bảo vệ, 3=Phù thủy, 4=Thợ săn, 5=Dân
const BASE: RoleId[] = ['werewolf', 'seer', 'guard', 'witch', 'hunter', 'villager'];

describe('Vòng đời pha (Mục 5 luật)', () => {
  it('Đêm 0 chỉ khởi tạo, không ai chết; Ngày 1 không biểu quyết', () => {
    let s = makeGame(BASE);
    expect(s.phase.kind).toBe('roleReveal');
    s = advance(s); // → Đêm 0
    expect(s.phase.kind).toBe('night');
    expect(s.nightPlan).toEqual(['wolvesReveal']);
    s = advance(s); // → sáng Ngày 1
    expect(s.phase.kind).toBe('dayAnnounce');
    expect(s.pendingAnnounce).toEqual([]);
    s = advance(s); // → thảo luận
    expect(s.phase.kind).toBe('dayDiscuss');
    expect(s.speakOrder).toHaveLength(6); // mọi người sống đều có lượt
    s = skipDiscuss(s);
    // Ngày 1 KHÔNG vote → vào thẳng Đêm 1
    expect(s.phase.kind).toBe('night');
    expect(s.nightNumber).toBe(1);
    expect(s.nightPlan).toEqual(['seer', 'guard', 'wolves', 'witch']);
  });

  it('từ Ngày 2 mới có biểu quyết', () => {
    let s = toNight1Step(makeGame(BASE), 'seer');
    s = advanceUntil(s, (x) => x.phase.kind === 'dayDiscuss' && x.dayNumber === 2);
    s = skipDiscuss(s);
    expect(s.phase.kind).toBe('dayVote');
  });
});

describe('Đêm: Sói + Bảo vệ + Phù thủy (ma trận §6.7)', () => {
  it('Sói cắn không ai chặn → nạn nhân chết, công bố không lộ vai', () => {
    let s = toNight1Step(makeGame(BASE), 'wolves');
    s = mustSubmit(s, { type: 'wolfVote', seat: 0, target: 5 });
    s = advanceUntil(s, (x) => x.phase.kind === 'dayAnnounce');
    expect(s.pendingAnnounce).toEqual([{ seat: 5, cause: 'night' }]);
    expect(s.players[5]!.alive).toBe(false);
  });

  it('Bảo vệ trùng nạn nhân → sống sót (case 1)', () => {
    let s = toNight1Step(makeGame(BASE), 'guard');
    s = mustSubmit(s, { type: 'guard', seat: 2, target: 5 });
    s = advanceUntil(s, (x) => currentNightStep(x) === 'wolves');
    s = mustSubmit(s, { type: 'wolfVote', seat: 0, target: 5 });
    s = advanceUntil(s, (x) => x.phase.kind === 'dayAnnounce');
    expect(s.players[5]!.alive).toBe(true);
    expect(s.pendingAnnounce).toEqual([]); // đêm yên bình
  });

  it('Bảo vệ KHÔNG chặn được Bình Độc (case 2)', () => {
    let s = toNight1Step(makeGame(BASE), 'guard');
    s = mustSubmit(s, { type: 'guard', seat: 2, target: 5 });
    s = advanceUntil(s, (x) => currentNightStep(x) === 'witch');
    s = mustSubmit(s, { type: 'witch', seat: 3, save: false, poisonTarget: 5 });
    s = advanceUntil(s, (x) => x.phase.kind === 'dayAnnounce');
    expect(s.players[5]!.alive).toBe(false); // độc xuyên bảo vệ
  });

  it('Phù thủy cứu nạn nhân → sống; bình cứu tiêu hao (case 3)', () => {
    let s = toNight1Step(makeGame(BASE), 'wolves');
    s = mustSubmit(s, { type: 'wolfVote', seat: 0, target: 5 });
    s = advanceUntil(s, (x) => currentNightStep(x) === 'witch');
    s = mustSubmit(s, { type: 'witch', seat: 3, save: true, poisonTarget: null });
    s = advanceUntil(s, (x) => x.phase.kind === 'dayAnnounce');
    expect(s.players[5]!.alive).toBe(true);
    expect(s.potions.heal).toBe(false);
  });

  it('Phù thủy TỰ cứu được; KHÔNG tự đầu độc được (case 3)', () => {
    let s = toNight1Step(makeGame(BASE), 'wolves');
    s = mustSubmit(s, { type: 'wolfVote', seat: 0, target: 3 });
    s = advanceUntil(s, (x) => currentNightStep(x) === 'witch');
    expect(submitAction(s, { type: 'witch', seat: 3, save: false, poisonTarget: 3 }).error).toBe(
      'INVALID_TARGET',
    );
    s = mustSubmit(s, { type: 'witch', seat: 3, save: true, poisonTarget: null });
    s = advanceUntil(s, (x) => x.phase.kind === 'dayAnnounce');
    expect(s.players[3]!.alive).toBe(true);
  });

  it('O7: cứu người đã được Bảo vệ chặn → bình vẫn tiêu', () => {
    let s = toNight1Step(makeGame(BASE), 'guard');
    s = mustSubmit(s, { type: 'guard', seat: 2, target: 5 });
    s = advanceUntil(s, (x) => currentNightStep(x) === 'wolves');
    s = mustSubmit(s, { type: 'wolfVote', seat: 0, target: 5 });
    s = advanceUntil(s, (x) => currentNightStep(x) === 'witch');
    s = mustSubmit(s, { type: 'witch', seat: 3, save: true, poisonTarget: null });
    s = advanceUntil(s, (x) => x.phase.kind === 'dayAnnounce');
    expect(s.players[5]!.alive).toBe(true);
    expect(s.potions.heal).toBe(false); // O7
  });

  it('Bảo vệ: không tự giữ, không giữ một người hai đêm liền (case 4)', () => {
    let s = toNight1Step(makeGame(BASE), 'guard');
    expect(submitAction(s, { type: 'guard', seat: 2, target: 2 }).error).toBe('INVALID_TARGET');
    s = mustSubmit(s, { type: 'guard', seat: 2, target: 5 });
    // qua đêm 2
    s = advanceUntil(s, (x) => x.nightNumber === 2 && currentNightStep(x) === 'guard');
    expect(submitAction(s, { type: 'guard', seat: 2, target: 5 }).error).toBe('INVALID_TARGET');
    expect(submitAction(s, { type: 'guard', seat: 2, target: 1 }).error).toBeUndefined();
  });

  it('Sói hòa phiếu nội bộ / không vote → không ai bị cắn (case 8)', () => {
    const roles: RoleId[] = ['werewolf', 'werewolf', 'seer', 'guard', 'witch', 'villager', 'villager', 'villager'];
    let s = toNight1Step(makeGame(roles), 'wolves');
    s = mustSubmit(s, { type: 'wolfVote', seat: 0, target: 5 });
    s = mustSubmit(s, { type: 'wolfVote', seat: 1, target: 6 });
    s = advanceUntil(s, (x) => x.phase.kind === 'dayAnnounce');
    expect(s.pendingAnnounce).toEqual([]);

    // không ai vote
    let s2 = toNight1Step(makeGame(roles), 'wolves');
    s2 = advanceUntil(s2, (x) => x.phase.kind === 'dayAnnounce');
    expect(s2.pendingAnnounce).toEqual([]);
  });

  it('Sói không được cắn Sói; Tiên tri soi đúng (case 10)', () => {
    const roles: RoleId[] = ['werewolf', 'werewolf', 'seer', 'guard', 'witch', 'villager', 'villager', 'villager'];
    let s = toNight1Step(makeGame(roles), 'seer');
    const r1 = submitAction(s, { type: 'seer', seat: 2, target: 0 });
    expect(r1.seerResult).toEqual({ seat: 0, isWolf: true });
    s = r1.state;
    // soi lần 2 trong cùng đêm → từ chối (kết quả đã lộ)
    expect(submitAction(s, { type: 'seer', seat: 2, target: 5 }).error).toBe('INVALID_ACTION');
    s = advanceUntil(s, (x) => currentNightStep(x) === 'wolves');
    expect(submitAction(s, { type: 'wolfVote', seat: 0, target: 1 }).error).toBe('INVALID_TARGET');
  });
});

describe('Biểu quyết treo cổ (Mục 7.3)', () => {
  function toVote(roles: RoleId[] = BASE) {
    let s = toNight1Step(makeGame(roles), 'wolves');
    s = advanceUntil(s, (x) => x.phase.kind === 'dayVote'); // đêm không ai chết → ngày 2 vote
    return s;
  }

  it('nhiều phiếu nhất bị treo (không cần quá bán)', () => {
    let s = toVote();
    s = mustSubmit(s, { type: 'vote', seat: 1, target: 0 });
    s = mustSubmit(s, { type: 'vote', seat: 2, target: 0 });
    s = mustSubmit(s, { type: 'vote', seat: 3, target: 0 });
    s = mustSubmit(s, { type: 'vote', seat: 5, target: 0 }); // 4 phiếu seat0 > 2 phiếu trắng (=Tha)
    s = advance(s); // hết giờ → chốt
    expect(s.phase.kind).toBe('voteResult');
    expect(s.lastLynched).toBe(0);
    expect(s.players[0]!.alive).toBe(false);
    // O1: bảng phiếu công khai đầy đủ
    expect(s.lastBallots).toContainEqual({ voter: 1, target: 0 });
    expect(s.lastBallots).toContainEqual({ voter: 4, target: null });
  });

  it('hòa phiếu → không treo ai (case 14)', () => {
    let s = toVote();
    s = mustSubmit(s, { type: 'vote', seat: 1, target: 0 });
    s = mustSubmit(s, { type: 'vote', seat: 2, target: 5 });
    s = advance(s);
    expect(s.lastLynched).toBeNull();
  });

  it('"Tha" nhiều phiếu nhất hoặc hòa với người dẫn đầu → không treo', () => {
    let s = toVote();
    s = mustSubmit(s, { type: 'vote', seat: 1, target: MERCY });
    s = mustSubmit(s, { type: 'vote', seat: 2, target: MERCY });
    s = mustSubmit(s, { type: 'vote', seat: 3, target: 0 });
    s = advance(s);
    expect(s.lastLynched).toBeNull();

    // Tha hòa người dẫn đầu: 1 Tha + 1 phiếu seat0 + còn lại trắng (=Tha) → không treo
    let s2 = toVote();
    s2 = mustSubmit(s2, { type: 'vote', seat: 1, target: 0 });
    s2 = advance(s2); // 1 phiếu seat0 vs 5 phiếu trắng(Tha) → Tha thắng
    expect(s2.lastLynched).toBeNull();
  });

  it('treo Sói cuối → Dân thắng ngay sau khi xử lý xong (case 14 + thứ tự kiểm thắng)', () => {
    let s = toVote();
    for (const seat of [1, 2, 3, 4, 5]) s = mustSubmit(s, { type: 'vote', seat, target: 0 });
    s = advance(s); // voteResult
    s = advance(s); // proceed → win check
    expect(s.phase.kind).toBe('gameOver');
    expect(s.winner).toBe('village');
  });
});

describe('Thợ săn (case 6, 7)', () => {
  it('chết vì bị cắn → được bắn; phát súng xử lý trước khi kiểm thắng', () => {
    let s = toNight1Step(makeGame(BASE), 'wolves');
    s = mustSubmit(s, { type: 'wolfVote', seat: 0, target: 4 }); // cắn Thợ săn
    s = advanceUntil(s, (x) => x.phase.kind === 'dayAnnounce');
    s = advance(s); // → hunterShot interrupt
    expect(s.phase).toMatchObject({ kind: 'hunterShot', hunterSeat: 4 });
    s = mustSubmit(s, { type: 'hunterShoot', seat: 4, target: 0 }); // bắn trúng Sói
    expect(s.players[0]!.alive).toBe(false);
    expect(s.phase.kind).toBe('gameOver'); // hết Sói → Dân thắng
    expect(s.winner).toBe('village');
  });

  it('bị treo cổ → vẫn được bắn; hết giờ không bắn = bỏ lượt', () => {
    let s = toNight1Step(makeGame(BASE), 'wolves');
    s = advanceUntil(s, (x) => x.phase.kind === 'dayVote');
    for (const seat of [0, 1, 2, 3]) s = mustSubmit(s, { type: 'vote', seat, target: 4 });
    s = advance(s); // voteResult: treo Thợ săn
    expect(s.lastLynched).toBe(4);
    s = advance(s); // → hunterShot
    expect(s.phase).toMatchObject({ kind: 'hunterShot', hunterSeat: 4 });
    s = advance(s); // hết giờ, không bắn
    expect(s.players.filter((p) => !p.alive).map((p) => p.seat)).toEqual([4]);
    expect(s.phase.kind).toBe('night'); // ván tiếp tục sang đêm
  });
});

describe('Điều kiện thắng (Mục 3)', () => {
  it('Sói thắng khi số Sói ≥ số người còn lại', () => {
    const s = makeGame(BASE);
    s.players[1]!.alive = false;
    s.players[2]!.alive = false;
    s.players[3]!.alive = false;
    s.players[4]!.alive = false;
    // còn Sói(0) + Dân(5) → 1 vs 1
    expect(checkWin(s)).toBe('wolves');
  });

  it('hết Sói → Dân thắng', () => {
    const s = makeGame(BASE);
    s.players[0]!.alive = false;
    expect(checkWin(s)).toBe('village');
  });
});

describe('Rời ván giữa chừng (Mục 11.3, case 17)', () => {
  it('rời = chết ngay; Thợ săn rời thì KHÔNG được bắn; kiểm thắng chạy', () => {
    let s = toNight1Step(makeGame(BASE), 'seer');
    s = submitAction(s, { type: 'leave', seat: 4 }).state; // Thợ săn rời
    expect(s.players[4]!.alive).toBe(false);
    expect(s.pendingHunters).toEqual([]);
    expect(s.phase.kind).toBe('night'); // ván tiếp tục

    // rời đến mức Sói áp đảo → game over ngay
    let s2 = toNight1Step(makeGame(BASE), 'seer');
    for (const seat of [1, 2, 3, 4]) s2 = submitAction(s2, { type: 'leave', seat }).state;
    expect(s2.phase.kind).toBe('gameOver');
    expect(s2.winner).toBe('wolves');
  });

  it('người đang nói rời → tự sang lượt kế', () => {
    let s = advanceUntil(makeGame(BASE), (x) => x.phase.kind === 'dayDiscuss');
    const speaker = s.speakOrder[0]!;
    s = submitAction(s, { type: 'leave', seat: speaker }).state;
    if (s.phase.kind === 'dayDiscuss') {
      expect(s.speakOrder[s.phase.speakIndex]).not.toBe(speaker);
    }
  });
});
