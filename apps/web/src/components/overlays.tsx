import { useEffect, useMemo, useState } from 'react';
import type { RedactedView, RoomView } from '@masoi/shared';
import { ROLE_INFO } from '@masoi/shared';
import { FACTION_LABEL, ROLE_META } from '../lib/meta';
import { Avatar } from './ui';
import { emitAck } from '../lib/socket';

/** Nền trời: trăng/sao/sương/đom đóm (E1, E9 đợt 1). Vị trí cố định theo seed nhỏ. */
export function NightSky() {
  const stars = useMemo(
    () => Array.from({ length: 26 }, (_, i) => ({ left: (i * 37) % 100, top: (i * 23) % 45, delay: (i % 7) * 0.5 })),
    [],
  );
  const flies = useMemo(
    () => Array.from({ length: 9 }, (_, i) => ({ left: (i * 29 + 11) % 95, top: 55 + ((i * 13) % 35), delay: i * 1.1 })),
    [],
  );
  return (
    <div className="night-sky">
      <div className="sun-glow" />
      <div className="moon" />
      {stars.map((s, i) => (
        <span key={i} className="star" style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s` }} />
      ))}
      {flies.map((f, i) => (
        <span key={i} className="firefly" style={{ left: `${f.left}%`, top: `${f.top}%`, animationDelay: `${f.delay}s` }} />
      ))}
      <div className="fog" />
    </div>
  );
}

/** Tiêu đề pha hiện giữa màn khi đổi ngày/đêm (E1/E2). */
export function PhaseTitle({ view }: { view: RedactedView }) {
  const [title, setTitle] = useState<{ key: string; text: string; icon: string } | null>(null);

  useEffect(() => {
    const kind = view.phase.kind;
    if (kind === 'night') {
      const text = view.nightNumber === 0 ? 'ĐÊM ĐẦU TIÊN' : `ĐÊM THỨ ${view.nightNumber}`;
      setTitle({ key: `n${view.nightNumber}`, text, icon: '🌙' });
    } else if (kind === 'dayAnnounce') {
      setTitle({ key: `d${view.dayNumber}`, text: `NGÀY THỨ ${view.dayNumber}`, icon: '☀️' });
    } else {
      return;
    }
    const t = setTimeout(() => setTitle(null), 2700);
    return () => clearTimeout(t);
  }, [view.phase.kind === 'night' ? view.nightNumber : view.dayNumber, view.phase.kind]);

  if (!title) return null;
  return (
    <div className="phase-title-overlay" key={title.key}>
      <div className="text-center">
        <div className="text-5xl">{title.icon}</div>
        <div className="font-display mt-2 text-4xl font-bold" style={{ color: 'var(--accent)' }}>
          {title.text}
        </div>
      </div>
    </div>
  );
}

/** Lá bài vai — lật 3D khi nhận vai (E3). */
export function RoleCardModal({ view, onClose }: { view: RedactedView; onClose: () => void }) {
  const [flipped, setFlipped] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFlipped(true), 700);
    return () => clearTimeout(t);
  }, []);
  const me = view.you;
  if (!me) return null;
  const info = ROLE_INFO[me.role];
  const meta = ROLE_META[me.role];
  return (
    <div className="modal-backdrop">
      <div className="flex flex-col items-center gap-5">
        <div className="role-card-scene">
          <div className={`role-card ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)}>
            <div className="role-face role-back">
              <span className="text-6xl">🌙</span>
              <span className="font-display text-xl" style={{ color: 'var(--accent)' }}>
                MA SÓI
              </span>
              <span className="text-xs" style={{ color: 'var(--ink-dim)' }}>
                Ngôi làng trong sương đêm
              </span>
            </div>
            <div className="role-face role-front" style={{ ['--role-color' as never]: meta.color }}>
              <span className="text-6xl">{meta.icon}</span>
              <span className="font-display text-3xl font-bold" style={{ color: meta.color }}>
                {info.name}
              </span>
              <span
                className="rounded-full px-3 py-0.5 text-xs font-semibold"
                style={{ background: 'var(--bg-raised)', color: me.faction === 'wolves' ? 'var(--wolf-bright)' : 'var(--village)' }}
              >
                {FACTION_LABEL[me.faction]}
              </span>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>
                {info.desc}
              </p>
            </div>
          </div>
        </div>
        {flipped && (
          <button className="btn btn-primary rise-in" onClick={onClose}>
            Đã hiểu vai của mình
          </button>
        )}
      </div>
    </div>
  );
}

/** Màn kết thúc: lật toàn bộ vai (E8 rút gọn đợt 1). */
export function GameOverModal({ view, room, isHost }: { view: RedactedView; room: RoomView; isHost: boolean }) {
  if (view.phase.kind !== 'gameOver') return null;
  const { winner, reveal } = view.phase;
  const wolvesWin = winner === 'wolves';
  return (
    <div className="modal-backdrop">
      <div className="panel rise-in w-full max-w-md p-6 text-center" style={{ borderColor: wolvesWin ? 'var(--wolf)' : 'var(--village)' }}>
        <div className="text-6xl">{wolvesWin ? '🐺' : '🌅'}</div>
        <h2 className="font-display mt-2 text-3xl font-bold" style={{ color: wolvesWin ? 'var(--wolf-bright)' : 'var(--village)' }}>
          {wolvesWin ? 'PHE MA SÓI THẮNG' : 'PHE DÂN LÀNG THẮNG'}
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--ink-dim)' }}>
          {wolvesWin ? 'Bầy Sói đã nuốt chửng ngôi làng.' : 'Bình minh trở lại, bầy Sói bị quét sạch.'}
        </p>
        <div className="mt-4 max-h-64 space-y-1.5 overflow-y-auto text-left">
          {reveal.map((r) => {
            const p = view.players[r.seat]!;
            const meta = ROLE_META[r.role];
            return (
              <div key={r.seat} className="flex items-center gap-2 rounded-lg px-2 py-1" style={{ background: 'var(--bg-raised)' }}>
                <Avatar index={p.avatar} size={30} />
                <span className={`flex-1 truncate text-sm ${p.alive ? '' : 'line-through opacity-60'}`}>{p.name}</span>
                <span className="text-lg">{meta.icon}</span>
                <span className="text-sm font-semibold" style={{ color: meta.color }}>
                  {ROLE_INFO[r.role].name}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-5 flex justify-center gap-3">
          {isHost && (
            <button className="btn btn-primary" onClick={() => emitAck('room:start')}>
              🔁 Chơi lại
            </button>
          )}
          <button
            className="btn btn-ghost"
            onClick={async () => {
              await emitAck('room:leave');
              location.href = '/lobby';
            }}
          >
            Rời phòng
          </button>
        </div>
        {!isHost && (
          <p className="mt-2 text-xs" style={{ color: 'var(--ink-dim)' }}>
            Chờ chủ phòng ({room.members.find((m) => m.isHost)?.name ?? '?'}) bấm chơi lại…
          </p>
        )}
      </div>
    </div>
  );
}
