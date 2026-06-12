import crypto from 'node:crypto';

// Bỏ O/0, I/1 để đọc mã không nhầm (PLAN §3.1)
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateRoomCode(taken: (code: string) => boolean): string {
  for (let attempt = 0; attempt < 100; attempt++) {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += ALPHABET[crypto.randomInt(ALPHABET.length)];
    }
    if (!taken(code)) return code;
  }
  throw new Error('Không sinh được mã phòng');
}
