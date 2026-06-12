import type { ErrorCode, VoteTarget } from '@masoi/shared';
import { MERCY } from '@masoi/shared';
import { clone } from './clone.js';
import {
  applyDeaths,
  checkWin,
  currentNightStep,
  currentSpeaker,
  nextSpeaker,
  proceedAfterDeaths,
} from './game.js';
import { type EngineState } from './state.js';

export type EngineAction =
  | { type: 'seer'; seat: number; target: number }
  | { type: 'guard'; seat: number; target: number }
  | { type: 'wolfVote'; seat: number; target: number }
  | { type: 'witch'; seat: number; save: boolean; poisonTarget: number | null }
  | { type: 'vote'; seat: number; target: VoteTarget | null }
  | { type: 'speakDone'; seat: number }
  | { type: 'hunterShoot'; seat: number; target: number | null }
  | { type: 'leave'; seat: number };

export interface SubmitResult {
  state: EngineState;
  error?: ErrorCode;
  /** Kết quả soi trả KÍN ngay cho Tiên tri. */
  seerResult?: { seat: number; isWolf: boolean };
}

function fail(state: EngineState, error: ErrorCode): SubmitResult {
  return { state, error };
}

/** Nhận hành động người chơi/bot. Trả state MỚI (state cũ giữ nguyên khi lỗi). */
export function submitAction(state: EngineState, action: EngineAction): SubmitResult {
  if (state.phase.kind === 'gameOver' && action.type !== 'leave') return fail(state, 'PHASE_CLOSED');
  const s = clone(state);
  const actor = s.players[action.seat];
  if (!actor) return fail(state, 'INVALID_ACTION');

  switch (action.type) {
    case 'seer': {
      if (currentNightStep(s) !== 'seer' || actor.role !== 'seer' || !actor.alive)
        return fail(state, 'NOT_YOUR_TURN');
      // Kết quả soi lộ ngay khi chọn → mỗi đêm chỉ chốt MỘT lần, không đổi
      if (s.night.seerTarget !== null) return fail(state, 'INVALID_ACTION');
      const target = s.players[action.target];
      if (!target || !target.alive || target.seat === actor.seat)
        return fail(state, 'INVALID_TARGET');
      s.night.seerTarget = target.seat;
      const isWolf = target.faction === 'wolves';
      s.seerResults.push({ night: s.nightNumber, seat: target.seat, isWolf });
      return { state: s, seerResult: { seat: target.seat, isWolf } };
    }

    case 'guard': {
      if (currentNightStep(s) !== 'guard' || actor.role !== 'guard' || !actor.alive)
        return fail(state, 'NOT_YOUR_TURN');
      const target = s.players[action.target];
      if (!target || !target.alive) return fail(state, 'INVALID_TARGET');
      if (target.seat === actor.seat) return fail(state, 'INVALID_TARGET'); // không tự bảo vệ
      if (target.seat === s.lastGuardTarget) return fail(state, 'INVALID_TARGET'); // không giữ 1 người 2 đêm liền
      s.night.guardTarget = target.seat;
      return { state: s };
    }

    case 'wolfVote': {
      if (currentNightStep(s) !== 'wolves' || actor.faction !== 'wolves' || !actor.alive)
        return fail(state, 'NOT_YOUR_TURN');
      const target = s.players[action.target];
      if (!target || !target.alive || target.faction === 'wolves')
        return fail(state, 'INVALID_TARGET'); // Sói không cắn phe Sói
      s.night.wolfVotes[actor.seat] = target.seat; // đổi phiếu tự do tới khi đóng bước
      return { state: s };
    }

    case 'witch': {
      if (currentNightStep(s) !== 'witch' || actor.role !== 'witch' || !actor.alive)
        return fail(state, 'NOT_YOUR_TURN');
      if (s.night.witchDone) return fail(state, 'INVALID_ACTION'); // quyết định 1 lần/đêm
      if (action.save) {
        if (s.night.wolfVictim === null || !s.potions.heal) return fail(state, 'INVALID_ACTION');
      }
      if (action.poisonTarget !== null) {
        const t = s.players[action.poisonTarget];
        if (!s.potions.poison) return fail(state, 'INVALID_ACTION');
        if (!t || !t.alive || t.seat === actor.seat) return fail(state, 'INVALID_TARGET'); // không tự đầu độc
      }
      s.night.witchSave = action.save;
      s.night.witchPoisonTarget = action.poisonTarget;
      s.night.witchDone = true;
      if (action.save) s.potions.heal = false; // O7: tiêu bình kể cả khi nạn nhân đã được Bảo vệ chặn
      if (action.poisonTarget !== null) s.potions.poison = false;
      return { state: s };
    }

    case 'vote': {
      if (s.phase.kind !== 'dayVote' || !actor.alive) return fail(state, 'PHASE_CLOSED');
      if (action.target === null) {
        delete s.votes[actor.seat];
        return { state: s };
      }
      if (action.target !== MERCY) {
        const t = s.players[action.target];
        if (!t || !t.alive) return fail(state, 'INVALID_TARGET');
      }
      s.votes[actor.seat] = action.target;
      return { state: s };
    }

    case 'speakDone': {
      if (s.phase.kind !== 'dayDiscuss' || currentSpeaker(s) !== actor.seat)
        return fail(state, 'NOT_YOUR_TURN');
      nextSpeaker(s);
      return { state: s };
    }

    case 'hunterShoot': {
      if (s.phase.kind !== 'hunterShot' || s.phase.hunterSeat !== actor.seat)
        return fail(state, 'NOT_YOUR_TURN');
      const resume = s.phase.resume;
      if (action.target !== null) {
        const t = s.players[action.target];
        if (!t || !t.alive || t.seat === actor.seat) return fail(state, 'INVALID_TARGET');
        applyDeaths(s, [{ seat: t.seat, cause: 'hunter' }]);
      }
      proceedAfterDeaths(s, resume);
      return { state: s };
    }

    case 'leave': {
      actor.connected = false;
      if (!actor.alive || s.phase.kind === 'gameOver') return { state: s };
      // Rời hẳn giữa ván = chết ngay + kích hoạt hiệu ứng (Mục 11.3); riêng Thợ săn rời = bỏ lượt bắn
      applyDeaths(s, [{ seat: actor.seat, cause: 'leave' }]);
      delete s.accusals[actor.seat];
      for (const [voter, target] of Object.entries(s.votes)) {
        if (target === actor.seat) delete s.votes[Number(voter)];
      }
      delete s.votes[actor.seat];
      const winner = checkWin(s);
      if (winner) {
        s.winner = winner;
        s.phase = { kind: 'gameOver', winner };
        return { state: s };
      }
      // Chuẩn hoá pha hiện tại quanh người vừa rời
      if (s.phase.kind === 'hunterShot' && s.phase.hunterSeat === actor.seat) {
        proceedAfterDeaths(s, s.phase.resume);
      } else if (s.phase.kind === 'dayDiscuss' && currentSpeaker(s) === actor.seat) {
        nextSpeaker(s);
      }
      return { state: s };
    }
  }
}

/** Chỉ điểm (accuse) — public, không có hiệu lực luật. */
export function setAccusal(state: EngineState, seat: number, target: number | null): EngineState {
  const s = clone(state);
  const actor = s.players[seat];
  if (!actor?.alive) return state;
  if (target === null) {
    delete s.accusals[seat];
    return s;
  }
  const t = s.players[target];
  if (!t?.alive || target === seat) return state;
  s.accusals[seat] = target;
  return s;
}
