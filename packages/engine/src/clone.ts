// structuredClone có ở Node 17+/browser nhưng type nằm trong lib DOM/@types/node —
// engine không được phụ thuộc hai thứ đó, nên tự khai báo type tại chỗ.
const sc = (globalThis as unknown as { structuredClone: <T>(value: T) => T }).structuredClone;

export function clone<T>(value: T): T {
  return sc(value);
}
