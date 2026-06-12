export interface ApiUser {
  id: string;
  name: string;
  avatar: number;
  kind: 'guest';
}

export async function fetchMe(): Promise<ApiUser | null> {
  const res = await fetch('/api/me');
  if (!res.ok) return null;
  const data = await res.json();
  return data.user as ApiUser;
}

export async function createGuest(name: string, avatar: number): Promise<ApiUser> {
  const res = await fetch('/api/guest', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name, avatar }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? 'Không tạo được tài khoản khách');
  }
  const data = await res.json();
  return data.user as ApiUser;
}
