import crypto from 'node:crypto';

export interface User {
  id: string;
  name: string;
  avatar: number;
  kind: 'guest';
}

// GĐ1: store in-memory (PLAN §12.1 — Postgres vào GĐ2 cùng tài khoản/thống kê)
const byToken = new Map<string, User>();
const byId = new Map<string, User>();

export const SESSION_COOKIE = 'masoi_sid';

export function createGuest(name: string, avatar: number): { user: User; token: string } {
  const user: User = {
    id: crypto.randomUUID(),
    name,
    avatar,
    kind: 'guest',
  };
  const token = crypto.randomBytes(24).toString('base64url');
  byToken.set(token, user);
  byId.set(user.id, user);
  return { user, token };
}

export function userByToken(token: string | undefined): User | null {
  if (!token) return null;
  return byToken.get(token) ?? null;
}

export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export function userFromCookieHeader(header: string | undefined): User | null {
  return userByToken(parseCookies(header)[SESSION_COOKIE]);
}

export function validName(name: unknown): name is string {
  return typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 20;
}
