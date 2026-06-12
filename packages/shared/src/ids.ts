// Nguồn duy nhất cho các id dùng chung FE/BE/engine/bot.
// GĐ1: 6 vai core. Vai mở rộng (GĐ3) thêm vào đây, KHÔNG đổi giá trị đã có.

export const ROLE_IDS = ['villager', 'werewolf', 'seer', 'guard', 'witch', 'hunter'] as const;
export type RoleId = (typeof ROLE_IDS)[number];

export type Faction = 'village' | 'wolves';

export const ROLE_INFO: Record<RoleId, { name: string; faction: Faction; desc: string }> = {
  villager: { name: 'Dân làng', faction: 'village', desc: 'Không có năng lực. Suy luận, thảo luận và biểu quyết để tìm Sói.' },
  werewolf: { name: 'Ma Sói', faction: 'wolves', desc: 'Mỗi đêm cùng bầy thống nhất cắn một người. Ban ngày giả làm Dân.' },
  seer: { name: 'Tiên tri', faction: 'village', desc: 'Mỗi đêm soi một người để biết kín người đó là Sói hay không.' },
  guard: { name: 'Bảo vệ', faction: 'village', desc: 'Mỗi đêm chọn một người khác mình để chặn Sói cắn. Không giữ một người hai đêm liền.' },
  witch: { name: 'Phù thủy', faction: 'village', desc: 'Có 1 Bình Cứu và 1 Bình Độc, mỗi bình dùng một lần cả ván. Đêm được báo kín ai bị Sói cắn.' },
  hunter: { name: 'Thợ săn', faction: 'village', desc: 'Khi chết (vì bất kỳ lý do gì) được bắn ngay một người trước khi rời cuộc chơi.' },
};

export type NightStepId = 'wolvesReveal' | 'seer' | 'guard' | 'wolves' | 'witch';

/** Trình tự bước đêm cố định (Mục 6 luật, rút gọn cho 6 vai GĐ1). */
export const NIGHT_ORDER: NightStepId[] = ['seer', 'guard', 'wolves', 'witch'];

export type PhaseKind =
  | 'roleReveal'
  | 'night'
  | 'dayAnnounce'
  | 'hunterShot'
  | 'dayDiscuss'
  | 'dayVote'
  | 'voteResult'
  | 'gameOver';

/** Công bố chỉ nói chết kiểu gì, không lộ nguyên nhân bí mật (cắn/độc đều là 'night'). */
export type DeathCause = 'night' | 'lynch' | 'hunter' | 'leave';

export type Winner = 'village' | 'wolves';

export type ChannelId = 'lobby' | 'village' | 'wolf' | 'dead';

export const EMOTES = ['👍', '😱', '🤔', '😡', '😂', '❤️'] as const;
export type EmoteId = (typeof EMOTES)[number];

export const MERCY = 'mercy' as const;
export type VoteTarget = number | typeof MERCY;
