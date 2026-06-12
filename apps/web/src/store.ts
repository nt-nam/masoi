import { create } from 'zustand';
import type { ChatMessage, EmoteId, RoomView, StateSync } from '@masoi/shared';
import type { ApiUser } from './lib/api';
import { socket } from './lib/socket';
import { sfx } from './lib/sound';

// ===== Phiên người dùng =====

interface SessionState {
  user: ApiUser | null;
  ready: boolean; // đã check /api/me xong
  setUser: (u: ApiUser | null) => void;
  setReady: () => void;
}

export const useSession = create<SessionState>((set) => ({
  user: null,
  ready: false,
  setUser: (user) => set({ user }),
  setReady: () => set({ ready: true }),
}));

// ===== Phòng =====

interface RoomState {
  room: RoomView | null;
  setRoom: (r: RoomView | null) => void;
}

export const useRoom = create<RoomState>((set) => ({
  room: null,
  setRoom: (room) => set({ room }),
}));

// ===== Ván đang chạy (chỉ render từ redacted view — PLAN §10.2) =====

interface GameState {
  sync: StateSync | null;
  /** serverTime - clientTime tại lần sync gần nhất (đồng hồ pha §7.3). */
  serverOffset: number;
  accusals: Record<number, number>;
  setSync: (s: StateSync) => void;
  clear: () => void;
  setAccusals: (a: Record<number, number>) => void;
}

export const useGame = create<GameState>((set) => ({
  sync: null,
  serverOffset: 0,
  accusals: {},
  setSync: (sync) =>
    set({
      sync,
      serverOffset: sync.serverTime - Date.now(),
      accusals: sync.view.accusals,
    }),
  clear: () => set({ sync: null, accusals: {} }),
  setAccusals: (accusals) => set({ accusals }),
}));

// ===== Chat đa kênh =====

const CHAT_CAP = 200;

interface ChatState {
  messages: ChatMessage[];
  active: string;
  unread: Record<string, number>;
  push: (m: ChatMessage) => void;
  /** Thay toàn bộ bằng lịch sử server gửi (sau reload/reconnect). */
  replace: (msgs: ChatMessage[]) => void;
  setActive: (channel: string) => void;
  reset: () => void;
}

export const useChat = create<ChatState>((set) => ({
  messages: [],
  active: 'village',
  unread: {},
  push: (m) =>
    set((s) => ({
      messages: [...s.messages.slice(-CHAT_CAP + 1), m],
      unread:
        m.channel === s.active
          ? s.unread
          : { ...s.unread, [m.channel]: (s.unread[m.channel] ?? 0) + 1 },
    })),
  replace: (msgs) => set({ messages: msgs.slice(-CHAT_CAP), unread: {} }),
  setActive: (active) => set((s) => ({ active, unread: { ...s.unread, [active]: 0 } })),
  reset: () => set({ messages: [], unread: {} }),
}));

// ===== Trạng thái kết nối socket =====

interface ConnState {
  connected: boolean;
  /** Đã từng nối được — để không hiện banner "mất kết nối" lúc mới mở trang. */
  everConnected: boolean;
  set: (connected: boolean) => void;
}

export const useConn = create<ConnState>((set) => ({
  connected: false,
  everConnected: false,
  set: (connected) => set((s) => ({ connected, everConnected: s.everConnected || connected })),
}));

// ===== Emote nổi trên avatar =====

interface EmotesState {
  emotes: Array<{ id: number; seat: number; emote: EmoteId }>;
  push: (seat: number, emote: EmoteId) => void;
}

let emoteId = 0;
export const useEmotes = create<EmotesState>((set) => ({
  emotes: [],
  push: (seat, emote) => {
    const id = ++emoteId;
    set((s) => ({ emotes: [...s.emotes.slice(-20), { id, seat, emote }] }));
    setTimeout(() => set((s) => ({ emotes: s.emotes.filter((e) => e.id !== id) })), 2000);
  },
}));

// ===== Wire socket events → stores (gọi 1 lần ở App) =====

let wired = false;
let lastPop = 0;
export function wireSocket(): void {
  if (wired) return;
  wired = true;

  socket.on('connect', () => useConn.getState().set(true));
  socket.on('disconnect', () => useConn.getState().set(false));

  socket.on('chat:history', (msgs: ChatMessage[]) => {
    useChat.getState().replace(msgs);
  });

  socket.on('room:update', (room: RoomView) => {
    useRoom.getState().setRoom(room);
    if (room.status === 'waiting') {
      // phòng quay lại lobby sau ván → bỏ sync cũ để hiện màn phòng chờ
      const sync = useGame.getState().sync;
      if (sync && sync.view.phase.kind === 'gameOver') useGame.getState().clear();
    }
  });

  socket.on('game:stateSync', (sync: StateSync) => {
    useGame.getState().setSync(sync);
  });

  socket.on('chat:message', (m: ChatMessage) => {
    useChat.getState().push(m);
    // pop nhẹ cho tin nhắn người chơi (âm pha/hệ thống đã có sound riêng), throttle chống spam bot
    if (m.fromSeat !== -1 && Date.now() - lastPop > 900) {
      lastPop = Date.now();
      sfx.pop();
    }
  });

  socket.on('emote:shown', (p: { seat: number; emote: EmoteId }) => {
    useEmotes.getState().push(p.seat, p.emote);
  });

  socket.on('accuse:update', (a: Record<number, number>) => {
    useGame.getState().setAccusals(a);
  });

  socket.on('room:closed', () => {
    useRoom.getState().setRoom(null);
    useGame.getState().clear();
  });
}

/** Giờ server hiện tại (đã bù lệch đồng hồ). */
export function serverNow(): number {
  return Date.now() + useGame.getState().serverOffset;
}
