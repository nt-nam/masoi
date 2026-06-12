import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { Server } from 'socket.io';
import { createGuest, SESSION_COOKIE, userFromCookieHeader, validName } from './auth.js';
import { setupSockets } from './sockets.js';

const PORT = Number(process.env.PORT || 3210);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());

// ===== Auth guest (GĐ1 — Google/email vào GĐ2, PLAN §9) =====

app.post('/api/guest', (req, res) => {
  const { name, avatar } = req.body ?? {};
  if (!validName(name)) {
    res.status(400).json({ error: 'INVALID_NAME', message: 'Tên hiển thị 2–20 ký tự' });
    return;
  }
  const { user, token } = createGuest(String(name).trim(), Number(avatar) % 12 || 0);
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 3600}`,
  );
  res.json({ user });
});

app.get('/api/me', (req, res) => {
  const user = userFromCookieHeader(req.headers.cookie);
  if (!user) {
    res.status(401).json({ error: 'UNAUTHORIZED' });
    return;
  }
  res.json({ user });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// ===== Static (production: server phục vụ luôn web/dist) =====

const webDist = path.resolve(__dirname, '../../web/dist');
if (existsSync(webDist)) {
  app.use(express.static(webDist));
  app.get(/^\/(?!api|socket\.io).*/, (_req, res) => {
    res.sendFile(path.join(webDist, 'index.html'));
  });
}

const httpServer = createServer(app);
const io = new Server(httpServer, {
  // cùng origin (dev qua Vite proxy, prod serve static) → không cần CORS mở
  serveClient: false,
});

setupSockets(io);

httpServer.listen(PORT, () => {
  console.log(`[masoi] server chạy tại http://localhost:${PORT}`);
});

export { app, httpServer, io };
