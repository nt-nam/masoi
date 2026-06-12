import type { ChannelId, EmoteId, VoteTarget } from './ids.js';
import type { RoomConfig, TimerPresetId } from './config.js';
import type { RedactedView } from './view.js';

export const PROTOCOL_VERSION = 1;

export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'ROOM_NOT_FOUND'
  | 'ROOM_FULL'
  | 'ROOM_ALREADY_STARTED'
  | 'NOT_HOST'
  | 'NOT_ENOUGH_PLAYERS'
  | 'NOT_IN_ROOM'
  | 'PHASE_CLOSED'
  | 'INVALID_ACTION'
  | 'INVALID_TARGET'
  | 'NOT_YOUR_TURN'
  | 'CHANNEL_FORBIDDEN'
  | 'RATE_LIMITED';

export type Ack<T = unknown> = { ok: true; data?: T } | { ok: false; error: ErrorCode; message?: string };

/** Thành viên phòng chờ (public). */
export interface RoomMemberView {
  seat: number;
  name: string;
  avatar: number;
  isBot: boolean;
  isHost: boolean;
  connected: boolean;
}

export interface RoomView {
  code: string;
  config: RoomConfig;
  members: RoomMemberView[];
  status: 'waiting' | 'starting' | 'inGame' | 'finished';
  yourSeat: number | null;
}

export interface ChatMessage {
  channel: ChannelId;
  fromSeat: number;
  fromName: string;
  text: string;
  ts: number;
}

/** client → server (tất cả dùng ack). */
export interface ClientToServer {
  'room:create': (cfg: { maxPlayers: number; timerPreset: TimerPresetId; isPublic: boolean }, ack: (r: Ack<{ code: string }>) => void) => void;
  'room:join': (p: { code: string }, ack: (r: Ack<{ room: RoomView }>) => void) => void;
  'room:leave': (ack: (r: Ack) => void) => void;
  'room:addBot': (ack: (r: Ack) => void) => void;
  'room:kickSeat': (p: { seat: number }, ack: (r: Ack) => void) => void;
  'room:configure': (cfg: { maxPlayers?: number; timerPreset?: TimerPresetId; isPublic?: boolean }, ack: (r: Ack) => void) => void;
  'room:start': (ack: (r: Ack) => void) => void;
  'game:action': (p: { step: string; target?: number | null; witch?: { save: boolean; poisonTarget: number | null } }, ack: (r: Ack) => void) => void;
  'vote:cast': (p: { target: VoteTarget | null }, ack: (r: Ack) => void) => void;
  'speak:done': (ack: (r: Ack) => void) => void;
  'chat:send': (p: { channel: ChannelId; text: string }, ack: (r: Ack) => void) => void;
  'emote:send': (p: { emote: EmoteId }, ack: (r: Ack) => void) => void;
  'accuse:set': (p: { target: number | null }, ack: (r: Ack) => void) => void;
  'game:requestSync': (ack: (r: Ack<{ sync: StateSync }>) => void) => void;
}

export interface StateSync {
  view: RedactedView;
  deadlineTs: number | null;
  serverTime: number;
  /** Tiến độ tổng của đêm 0..1 (không lộ bước) — chống timing-leak. */
  nightProgress?: number;
}

/** server → client. */
export interface ServerToClient {
  'room:update': (room: RoomView) => void;
  'game:stateSync': (sync: StateSync) => void;
  'chat:message': (msg: ChatMessage) => void;
  /** Lịch sử chat (đã lọc theo quyền đọc HIỆN TẠI) — gửi khi join/reconnect để F5 không mất feed. */
  'chat:history': (msgs: ChatMessage[]) => void;
  'emote:shown': (p: { seat: number; emote: EmoteId }) => void;
  'accuse:update': (accusals: Record<number, number>) => void;
  'room:closed': (p: { reason: string }) => void;
  'error': (p: { code: ErrorCode; message?: string }) => void;
}
