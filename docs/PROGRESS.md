# Ma Sói Web App — Tiến độ & Kết quả

> Lần cập nhật gần nhất: 2026-06-13
> Tổng: **15 pass / 0 fail / 1 skip / 0 pending** (16 task — GĐ1)

Phạm vi đợt này: **GĐ1 — MVP chơi được với bạn** (PLAN §12.1, M0–M5). GĐ2/GĐ3 chưa phân rã — sẽ thêm task khi tới.

## 1. Tiến độ qua các lần làm

| Lần | Pass | Fail | Skip | Pending | Thay đổi chính |
|---|---|---|---|---|---|
| Baseline (2026-06-13) | 0 | 0 | 0 | 16 | Phân rã GĐ1 thành 16 task |
| Iter 1 (2026-06-13) | 15 | 0 | 1 | 0 | Code toàn bộ GĐ1: monorepo 5 gói, engine + 32 test, server + smoke test, web đầy đủ màn + hiệu ứng đợt 1. Verify end-to-end bằng browser thật (1 người + 4 bot chơi trọn ván) |
| Mục tiêu GĐ1 | ≥ 14 | 0 | ≤ 2 | 0 | ✅ ĐẠT |

## 2. Trạng thái từng task

| # | Tên task | Mô tả ngắn | Trạng thái |
|---|---|---|---|
| T1 | Scaffold monorepo (M0) | pnpm workspaces + Turborepo + TS strict + ESLint/Prettier + Vitest + CI GitHub Actions (lint/typecheck/test/build). | Pass |
| T2 | Gói `shared` (M1) | Role/phase/channel ids, bảng chia vai theo số người (đúng Mục 4 luật), 3 timer preset, event contract + RedactedView types. | Pass |
| T3 | Engine: state machine pha (M2) | Đêm 0 chỉ khởi tạo → Ngày 1 không vote → Đêm 1… ; đêm chạy lần lượt từng bước, bước không có vai bị bỏ qua (server đệm 3–6s chống timing-leak). | Pass |
| T4 | Engine: resolver 6 vai core (M2) | Pipeline cố định: Sói đa số phiếu → Bảo vệ chặn → Phù thủy cứu/độc (O7: bình tiêu kể cả cứu người được chặn; độc xuyên bảo vệ) → dây chuyền Thợ săn interrupt → kiểm thắng sau khi hết dây chuyền. | Pass |
| T5 | Engine: bộ test ma trận (M2) | 21 test luật + 3 test determinism/kết-thúc (fast-check, 40 ván random) — **31 test xanh ngay lần chạy đầu** (1 lỗi tìm thấy nằm ở test, không phải engine: quên phiếu trắng = "Tha"). | Pass |
| T6 | Engine: view builder + test chống leak (M2) | `buildView` per-seat; 7 test leak: dân không thấy vai/bước/mục tiêu ai, Sói thấy bầy, Phù thủy không biết nạn nhân có được Bảo vệ, công bố chết không kèm vai, chỉ gameOver mới lật bài. | Pass |
| T7 | Server: auth guest + phòng theo mã (M3) | Cookie phiên HttpOnly, mã phòng 6 ký tự (bỏ O/0 I/1), host thêm/kick bot, chuyển host, chơi lại sau ván. Store in-memory (Postgres vào GĐ2 theo PLAN). | Pass |
| T8 | Server: game runner + đồng hồ pha (M3) | Deadline phía server (client chỉ render), early-advance khi đủ hành động + đệm ngẫu nhiên, tiến độ đêm tổng (không lộ bước), mất kết nối giữ slot 90s rồi xử như rời ván. | Pass |
| T9 | Server: chat đa kênh + emote + accuse (M3) | Kênh Làng (chỉ người tới lượt nói), kênh Sói (chỉ bước Sói ban đêm), kênh Người chết; rate-limit; enforce toàn bộ ở server. Feed hệ thống tường thuật ván. | Pass |
| T10 | Bot heuristic cơ bản (GĐ1) | Hành động hợp lệ có chủ đích (Tiên tri soi người bị nghi, Sói phối hợp mục tiêu, Phù thủy cứu sớm/độc dè dặt, vote theo đám đông), trễ 1.2–3.7s giống người, nói mẫu câu tiếng Việt + biết im lặng. Suy luận sâu = GĐ2. | Pass |
| T11 | Web: scaffold + theme (M4) | Vite + React 19 + Tailwind 4; tokens "Ngôi làng trong sương đêm" (PLAN §13.1) đổi theo pha bằng CSS variables; Cormorant + Be Vietnam Pro; trăng/sao/sương/đom đóm CSS; `prefers-reduced-motion`. Bundle 99KB gz (ngân sách 300KB). | Pass |
| T12 | Web: Landing + Lobby + Phòng chờ (M4) | Tạo guest + chọn chân dung; tạo phòng (số người + nhịp độ); vào bằng mã/link; phòng chờ: copy link, slot, nhãn BOT, kick, preview bộ vai có tooltip luật. | Pass |
| T13 | Web: màn chơi (M4) | Banner pha + đồng hồ vòng; lưới người chơi (chết/vote/accuse/mất kết nối/spotlight); ActionPanel theo vai từng pha (soi/giữ/cắn + phiếu bầy/cứu-độc/bắn/vote+Tha); chat dock 3 kênh + emote; khán giả desaturate; modal kết thúc lật vai + chơi lại. | Pass |
| T14 | Web: hiệu ứng đợt 1 (M4) | E1/E2 chuyển pha (đổi màu 2.5s + trăng mọc + tiêu đề ĐÊM/NGÀY THỨ N), E3 lật bài vai 3D, E4 spotlight + ring lượt nói, E10 nút glow + emote bay + tin nhắn slide. Âm thanh: **Skip** (xem F1). | Pass |
| T15 | Chạy production local (M5) | `pnpm build` → server serve static; README hướng dẫn; smoke test tích hợp (socket.io-client, ván full bot create→gameOver, 3.5s); **verify tay bằng Playwright browser**: landing → lobby → phòng → ván trọn vẹn → modal kết quả (screenshot tại `docs/screenshots/`). | Pass |
| T16 | Deploy public (M5) | Đưa lên hosting free-tier. | Blocked — cần user chọn provider + tài khoản (PLAN §12.2) |

## 3. Phân tích lỗi / việc chủ động bỏ qua (gom theo root cause)

| # | Tên vấn đề | Mô tả | Ảnh hưởng |
|---|---|---|---|
| F1 | Chưa có âm thanh | Cần asset CC0 (sói hú, gà gáy, chuông, trống) — không tự sinh được trong đợt này. Stack Howler + audio sprite đã chốt trong PLAN §14.3, chỉ chờ asset. | Trải nghiệm thiếu lớp âm; không chặn gameplay |
| F2 | Asset hình tạm | Avatar = emoji, chưa phải chân dung khắc gỗ theo art direction §13.3. | Nhìn được nhưng chưa đúng chuẩn art; thay dần ở GĐ3 |
| F3 | Domain events engine hoãn | Engine chưa phát DomainEvent riêng (feed do server suy từ chuyển pha). Cần khi làm replay/thống kê GĐ2-3 (PLAN §6.5). | Không ảnh hưởng GĐ1; cần refactor nhẹ khi tới GĐ2 |

## 4. Việc cần làm tiếp

| Ưu tiên | Việc | Tác dụng |
|---|---|---|
| P0 | User chơi thử vài ván (`pnpm dev`), feedback nhịp đồng hồ + câu thoại bot | Playtest đầu tiên — input cho mọi tinh chỉnh |
| P1 | Chọn provider hosting → mở khoá T16 deploy | Bạn bè chơi qua link public |
| P2 | GĐ2: Postgres + tài khoản Google/email + hồ sơ thống kê; ghép trận + hàng đợi; domain events (F3) | Theo PLAN §12.1 |
| P3 | Asset âm thanh CC0 (F1) + chân dung theo art style (F2); vai mở rộng đợt 1 (Trưởng làng, Già làng, Thầy đồng, Cupid) | Nâng chất + nội dung GĐ3 |
