import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createGuest } from '../lib/api';
import { connectSocket } from '../lib/socket';
import { AVATARS } from '../lib/meta';
import { useSession } from '../store';

export function Landing() {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setUser = useSession((s) => s.setUser);
  const navigate = useNavigate();
  const location = useLocation();

  async function enter() {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError('Tên cần ít nhất 2 ký tự');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const user = await createGuest(trimmed, avatar);
      setUser(user);
      connectSocket();
      const dest = (location.state as { from?: string } | null)?.from ?? '/lobby';
      navigate(dest, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="phase-root relative" data-phase="night">
      <div className="night-sky">
        <div className="moon" />
        <div className="fog" />
      </div>
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 p-6">
        <div className="text-center">
          <div className="text-6xl">🐺</div>
          <h1 className="font-display mt-2 text-5xl font-bold tracking-widest" style={{ color: 'var(--accent)' }}>
            MA SÓI
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--ink-dim)' }}>
            Ngôi làng trong sương đêm — đấu trí, lừa dối, sống sót.
          </p>
        </div>

        <div className="panel w-full space-y-4 p-5">
          <div>
            <label className="mb-1 block text-sm font-medium">Tên hiển thị</label>
            <input
              type="text"
              value={name}
              maxLength={20}
              placeholder="VD: Thợ Săn Đêm"
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && enter()}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Chân dung</label>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((a, i) => (
                <button
                  key={i}
                  onClick={() => setAvatar(i)}
                  className="grid aspect-square place-items-center rounded-xl text-2xl transition-all"
                  style={{
                    background: 'var(--bg-raised)',
                    border: avatar === i ? '2px solid var(--accent)' : '1px solid rgba(232,226,208,0.1)',
                    boxShadow: avatar === i ? '0 0 14px rgba(232,180,79,0.4)' : 'none',
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          {error && (
            <p className="text-sm" style={{ color: 'var(--wolf-bright)' }}>
              {error}
            </p>
          )}
          <button className="btn btn-primary w-full !py-3 text-base" disabled={busy} onClick={enter}>
            {busy ? 'Đang vào làng…' : '🌙 Vào làng chơi ngay'}
          </button>
          <p className="text-center text-xs" style={{ color: 'var(--ink-dim)' }}>
            Chơi ngay không cần đăng ký. Tài khoản & thống kê sẽ có ở bản sau.
          </p>
        </div>

        <div className="panel w-full p-4 text-sm leading-relaxed" style={{ color: 'var(--ink-dim)' }}>
          <b style={{ color: 'var(--ink)' }}>Cách chơi:</b> mỗi người nhận một vai bí mật. Ban đêm Sói cắn người,
          các vai chức năng hành động kín. Ban ngày cả làng thảo luận theo lượt rồi biểu quyết treo cổ.
          Dân thắng khi diệt hết Sói — Sói thắng khi áp đảo dân làng.
        </div>
      </div>
    </div>
  );
}
