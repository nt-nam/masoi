import { useEffect, useMemo, useState } from 'react';
import type { RoomView } from '@masoi/shared';
import { emitAck } from '../lib/socket';
import { useGame } from '../store';
import { Countdown } from '../components/ui';
import { PlayerGrid } from '../components/PlayerGrid';
import { ActionPanel } from '../components/ActionPanel';
import { ChatDock } from '../components/ChatDock';
import { GameOverModal, NightSky, PhaseTitle, RoleCardModal } from '../components/overlays';
import { ROLE_META } from '../lib/meta';
import { ROLE_INFO } from '@masoi/shared';

export function GameScreen({ room }: { room: RoomView }) {
  const sync = useGame((s) => s.sync);
  const accusals = useGame((s) => s.accusals);

  const [poisonMode, setPoisonMode] = useState(false);
  const [poisonPick, setPoisonPick] = useState<number | null>(null);
  const [witchSave, setWitchSave] = useState(false);
  const [roleSeen, setRoleSeen] = useState(false);
  const [peekRole, setPeekRole] = useState(false);

  const view = sync?.view ?? null;
  const isRoleReveal = view?.phase.kind === 'roleReveal';

  useEffect(() => {
    setPoisonMode(false);
    setPoisonPick(null);
    setWitchSave(false);
  }, [view?.nightNumber]);

  useEffect(() => {
    if (isRoleReveal) setRoleSeen(false);
  }, [isRoleReveal]);

  const dataPhase = useMemo(() => {
    if (!view) return 'night';
    const k = view.phase.kind;
    if (k === 'roleReveal' || k === 'night') return 'night';
    if (k === 'gameOver') return view.phase.winner === 'wolves' ? 'night' : 'day';
    return 'day';
  }, [view]);

  if (!view || !sync) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <p style={{ color: 'var(--ink-dim)' }}>Đang đồng bộ ván chơi…</p>
      </div>
    );
  }

  const me = view.you;
  const prompt = me?.prompt ?? null;
  const phase = view.phase;
  const isHost = room.members.find((m) => m.seat === room.yourSeat)?.isHost ?? false;

  // Ghế chạm được trên lưới — tuỳ prompt hiện tại
  const targetable = new Set<number>(
    !prompt
      ? []
      : prompt.step === 'witch'
        ? poisonMode
          ? prompt.validTargets
          : []
        : prompt.step === 'seer' && prompt.chosen != null
          ? []
          : prompt.validTargets,
  );

  const selected = new Set<number>();
  if (prompt?.chosen != null) selected.add(prompt.chosen);
  if (poisonPick != null) selected.add(poisonPick);
  if (prompt?.step === 'witch' && prompt.witch?.victim != null && witchSave) selected.add(prompt.witch.victim);

  async function onTarget(seat: number) {
    if (!prompt) return;
    switch (prompt.step) {
      case 'seer':
      case 'guard':
      case 'wolves':
        await emitAck('game:action', { step: prompt.step, target: seat });
        break;
      case 'witch':
        setPoisonPick(seat);
        setPoisonMode(false);
        break;
      case 'hunterShoot':
        await emitAck('game:action', { step: 'hunterShoot', target: seat });
        break;
      case 'vote':
        await emitAck('vote:cast', { target: seat });
        break;
    }
  }

  const phaseLabel = (() => {
    switch (phase.kind) {
      case 'roleReveal':
        return '🎴 Nhận vai';
      case 'night':
        return view.nightNumber === 0 ? '🌙 Đêm đầu tiên' : `🌙 Đêm ${view.nightNumber}`;
      case 'dayAnnounce':
        return `🌅 Ngày ${view.dayNumber} — Bình minh`;
      case 'hunterShot':
        return '🏹 Phát súng Thợ săn';
      case 'dayDiscuss':
        return `🗣️ Ngày ${view.dayNumber} — Thảo luận`;
      case 'dayVote':
        return `🗳️ Ngày ${view.dayNumber} — Biểu quyết`;
      case 'voteResult':
        return '⚖️ Phán quyết của làng';
      case 'gameOver':
        return '🏆 Kết thúc';
    }
  })();

  const canAccuse =
    !!me?.alive && (phase.kind === 'dayAnnounce' || phase.kind === 'dayDiscuss' || phase.kind === 'dayVote');

  const spectating = !!me && !me.alive && phase.kind !== 'gameOver';

  return (
    <div className={spectating ? 'spectating' : ''}>
      <div className="phase-root relative" data-phase={dataPhase}>
        <NightSky />
        <PhaseTitle view={view} />
        {isRoleReveal && !roleSeen && <RoleCardModal view={view} onClose={() => setRoleSeen(true)} />}
        {peekRole && !isRoleReveal && <RoleCardModal view={view} onClose={() => setPeekRole(false)} />}
        <GameOverModal view={view} room={room} isHost={isHost} />

        <div className="relative z-10 mx-auto flex min-h-dvh max-w-5xl flex-col gap-3 p-3">
          {/* Banner pha */}
          <header className="panel flex items-center gap-3 px-4 py-2.5">
            <div className="min-w-0 flex-1">
              <h1 className="font-display truncate text-lg font-bold tracking-wide">{phaseLabel}</h1>
              {spectating && (
                <p className="text-xs" style={{ color: 'var(--ink-dim)' }}>
                  👻 Khán giả
                </p>
              )}
            </div>
            {me && (
              <button
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm"
                style={{ background: 'var(--bg-raised)' }}
                onClick={() => setPeekRole(true)}
                title="Xem lại vai của bạn"
              >
                <span>{ROLE_META[me.role].icon}</span>
                <span className="hidden sm:inline" style={{ color: ROLE_META[me.role].color }}>
                  {ROLE_INFO[me.role].name}
                </span>
              </button>
            )}
            <Countdown deadline={sync.deadlineTs} />
          </header>

          {/* Tiến độ đêm — không lộ bước (PLAN §2.2) */}
          {phase.kind === 'night' && (
            <div className="h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--bg-surface)' }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${Math.round((sync.nightProgress ?? 0) * 100)}%`, background: 'var(--accent)' }}
              />
            </div>
          )}

          <PlayerGrid
            view={view}
            accusals={accusals}
            targetable={targetable}
            selected={selected}
            speaking={phase.kind === 'dayDiscuss' ? phase.currentSpeaker : null}
            voted={new Set(phase.kind === 'dayVote' ? phase.voted : [])}
            onTarget={onTarget}
            canAccuse={canAccuse}
            onAccuse={(seat) => emitAck('accuse:set', { target: accusals[me!.seat] === seat ? null : seat })}
          />

          <ActionPanel
            view={view}
            poisonMode={poisonMode}
            poisonPick={poisonPick}
            witchSave={witchSave}
            onWitchToggleSave={() => setWitchSave((v) => !v)}
            onPoisonMode={setPoisonMode}
            onWitchConfirm={() =>
              emitAck('game:action', { step: 'witch', witch: { save: witchSave, poisonTarget: poisonPick } })
            }
            onSpeakDone={() => emitAck('speak:done')}
            onVoteMercy={() => emitAck('vote:cast', { target: 'mercy' })}
            onHunterSkip={() => emitAck('game:action', { step: 'hunterShoot', target: null })}
          />

          <div className="min-h-0 flex-1" style={{ minHeight: '220px' }}>
            <ChatDock room={room} view={view} />
          </div>
        </div>
      </div>
    </div>
  );
}
