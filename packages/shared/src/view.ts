import type { DeathCause, Faction, RoleId, VoteTarget, Winner } from './ids.js';

/** Thông tin public của một ghế — KHÔNG bao giờ chứa vai khi đang chơi. */
export interface PlayerPublic {
  seat: number;
  name: string;
  avatar: number;
  alive: boolean;
  connected: boolean;
  isBot: boolean; // O2: phòng riêng hiện nhãn bot (GĐ1 mọi phòng là phòng riêng)
}

export interface DeathNotice {
  seat: number;
  cause: DeathCause;
}

export type PhaseView =
  | { kind: 'roleReveal' }
  | { kind: 'night' } // không lộ đang ở bước vai nào (chống timing-leak §2.2)
  | { kind: 'dayAnnounce'; deaths: DeathNotice[] }
  | { kind: 'hunterShot'; hunterSeat: number }
  | { kind: 'dayDiscuss'; speakOrder: number[]; currentSpeaker: number | null; spoken: number[]; canVoteToday: boolean }
  | { kind: 'dayVote'; voted: number[] }
  | { kind: 'voteResult'; ballots: Array<{ voter: number; target: VoteTarget | null }>; lynched: number | null }
  | { kind: 'gameOver'; winner: Winner; reveal: Array<{ seat: number; role: RoleId; faction: Faction }> };

/** Prompt hành động — chỉ gửi riêng cho người tới lượt. */
export interface ActionPrompt {
  step: 'seer' | 'guard' | 'wolves' | 'witch' | 'vote' | 'speak' | 'hunterShoot';
  validTargets: number[];
  /** Lựa chọn hiện tại (đổi được tới khi hết giờ). */
  chosen?: number | null;
  /** Riêng Phù thủy. */
  witch?: {
    victim: number | null; // O7: báo đúng người Sói nhắm, không lộ có được bảo vệ hay không
    canSave: boolean;
    canPoison: boolean;
    save: boolean;
    poisonTarget: number | null;
  };
  /** Riêng Sói: phiếu nội bộ hiện tại của bầy. */
  wolfVotes?: Record<number, number>;
}

/**
 * Góc nhìn đã lọc cho một ghế (hoặc khán giả ngoài).
 * Đây là TOÀN BỘ những gì client được biết — render thuần từ đây (PLAN §10, §11).
 */
export interface RedactedView {
  you: {
    seat: number;
    role: RoleId;
    faction: Faction;
    alive: boolean;
    prompt: ActionPrompt | null;
  } | null; // null = khán giả không trong ván
  players: PlayerPublic[];
  nightNumber: number;
  dayNumber: number;
  phase: PhaseView;
  /** Chỉ có nếu bạn là Sói: ghế đồng đội. */
  wolves?: number[];
  /** Chỉ có nếu bạn là Tiên tri: kết quả các đêm đã soi. */
  seerResults?: Array<{ night: number; seat: number; isWolf: boolean }>;
  /** Chỉ có nếu bạn là Phù thủy: bình còn lại. */
  potions?: { heal: boolean; poison: boolean };
  /** Ai đang chỉ điểm ai (public, reset mỗi sáng). */
  accusals: Record<number, number>;
}
