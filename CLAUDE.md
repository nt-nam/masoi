# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Dự án

Web game **Ma Sói** (Werewolf) chơi online nhiều người: phòng riêng theo mã + ghép trận người lạ có lấp bot, server-authoritative, tiếng Việt, ưu tiên hạ tầng free-tier. **GĐ1 (MVP 6 vai, phòng riêng + bot) đã code xong và chạy được** — xem `docs/PROGRESS.md`; GĐ2/GĐ3 theo PLAN §12. Tài liệu trong `docs/` là nguồn sự thật, code phải bám theo.

Giao tiếp với user và viết tài liệu bằng **tiếng Việt**.

## Nguồn sự thật (đọc trước khi làm)

| File | Vai trò |
|---|---|
| `docs/LUAT_MA_SOI.md` | Luật chơi đã chốt (bản cuối). Rules reference thuần, không chứa kỹ thuật. Online chơi **không có Quản trò** — luật + thứ tự lượt là trọng tài (Mục 11). **Không tự ý đổi luật**; muốn đổi phải hỏi user. |
| `docs/PLAN.md` | Kế hoạch & thiết kế đầy đủ, 17 section đều 🟢 đã chốt: kiến trúc, engine, data model + event contract, bot, auth, art direction, hiệu ứng, lộ trình GĐ1→GĐ3. 8 điểm luật mơ hồ đã chốt tại **§17.3 (O1–O8)** — engine phải theo đúng. |
| `docs/PROGRESS.md` | (Tạo khi bắt đầu code) theo dõi task atomic theo format mô tả trong PLAN. |

Quy ước tài liệu: cập nhật **in-place** (không tạo file v2); mỗi thay đổi quyết định append vào bảng "Lịch sử cập nhật" cuối `PLAN.md` kèm ngày + lý do, không xoá lịch sử. Tài liệu mới đặt trong `docs/`.

## Cách ra quyết định

Khi gặp điểm mở mà đã có phương án khuyến nghị/trội: **tự quyết theo phương án đó, ghi quyết định + lý do vào PLAN.md, không hỏi lại user**. Chỉ hỏi khi không có phương án trội hoặc thay đổi scope lớn (chỉ đạo của user 2026-06-13, ghi tại PLAN §17.3).

## Lệnh

```bash
pnpm install                          # Node ≥22, pnpm ≥10
pnpm dev                              # server :3001 + web :5173 (concurrently, hot-reload)
pnpm test                             # turbo run test — engine (Vitest: luật/leak/determinism) + server (smoke full ván)
pnpm --filter @masoi/engine test      # chỉ test engine; 1 file: pnpm --filter @masoi/engine exec vitest run test/rules.test.ts
pnpm typecheck                        # tsc --noEmit từng gói
pnpm lint                             # eslint flat config ở root
pnpm build                            # build web (server chạy bằng tsx, không cần build)
pnpm --filter @masoi/server start     # production local: serve luôn apps/web/dist trên :3001
```

- `MASOI_TIMER_SCALE=0.25` (env) co mọi đồng hồ pha — dùng khi thử nghiệm/test (smoke test đặt 0.012).
- Gói workspace là **source package** (main → `src/index.ts`, không build): vitest/tsx/vite ăn TS trực tiếp. Engine cấm import có-type-Node (xem `engine/src/clone.ts` cho pattern).
- PDF tài liệu: `node build_pdf.mjs docs/FILE.md` xuất HTML cạnh file nguồn; in PDF là bước Chrome headless thủ công, PDF có thể cũ hơn `.md`.

## Kiến trúc đã chốt (tóm tắt định hướng — chi tiết đọc PLAN)

TypeScript end-to-end, monorepo `packages/{shared,engine,bots}` + `apps/{server,web}`. Chiều phụ thuộc **một hướng**: `shared ← engine ← bots ← server`, `shared ← web` — `web` không được import resolver của engine.

Bất biến phải giữ khi viết code:

- **Engine** (`packages/engine`) là nguồn sự thật duy nhất của luật: thuần TS, deterministic, không I/O, RNG có seed — cấm `Date.now()`/`Math.random()` bên trong engine (thời gian đưa vào qua action). Cùng seed + action log → cùng kết quả (nền của replay).
- **Server-authoritative tuyệt đối:** client chỉ nhận **redacted view** dựng từ `buildView(state, viewer)` — một phễu duy nhất, không bao giờ serialize `GameState` trực tiếp ra socket. Có test chống leak per vai × pha (PLAN §11, §16.2).
- **Bot** nhận đúng redacted view như người thật và đi qua đúng engine — không đọc state gốc.
- **Chống timing-leak:** trong đêm chỉ hiện tiến độ tổng (không lộ đang ở bước vai nào); bước bị bỏ qua vẫn cộng đệm ngẫu nhiên từ seed (PLAN §2.2).

Bất biến luật hay bị làm sai (chi tiết Mục 5–9 của luật, ma trận test bắt buộc PLAN §6.7):

- Đêm 0 chỉ khởi tạo (Cupid, cặp đôi, Sói nhận mặt) — không ai chết, vai khác chưa hành động. Ngày 1 không treo cổ.
- Đêm chạy **lần lượt từng bước** theo trình tự cố định (Bảo vệ trước Sói, Phù thủy sau Sói); kết quả chỉ công bố khi sang Ngày.
- Xử lý **hết** dây chuyền chết (cặp đôi chết theo, Thợ săn bắn) rồi mới kiểm thắng, theo thứ tự **độc lập → Sói → Dân**; Sói Trắng không tính vào "số Sói" khi xét Sói thắng.
- Hết giờ chưa chọn = bỏ lượt, không có hành động mặc định ngầm; rời ván giữa chừng = chết + kích hoạt đủ hiệu ứng.
