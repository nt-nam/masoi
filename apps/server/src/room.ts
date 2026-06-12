import crypto from 'node:crypto';
import type { Server } from 'socket.io';
import {
  advance,
  buildView,
  createGame,
  currentActors,
  currentNightStep,
  currentSpeaker,
  durationKey,
  readyToAdvance,
  setAccusal,
  submitAction,
  type EngineAction,
  type EngineState,
} from '@masoi/engine';
import { BOT_NAMES, decideBotMove } from '@masoi/bots';
import {
  buildRoleSet,
  MIN_PLAYERS,
  TIMER_PRESETS,
  type ChannelId,
  type ChatMessage,
  type ErrorCode,
  type RoomConfig,
  type RoomView,
  type StateSync,
} from '@masoi/shared';
import type { User } from './auth.js';
import { generateRoomCode } from './codes.js';

/** Hệ số co thời gian cho test/dev (vd 0.02 → đêm 30s thành 0.6s). */
const TIMER_SCALE = Number(process.env.MASOI_TIMER_SCALE || '1');
const ms = (seconds: number) => Math.max(50, seconds * 1000 * TIMER_SCALE);

const DISCONNECT_GRACE_MS = ms(90); // quá hạn re-join → xử như rời ván (PLAN §7.5)

export interface Member {
  userId: string | null; // null = bot
  name: string;
  avatar: number;
  isBot: boolean;
  connected: boolean;
  socketId: string | null;
  seat: number | null; // gán khi ván bắt đầu
  disconnectTimer: NodeJS.Timeout | null;
  lastChatAt: number;
  lastEmoteAt: number;
}

interface GameRun {
  state: EngineState;
  deadline: number | null;
  timer: NodeJS.Timeout | null;
  botRng: Map<number, number>;
  /** Chống schedule bot 2 lần cho cùng (pha, bước, ghế). */
  scheduledBotKeys: Set<string>;
}

export class Room {
  code: string;
  config: RoomConfig;
  members: Member[] = [];
  hostUserId: string;
  status: 'waiting' | 'starting' | 'inGame' | 'finished' = 'waiting';
  game: GameRun | null = null;
  /** Lịch sử chat (mọi kênh) — để gửi lại khi reload/reconnect. */
  private history: ChatMessage[] = [];

  constructor(
    private io: Server,
    private manager: RoomManager,
    host: User,
    config: RoomConfig,
  ) {
    this.code = generateRoomCode((c) => manager.rooms.has(c));
    this.config = config;
    this.hostUserId = host.id;
    this.addHuman(host);
  }

  // ===== Thành viên =====

  addHuman(user: User): Member {
    const m: Member = {
      userId: user.id,
      name: user.name,
      avatar: user.avatar,
      isBot: false,
      connected: true,
      socketId: null,
      seat: null,
      disconnectTimer: null,
      lastChatAt: 0,
      lastEmoteAt: 0,
    };
    this.members.push(m);
    return m;
  }

  addBot(): Member | null {
    if (this.members.length >= this.config.maxPlayers) return null;
    const used = new Set(this.members.map((m) => m.name));
    const name = BOT_NAMES.find((n) => !used.has(n)) ?? `Bot ${this.members.length}`;
    const m: Member = {
      userId: null,
      name,
      avatar: crypto.randomInt(12),
      isBot: true,
      connected: true,
      socketId: null,
      seat: null,
      disconnectTimer: null,
      lastChatAt: 0,
      lastEmoteAt: 0,
    };
    this.members.push(m);
    return m;
  }

  memberByUser(userId: string): Member | undefined {
    return this.members.find((m) => m.userId === userId);
  }

  memberBySeat(seat: number): Member | undefined {
    return this.members.find((m) => m.seat === seat);
  }

  humanMembers(): Member[] {
    return this.members.filter((m) => !m.isBot);
  }

  /** Host rời ở lobby → chuyển host cho người thật vào sớm nhất (PLAN §7.2). */
  migrateHost(): void {
    const next = this.humanMembers()[0];
    if (next?.userId) this.hostUserId = next.userId;
  }

  // ===== View & emit =====

  roomViewFor(member: Member | null): RoomView {
    return {
      code: this.code,
      config: this.config,
      members: this.members.map((m, i) => ({
        seat: m.seat ?? i,
        name: m.name,
        avatar: m.avatar,
        isBot: m.isBot, // O2: phòng riêng hiện nhãn bot
        isHost: m.userId !== null && m.userId === this.hostUserId,
        connected: m.connected,
      })),
      status: this.status,
      yourSeat: member ? (member.seat ?? this.members.indexOf(member)) : null,
    };
  }

  broadcastRoom(): void {
    for (const m of this.humanMembers()) {
      if (m.socketId) this.io.to(m.socketId).emit('room:update', this.roomViewFor(m));
    }
  }

  stateSyncFor(member: Member): StateSync | null {
    if (!this.game || member.seat === null) return null;
    const sync: StateSync = {
      view: buildView(this.game.state, member.seat),
      deadlineTs: this.game.deadline,
      serverTime: Date.now(),
    };
    if (this.game.state.phase.kind === 'night') sync.nightProgress = this.nightProgress();
    return sync;
  }

  syncAll(): void {
    for (const m of this.humanMembers()) {
      if (!m.socketId) continue;
      const sync = this.stateSyncFor(m);
      if (sync) this.io.to(m.socketId).emit('game:stateSync', sync);
    }
  }

  /** Tiến độ tổng của đêm — không lộ đang ở bước nào (PLAN §2.2). */
  private nightProgress(): number {
    const g = this.game!;
    if (g.state.phase.kind !== 'night') return 0;
    const preset = TIMER_PRESETS[this.config.timerPreset];
    const dur = (step: string) =>
      step === 'wolvesReveal' ? preset.wolvesReveal
      : step === 'wolves' ? preset.wolves
      : step === 'witch' ? preset.witch
      : preset.nightStep;
    const total = g.state.nightPlan.reduce((acc, s) => acc + dur(s), 0);
    const done = g.state.nightPlan.slice(0, g.state.phase.stepIndex).reduce((acc, s) => acc + dur(s), 0);
    return total > 0 ? done / total : 0;
  }

  sendSystem(text: string): void {
    const msg: ChatMessage = { channel: 'village', fromSeat: -1, fromName: 'Làng', text, ts: Date.now() };
    this.pushHistory(msg);
    for (const m of this.humanMembers()) {
      if (m.socketId) this.io.to(m.socketId).emit('chat:message', msg);
    }
  }

  private pushHistory(msg: ChatMessage): void {
    this.history.push(msg);
    if (this.history.length > 150) this.history.splice(0, this.history.length - 150);
  }

  /** Lịch sử mà member được phép đọc Ở THỜI ĐIỂM HIỆN TẠI (không lộ kênh kín cũ cho người mới đổi trạng thái). */
  historyFor(member: Member): ChatMessage[] {
    const readable = new Set<ChannelId>(['lobby', 'village']);
    const g = this.game;
    if (g && member.seat !== null) {
      const p = g.state.players[member.seat];
      if (p?.faction === 'wolves') readable.add('wolf');
      if (p && !p.alive) readable.add('dead');
    }
    return this.history.filter((m) => readable.has(m.channel));
  }

  // ===== Vòng đời ván =====

  start(): ErrorCode | null {
    if (this.status !== 'waiting' && this.status !== 'finished') return 'ROOM_ALREADY_STARTED';
    const n = this.members.length;
    if (n < MIN_PLAYERS) return 'NOT_ENOUGH_PLAYERS';
    this.status = 'starting';
    this.broadcastRoom();
    setTimeout(() => this.actuallyStart(), ms(3));
    return null;
  }

  private actuallyStart(): void {
    if (this.status !== 'starting') return;
    const n = this.members.length;
    const seed = crypto.randomInt(2 ** 31);
    const config = {
      playerCount: n,
      roles: buildRoleSet(n),
      timers: TIMER_PRESETS[this.config.timerPreset],
    };
    this.members.forEach((m, i) => (m.seat = i));
    const state = createGame(
      config,
      this.members.map((m) => ({ name: m.name, avatar: m.avatar, isBot: m.isBot })),
      seed,
    );
    this.game = {
      state,
      deadline: null,
      timer: null,
      botRng: new Map(this.members.map((m, i) => [i, (seed ^ (i * 2654435761)) | 0])),
      scheduledBotKeys: new Set(),
    };
    this.status = 'inGame';
    this.broadcastRoom();
    this.sendSystem('🎴 Ván bắt đầu! Mỗi người nhận một vai bí mật.');
    this.schedulePhase();
    this.syncAll();
  }

  private phaseKey(): string {
    const s = this.game!.state;
    const detail =
      s.phase.kind === 'night' ? s.phase.stepIndex
      : s.phase.kind === 'dayDiscuss' ? s.phase.speakIndex
      : s.phase.kind === 'hunterShot' ? s.phase.hunterSeat
      : 0;
    return `${s.phase.kind}:${detail}:n${s.nightNumber}:d${s.dayNumber}`;
  }

  /** Đặt đồng hồ cho pha hiện tại + đánh thức bot. */
  private schedulePhase(): void {
    const g = this.game;
    if (!g) return;
    if (g.timer) clearTimeout(g.timer);
    g.scheduledBotKeys.clear();

    if (g.state.phase.kind === 'gameOver') {
      g.deadline = null;
      g.timer = null;
      this.status = 'finished';
      this.broadcastRoom();
      return;
    }

    const key = durationKey(g.state);
    const preset = TIMER_PRESETS[this.config.timerPreset];
    let duration = key ? ms(preset[key]) : ms(10);

    // Bước đêm không có ai hành động (vai chết) → chỉ đệm 3–6s, không chạy full (PLAN §2.2)
    const step = currentNightStep(g.state);
    if (step && step !== 'wolvesReveal' && currentActors(g.state).length === 0) {
      duration = ms(3) + Math.random() * ms(3);
    }

    g.deadline = Date.now() + duration;
    g.timer = setTimeout(() => this.advancePhase(), duration);
    this.scheduleBots();
  }

  private advancePhase(): void {
    const g = this.game;
    if (!g || g.state.phase.kind === 'gameOver') return;
    const prev = g.state;
    g.state = advance(g.state);
    this.onTransition(prev);
  }

  /** Sau MỌI thay đổi pha/bước: feed + đồng hồ mới + sync. */
  private onTransition(prev: EngineState): void {
    const g = this.game;
    if (!g) return;
    this.emitFeed(prev, g.state);
    this.schedulePhase();
    this.syncAll();
  }

  private emitFeed(prev: EngineState, next: EngineState): void {
    if (prev.phase.kind === next.phase.kind && prev.nightNumber === next.nightNumber && prev.dayNumber === next.dayNumber) return;
    const name = (seat: number) => next.players[seat]?.name ?? '???';
    switch (next.phase.kind) {
      case 'night':
        if (prev.phase.kind !== 'night') {
          this.sendSystem(
            next.nightNumber === 0
              ? '🌙 Đêm đầu tiên buông xuống. Bầy Sói lặng lẽ nhận mặt nhau...'
              : `🌙 Đêm thứ ${next.nightNumber} buông xuống. Cả làng chìm vào giấc ngủ.`,
          );
        }
        break;
      case 'dayAnnounce': {
        const deaths = next.pendingAnnounce;
        if (next.dayNumber === 1) {
          this.sendSystem('🌅 Trời sáng. Ngày đầu tiên: làm quen và dò xét — hôm nay KHÔNG treo cổ.');
        } else if (deaths.length === 0) {
          this.sendSystem('🌅 Trời sáng. Đêm qua bình yên, không ai chết.');
        } else {
          this.sendSystem(`🌅 Trời sáng. Đêm qua: ${deaths.map((d) => name(d.seat)).join(', ')} đã chết.`);
        }
        break;
      }
      case 'hunterShot':
        this.sendSystem(`🏹 ${name(next.phase.hunterSeat)} là Thợ săn! Phát súng cuối cùng đang lên nòng...`);
        break;
      case 'dayDiscuss':
        if (prev.phase.kind !== 'dayDiscuss') {
          this.sendSystem('🗣️ Thảo luận bắt đầu — lượt nói theo thứ tự ngẫu nhiên.');
        }
        break;
      case 'dayVote':
        this.sendSystem('🗳️ Biểu quyết treo cổ! Chọn một người hoặc "Tha". Đổi phiếu được tới khi hết giờ.');
        break;
      case 'voteResult':
        this.sendSystem(
          next.lastLynched !== null
            ? `⚖️ Làng đã quyết: ${name(next.lastLynched)} bị treo cổ.`
            : '⚖️ Không ai bị treo (hòa phiếu hoặc "Tha" thắng).',
        );
        break;
      case 'gameOver':
        this.sendSystem(next.phase.winner === 'village' ? '🏆 PHE DÂN LÀNG THẮNG! Bầy Sói đã bị quét sạch.' : '🐺 PHE MA SÓI THẮNG! Bầy Sói đã áp đảo dân làng.');
        break;
      default:
        break;
    }
    // Thợ săn vừa bắn ai đó (phát hiện qua deathCause mới)
    for (const p of next.players) {
      const before = prev.players[p.seat];
      if (before?.alive && !p.alive && p.deathCause === 'hunter') {
        this.sendSystem(`🏹 ${name(p.seat)} trúng phát súng của Thợ săn!`);
      }
    }
  }

  // ===== Hành động người chơi =====

  applyEngineAction(seat: number, action: EngineAction): ErrorCode | null {
    const g = this.game;
    if (!g || this.status !== 'inGame') return 'PHASE_CLOSED';
    const prevKey = this.phaseKey();
    const prevState = g.state;
    const r = submitAction(g.state, action);
    if (r.error) return r.error;
    g.state = r.state;
    if (this.phaseKey() !== prevKey) {
      // speakDone/hunterShoot/leave có thể đổi pha ngay trong action
      this.onTransition(prevState);
      return null;
    }
    // Đủ input → chốt bước sớm với đệm ngẫu nhiên nhỏ (PLAN §7.3)
    if (readyToAdvance(g.state) && g.deadline !== null) {
      const padded = Date.now() + ms(1.2) + Math.random() * ms(0.8);
      if (padded < g.deadline) {
        if (g.timer) clearTimeout(g.timer);
        g.deadline = padded;
        g.timer = setTimeout(() => this.advancePhase(), padded - Date.now());
      }
    }
    this.syncAll();
    return null;
  }

  handleLeaveGame(member: Member): void {
    if (this.game && member.seat !== null && this.status === 'inGame') {
      const p = this.game.state.players[member.seat];
      if (p?.alive) {
        this.sendSystem(`🚪 ${member.name} đã rời ván — coi như đã chết (luật vắng mặt).`);
        this.applyEngineAction(member.seat, { type: 'leave', seat: member.seat });
      }
    }
  }

  setMemberAccusal(member: Member, target: number | null): ErrorCode | null {
    const g = this.game;
    if (!g || member.seat === null) return 'PHASE_CLOSED';
    const kind = g.state.phase.kind;
    if (kind !== 'dayAnnounce' && kind !== 'dayDiscuss' && kind !== 'dayVote') return 'PHASE_CLOSED';
    g.state = setAccusal(g.state, member.seat, target);
    for (const m of this.humanMembers()) {
      if (m.socketId) this.io.to(m.socketId).emit('accuse:update', { ...g.state.accusals });
    }
    return null;
  }

  // ===== Chat =====

  canChat(member: Member, channel: ChannelId): boolean {
    if (channel === 'lobby') return this.status !== 'inGame';
    const g = this.game;
    if (!g || member.seat === null || this.status !== 'inGame') return false;
    const p = g.state.players[member.seat];
    if (!p) return false;
    switch (channel) {
      case 'village':
        // chỉ người tới lượt nói, trong pha thảo luận (PLAN §4.1)
        return p.alive && g.state.phase.kind === 'dayDiscuss' && currentSpeaker(g.state) === member.seat;
      case 'wolf': {
        const step = currentNightStep(g.state);
        return p.alive && p.faction === 'wolves' && (step === 'wolves' || step === 'wolvesReveal');
      }
      case 'dead':
        return !p.alive;
      default:
        return false;
    }
  }

  chatRecipients(channel: ChannelId): Member[] {
    const humans = this.humanMembers();
    if (channel === 'lobby' || channel === 'village') return humans; // khán giả đọc được kênh chung
    const g = this.game;
    if (!g) return [];
    if (channel === 'wolf') {
      return humans.filter((m) => m.seat !== null && g.state.players[m.seat]?.faction === 'wolves');
    }
    return humans.filter((m) => m.seat !== null && !g.state.players[m.seat]?.alive); // dead
  }

  deliverChat(fromMember: Member, channel: ChannelId, text: string): void {
    const msg: ChatMessage = {
      channel,
      fromSeat: fromMember.seat ?? this.members.indexOf(fromMember),
      fromName: fromMember.name,
      text,
      ts: Date.now(),
    };
    this.pushHistory(msg);
    for (const m of this.chatRecipients(channel)) {
      if (m.socketId) this.io.to(m.socketId).emit('chat:message', msg);
    }
  }

  /** Người chết không được tác động vào người sống — kể cả bằng emote (luật 11.4). */
  canEmote(member: Member): boolean {
    if (this.status !== 'inGame' || !this.game || member.seat === null) return true; // lobby thoải mái
    return this.game.state.players[member.seat]?.alive ?? false;
  }

  // ===== Bot =====

  private scheduleBots(): void {
    const g = this.game;
    if (!g || g.state.phase.kind === 'gameOver') return;
    const key = this.phaseKey();
    for (const seat of currentActors(g.state)) {
      const member = this.memberBySeat(seat);
      if (!member?.isBot) continue;
      const botKey = `${key}:${seat}`;
      if (g.scheduledBotKeys.has(botKey)) continue;
      g.scheduledBotKeys.add(botKey);
      const delay = ms(1.2) + Math.random() * ms(2.5); // trễ giống người (PLAN §8.1)
      setTimeout(() => this.runBot(seat, key), delay);
    }
  }

  private runBot(seat: number, scheduledKey: string): void {
    const g = this.game;
    if (!g || this.status !== 'inGame' || this.phaseKey() !== scheduledKey) return;
    const view = buildView(g.state, seat);
    const move = decideBotMove(view, g.botRng.get(seat) ?? seat);
    g.botRng.set(seat, move.rngState);
    const member = this.memberBySeat(seat);
    if (!member) return;

    if (move.accuse !== undefined) this.setMemberAccusal(member, move.accuse);

    if (move.say?.length && this.canChat(member, 'village')) {
      for (const line of move.say) this.deliverChat(member, 'village', line);
    }

    if (move.action) {
      const a = move.action;
      const engineAction: EngineAction =
        a.kind === 'witch'
          ? { type: 'witch', seat, save: a.save, poisonTarget: a.poisonTarget }
          : a.kind === 'vote'
            ? { type: 'vote', seat, target: a.target }
            : a.kind === 'hunterShoot'
              ? { type: 'hunterShoot', seat, target: a.target }
              : { type: a.kind, seat, target: a.target };
      this.applyEngineAction(seat, engineAction);
    }

    if (move.speakDone) {
      // nói xong nghỉ một nhịp rồi kết thúc lượt
      const doneDelay = ms(1) + (move.say?.length ?? 0) * ms(1.5);
      setTimeout(() => {
        const g2 = this.game;
        if (!g2 || this.status !== 'inGame') return;
        if (g2.state.phase.kind === 'dayDiscuss' && currentSpeaker(g2.state) === seat) {
          this.applyEngineAction(seat, { type: 'speakDone', seat });
        }
      }, doneDelay);
    }
  }

  // ===== Dọn dẹp =====

  dispose(): void {
    if (this.game?.timer) clearTimeout(this.game.timer);
    for (const m of this.members) {
      if (m.disconnectTimer) clearTimeout(m.disconnectTimer);
    }
    this.game = null;
  }
}

export class RoomManager {
  rooms = new Map<string, Room>();
  userRoom = new Map<string, string>(); // userId → roomCode

  constructor(private io: Server) {}

  createRoom(host: User, config: RoomConfig): Room | { error: ErrorCode } {
    this.leaveCurrentRoom(host.id);
    const room = new Room(this.io, this, host, config);
    this.rooms.set(room.code, room);
    this.userRoom.set(host.id, room.code);
    return room;
  }

  joinRoom(user: User, code: string): Room | { error: ErrorCode } {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return { error: 'ROOM_NOT_FOUND' };
    const existing = room.memberByUser(user.id);
    if (existing) return room; // re-join
    if (room.status !== 'waiting' && room.status !== 'finished') return { error: 'ROOM_ALREADY_STARTED' };
    if (room.members.length >= room.config.maxPlayers) return { error: 'ROOM_FULL' };
    this.leaveCurrentRoom(user.id);
    room.addHuman(user);
    this.userRoom.set(user.id, room.code);
    return room;
  }

  roomOfUser(userId: string): Room | null {
    const code = this.userRoom.get(userId);
    return code ? (this.rooms.get(code) ?? null) : null;
  }

  leaveCurrentRoom(userId: string): void {
    const room = this.roomOfUser(userId);
    if (!room) return;
    const member = room.memberByUser(userId);
    this.userRoom.delete(userId);
    if (!member) return;
    room.handleLeaveGame(member);
    room.members = room.members.filter((m) => m !== member);
    if (member.disconnectTimer) clearTimeout(member.disconnectTimer);
    if (room.hostUserId === userId) room.migrateHost();
    if (room.humanMembers().length === 0) {
      room.dispose();
      this.rooms.delete(room.code);
      return;
    }
    room.broadcastRoom();
  }

  /** Mất kết nối: giữ slot, quá hạn xử như rời (PLAN §7.5). */
  handleDisconnect(userId: string): void {
    const room = this.roomOfUser(userId);
    const member = room?.memberByUser(userId);
    if (!room || !member) return;
    member.connected = false;
    member.socketId = null;
    room.broadcastRoom();
    if (room.status === 'inGame') {
      member.disconnectTimer = setTimeout(() => {
        this.leaveCurrentRoom(userId);
      }, DISCONNECT_GRACE_MS);
    } else if (room.status === 'waiting' || room.status === 'finished') {
      // rời lobby luôn sau 30s mất kết nối
      member.disconnectTimer = setTimeout(() => this.leaveCurrentRoom(userId), ms(30));
    }
  }

  handleReconnect(userId: string, socketId: string): Room | null {
    const room = this.roomOfUser(userId);
    const member = room?.memberByUser(userId);
    if (!room || !member) return null;
    member.connected = true;
    member.socketId = socketId;
    if (member.disconnectTimer) {
      clearTimeout(member.disconnectTimer);
      member.disconnectTimer = null;
    }
    room.broadcastRoom();
    return room;
  }
}
