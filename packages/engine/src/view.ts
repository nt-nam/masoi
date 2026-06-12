import type { ActionPrompt, PhaseView, PlayerPublic, RedactedView } from '@masoi/shared';
import { currentNightStep, currentSpeaker } from './game.js';
import { aliveSeats, type EngineState } from './state.js';

/**
 * PHỄU REDACTION DUY NHẤT (PLAN §6.6, §11): mọi thứ client thấy đi qua đây.
 * Không bao giờ trả vai người khác / mục tiêu của vai khác / kênh ngoài quyền.
 */
export function buildView(state: EngineState, viewerSeat: number | null): RedactedView {
  const players: PlayerPublic[] = state.players.map((p) => ({
    seat: p.seat,
    name: p.name,
    avatar: p.avatar,
    alive: p.alive,
    connected: p.connected,
    isBot: p.isBot,
  }));

  const viewer = viewerSeat === null ? null : state.players[viewerSeat] ?? null;

  let phase: PhaseView;
  switch (state.phase.kind) {
    case 'roleReveal':
      phase = { kind: 'roleReveal' };
      break;
    case 'night':
      phase = { kind: 'night' }; // không lộ bước (chống timing-leak §2.2)
      break;
    case 'dayAnnounce':
      phase = { kind: 'dayAnnounce', deaths: state.pendingAnnounce.map((d) => ({ ...d })) };
      break;
    case 'hunterShot':
      phase = { kind: 'hunterShot', hunterSeat: state.phase.hunterSeat };
      break;
    case 'dayDiscuss':
      phase = {
        kind: 'dayDiscuss',
        speakOrder: [...state.speakOrder],
        currentSpeaker: currentSpeaker(state),
        spoken: [...state.spoken],
        canVoteToday: state.dayNumber >= 2,
      };
      break;
    case 'dayVote':
      phase = {
        kind: 'dayVote',
        voted: aliveSeats(state).filter((seat) => state.votes[seat] != null),
      };
      break;
    case 'voteResult':
      // O1: công khai đầy đủ ai-vote-ai sau khi khoá phiếu
      phase = {
        kind: 'voteResult',
        ballots: state.lastBallots.map((b) => ({ ...b })),
        lynched: state.lastLynched,
      };
      break;
    case 'gameOver':
      phase = {
        kind: 'gameOver',
        winner: state.phase.winner,
        reveal: state.players.map((p) => ({ seat: p.seat, role: p.role, faction: p.faction })),
      };
      break;
  }

  const view: RedactedView = {
    you: null,
    players,
    nightNumber: state.nightNumber,
    dayNumber: state.dayNumber,
    phase,
    accusals: { ...state.accusals },
  };

  if (!viewer) return view;

  view.you = {
    seat: viewer.seat,
    role: viewer.role,
    faction: viewer.faction,
    alive: viewer.alive,
    prompt: buildPrompt(state, viewer.seat),
  };

  // Thông tin kín theo vai — chỉ cho đúng người (Mục 11.1)
  if (viewer.faction === 'wolves') {
    view.wolves = state.players.filter((p) => p.faction === 'wolves').map((p) => p.seat);
  }
  if (viewer.role === 'seer') {
    view.seerResults = state.seerResults.map((r) => ({ ...r }));
  }
  if (viewer.role === 'witch') {
    view.potions = { ...state.potions };
  }
  return view;
}

function buildPrompt(state: EngineState, seat: number): ActionPrompt | null {
  const p = state.players[seat]!;
  if (!p.alive) return null;
  const alive = aliveSeats(state);
  const step = currentNightStep(state);

  if (step === 'seer' && p.role === 'seer') {
    return {
      step: 'seer',
      validTargets: alive.filter((t) => t !== seat),
      chosen: state.night.seerTarget,
    };
  }
  if (step === 'guard' && p.role === 'guard') {
    return {
      step: 'guard',
      validTargets: alive.filter((t) => t !== seat && t !== state.lastGuardTarget),
      chosen: state.night.guardTarget,
    };
  }
  if (step === 'wolves' && p.faction === 'wolves') {
    return {
      step: 'wolves',
      validTargets: alive.filter((t) => state.players[t]!.faction !== 'wolves'),
      chosen: state.night.wolfVotes[seat] ?? null,
      wolfVotes: { ...state.night.wolfVotes },
    };
  }
  if (step === 'witch' && p.role === 'witch') {
    return {
      step: 'witch',
      validTargets: alive.filter((t) => t !== seat),
      witch: {
        victim: state.night.wolfVictim, // O7: báo đúng người bị nhắm, không lộ có được Bảo vệ hay không
        canSave: !state.night.witchDone && state.potions.heal && state.night.wolfVictim !== null,
        canPoison: !state.night.witchDone && state.potions.poison,
        save: state.night.witchSave,
        poisonTarget: state.night.witchPoisonTarget,
      },
    };
  }
  if (state.phase.kind === 'hunterShot' && state.phase.hunterSeat === seat) {
    return { step: 'hunterShoot', validTargets: alive.filter((t) => t !== seat) };
  }
  if (state.phase.kind === 'dayDiscuss' && currentSpeaker(state) === seat) {
    return { step: 'speak', validTargets: [] };
  }
  if (state.phase.kind === 'dayVote') {
    return { step: 'vote', validTargets: alive, chosen: typeof state.votes[seat] === 'number' ? (state.votes[seat] as number) : null };
  }
  return null;
}
