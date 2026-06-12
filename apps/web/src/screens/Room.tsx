import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MIN_PLAYERS, ROLE_INFO, buildRoleSet, type RoleId, type RoomView } from '@masoi/shared';
import { emitAck } from '../lib/socket';
import { useChat, useRoom } from '../store';
import { Avatar, SectionTitle } from '../components/ui';
import { ChatDock } from '../components/ChatDock';
import { GameScreen } from './Game';
import { ROLE_META } from '../lib/meta';

export function RoomScreen() {
  const { code } = useParams<{ code: string }>();
  const room = useRoom((s) => s.room);
  const navigate = useNavigate();
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    if (room?.code === code.toUpperCase()) return;
    (async () => {
      const r = await emitAck<{ room: RoomView }>('room:join', { code });
      if (r.ok) {
        if (r.data) useRoom.getState().setRoom(r.data.room);
      } else
        setJoinError(
          r.error === 'ROOM_NOT_FOUND'
            ? 'Phòng không tồn tại hoặc đã giải tán.'
            : r.error === 'ROOM_FULL'
              ? 'Phòng đã đầy.'
              : r.error === 'ROOM_ALREADY_STARTED'
                ? 'Ván đang diễn ra — không vào giữa chừng được.'
                : 'Không vào được phòng.',
        );
    })();
  }, [code, room?.code]);

  if (joinError) {
    return (
      <div className="grid min-h-dvh place-items-center p-4">
        <div className="panel max-w-sm p-6 text-center">
          <p className="text-3xl">🚪</p>
          <p className="mt-2">{joinError}</p>
          <button className="btn btn-primary mt-4" onClick={() => navigate('/lobby')}>
            Về sảnh
          </button>
        </div>
      </div>
    );
  }

  if (!room || room.code !== code?.toUpperCase()) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <p style={{ color: 'var(--ink-dim)' }}>Đang vào phòng…</p>
      </div>
    );
  }

  if (room.status === 'inGame' || room.status === 'finished') {
    return <GameScreen room={room} />;
  }

  return <WaitingRoom room={room} />;
}

function WaitingRoom({ room }: { room: RoomView }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  useEffect(() => useChat.getState().setActive('lobby'), []);

  const isHost = room.members.find((m) => m.seat === room.yourSeat)?.isHost ?? false;
  const n = room.members.length;
  const roles = n >= MIN_PLAYERS ? buildRoleSet(n) : null;
  const roleCounts = roles
    ? [...roles.reduce((m, r) => m.set(r, (m.get(r) ?? 0) + 1), new Map<RoleId, number>())]
    : [];

  async function copyInvite() {
    await navigator.clipboard.writeText(`${location.origin}/room/${room.code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function start() {
    setStartError(null);
    const r = await emitAck('room:start');
    if (!r.ok) {
      setStartError(r.error === 'NOT_ENOUGH_PLAYERS' ? `Cần ít nhất ${MIN_PLAYERS} người (thêm bot nếu thiếu).` : 'Không bắt đầu được.');
    }
  }

  return (
    <div className="phase-root relative" data-phase="night">
      <div className="night-sky">
        <div className="moon" />
        <div className="fog" />
      </div>
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-2xl flex-col gap-4 p-4">
        <header className="panel flex items-center gap-4 p-4">
          <div className="flex-1">
            <p className="text-xs" style={{ color: 'var(--ink-dim)' }}>
              Mã phòng — đưa cho bạn bè
            </p>
            <p className="font-mono text-3xl font-bold tracking-[0.35em]" style={{ color: 'var(--accent)' }}>
              {room.code}
            </p>
          </div>
          <button className="btn btn-ghost" onClick={copyInvite}>
            {copied ? '✓ Đã chép' : '🔗 Chép link mời'}
          </button>
        </header>

        {room.status === 'starting' && (
          <div className="panel rise-in p-4 text-center font-semibold" style={{ color: 'var(--accent)' }}>
            🎴 Ván sắp bắt đầu — chia vai…
          </div>
        )}

        <div className="panel p-4">
          <div className="mb-3 flex items-center justify-between">
            <SectionTitle>
              Dân làng ({n}/{room.config.maxPlayers})
            </SectionTitle>
            {isHost && (
              <button className="btn btn-ghost !px-3 !py-1.5 text-sm" onClick={() => emitAck('room:addBot')}>
                🤖 Thêm bot
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {room.members.map((m, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl p-2" style={{ background: 'var(--bg-raised)' }}>
                <Avatar index={m.avatar} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {m.name}
                    {m.seat === room.yourSeat ? ' (bạn)' : ''}
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--ink-dim)' }}>
                    {m.isHost ? '👑 Chủ phòng' : m.isBot ? '🤖 Bot' : m.connected ? 'Sẵn sàng' : '📡 Mất kết nối'}
                  </p>
                </div>
                {isHost && !m.isHost && (
                  <button
                    className="rounded px-1.5 text-sm opacity-60 hover:opacity-100"
                    title="Mời ra khỏi phòng"
                    onClick={() => emitAck('room:kickSeat', { seat: i })}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {Array.from({ length: Math.max(0, room.config.maxPlayers - n) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="grid h-[52px] place-items-center rounded-xl border border-dashed text-xs"
                style={{ borderColor: 'rgba(232,226,208,0.15)', color: 'var(--ink-dim)' }}
              >
                Chỗ trống
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-4">
          <SectionTitle>Bộ vai của ván ({n >= MIN_PLAYERS ? n : '≥5'} người)</SectionTitle>
          {roleCounts.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {roleCounts.map(([role, count]) => (
                <span
                  key={role}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1 text-sm"
                  style={{ background: 'var(--bg-raised)' }}
                  title={ROLE_INFO[role].desc}
                >
                  <span>{ROLE_META[role].icon}</span>
                  <span style={{ color: ROLE_META[role].color }}>{ROLE_INFO[role].name}</span>
                  {count > 1 && <b>×{count}</b>}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm" style={{ color: 'var(--ink-dim)' }}>
              Cần ít nhất {MIN_PLAYERS} người để mở ván — thêm bot nếu thiếu người.
            </p>
          )}
          <p className="mt-2 text-xs" style={{ color: 'var(--ink-dim)' }}>
            Vai chia ngẫu nhiên và bí mật. Di chuột vào tên vai để xem mô tả.
          </p>
        </div>

        <div style={{ height: 260 }}>
          <ChatDock room={room} view={null} />
        </div>

        <div className="sticky bottom-3 flex gap-3">
          <button
            className="btn btn-ghost"
            onClick={async () => {
              await emitAck('room:leave');
              useRoom.getState().setRoom(null);
              navigate('/lobby');
            }}
          >
            Rời phòng
          </button>
          {isHost ? (
            <button className="btn btn-primary flex-1 !py-3" disabled={n < MIN_PLAYERS || room.status === 'starting'} onClick={start}>
              {n < MIN_PLAYERS ? `Cần thêm ${MIN_PLAYERS - n} người nữa` : `🌙 Bắt đầu ván (${n} người)`}
            </button>
          ) : (
            <p className="grid flex-1 place-items-center text-sm" style={{ color: 'var(--ink-dim)' }}>
              Chờ chủ phòng bắt đầu…
            </p>
          )}
        </div>
        {startError && (
          <p className="pb-2 text-center text-sm" style={{ color: 'var(--wolf-bright)' }}>
            {startError}
          </p>
        )}
      </div>
    </div>
  );
}
