import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RoomView, TimerPresetId } from '@masoi/shared';
import { emitAck } from '../lib/socket';
import { useSession } from '../store';
import { Avatar, SectionTitle } from '../components/ui';

export function Lobby() {
  const user = useSession((s) => s.user);
  const navigate = useNavigate();
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [preset, setPreset] = useState<TimerPresetId>('standard');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function createRoom() {
    setBusy(true);
    setError(null);
    const r = await emitAck<{ code: string }>('room:create', {
      maxPlayers,
      timerPreset: preset,
      isPublic: false,
    });
    setBusy(false);
    if (r.ok && r.data) navigate(`/room/${r.data.code}`);
    else setError('Không tạo được phòng, thử lại nhé.');
  }

  async function joinRoom() {
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 6) {
      setError('Mã phòng gồm 6 ký tự');
      return;
    }
    setBusy(true);
    setError(null);
    const r = await emitAck<{ room: RoomView }>('room:join', { code });
    setBusy(false);
    if (r.ok) navigate(`/room/${code}`);
    else
      setError(
        r.error === 'ROOM_NOT_FOUND'
          ? 'Không tìm thấy phòng với mã này.'
          : r.error === 'ROOM_FULL'
            ? 'Phòng đã đầy.'
            : r.error === 'ROOM_ALREADY_STARTED'
              ? 'Phòng đang trong ván — chờ ván sau nhé.'
              : 'Không vào được phòng.',
      );
  }

  return (
    <div className="phase-root relative" data-phase="night">
      <div className="night-sky">
        <div className="moon" />
        <div className="fog" />
      </div>
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-lg flex-col gap-4 p-4">
        <header className="flex items-center gap-3 pt-2">
          <Avatar index={user?.avatar ?? 0} />
          <div className="flex-1">
            <p className="font-semibold">{user?.name}</p>
            <p className="text-xs" style={{ color: 'var(--ink-dim)' }}>
              Khách — thống kê chưa được lưu
            </p>
          </div>
          <span className="font-display text-2xl font-bold tracking-widest" style={{ color: 'var(--accent)' }}>
            MA SÓI
          </span>
        </header>

        <div className="panel space-y-3 p-5">
          <SectionTitle>🏠 Tạo phòng chơi với bạn bè</SectionTitle>
          <div className="flex items-center gap-3">
            <label className="text-sm" style={{ color: 'var(--ink-dim)' }}>
              Số người tối đa
            </label>
            <input
              type="number"
              min={5}
              max={18}
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Math.max(5, Math.min(18, Number(e.target.value) || 8)))}
              style={{ width: 80 }}
            />
            <label className="text-sm" style={{ color: 'var(--ink-dim)' }}>
              Nhịp độ
            </label>
            <select value={preset} onChange={(e) => setPreset(e.target.value as TimerPresetId)} style={{ width: 130 }}>
              <option value="fast">⚡ Nhanh</option>
              <option value="standard">🕯️ Chuẩn</option>
              <option value="slow">🐢 Chậm</option>
            </select>
          </div>
          <p className="text-xs" style={{ color: 'var(--ink-dim)' }}>
            Bộ vai tự cân bằng theo số người (luật chuẩn). Thiếu người? Thêm bot trong phòng chờ.
          </p>
          <button className="btn btn-primary w-full" disabled={busy} onClick={createRoom}>
            Tạo phòng & lấy mã mời
          </button>
        </div>

        <div className="panel space-y-3 p-5">
          <SectionTitle>🔑 Vào phòng bằng mã</SectionTitle>
          <div className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              maxLength={6}
              placeholder="VD: AB2CD9"
              className="!font-mono !text-lg !tracking-[0.3em] uppercase"
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
            />
            <button className="btn btn-ghost" disabled={busy} onClick={joinRoom}>
              Vào
            </button>
          </div>
        </div>

        {error && (
          <p className="text-center text-sm" style={{ color: 'var(--wolf-bright)' }}>
            {error}
          </p>
        )}

        <p className="mt-auto pb-2 text-center text-xs" style={{ color: 'var(--ink-dim)' }}>
          Ghép trận người lạ & danh sách phòng công khai sẽ có ở giai đoạn 2.
        </p>
      </div>
    </div>
  );
}
