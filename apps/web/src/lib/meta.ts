import type { Faction, RoleId } from '@masoi/shared';

export const AVATARS = ['🧑‍🌾', '👩‍🌾', '🧔', '👵', '👴', '🧒', '👦', '👧', '🧙', '👱‍♀️', '🧑‍🦱', '🧓'];

export const ROLE_META: Record<RoleId, { icon: string; color: string }> = {
  villager: { icon: '🌾', color: 'var(--village)' },
  werewolf: { icon: '🐺', color: 'var(--wolf-bright)' },
  seer: { icon: '🔮', color: '#9f7aea' },
  guard: { icon: '🛡️', color: '#63b3ed' },
  witch: { icon: '🧪', color: '#68d391' },
  hunter: { icon: '🏹', color: '#f6ad55' },
};

export const FACTION_LABEL: Record<Faction, string> = {
  village: 'Phe Dân làng',
  wolves: 'Phe Ma Sói',
};

export function avatarOf(index: number): string {
  return AVATARS[((index % AVATARS.length) + AVATARS.length) % AVATARS.length]!;
}
