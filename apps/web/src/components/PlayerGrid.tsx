import type { RedactedView } from '@masoi/shared';
import { Avatar } from './ui';
import { useEmotes } from '../store';

interface Props {
  view: RedactedView;
  accusals: Record<number, number>;
  targetable: Set<number>;
  selected: Set<number>;
  speaking: number | null;
  voted: Set<number>;
  onTarget: (seat: number) => void;
  onAccuse: (seat: number) => void;
  canAccuse: boolean;
}

export function PlayerGrid({ view, accusals, targetable, selected, speaking, voted, onTarget, onAccuse, canAccuse }: Props) {
  const emotes = useEmotes((s) => s.emotes);
  const me = view.you;
  const wolves = new Set(view.wolves ?? []);
  const accuseCounts = new Map<number, number>();
  for (const t of Object.values(accusals)) accuseCounts.set(t, (accuseCounts.get(t) ?? 0) + 1);
  const myAccusal = me ? accusals[me.seat] : undefined;

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
      {view.players.map((p) => {
        const classes = ['player-card'];
        if (!p.alive) classes.push('dead');
        if (targetable.has(p.seat)) classes.push('targetable');
        if (selected.has(p.seat)) classes.push('selected');
        if (speaking === p.seat && p.alive) classes.push('speaking');
        const accuses = accuseCounts.get(p.seat) ?? 0;
        return (
          <div key={p.seat} className={classes.join(' ')} onClick={() => targetable.has(p.seat) && onTarget(p.seat)}>
            {emotes
              .filter((e) => e.seat === p.seat)
              .map((e) => (
                <span key={e.id} className="emote-pop">
                  {e.emote}
                </span>
              ))}
            <div className="relative">
              <Avatar index={p.avatar} />
              {!p.alive && <span className="absolute -right-1 -bottom-1 text-sm">💀</span>}
              {voted.has(p.seat) && p.alive && (
                <span className="absolute -right-1 -top-1 text-xs" title="Đã bỏ phiếu">✅</span>
              )}
              {!p.connected && !p.isBot && (
                <span className="absolute -left-1 -top-1 text-xs" title="Mất kết nối">📡</span>
              )}
            </div>
            <div className="flex max-w-full items-center gap-1 px-1">
              {wolves.has(p.seat) && <span title="Cùng bầy Sói">🐺</span>}
              <span className="truncate text-xs font-medium">
                {p.name}
                {me?.seat === p.seat ? ' (bạn)' : ''}
              </span>
            </div>
            <div className="flex h-5 items-center gap-1 text-[11px]" style={{ color: 'var(--ink-dim)' }}>
              {p.isBot && <span className="rounded bg-[var(--bg-raised)] px-1">BOT</span>}
              {accuses > 0 && (
                <span title={`${accuses} người đang nghi`} style={{ color: 'var(--wolf-bright)' }}>
                  👉{accuses}
                </span>
              )}
            </div>
            {canAccuse && p.alive && me && p.seat !== me.seat && (
              <button
                className="absolute right-1 top-1 rounded px-1 text-[11px] opacity-70 hover:opacity-100"
                style={{
                  background: myAccusal === p.seat ? 'var(--wolf)' : 'var(--bg-raised)',
                  color: myAccusal === p.seat ? '#fff' : 'var(--ink-dim)',
                }}
                title={myAccusal === p.seat ? 'Bỏ nghi' : 'Chỉ điểm người này'}
                onClick={(e) => {
                  e.stopPropagation();
                  onAccuse(p.seat);
                }}
              >
                👉
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
