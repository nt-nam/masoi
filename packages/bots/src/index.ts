import { rngInt, rngNext, rngPick } from '@masoi/engine';
import type { RedactedView, VoteTarget } from '@masoi/shared';
import { ACCUSE_LINES, DEFEND_LINES, fillTemplate, NEUTRAL_LINES, OPENERS } from './speech.js';

export type BotAction =
  | { kind: 'seer'; target: number }
  | { kind: 'guard'; target: number }
  | { kind: 'wolfVote'; target: number }
  | { kind: 'witch'; save: boolean; poisonTarget: number | null }
  | { kind: 'hunterShoot'; target: number | null }
  | { kind: 'vote'; target: VoteTarget };

export interface BotMove {
  action?: BotAction;
  /** Câu nói gửi vào kênh làng TRƯỚC khi speakDone (chỉ khi tới lượt nói). */
  say?: string[];
  accuse?: number;
  speakDone?: boolean;
  rngState: number;
}

/**
 * Bot heuristic GĐ1 (PLAN §8): hành động hợp lệ + có chủ đích đơn giản.
 * Pure function — bot chỉ nhìn RedactedView như người thật, server giữ rngState.
 */
export function decideBotMove(view: RedactedView, rngState: number): BotMove {
  let rng = rngState;
  const me = view.you;
  if (!me) return { rngState: rng };
  const prompt = me.prompt;

  // Ai đang bị cộng đồng nghi nhất (public info) — mồi cho vote/bắn/nói
  const accusalCounts = new Map<number, number>();
  for (const target of Object.values(view.accusals)) {
    accusalCounts.set(target, (accusalCounts.get(target) ?? 0) + 1);
  }
  const mostAccused = [...accusalCounts.entries()]
    .filter(([seat]) => view.players[seat]?.alive && seat !== me.seat)
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  if (!prompt) return { rngState: rng };

  switch (prompt.step) {
    case 'seer': {
      if (prompt.chosen != null) return { rngState: rng };
      // soi người chưa soi, ưu tiên người đang bị nghi
      const seen = new Set((view.seerResults ?? []).map((r) => r.seat));
      const unseen = prompt.validTargets.filter((t) => !seen.has(t));
      const pool = unseen.length ? unseen : prompt.validTargets;
      if (!pool.length) return { rngState: rng };
      const preferred = mostAccused !== undefined && pool.includes(mostAccused) ? mostAccused : null;
      const r = rngPick(rng, pool);
      rng = r.next;
      return { action: { kind: 'seer', target: preferred ?? r.value }, rngState: rng };
    }
    case 'guard': {
      if (prompt.chosen != null || !prompt.validTargets.length) return { rngState: rng };
      const r = rngPick(rng, prompt.validTargets);
      rng = r.next;
      return { action: { kind: 'guard', target: r.value }, rngState: rng };
    }
    case 'wolves': {
      if (!prompt.validTargets.length) return { rngState: rng };
      // bầy phối hợp: mọi Sói-bot cùng tính ra một mục tiêu từ nightNumber (deterministic, không cần bàn)
      const idx = (view.nightNumber * 7 + view.players.length) % prompt.validTargets.length;
      const target = prompt.validTargets[idx]!;
      if (prompt.chosen === target) return { rngState: rng };
      return { action: { kind: 'wolfVote', target }, rngState: rng };
    }
    case 'witch': {
      const w = prompt.witch;
      if (!w || w.save || w.poisonTarget !== null) return { rngState: rng };
      // cứu nếu nạn nhân là chính mình, hoặc còn sớm (đêm 1-2) — giữ người cho làng
      let save = false;
      if (w.canSave && w.victim !== null) {
        save = w.victim === me.seat || view.nightNumber <= 2;
      }
      // độc dè dặt: chỉ khi có người bị nghi nhiều và đã qua đêm 2
      let poisonTarget: number | null = null;
      if (w.canPoison && view.nightNumber > 2 && mostAccused !== undefined) {
        const roll = rngNext(rng);
        rng = roll.next;
        if (roll.value < 0.35 && prompt.validTargets.includes(mostAccused)) poisonTarget = mostAccused;
      }
      return { action: { kind: 'witch', save, poisonTarget }, rngState: rng };
    }
    case 'hunterShoot': {
      if (!prompt.validTargets.length) return { action: { kind: 'hunterShoot', target: null }, rngState: rng };
      const target =
        mostAccused !== undefined && prompt.validTargets.includes(mostAccused)
          ? mostAccused
          : (() => {
              const r = rngPick(rng, prompt.validTargets);
              rng = r.next;
              return r.value;
            })();
      return { action: { kind: 'hunterShoot', target }, rngState: rng };
    }
    case 'vote': {
      // Sói-bot né đồng đội; còn lại vote theo đám đông, đôi khi Tha
      const roll = rngNext(rng);
      rng = roll.next;
      const myWolves = new Set(view.wolves ?? []);
      const candidates = prompt.validTargets.filter((t) => t !== me.seat && !myWolves.has(t));
      if (!candidates.length || roll.value < 0.2) {
        return { action: { kind: 'vote', target: 'mercy' }, rngState: rng };
      }
      const target =
        mostAccused !== undefined && candidates.includes(mostAccused)
          ? mostAccused
          : (() => {
              const r = rngPick(rng, candidates);
              rng = r.next;
              return r.value;
            })();
      return { action: { kind: 'vote', target }, rngState: rng };
    }
    case 'speak': {
      const alive = view.players.filter((p) => p.alive && p.seat !== me.seat);
      const accusedMe = Object.values(view.accusals).includes(me.seat);
      const roll = rngNext(rng);
      rng = roll.next;
      const say: string[] = [];
      let accuse: number | undefined;
      if (roll.value < 0.35) {
        // bot được phép im lặng có chủ đích (PLAN §8.4)
      } else if (accusedMe) {
        const r = rngPick(rng, DEFEND_LINES);
        rng = r.next;
        say.push(fillTemplate(r.value, ''));
      } else if (view.dayNumber >= 2 && alive.length && roll.value < 0.75) {
        // chọn người để nghi: theo đám đông nếu có, không thì ngẫu nhiên
        const pickTarget =
          mostAccused !== undefined
            ? mostAccused
            : (() => {
                const r = rngInt(rng, alive.length);
                rng = r.next;
                return alive[r.value]!.seat;
              })();
        const name = view.players[pickTarget]?.name ?? '???';
        const r = rngPick(rng, ACCUSE_LINES);
        rng = r.next;
        say.push(fillTemplate(r.value, name));
        accuse = pickTarget;
      } else {
        const pool = view.dayNumber === 1 ? OPENERS : NEUTRAL_LINES;
        const r = rngPick(rng, pool);
        rng = r.next;
        say.push(fillTemplate(r.value, ''));
      }
      return { say, accuse, speakDone: true, rngState: rng };
    }
  }
  return { rngState: rng };
}

export const BOT_NAMES = [
  'Tí Còi', 'Ba Gà', 'Tư Ếch', 'Năm Lúa', 'Sáu Mít', 'Bảy Cò',
  'Tám Tàng', 'Chín Mập', 'Út Ngơ', 'Hai Lì', 'Tèo Khờ', 'Bống Bang',
];
