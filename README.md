# 🐺 Ma Sói — Ngôi làng trong sương đêm

Web game Ma Sói (Werewolf) chơi online nhiều người: phòng riêng theo mã mời, chơi không cần Quản trò (luật + thứ tự lượt là trọng tài), bot lấp chỗ khi thiếu người. Tiếng Việt, server-authoritative, realtime qua WebSocket.

> Luật chơi đầy đủ: [docs/LUAT_MA_SOI.md](docs/LUAT_MA_SOI.md) · Thiết kế: [docs/PLAN.md](docs/PLAN.md) · Tiến độ: [docs/PROGRESS.md](docs/PROGRESS.md)

## Trạng thái: GĐ1 — MVP chơi được với bạn ✅

- 6 vai core: Dân làng, Ma Sói, Tiên tri, Bảo vệ, Phù thủy, Thợ săn (5–18 người, bộ vai tự cân bằng theo luật).
- Phòng riêng theo mã 6 ký tự + link mời; host thêm bot để đủ người.
- Đêm chạy lần lượt từng bước kín; ngày thảo luận theo **lượt nói ngẫu nhiên**; biểu quyết có "Tha", công khai bảng phiếu sau khi khóa.
- Chat đa kênh (Làng / Sói / Người chết), emote, chỉ điểm; chế độ khán giả khi chết.
- Bot heuristic biết hành động theo vai và phát biểu khi tới lượt.
- Âm thanh tổng hợp WebAudio (không cần asset): sting chuyển pha, trống công bố chết, chuông treo cổ, chime tới lượt.
- Giai đoạn sau (xem PLAN §12): ghép trận người lạ, tài khoản Google/email, hồ sơ + thống kê, vai mở rộng.

## Chạy dự án

Yêu cầu: Node ≥ 22, pnpm ≥ 10.

```bash
pnpm install

# Dev (server :3210 + web :5173, hot-reload)
pnpm dev

# Production local (server serve luôn web đã build)
pnpm build
pnpm --filter @masoi/server start   # → http://localhost:3210
```

Mở http://localhost:5173 (dev) — nhập tên → tạo phòng → thêm bot cho đủ 5 → bắt đầu. Muốn xem ván chạy nhanh khi thử nghiệm: đặt `MASOI_TIMER_SCALE=0.25` trước khi start server (mọi đồng hồ pha nhân hệ số này).

## Kiểm tra

```bash
pnpm test        # engine: ma trận luật + chống leak + determinism (fast-check); server: smoke full ván
pnpm typecheck
pnpm lint
```

## Cấu trúc monorepo

```
packages/shared   # ids, cấu hình chia vai, timer presets, event contract, RedactedView types
packages/engine   # luật thuần: state machine, resolver đêm, vote, win check — deterministic, seed RNG, 0 I/O
packages/bots     # bộ não bot heuristic (chỉ nhìn RedactedView như người thật)
apps/server       # Node + Socket.IO: phòng, đồng hồ pha, chat đa kênh, bot driver, auth guest
apps/web          # React + Vite + Tailwind: theme "Ngôi làng trong sương đêm"
```

Nguyên tắc cốt lõi (PLAN §11): client chỉ nhận **góc nhìn đã lọc** (`buildView`) — vai người khác, mục tiêu của vai khác, nội dung kênh ngoài quyền không bao giờ rời server.
