import { useEffect, useRef, useState } from 'react';
import type { ChannelId, RedactedView, RoomView } from '@masoi/shared';
import { EMOTES } from '@masoi/shared';
import { emitAck } from '../lib/socket';
import { useChat } from '../store';

interface Props {
  room: RoomView;
  view: RedactedView | null;
}

export function ChatDock({ room, view }: Props) {
  const { messages, active, unread, setActive } = useChat();
  const [text, setText] = useState('');
  const [hint, setHint] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const me = view?.you ?? null;
  const inGame = room.status === 'inGame' && view !== null;

  const tabs: Array<{ id: ChannelId; label: string }> = [];
  if (!inGame) tabs.push({ id: 'lobby', label: '🏠 Phòng chờ' });
  if (inGame) tabs.push({ id: 'village', label: '🏘️ Làng' });
  if (inGame && view?.wolves) tabs.push({ id: 'wolf', label: '🐺 Sói' });
  if (inGame && me && !me.alive) tabs.push({ id: 'dead', label: '👻 Người chết' });

  const activeTab = tabs.some((t) => t.id === active) ? (active as ChannelId) : tabs[0]?.id ?? 'village';

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, activeTab]);

  const canSend = (() => {
    if (!activeTab) return false;
    if (activeTab === 'lobby') return room.status !== 'inGame';
    if (!me) return false;
    if (activeTab === 'village') return me.prompt?.step === 'speak';
    if (activeTab === 'wolf') return me.alive && view?.phase.kind === 'night';
    if (activeTab === 'dead') return !me.alive;
    return false;
  })();

  const sendHint = !canSend
    ? activeTab === 'village'
      ? 'Chỉ gửi được khi tới lượt nói của bạn'
      : activeTab === 'wolf'
        ? 'Kênh Sói chỉ mở trong lượt Sói ban đêm'
        : null
    : null;

  async function send() {
    const t = text.trim();
    if (!t || !activeTab) return;
    setText('');
    const r = await emitAck('chat:send', { channel: activeTab, text: t });
    if (!r.ok) {
      setHint(
        r.error === 'CHANNEL_FORBIDDEN'
          ? 'Chưa tới lượt bạn được nói ở kênh này.'
          : r.error === 'RATE_LIMITED'
            ? 'Chậm lại chút nhé.'
            : 'Không gửi được.',
      );
      setTimeout(() => setHint(null), 2500);
    }
  }

  async function sendEmote(emote: string) {
    await emitAck('emote:send', { emote });
  }

  const shown = messages.filter((m) => m.channel === activeTab);

  return (
    <div className="panel flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-1 border-b border-white/5 px-2 pt-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className="relative rounded-t-lg px-3 py-1.5 text-sm font-medium"
            style={{
              background: activeTab === t.id ? 'var(--bg-raised)' : 'transparent',
              color: activeTab === t.id ? 'var(--ink)' : 'var(--ink-dim)',
            }}
          >
            {t.label}
            {(unread[t.id] ?? 0) > 0 && activeTab !== t.id && (
              <span
                className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold"
                style={{ background: 'var(--wolf)', color: '#fff' }}
              >
                {unread[t.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div ref={listRef} className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-3 py-2">
        {shown.map((m, i) => (
          <div key={i} className="chat-msg text-sm leading-snug">
            {m.fromSeat === -1 ? (
              <span className="italic" style={{ color: 'var(--accent)' }}>
                {m.text}
              </span>
            ) : (
              <>
                <b style={{ color: 'var(--ink)' }}>{m.fromName}: </b>
                <span style={{ color: 'var(--ink)' }}>{m.text}</span>
              </>
            )}
          </div>
        ))}
        {shown.length === 0 && (
          <p className="pt-4 text-center text-xs" style={{ color: 'var(--ink-dim)' }}>
            Chưa có tin nhắn nào.
          </p>
        )}
      </div>

      {inGame && me?.alive && (
        <div className="flex gap-1 px-3 pb-1">
          {EMOTES.map((e) => (
            <button key={e} className="rounded p-1 text-lg hover:bg-white/5" onClick={() => sendEmote(e)}>
              {e}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 p-2">
        <input
          type="text"
          value={text}
          maxLength={500}
          placeholder={sendHint ?? (hint ?? 'Nhắn gì đó…')}
          disabled={!canSend}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button className="btn btn-primary !px-3" disabled={!canSend || !text.trim()} onClick={send}>
          Gửi
        </button>
      </div>
      {hint && (
        <p className="px-3 pb-2 text-xs" style={{ color: 'var(--wolf-bright)' }}>
          {hint}
        </p>
      )}
    </div>
  );
}
