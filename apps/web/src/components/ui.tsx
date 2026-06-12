import { useEffect, useRef, useState } from 'react';
import { avatarOf } from '../lib/meta';
import { serverNow } from '../store';

export function Avatar({ index, size = 44 }: { index: number; size?: number }) {
  return (
    <span
      className="inline-grid place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.55,
        background: 'var(--bg-raised)',
        border: '1px solid rgba(232,226,208,0.15)',
      }}
    >
      {avatarOf(index)}
    </span>
  );
}

/** Đồng hồ pha — render từ deadline server, client không tự quyết (PLAN §7.3). */
export function Countdown({ deadline }: { deadline: number | null }) {
  const [remain, setRemain] = useState(0);
  const totalRef = useRef(1);

  useEffect(() => {
    if (deadline === null) return;
    totalRef.current = Math.max(1, deadline - serverNow());
    const tick = () => setRemain(Math.max(0, deadline - serverNow()));
    tick();
    const t = setInterval(tick, 250);
    return () => clearInterval(t);
  }, [deadline]);

  if (deadline === null) return null;
  const pct = Math.max(0, Math.min(100, (remain / totalRef.current) * 100));
  const secs = Math.ceil(remain / 1000);
  return (
    <div className="clock-ring" style={{ ['--pct' as never]: pct }}>
      <span className={secs <= 5 ? 'text-[var(--wolf-bright)]' : ''}>{secs}</span>
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-xl font-semibold tracking-wide" style={{ color: 'var(--accent)' }}>
      {children}
    </h2>
  );
}
