# Ma Sói Web App — Kế hoạch & Thiết kế

> Last updated: 2026-06-13 · Scope: Biến `LUAT_MA_SOI.md` (bản luật cuối, online không Quản trò) thành web app Ma Sói chơi online nhiều người: phòng riêng theo mã + ghép trận người lạ có lấp bot, full bộ vai mở rộng, public có tài khoản, ưu tiên free-tier.
>
> **Bản 2026-06-13 là bản chi tiết hoá:** giữ nguyên mọi quyết định đã chốt 2026-05-21, đào sâu từng section xuống mức đặc tả triển khai, và bổ sung §13–§17 (nghệ thuật, hiệu ứng & âm thanh, đặc tả màn hình, phi chức năng, rủi ro).

## Mục lục

1. [Kiến trúc tổng thể & Tech stack](#1-kiến-trúc-tổng-thể--tech-stack)
2. [Nghiệp vụ & use-case (game flow thuần)](#2-nghiệp-vụ--use-case-game-flow-thuần)
3. [Trải nghiệm ngoài trận & tính năng xã hội](#3-trải-nghiệm-ngoài-trận--tính-năng-xã-hội)
4. [Tương tác & trải nghiệm trong trận](#4-tương-tác--trải-nghiệm-trong-trận)
5. [Mô hình dữ liệu & API/Event contract](#5-mô-hình-dữ-liệu--apievent-contract)
6. [Engine luật (server-authoritative)](#6-engine-luật-server-authoritative)
7. [Backend: realtime, phòng, ghép trận, lấp bot](#7-backend-realtime-phòng-ghép-trận-lấp-bot)
8. [Bot AI (người chơi máy)](#8-bot-ai-người-chơi-máy)
9. [Tài khoản & xác thực](#9-tài-khoản--xác-thực)
10. [Frontend web (giao diện người chơi)](#10-frontend-web-giao-diện-người-chơi)
11. [Visibility & chống gian lận](#11-visibility--chống-gian-lận)
12. [Hạ tầng, triển khai & lộ trình MVP](#12-hạ-tầng-triển-khai--lộ-trình-mvp)
13. [Định hướng nghệ thuật & design system](#13-định-hướng-nghệ-thuật--design-system)
14. [Hiệu ứng, chuyển động & âm thanh](#14-hiệu-ứng-chuyển-động--âm-thanh)
15. [Đặc tả màn hình chi tiết](#15-đặc-tả-màn-hình-chi-tiết)
16. [Chất lượng phi chức năng](#16-chất-lượng-phi-chức-năng)
17. [Rủi ro, giả định & điểm cần chốt](#17-rủi-ro-giả-định--điểm-cần-chốt)

---

## 1. Kiến trúc tổng thể & Tech stack

> 🟢 Đã chốt (2026-05-21) · Chi tiết hoá 2026-06-13

**Quyết định:** TypeScript end-to-end trong **monorepo**, server game **authoritative**, realtime qua WebSocket. Ưu tiên hạ tầng **free-tier**.

**Lý do:** TS toàn phần cho phép **dùng chung engine luật + types** giữa FE/BE/bot — viết luật 1 lần, bot chạy đúng engine server. Socket.IO có sẵn phòng/kết nối lại, hợp game theo phòng. Server giữ trạng thái thật để chống gian lận (§11). Không chọn Next.js vì serverless khó nuôi WebSocket; không chọn Flutter Web vì không tái dùng được engine TS ở FE.

### 1.1. Cấu trúc monorepo

```
masoi/
├─ packages/
│  ├─ engine/        # Luật thuần: state machine, resolver, win check. KHÔNG I/O, KHÔNG import gì ngoài shared.
│  ├─ shared/        # Types + event contract + hằng số (role ids, phase ids, error codes). Không logic.
│  └─ bots/          # Bộ não bot heuristic. Chỉ phụ thuộc engine + shared.
├─ apps/
│  ├─ server/        # Node + Socket.IO + Postgres/Redis. Phụ thuộc engine, shared, bots.
│  └─ web/           # React + Vite SPA. Phụ thuộc shared (và engine ở mức types/hằng số — KHÔNG chạy luật ở client).
├─ docs/             # LUAT_MA_SOI.md, PLAN.md, PROGRESS.md
└─ turbo.json, pnpm-workspace.yaml, tsconfig.base.json
```

Chiều phụ thuộc một hướng: `shared ← engine ← bots ← server`, `shared ← web`. `web` không được import resolver của engine (chống lộ luật ẩn + chống tự suy luận trạng thái — §11).

### 1.2. Lựa chọn cụ thể

| Lớp | Chọn | Ghi chú |
|---|---|---|
| Runtime | Node.js LTS (22+) | Pin version trong `.nvmrc` |
| Package manager | pnpm + Turborepo | Cache build/test theo gói |
| FE | React 18+, Vite, TypeScript strict | SPA, không SSR |
| State client | Zustand (stores nhỏ tách theo miền) | §10.2 |
| Styling | TailwindCSS + design tokens (§13) | |
| Animation | Motion (Framer Motion) + CSS keyframes + canvas nhẹ | §14 |
| Âm thanh | Howler.js (audio sprite) | §14.4 |
| Realtime | Socket.IO 4 | room, ack, auto-reconnect |
| DB bền | PostgreSQL | §5.1 |
| DB tạm | Redis | §5.2 — kèm vai trò recovery |
| Test | Vitest + fast-check (engine), Playwright (E2E) | §16.2 |
| Lint/format | ESLint + Prettier, chạy trong CI | §12 |

**Cần verify sau:** giới hạn kết nối WebSocket đồng thời + số giờ chạy của free-tier (ảnh hưởng số phòng song song); cân nhắc gộp Redis vào 1 instance để tiết kiệm khi còn nhỏ.

---

## 2. Nghiệp vụ & use-case (game flow thuần)

> 🟢 Đã chốt (2026-05-21) · Chi tiết hoá 2026-06-13

**Quyết định:** Flow ván theo đúng `LUAT_MA_SOI.md` (bản cuối), deterministic, không Quản trò người — luật + thứ tự lượt là trọng tài. Bổ sung ở tầng ứng dụng (không đổi luật lõi): thảo luận ban ngày theo **lượt nói ngẫu nhiên** (§4).

### 2.1. State machine vòng đời ván

```
LOBBY (phòng chờ)
  → STARTING (đếm ngược 5s, khoá phòng)
  → ROLE_REVEAL (mỗi người xem vai kín, ~10s)
  → NIGHT round=0 (chỉ khởi tạo: Cupid → Cặp đôi nhận nhau → Sói nhận mặt nhau. KHÔNG ai chết)
  → DAY round=1
      ├─ ANNOUNCE (không có ai chết — thông báo "đêm yên bình")
      ├─ DISCUSS (lượt nói ngẫu nhiên, mỗi người sống 1 lượt)
      └─ (KHÔNG có VOTE — Ngày 1 không treo cổ)
  → NIGHT round=1 (đêm hành động đầu tiên, chạy lần lượt từng bước — §2.2)
  → DAY round=2
      ├─ ANNOUNCE (công bố danh sách chết đêm qua, gộp 1 danh sách, KHÔNG lộ vai)
      ├─ [INTERRUPT: HUNTER_SHOT nếu Thợ săn vừa chết — xử lý xong mới tiếp]
      ├─ DISCUSS
      ├─ VOTE (bỏ phiếu thẳng, có "Tha", đổi phiếu tự do tới hết giờ)
      └─ LYNCH_RESULT (nhiều phiếu nhất bị treo; hòa → không treo; Trưởng làng phá hòa nếu có)
          └─ [INTERRUPT: HUNTER_SHOT nếu người bị treo là Thợ săn]
  → NIGHT round=2 → DAY round=3 → … (lặp)
  → GAME_OVER (đạt điều kiện thắng bất kỳ lúc nào sau khi xử lý hết dây chuyền chết)
```

Bất biến từ luật, engine phải enforce:
- Đêm 0 chỉ khởi tạo — mọi vai chức năng khác (Tiên tri, Bảo vệ, Thầy đồng, Sói Tiên tri, Phù thủy, Kẻ Thổi Sáo…) bắt đầu hành động từ Đêm 1.
- Ngày 1 không biểu quyết. Mỗi ngày treo tối đa 1 người.
- Kết quả đêm chỉ công bố khi sang Ngày; trong đêm không lộ kết quả từng bước.
- Xử lý **hết** dây chuyền chết (cặp đôi chết theo, Thợ săn bắn) rồi mới kiểm tra thắng, theo thứ tự độc lập → Sói → Dân.

### 2.2. Các bước trong một Đêm (chạy tuần tự, mỗi bước có đồng hồ riêng)

Theo đúng trình tự Mục 6 của luật; bước nào không có vai (không có trong ván / vai đã chết / không tới lịch) thì engine **bỏ qua tự động, không chờ**:

| Bước | Vai | Khi nào | Đồng hồ đề xuất |
|---|---|---|---|
| 1 | Cupid chọn cặp đôi | Chỉ Đêm 0 | 30s |
| 2 | Cặp đôi nhận diện nhau | Chỉ Đêm 0 | 10s (chỉ hiển thị) |
| 2b | Sói nhận mặt nhau (mở kênh Sói) | Chỉ Đêm 0 | 15s (chỉ hiển thị) |
| 3 | Thầy đồng soi người chết | Mỗi đêm (bỏ qua nếu chưa ai chết) | 30s |
| 4 | Tiên tri soi | Mỗi đêm từ Đêm 1 | 30s |
| 5 | Bảo vệ chọn người giữ | Mỗi đêm từ Đêm 1 | 30s |
| 6 | Sói thảo luận kênh riêng + vote nạn nhân | Mỗi đêm từ Đêm 1 | 60s |
| 6a | Sói Nguyền quyết định dùng quyền nhiễm (1 lần/ván) | Trong bước Sói, sau khi chốt nạn nhân | gộp vào 60s |
| 6b | Sói Trắng giết thêm 1 Sói | Đêm chẵn (2, 4, 6…) | 30s |
| 6c | Sói Tiên tri soi vai chính xác | Mỗi đêm từ Đêm 1 | 30s |
| 7 | Phù thủy (được báo kín nạn nhân → cứu/độc) | Mỗi đêm từ Đêm 1 | 30s |
| 8 | Kẻ Thổi Sáo mê hoặc 2 người | Mỗi đêm từ Đêm 1 | 30s |

(Cô bé không có trong bản online — luật Mục 8.1.) Hết giờ chưa chọn = **bỏ lượt**, không có hành động mặc định ngầm (luật Mục 11.3).

**Chống đoán vai qua nhịp thời gian (timing leak):** nếu bước nào hiển thị "đang tới bước X" cho cả phòng, người chơi có thể suy ra ván có vai gì và ai đang thao tác nhanh/chậm. Quy ước: trong đêm, mọi người chỉ thấy **tiến độ tổng** ("Đêm đang diễn ra… 45%") chứ không thấy đang ở bước của vai nào; riêng người tới lượt thấy prompt của mình. Các bước bị bỏ qua vẫn cộng một khoảng đệm ngẫu nhiên nhỏ (3–6s, lấy từ RNG seed) để tổng thời gian đêm không tố cáo cấu hình vai.

### 2.3. Use-case lõi (danh sách kiểm cho FE/BE)

1. Tạo phòng riêng → nhận mã/link → bạn bè vào bằng mã.
2. Chơi nhanh → vào hàng đợi → đủ người hoặc hết countdown thì lấp bot → vào ván.
3. Chủ phòng cấu hình ván (số người, bộ vai, preset đồng hồ) → start.
4. Nhận vai kín, xem mô tả vai + phe + cách chơi ngay trên lá bài.
5. Hành động đêm theo lượt vai (chọn mục tiêu kín, xác nhận, đổi tới khi hết giờ bước).
6. Nói theo lượt ban ngày; buộc tội (accuse); emote.
7. Bỏ phiếu treo cổ / "Tha"; đổi phiếu; xem kết quả.
8. Chết → chuyển chế độ khán giả + kênh chat người chết.
9. Mất mạng → re-join trong thời gian ân hạn, nhận lại đúng góc nhìn của mình.
10. Hết ván → màn tổng kết lật toàn bộ vai + timeline ván → chơi lại cùng phòng.

**Cần verify sau:** khi cài engine, đối chiếu từng vai mở rộng với luật để không sót edge case (danh sách điểm mở đã gom ở §17.3).

---

## 3. Trải nghiệm ngoài trận & tính năng xã hội

> 🟢 Đã chốt (2026-05-21) · Chi tiết hoá 2026-06-13

**Quyết định — v1 gồm:** Sảnh (Chơi nhanh + Tạo phòng riêng + danh sách phòng công khai), Hồ sơ + thống kê, Bạn bè + trạng thái online. **Phase sau:** MMR/bảng xếp hạng, thành tích/nhiệm vụ, replay, cosmetic.

**Lý do:** v1 ưu tiên thứ giúp vào trận nhanh và động lực chơi lại cơ bản. MMR/replay/cosmetic tốn công và cần lượng người chơi đủ lớn.

### 3.1. Sảnh

- **Chơi nhanh:** 1 nút → vào hàng đợi, hiện trạng thái ("đang tìm… 3/8, lấp bot sau 0:32"). Hủy được.
- **Tạo phòng riêng:** modal cấu hình (§15.3) → sinh **mã 6 ký tự** (không nhầm lẫn O/0, I/1) + link `…/room/ABC123`. Link chỉ là bọc mã.
- **Danh sách phòng công khai:** phòng riêng có toggle "công khai" để hiện ở sảnh; hiển thị tên chủ phòng, số chỗ, bộ vai rút gọn. Lọc: còn chỗ / sắp bắt đầu.
- **Phòng đang chơi dở:** nếu user còn ván chưa kết thúc (trong thời gian ân hạn re-join), sảnh hiện banner "Quay lại ván đang chơi".

### 3.2. Hồ sơ & thống kê (v1)

- Avatar chọn từ bộ có sẵn (8–12 chân dung theo art style §13), tên hiển thị (unique, lọc từ cấm).
- Thống kê: tổng ván, thắng/thua, tỉ lệ thắng theo **phe** (Dân/Sói/Độc lập) và theo **vai**, tỉ lệ sống sót, vai hay gặp nhất. Nguồn: `game_history` (§5.1) — chỉ tính ván có kết quả, ván bỏ ngang tính như thua.
- Guest: thống kê chỉ sống trong phiên (mất khi cookie hết hạn) — hiển thị nhắc "đăng ký để giữ thành tích" sau mỗi ván thắng.

### 3.3. Bạn bè & online

- Gửi lời mời bằng username; chấp nhận/từ chối/chặn.
- Presence qua socket: online / đang trong ván / offline (cập nhật khi connect/disconnect, không polling).
- "Mời vào phòng": gửi notification realtime kèm mã phòng, 1 chạm để vào.

### 3.4. Mở rộng phase sau (đã định hướng để không phải thiết kế lại)

| Tính năng | Móc nối đã chuẩn bị từ v1 |
|---|---|
| Replay / xem lại ván | Engine deterministic + seed + event log đã lưu trong `game_history.event_log` (§5.1, §6.5) — replay = chạy lại engine trên log |
| MMR & bảng xếp hạng | `game_history_players` đủ dữ liệu để tính Glicko-2 hồi tố |
| Thành tích / nhiệm vụ | Domain events của engine (§6.5) là nguồn trigger ("thắng 3 ván liên tiếp vai Sói"…) |
| Cosmetic (khung avatar, skin bài) | Avatar/role card render qua design tokens — thêm skin là thêm token set |
| Mùa giải / sự kiện | Cấu hình bộ vai đã là data (preset trong DB), thêm preset sự kiện không cần code |

**Cần verify sau:** mời-qua-link đi kèm "Tạo phòng riêng" (mã phòng là đủ cho v1, link chỉ là bọc mã).

---

## 4. Tương tác & trải nghiệm trong trận

> 🟢 Đã chốt (2026-05-21) · Chi tiết hoá 2026-06-13

**Quyết định — v1:** lượt nói ngẫu nhiên (đặc trưng cốt lõi) + nhắn tin văn bản; chat đa kênh; trạng thái trực quan; emote; chỉ điểm; hiệu ứng + âm thanh chuyển pha. **Phase sau:** voice, lời cuối, reaction theo tin nhắn.

**Lý do:** nói theo lượt giúp dễ quan sát, không hỗn loạn khi đông người/có bot; mỗi phát ngôn gắn 1 lượt rõ ràng → dữ liệu dễ lưu/quản lý (chống gian lận §11, thống kê §3, replay sau này).

### 4.1. Cơ chế lượt nói (chi tiết)

- Vào pha DISCUSS, engine rút **thứ tự ngẫu nhiên** (từ RNG seed) trên tập người sống; thứ tự hiển thị công khai dạng hàng đợi.
- Mỗi lượt mặc định **35s** (host chỉnh 20–60s qua preset đồng hồ). Người tới lượt mới gửi được tin vào kênh chung; có nút **"Nói xong"** để kết thúc sớm và nút **"Bỏ lượt"**.
- Người chưa/đã qua lượt vẫn tương tác được bằng **emote** và **chỉnh accuse** — không gửi text.
- Mỗi người 1 lượt/ngày (không mua thêm lượt ở v1). Hết hàng đợi → sang VOTE (từ Ngày 2) hoặc sang Đêm (Ngày 1).
- Tin nhắn trong lượt giới hạn 500 ký tự/tin, tối đa 5 tin/lượt (chống spam, giữ nhịp).

### 4.2. Ma trận kênh chat (ai thấy gì, khi nào)

| Kênh | Ai đọc | Ai gửi | Khi nào |
|---|---|---|---|
| Phòng chờ | mọi người trong phòng | mọi người | LOBBY |
| Chung (làng) | người sống + khán giả (đọc) | **chỉ người tới lượt nói** | DISCUSS; đóng ở VOTE & NIGHT |
| Sói 🐺 | các Sói (kể cả Sói Trắng, Sói Tiên tri, Sói Nguyền, người bị nhiễm) | các Sói còn sống | chỉ trong bước Sói ban đêm |
| Người chết 👻 | người chết + (đọc) không ai khác | người chết | mọi lúc sau khi chết |
| Hệ thống | từng người (riêng) | server | thông báo kín: kết quả soi, nạn nhân cho Phù thủy, "bạn bị mê hoặc"… |

Server enforce quyền gửi theo pha (§11). Cặp đôi: v1 **không** mở kênh riêng (luật để "tùy luật"; giảm phức tạp) — chỉ thông báo kín danh tính nhau ở Đêm 0.

### 4.3. Trạng thái trực quan & chỉ điểm

- **Đồng hồ pha:** vòng tròn đếm ngược quanh banner pha; deadline do server phát, client chỉ render (§7.3).
- **Ai đã hành động/bỏ phiếu:** chấm trạng thái trên avatar ("đã chọn xong") — không lộ nội dung khi đang diễn ra.
- **Bảng phiếu sau khi chốt:** khi VOTE khóa, công bố đầy đủ ai-vote-ai làm dữ liệu suy luận cho ngày sau (đã chốt — O1).
- **Chỉ điểm (accuse):** mỗi người sống ghim tối đa 1 người/ngày; hiện badge 👉 đếm số người đang nghi trên avatar; reset mỗi sáng. Không có hiệu lực luật — thuần công cụ thảo luận.
- **Emote:** bánh xe 6 emote (👍 😱 🤔 😡 😂 ❤️), nổi lên từ avatar rồi tan; throttle 1 emote/3s.

**Cần verify sau:** độ dài mặc định mỗi lượt nói sau khi playtest; mức phát ngôn của bot khi tới lượt (§8).

---

## 5. Mô hình dữ liệu & API/Event contract

> 🟢 Đã chốt (2026-05-21) · Chi tiết hoá 2026-06-13

**Quyết định:** Bền ở PostgreSQL, nhịp nhanh ở Redis, contract realtime định nghĩa trong `shared`, server chỉ gửi **redacted view** cho từng client.

**Lý do:** tách bền/tạm tận dụng đúng thế mạnh từng store; contract 1 nguồn cho FE/BE/bot; redacted view là cách an toàn nhất cho game thông tin ẩn.

### 5.1. PostgreSQL (bền)

```
users               (id uuid PK, username citext UNIQUE, display_name, avatar_id,
                     kind enum('guest','registered'), created_at, last_seen_at)
auth_identities     (id PK, user_id FK, provider enum('google','password'),
                     provider_uid, email citext UNIQUE NULL, email_verified bool,
                     password_hash NULL)                  -- argon2id, chỉ provider=password
sessions            (id PK, user_id FK, token_hash UNIQUE, created_at, expires_at, ip, user_agent)
friendships         (user_lo FK, user_hi FK, status enum('pending','accepted','blocked'),
                     requested_by FK, created_at, PK(user_lo, user_hi))   -- lo < hi, chống trùng chiều
profile_stats       (user_id PK, games_total, wins_total, per_faction jsonb, per_role jsonb,
                     survived_total, updated_at)          -- denormalized, cập nhật cuối ván
game_history        (id PK, room_code, config jsonb, seed bigint, started_at, ended_at,
                     rounds int, winner enum('village','wolves','solo_tanner','solo_piper',
                     'solo_white_wolf','solo_lovers','aborted'),
                     event_log jsonb NULL)                -- log domain-event để replay sau này
game_history_players(game_id FK, seat int, user_id FK NULL, is_bot bool, bot_name NULL,
                     role_id, faction, survived bool, won bool, PK(game_id, seat))
```

- Guest cũng là 1 dòng `users(kind='guest')` → nâng cấp = đổi `kind` + gắn `auth_identities`, giữ nguyên id nên stats/bạn bè đi theo luôn.
- `event_log` ghi từ v1 (rẻ — chỉ là JSON cuối ván) dù replay là tính năng phase sau.

### 5.2. Redis (tạm, nhịp nhanh)

| Key | Kiểu | Nội dung / TTL |
|---|---|---|
| `room:{code}` | JSON | RoomState: config, members (userId/botId, seat, ready, connected), hostId, status. TTL 24h, refresh khi hoạt động |
| `rooms:public` | SET | mã các phòng đang công khai |
| `game:{id}:state` | JSON | snapshot GameState đầy đủ (server memory là bản chạy, Redis là bản recovery — §7.5) |
| `queue:quick` | ZSET | userId → epoch vào hàng đợi |
| `user:{id}:presence` | STRING | `online` / `in-game:{roomCode}` , TTL theo heartbeat |
| `ratelimit:*` | INCR+EX | đếm tạo phòng / login / chat theo user+IP |

### 5.3. Event contract (định nghĩa TS trong `packages/shared`, kèm protocolVersion)

**Client → Server** (tất cả có ack `{ok} | {error: code}`):

| Event | Payload | Ghi chú |
|---|---|---|
| `lobby:quickJoin` / `lobby:quickCancel` | — | vào/rời hàng đợi |
| `room:create` | `{config}` | ack trả `roomCode` |
| `room:join` | `{code}` | ack trả RoomView |
| `room:leave` | — | host rời → host migration (§7.2) |
| `room:configure` | `{config}` | chỉ host, chỉ khi LOBBY |
| `room:addBot` / `room:kickSeat` | `{seat}` | chỉ host |
| `room:start` | — | chỉ host, validate đủ người & bộ vai hợp lệ |
| `game:action` | `{step, targetIds[], extra?}` | hành động đêm generic — engine validate theo vai+bước; gửi lại = đổi lựa chọn tới khi hết giờ |
| `vote:cast` | `{target: seatId \| 'mercy'}` | đổi tự do tới khi khóa |
| `speak:done` | — | kết thúc lượt nói sớm |
| `chat:send` | `{channel, text}` | server kiểm quyền kênh + lượt |
| `emote:send` | `{emoteId}` | throttle |
| `accuse:set` | `{target: seatId \| null}` | |
| `game:requestSync` | — | xin full redacted view (sau reconnect) |
| `friend:request/accept/remove` | `{username \| userId}` | |
| `room:invite` | `{friendId}` | |

**Server → Client:**

| Event | Payload | Gửi cho |
|---|---|---|
| `queue:update` | `{found, current, target, fillAt}` | người trong hàng đợi |
| `lobby:roomsUpdate` | danh sách phòng công khai | người ở sảnh |
| `room:update` | RoomView | cả phòng |
| `game:started` | `{yourRole, yourFaction, mates?}` | **riêng từng người** (mates chỉ cho Sói/cặp đôi) |
| `game:stateSync` | RedactedView (đầy đủ) | riêng từng người — khi vào pha mới & khi reconnect |
| `game:phaseChanged` | `{phase, round, deadlineTs, nightProgress?}` | cả phòng (không lộ bước vai nào — §2.2) |
| `action:required` | `{step, validTargets[], note, deadlineTs}` | **riêng vai tới lượt** |
| `action:result` | `{step, result}` | riêng (kết quả soi, nạn nhân cho Phù thủy, "bạn bị mê hoặc"…) |
| `turn:begin` / `turn:end` | `{seatId, deadlineTs}` | cả phòng (lượt nói) |
| `chat:message` | `{channel, fromSeat, text, ts}` | đúng thành viên kênh |
| `emote:shown` / `accuse:update` | … | cả phòng |
| `vote:progress` | `{votedSeats[]}` | cả phòng (chỉ AI ĐÃ vote) |
| `vote:result` | `{tally: {seat→target}, lynched?, tieBroken?}` | cả phòng, sau khi khóa |
| `player:died` | `{deaths: [{seat, cause: 'night'\|'lynch'\|'hunter'\|'heartbreak'}]}` | cả phòng — **không kèm vai** |
| `game:over` | `{winner, reveal: [{seat, role, faction}], timeline}` | cả phòng |
| `friend:update` / `room:invited` | … | cá nhân |
| `error` | `{code, message}` | cá nhân |

**Nguyên tắc chốt:** mọi payload đi qua **view builder** duy nhất (§6.6, §11) — không serialize trực tiếp GameState.

---

## 6. Engine luật (server-authoritative)

> 🟢 Đã chốt (2026-05-21) · Chi tiết hoá 2026-06-13

**Quyết định:** gói `engine` thuần TypeScript, deterministic, không I/O, là nguồn sự thật duy nhất của luật. RNG có seed.

**Lý do:** tách engine khỏi mạng để test kỹ (phần dễ sai nhất), server lẫn bot dùng chung, seed RNG mở đường replay.

### 6.1. API & module

```ts
createGame(config: GameConfig, seed: number): GameState
applyAction(state, action: PlayerAction): { state, events: DomainEvent[] }   // pure, trả state mới
advancePhase(state): { state, events: DomainEvent[] }                        // server gọi khi hết giờ bước/pha
checkWin(state): Winner | null
buildView(state, viewerSeat: number | 'spectator'): RedactedView             // §6.6
```

```
engine/src/
├─ config.ts      # bảng số Sói theo dải người, bảng bật vai theo số người (Mục 4 luật), validate bộ vai
├─ state.ts       # GameState, PlayerState, statuses
├─ phases.ts      # state machine pha + dựng danh sách bước đêm cho từng round
├─ validate.ts    # luật chọn mục tiêu hợp lệ cho từng (vai, bước)
├─ resolve/night.ts  # pipeline xử lý đêm (§6.3)
├─ resolve/day.ts    # đếm phiếu, hòa, phá hòa Trưởng làng, treo cổ (v1 không truyền chức khi Trưởng làng chết — O6)
├─ resolve/deaths.ts # hàng đợi chết + dây chuyền (cặp đôi, Thợ săn interrupt)
├─ win.ts         # thứ tự kiểm thắng (§6.4)
├─ rng.ts         # PRNG seeded (xoshiro/mulberry32): chia vai, thứ tự nói, đệm thời gian
├─ events.ts      # DomainEvent types
└─ view.ts        # buildView — redaction tập trung
```

### 6.2. Trạng thái chính (phác)

```ts
PlayerState {
  seat, roleId, faction,            // faction đổi được (Sói Nguyền nhiễm)
  alive: boolean,
  statuses: {
    loverWith?: seat, charmed?: bool, mayor?: bool,
    elderShield?: number,           // Già làng: 1 → 0
    lastGuarded?: bool,             // đánh dấu cho luật "không giữ 2 đêm liền"
  }
}
GameState {
  players[], round, phase, nightStepIndex,
  night: { guardTarget?, wolfVotes: {}, wolfVictim?, infectUsed?, witchSave?, witchPoisonTarget?,
           whiteWolfTarget?, charmTargets[] },
  consumables: { witchHeal: bool, witchPoison: bool, infect: bool },
  pendingDeaths: Death[], pendingHunterShot?: seat,
  speakOrder[], votes: {}, history: DomainEvent[], seed, rngState
}
```

### 6.3. Pipeline xử lý đêm (thứ tự cố định — đây là phần phải test kỹ nhất)

1. **Chốt nạn nhân Sói:** đa số phiếu nội bộ Sói; hòa hoặc không phiếu → đêm đó Sói không cắn.
2. **Nhiễm (Sói Nguyền, nếu kích hoạt):** cắn biến thành nhiễm — nạn nhân không chết mà đổi sang phe Sói từ đêm sau (vào kênh Sói). Mục tiêu đang được **Bảo vệ** giữ → nhiễm thất bại và Sói Nguyền **không mất quyền**, xử lý tiếp như cắn thường bị chặn (O3). Nhiễm thành công → đêm đó không có nạn nhân bị cắn → Phù thủy được báo "không ai bị cắn".
3. **Phù thủy được báo nạn nhân** (đúng người Sói nhắm, không tiết lộ có được bảo vệ hay không) → quyết định cứu/độc.
4. **Tính sống chết theo thứ tự:**
   - Cắn: bị **Bảo vệ** chặn → sống (mất kèo im lặng); chưa chặn mà là **Già làng còn khiên** → sống, trừ khiên; chưa chặn mà **Phù thủy cứu** → sống, trừ bình; còn lại → vào `pendingDeaths`.
   - Độc: vào `pendingDeaths` — **không** bị Bảo vệ/khiên Già làng chặn (luật Mục 9).
   - Sói Trắng (đêm chẵn): mục tiêu là 1 Sói → `pendingDeaths`.
   - Mê hoặc: set `charmed`, thông báo kín cho người bị mê.
5. **Dây chuyền:** với mỗi cái chết → người yêu chết theo (heartbreak, đệ quy); Thợ săn chết → set `pendingHunterShot`, phát súng xử lý ở đầu pha Ngày (interrupt riêng, có đồng hồ; hết giờ = bỏ lượt không bắn) → phát súng lại có thể gây dây chuyền mới → lặp tới khi hàng đợi rỗng.
6. **Kiểm thắng** (§6.4). Chưa ai thắng → sang Ngày, công bố `pendingDeaths` thành **một danh sách**, không tách nguyên nhân bí mật.

### 6.4. Thứ tự kiểm điều kiện thắng (sau khi dây chuyền rỗng)

1. **Thằng Ngố:** vừa bị treo cổ → thắng ngay, kết thúc ván (chết ban đêm thì không).
2. **Kẻ Thổi Sáo:** mọi người sống (trừ chính hắn) đều `charmed` → thắng.
3. **Cặp đôi khác phe:** chỉ còn đúng 2 người sống là cặp đôi → thắng.
4. **Sói Trắng:** là người sống duy nhất → thắng.
5. **Phe Sói:** số Sói sống (KHÔNG tính Sói Trắng) ≥ số người sống ngoài phe Sói. Chỉ còn Sói Trắng + Dân → Sói thường KHÔNG thắng, ván tiếp tục.
6. **Phe Dân:** toàn bộ Sói (kể cả Sói Trắng) đã bị loại.

### 6.5. Determinism & domain events

- `state + action log + seed` → tái tạo được toàn ván (property test bằng fast-check: chạy 2 lần cùng input phải ra cùng state). Đây là nền của replay (§3.4).
- Engine không bao giờ gọi `Date.now()`/`Math.random()` — thời gian do server đưa vào qua action, ngẫu nhiên qua `rng.ts`.
- Mỗi thay đổi phát `DomainEvent` (`PLAYER_DIED`, `PHASE_CHANGED`, `SEER_RESULT`…) — server dịch event thành socket emit qua view builder; cuối ván dump vào `game_history.event_log`.

### 6.6. View builder (redaction tập trung)

`buildView(state, viewer)` trả về đúng những gì viewer được thấy: vai của chính mình; danh sách sống/chết; đồng đội Sói (nếu là Sói); người yêu (nếu trong cặp); kết quả soi của chính mình; trạng thái public (mayor, accuse, đã-vote). **Không bao giờ** chứa vai người khác, mục tiêu của vai khác, hay nội dung kênh mình không thuộc. Test snapshot per-role đảm bảo không leak (§11, §16.2).

### 6.7. Ma trận test bắt buộc (trích — file test sẽ phủ đủ)

| # | Case | Kỳ vọng |
|---|---|---|
| 1 | Bảo vệ trùng nạn nhân Sói | sống; bình Phù thủy không bị trừ nếu không dùng |
| 2 | Bảo vệ + Độc cùng người | vẫn chết (độc xuyên bảo vệ) |
| 3 | Phù thủy tự cứu | hợp lệ; tự đầu độc → invalid |
| 4 | Bảo vệ tự giữ / giữ 1 người 2 đêm liền | invalid |
| 5 | Già làng bị cắn 2 lần | lần 1 sống mất khiên, lần 2 chết; độc/treo giết ngay |
| 6 | Thợ săn chết mọi kiểu (cắn/treo/độc) | đều được bắn; hết giờ không bắn |
| 7 | Thợ săn trong cặp đôi, người yêu chết | chết theo → vẫn được bắn → dây chuyền tiếp |
| 8 | Sói hòa phiếu nội bộ / không vote | không ai bị cắn |
| 9 | Sói Trắng giết Sói cuối | ván tiếp tục, Sói thường không thắng |
| 10 | Tiên tri soi Sói Trắng / soi người yêu của Sói | "là Sói" / đúng vai gốc |
| 11 | Sói Nguyền nhiễm | nạn nhân thành Sói từ đêm sau, vào kênh Sói, quyền mất vĩnh viễn |
| 12 | Thằng Ngố bị treo / bị cắn | thắng ngay / không thắng |
| 13 | Kẻ Thổi Sáo mê hết người sống | thắng tuyệt đối |
| 14 | Ngày 1 không vote; hòa phiếu không treo; "Tha" thắng phiếu | đúng luật Mục 7.3 |
| 15 | Trưởng làng phá hòa | chỉ chọn trong nhóm hòa |
| 16 | Thầy đồng soi người chết | đúng phe; là vai duy nhất nhắm người chết |
| 17 | Rời ván giữa chừng | chết ngay + kích hoạt đủ hiệu ứng |
| 18 | Determinism | cùng seed + log → cùng kết quả |

---

## 7. Backend: realtime, phòng, ghép trận, lấp bot

> 🟢 Đã chốt (2026-05-21) · Chi tiết hoá 2026-06-13

**Quyết định:** Server Socket.IO giữ trạng thái thật + đồng hồ pha; phòng riêng không auto-bot; ghép trận chờ ~30–45s rồi lấp bot (tối thiểu 1 người thật); mất kết nối giữ slot cho re-join, quá hạn xử như rời ván.

### 7.1. Kết nối & phiên

- Handshake socket xác thực bằng session cookie (§9); 1 user nhiều tab → chỉ tab mới nhất giữ quyền thao tác trong ván, tab cũ chuyển read-only.
- Heartbeat mặc định Socket.IO; presence ghi Redis với TTL.
- Mọi event client → validate quyền (đúng phòng, đúng pha, đúng lượt) trước khi đụng engine.

### 7.2. Vòng đời phòng

`created → waiting → starting(5s) → in-game → finished → (chơi lại: quay về waiting, giữ thành viên) | archived`

- Host rời khi LOBBY → chuyển host cho người thật vào sớm nhất; phòng rỗng người thật → xoá sau 60s.
- Trong ván, "host" không có đặc quyền gì nữa (luật là trọng tài) — tránh host quyền lực can thiệp ván.

### 7.3. Đồng hồ pha (server-authoritative)

- Mỗi bước/pha có `deadlineTs` (epoch ms) do server đặt; client chỉ render countdown từ `deadlineTs - serverTimeOffset` (offset đo lúc handshake).
- Scheduler per-room: `setTimeout` tới deadline → gọi `advancePhase`. Mọi hành động đến sau deadline bị từ chối (`error: PHASE_CLOSED`).
- Bước đêm xong sớm (mọi vai liên quan đã chốt) → có thể kết thúc sớm **nhưng** cộng đệm ngẫu nhiên 3–6s từ seed để chống timing leak (§2.2).

### 7.4. Ghép trận nhanh

1. Vào `queue:quick` (Redis ZSET theo thời điểm vào).
2. Đủ **2 người thật** trở lên → mở "phòng đang gom", countdown **40s** (giữa khoảng 30–45 đã chốt); người vào sau được dồn vào phòng đang gom trước khi mở phòng mới.
3. Hết countdown: ≥ 1 người thật → **lấp bot** tới sĩ số mục tiêu **8** (cấu hình hệ thống) → start. 0 người thật (đã thoát hết) → huỷ.
4. Chống abuse: rời ván ghép nhanh giữa chừng > N lần/giờ → khoá hàng đợi tạm thời.

### 7.5. Mất kết nối & khôi phục

- Disconnect trong ván: đánh dấu `disconnected`, giữ slot **90s** (ân hạn); bot **không** thế chỗ người thật trong lúc chờ (hành động tới lượt mà vắng = bỏ lượt theo luật 11.3). Quá 90s → xử như rời hẳn: chết + kích hoạt hiệu ứng.
- Re-join: client `game:requestSync` → nhận `RedactedView` đầy đủ → render lại đúng chỗ.
- Server restart: state ván snapshot vào Redis sau mỗi `advancePhase`/`applyAction` (write-through); khởi động lại → nạp `game:{id}:state`, đặt lại scheduler theo `deadlineTs`. Mục tiêu v1: không mất ván khi deploy.

### 7.6. Kết thúc ván

Transaction Postgres: insert `game_history` + `game_history_players`, update `profile_stats`; xong mới phát `game:over`. Phòng quay về `waiting` cho lượt "chơi lại".

**Cần verify sau:** sĩ số mục tiêu mode ghép nhanh (8) sau playtest; giới hạn WebSocket free-tier (§1).

---

## 8. Bot AI (người chơi máy)

> 🟢 Đã chốt (2026-05-21) · Chi tiết hoá 2026-06-13

**Quyết định:** bot suy luận theo thông tin (không random hợp lệ), nhận đúng redacted view như người, đi qua đúng engine. Triển khai theo bậc: heuristic vững trước, sâu dần.

### 8.1. Kiến trúc

- Bot = actor chạy trong process server, subscribe cùng luồng event/view như client thật (qua interface chung, không qua socket). Không đọc `GameState` gốc — chỉ `buildView(state, botSeat)`. Đây vừa là chống gian lận vừa là **test sống** cho view builder.
- `packages/bots`: `SuspicionModel` (bộ nhớ + chấm điểm) + `RolePolicy` per vai + `SpeechGenerator` + `Persona` (tên, avatar, độ trễ phản ứng 1.5–6s ngẫu nhiên để giống người).

### 8.2. Mô hình nghi ngờ (heuristic v1)

Điểm nghi `S[seat]` cập nhật theo sự kiện công khai: vote ngược với kết quả suy luận chung (+), bị nhiều người accuse (+nhẹ), claim vai mâu thuẫn thông tin mình biết chắc (++), cứu/bênh người sau này lộ là Sói (+), im lặng bỏ lượt nhiều (+nhẹ), đứng ngoài mọi cuộc vote (−/+ tuỳ phe bot). Thông tin kín của vai (kết quả soi, nạn nhân Phù thủy) ghi đè điểm với trọng số tuyệt đối.

### 8.3. Chính sách theo vai (v1)

| Vai bot | Đêm | Ngày |
|---|---|---|
| Sói | nhắm người điểm "giá-trị-cho-Dân" cao (hay dẫn dắt, bị nghi thấp); tránh mục tiêu vừa được claim bảo vệ | gây nhiễu: accuse người Dân điểm nghi cao sẵn, vote theo đám đông khi an toàn |
| Tiên tri | soi người điểm nghi cao nhất chưa soi | giấu vai tới khi nắm ≥1 Sói; khi claim thì nói kết quả soi |
| Bảo vệ | giữ người có dấu hiệu là vai chức năng (bị accuse là "Tiên tri", vừa claim) — tôn trọng luật không-2-đêm-liền | kín tiếng |
| Phù thủy | cứu nếu nạn nhân điểm nghi thấp hoặc nghi là vai chức năng; độc khi chắc ≥80% là Sói | giữ thông tin nạn nhân làm bằng chứng phát biểu |
| Thợ săn | — | khi chết: bắn seat điểm nghi cao nhất |
| Dân | — | phát biểu/vote theo điểm nghi |
| Vai mở rộng | thêm dần theo GĐ3, mỗi vai 1 policy riêng | |

### 8.4. Phát ngôn khi tới lượt

- Ngân hàng câu tiếng Việt theo **mẫu + slot** (`{name}`, `{reason}`, `{vote}`), phân loại theo ngữ cảnh: mở đầu ngày, buộc tội, biện hộ khi bị accuse, phản hồi claim, chốt vote. Mỗi mẫu nhiều biến thể, chọn qua RNG seed để không lặp.
- Bot được phép **bỏ lượt** có chủ đích (xác suất theo persona) — bot nói ít còn hơn nói vô nghĩa.
- Không dùng LLM ở v1 (chi phí + độ trễ + khó kiểm soát); thiết kế `SpeechGenerator` thành interface để sau này cắm LLM cho phòng "bot cao cấp" nếu muốn.

**Nhãn bot — đã chốt (2026-06-13, O2):** phòng riêng hiện nhãn 🤖 (host chủ động thêm bot); **ghép nhanh ẩn nhãn trong ván** để giữ immersion, mô tả chế độ ghi rõ "trận có thể có người chơi máy".

**Cần verify sau:** mức phát ngôn "đủ giống người" sau playtest.

---

## 9. Tài khoản & xác thực

> 🟢 Đã chốt (2026-05-21) · Chi tiết hoá 2026-06-13

**Quyết định:** v1 có guest + Google OAuth + email/mật khẩu; nâng cấp guest → tài khoản giữ thống kê; hash argon2; phiên cookie HttpOnly; lưu Postgres.

### 9.1. Chi tiết flow

- **Guest:** bấm "Chơi ngay" → tạo `users(kind='guest')` + session cookie (HttpOnly, Secure, SameSite=Lax) hạn 30 ngày. Tên hiển thị tự sinh ("DânLàng#4821") đổi được.
- **Google:** OAuth 2 + PKCE; lần đầu → tạo user; nếu đang là guest → **gắn identity vào chính user guest hiện tại** (giữ id, stats, bạn bè).
- **Email/mật khẩu:** argon2id; email verification **hoãn** (chỉ bật khi cần chống abuse); quên mật khẩu = link một lần qua email (cần mail provider free-tier — Resend/Brevo).
- **Session:** bảng `sessions`, token random 256-bit lưu **hash**; thư viện: vì Lucia đã ngừng phát triển thành library, chốt **tự cài session theo guide của Lucia** (mỏng, dễ kiểm soát) hoặc Auth.js nếu muốn đỡ code OAuth — quyết định lúc cài đặt, ưu tiên ít dependency.
- **Rate-limit:** login 5 lần/phút/IP; tạo phòng 3 phòng/10 phút/user; tạo guest 10/giờ/IP.

**Cần verify sau:** chống lạm dụng guest đủ chưa sau khi public; provider gửi mail free-tier.

---

## 10. Frontend web (giao diện người chơi)

> 🟢 Đã chốt (2026-05-21) · Chi tiết hoá 2026-06-13

**Quyết định:** React + TypeScript (Vite), mobile-first, tiếng Việt, Zustand + Tailwind, chỉ render từ redacted view.

### 10.1. Routes

| Route | Màn hình (đặc tả §15) |
|---|---|
| `/` | Landing + "Chơi ngay" (guest) / đăng nhập |
| `/lobby` | Sảnh: chơi nhanh, tạo phòng, danh sách phòng, sidebar bạn bè |
| `/room/:code` | Phòng chờ (kiêm deep-link mời) |
| `/game/:roomCode` | Màn chơi (route riêng để reload = re-sync) |
| `/profile/:username`, `/friends`, `/settings`, `/rules` | phụ trợ |

### 10.2. Kiến trúc state

- 1 socket singleton (module `lib/socket.ts`), tự reconnect + `game:requestSync` khi nối lại.
- Stores Zustand tách miền: `sessionStore` (user, auth), `lobbyStore`, `roomStore`, `gameStore` (RedactedView + derived selectors: "tôi được làm gì lúc này?"), `chatStore` (per-channel ring buffer 200 tin), `uiStore` (âm lượng, reduced-motion, overlay đang mở).
- **Mọi thứ trong `gameStore` đến từ server.** Client không suy luận trạng thái ẩn, không giữ logic luật — chỉ giữ logic hiển thị. Optimistic UI duy nhất cho chat của chính mình (pending → confirmed).
- `action:required` điều khiển **ActionPanel** dạng máy trạng thái hiển thị: idle / chọn mục tiêu / đã chốt (đổi được tới deadline) / khoá.

### 10.3. Cây component màn chơi (rút gọn)

```
GameScreen
├─ PhaseBanner          (tên pha, round, đồng hồ vòng tròn, icon trăng/mặt trời)
├─ PlayerCircle         (avatar vòng tròn; mobile: lưới; spotlight lượt nói; badge accuse/vote/mayor; hiệu ứng chết)
├─ ActionPanel          (contextual theo vai + bước: chọn mục tiêu / cứu-độc / bắn / vote)
├─ ChatDock             (tab theo kênh được thấy; input khoá theo quyền; emote wheel)
├─ EventFeed            (log công khai: "Trời tối", "An đã bị treo cổ"…)
├─ NightOverlay / DayOverlay (lớp hiệu ứng chuyển pha §14)
└─ GameOverModal        (lật vai, timeline, stats, chơi lại)
```

### 10.4. Khác

- i18n: copy gom 1 file `vi.ts` từ đầu (chuẩn bị đa ngữ sau, không hardcode chuỗi trong component).
- Title/favicon đổi theo pha (🌙/☀️) — nhìn tab biết tới lượt; thêm notification sound khi tới lượt mình mà tab blur.
- Hỗ trợ tối thiểu: 2 phiên bản major mới nhất của Chrome/Safari/Firefox/Edge; màn 360px trở lên.

---

## 11. Visibility & chống gian lận

> 🟢 Đã chốt (2026-05-21) · Chi tiết hoá 2026-06-13

**Quyết định:** server-authoritative tuyệt đối — client không bao giờ nhận thông tin nó không được phép thấy.

### 11.1. Một phễu duy nhất

- **100% payload ra ngoài đi qua `buildView`/serializer whitelist** (liệt kê field được gửi, không spread object state). Cấm emit bất kỳ object nào của `GameState` trực tiếp — enforce bằng lint rule + code review checklist.
- Test chống leak (§16.2): với mỗi vai × mỗi pha, snapshot toàn bộ payload client nhận được và assert không chứa: roleId người khác, target của vai khác, nội dung kênh ngoài quyền, kết quả đêm trước công bố.

### 11.2. Enforce hành vi

- Quyền gửi chat theo (kênh × pha × lượt) kiểm ở server (§4.2). Lượt nói: ngoài lượt gửi text vào kênh chung → từ chối.
- Hành động/vote: validate qua engine (`validate.ts`) — sai vai, sai bước, sai mục tiêu đều `error` và ghi audit log.
- Timing leak: tiến độ đêm ẩn bước + đệm ngẫu nhiên (§2.2, §7.3).
- Khán giả (người chết) bị cắt mọi đường ghi vào kênh người sống ở tầng server, không chỉ ẩn UI.

### 11.3. Ngoài-band & abuse

- Gọi điện/nhắn ngoài app cho nhau (ghosting) không chặn được về kỹ thuật — giảm thiểu bằng nhịp pha nhanh + bảng phiếu công khai sau chốt (ai chơi bất thường sẽ lộ trong dữ liệu).
- Multi-account 1 phòng: chặn 2 user cùng IP vào cùng phòng ghép nhanh (cho phép ở phòng riêng — bạn cùng nhà là hợp lệ).
- Audit log mọi action bị từ chối + pattern bất thường (vote sau deadline hàng loạt, spam join/leave).

**Cần verify sau:** rà từng event đảm bảo không "vô tình" kèm field nhạy cảm khi serialize (đưa vào checklist PR + test leak).

---

## 12. Hạ tầng, triển khai & lộ trình MVP

> 🟢 Đã chốt (2026-05-21) · Chi tiết hoá 2026-06-13

**Quyết định:** lộ trình 3 giai đoạn (core trước, mở rộng dần); free-tier; CI GitHub Actions.

### 12.1. Lộ trình chi tiết (mỗi GĐ có Definition of Done)

**GĐ1 — MVP chơi được với bạn (mục tiêu ~4–6 tuần người-thật):**

| Milestone | Nội dung | DoD |
|---|---|---|
| M0 | Scaffold monorepo + CI (lint, typecheck, test) | `pnpm build/test` xanh trên CI |
| M1 | `shared`: types + event contract + role/phase ids | review chéo với luật |
| M2 | `engine`: 6 vai core (Dân, Sói, Tiên tri, Bảo vệ, Phù thủy, Thợ săn) + state machine + test ma trận §6.7 (phần áp dụng) | coverage nhánh resolver ~100%, determinism test xanh |
| M3 | `server`: phòng theo mã, vòng đời pha, đồng hồ, chat đa kênh, auth guest | 2 trình duyệt chơi hết 1 ván qua localhost |
| M4 | `web`: lobby + phòng chờ + màn chơi đủ tương tác §4 + theme nền §13 + chuyển pha cơ bản + role reveal §14 | ván 8 người thật chơi mượt trên mobile |
| M5 | Deploy public + smoke E2E | bạn bè chơi qua link, không cần hướng dẫn miệng |

**GĐ2 — Ghép trận, bot, tài khoản:** hàng đợi + lấp bot heuristic (đủ 6 vai core); Google + email auth + nâng cấp guest; hồ sơ + thống kê; bạn bè + presence + mời vào phòng; bảng phiếu công khai sau chốt; polish hiệu ứng đợt 2 (§14 catalogue phần vote/chết).

**GĐ3 — Mở rộng nội dung:** thêm dần vai mở rộng theo cụm (đợt 1: Trưởng làng, Già làng, Thầy đồng, Cupid; đợt 2: Sói Trắng, Sói Tiên tri, Sói Nguyền; đợt 3: Thằng Ngố, Kẻ Thổi Sáo) — mỗi đợt kèm policy bot + test; bot suy luận sâu hơn; full catalogue hiệu ứng + âm thanh + ambient.

**Sau:** MMR/xếp hạng, thành tích/nhiệm vụ, replay (đã có sẵn seed + event log), cosmetic, voice.

### 12.2. Hạ tầng & vận hành

- **Server:** 1 instance duy nhất lúc đầu (đơn giản nhất cho WS + state in-memory). Ứng viên free/siêu rẻ: Fly.io máy nhỏ, Railway, Koyeb, hoặc VPS Oracle Always-Free — **chốt sau khi đo** (mục Cần verify).
- **Postgres/Redis:** Neon/Supabase free (PG) + Upstash free (Redis) — đều có free-tier ổn định 2026.
- **Web tĩnh:** Vercel/Netlify/Cloudflare Pages.
- **CI:** GitHub Actions — lint + typecheck + vitest (engine bắt buộc xanh) trên mọi PR; deploy theo tag.
- **Quan sát:** §16.4.

**Cần verify sau:** chọn nhà cung cấp sau khi đo nhu cầu WS thực tế; ngưỡng nâng cấp trả phí.

---

## 13. Định hướng nghệ thuật & design system

> 🟢 Đã chốt (2026-06-13 — user giao assistant diễn giải "giao diện hợp thể loại")

**Quyết định:** Art theme **"Ngôi làng trong sương đêm"** — gothic dân gian, bí ẩn nhưng ấm: nền đêm xanh thẫm có trăng + sương, ánh **đèn lồng vàng** làm accent chính, đỏ máu dành riêng cho Sói/nguy hiểm. Game luôn nền tối (không có light mode); pha Ngày chỉ **đổi tông sáng-ấm trên cùng hệ tối**, để chuyển pha là một hiệu ứng màu mượt thay vì đổi theme gắt.

**Lý do:** Ma Sói là game đêm/suy luận — dark + ánh lửa là ngôn ngữ thị giác chuẩn của thể loại (Werewolf Online, Town of Salem đều vậy) và làm hiệu ứng ánh sáng (§14) nổi nhất với chi phí asset thấp: phần lớn "đẹp" đến từ màu + ánh sáng + chuyển động, không cần minh hoạ nặng — hợp nguồn lực 1 người.

### 13.1. Bảng màu (design tokens, CSS variables — đổi theo pha)

| Token | Đêm | Ngày | Dùng cho |
|---|---|---|---|
| `--bg-base` | `#0B0F1A` (xanh đêm đen) | `#141B2E` | nền |
| `--bg-surface` | `#161E33` | `#1D2742` | card, panel, dock |
| `--ink` | `#E8E2D0` (ngà giấy cũ) | `#F0EBDD` | chữ chính |
| `--ink-dim` | `#8E99B5` | `#9AA5C0` | chữ phụ |
| `--accent` | `#E8B44F` (vàng đèn lồng) | `#F2C66B` (nắng sớm) | nút chính, đồng hồ, viền focus |
| `--wolf` | `#B3262E` (đỏ máu) | = | phe Sói, nguy hiểm, cảnh báo treo cổ |
| `--village` | `#6FA76F` (lục rêu) | = | phe Dân |
| `--solo` | `#8B5CF6` (tím) | = | phe độc lập |
| `--dead` | desaturate + opacity .55 | = | người chết |

Quy tắc: **không truyền nghĩa chỉ bằng màu** — phe luôn kèm icon (🐺/🌿/🌒) và chữ (§16.3).

### 13.2. Chữ

- **Display** (tên pha, tiêu đề, tên vai trên lá bài): serif cổ có hỗ trợ tiếng Việt — **Cormorant** (Google Fonts, subset `vietnamese`); fallback `Georgia, serif`.
- **Body/UI:** **Be Vietnam Pro** — dựng cho tiếng Việt, đủ weight.
- Cỡ: hệ 4pt; body mobile 15–16px; display dùng tracking rộng + small-caps cho banner pha.
- *Verify khi cài:* render dấu tiếng Việt của Cormorant ở cỡ lớn (Ắ, Ễ, Ộ…) — nếu xấu, thay bằng **Crimson Pro**.

### 13.3. Hệ hình ảnh

- **Role card** = asset trung tâm của game (thứ người chơi nhìn lâu nhất lúc reveal): khung kiểu bài tarot — viền hoa văn khắc gỗ, nền texture giấy cũ tối, icon vai lớn ở giữa, dải màu phe ở chân, tên vai font display. 16 vai = 16 icon cùng nét.
- **Icon vai & UI:** bộ icon line-art một nét (stroke đồng nhất 1.5–2px) — UI dùng Lucide; icon vai tự vẽ SVG cùng grid 24px (trăng, mắt, khiên, bình thuốc, nỏ, huy hiệu, gậy đồng, sáo, mặt nạ…). SVG để nhuộm màu theo phe bằng `currentColor`.
- **Avatar người chơi:** 8–12 chân dung bán thân kiểu khắc gỗ/silhouette tối giản cùng palette — tránh ảnh thật/emoji lệch tông.
- **Nền cảnh:** 1 cảnh làng-bìa-rừng dựng bằng **3–4 lớp silhouette SVG parallax** (rừng xa, nhà, hàng rào, sương) + trăng/mặt trời là element riêng để animate — không dùng ảnh bitmap nặng.
- **Nguồn asset:** tự dựng SVG + AI-generate có chỉnh tay cho texture/chân dung; mọi asset ngoài phải CC0/đã mua — ghi nguồn trong `docs/CREDITS.md`.

### 13.4. Layout & spacing

- Hệ spacing 4pt, radius 10–14px (mềm, hợp "đèn lồng"), border 1px màu surface-sáng thay vì shadow gắt; glow vàng nhẹ cho element active.
- Mobile-first một cột; breakpoint chính: ≥1024px chuyển layout vòng tròn + dock chat phải (§15.5).

**Cần verify sau:** user duyệt mockup tĩnh màn chơi (đêm + ngày) trước khi code UI hàng loạt — chốt palette/feel bằng mắt, không bằng chữ.

---

## 14. Hiệu ứng, chuyển động & âm thanh

> 🟢 Đã chốt (2026-06-13 — user giao assistant diễn giải "hiệu ứng đẹp mắt")

**Quyết định:** hiệu ứng được thiết kế thành **catalogue có ưu tiên** (bảng dưới) — mỗi hiệu ứng phục vụ truyền đạt trạng thái game trước, đẹp sau; làm theo 3 đợt khớp GĐ1/2/3. Stack: **Motion (Framer Motion)** cho UI transition, **CSS keyframes + variables** cho ambient/đổi pha, **canvas 2D nhẹ tự viết** cho particle (đom đóm, sương), **Howler.js** cho âm thanh.

**Lý do:** transform/opacity + canvas nhỏ giữ được 60fps trên mobile tầm trung; không kéo thư viện 3D/WebGL (quá tay cho nhu cầu, nặng bundle). Lottie/Rive chỉ cân nhắc sau nếu cần asset phức tạp (trăng máu, sói hú) mà CSS không tới.

### 14.1. Catalogue hiệu ứng

| # | Hiệu ứng | Mô tả | Đợt |
|---|---|---|---|
| E1 | **Chuyển Ngày → Đêm** | Vignette tối dần từ mép, trăng mọc sau lớp silhouette, sương cuộn vào (2 layer trượt lệch tốc độ), toàn bộ CSS variables màu chuyển trong ~2.5s; chữ "ĐÊM THỨ N" font display fade-in giữa màn | 1 |
| E2 | **Chuyển Đêm → Ngày** | Dải sáng ấm quét ngang, sương tan (opacity + blur giảm), trăng lặn/mặt trời lên; "NGÀY THỨ N" | 1 |
| E3 | **Role reveal đầu ván** | Lá bài úp xoay 3D (CSS perspective) lật ra, glow màu phe toả từ viền, rung nhẹ 1 nhịp; giữ 5s + nút "Đã hiểu vai" | 1 |
| E4 | **Spotlight lượt nói** | Avatar người nói phóng nhẹ 1.06x, ring vàng chạy đồng hồ quanh avatar (conic-gradient animate), người khác mờ đi 20% | 1 |
| E5 | **Công bố cái chết** | Màn tối 0.8s → tên nạn nhân hiện theo nhịp trống; avatar hoá xám + nến trên avatar phụt tắt (particle khói nhỏ); nhiều người chết thì lần lượt cách nhau 0.6s | 2 |
| E6 | **Biểu quyết** | Phiếu (con dấu sáp) bay từ người vote tới avatar bị vote khi công bố tally; người bị treo: chuông làng + silhouette giá treo mờ dần ở nền — gợi, không ghê | 2 |
| E7 | **Hành động kín của mình** | Chọn mục tiêu: đường chỉ sáng nối tới avatar mục tiêu + icon hành động (mắt/khiên/bình) ghim lên — chỉ mình thấy | 2 |
| E8 | **Màn thắng/thua theo phe** | Sói thắng: trăng nhuộm đỏ + hú; Dân thắng: bình minh tràn màn + chim; Độc lập: màn tím + motif vai (sáo, dây thừng…) | 2 |
| E9 | **Ambient nền** | Đêm: đom đóm thưa (canvas ≤ 30 hạt), sương trôi chậm, sao nhấp nháy; Ngày: bụi nắng | 3 |
| E10 | **Micro-interactions** | Nút chính glow thở chậm; emote bay lên tan; tin nhắn slide-fade; hover card nghiêng 2° | 1 (nút/chat) & 3 (phần còn lại) |

### 14.2. Nguyên tắc kỹ thuật

- Chỉ animate `transform`/`opacity`/`filter`; cấm animate layout (width/top…). Particle canvas tự quản frame, pause khi tab ẩn.
- `prefers-reduced-motion` + toggle trong Settings: tắt particle/parallax/rung, giữ fade tối thiểu — trạng thái game không bao giờ chỉ truyền bằng animation (luôn kèm text trong EventFeed).
- Hiệu ứng phải **skippable về nhận thức**: người vào lại giữa chừng (re-sync) thấy ngay trạng thái cuối, không bị bắt xem lại animation.

### 14.3. Âm thanh (Howler, audio sprite 1 file)

| Nhóm | Âm | Lúc nào |
|---|---|---|
| Chuyển pha | sói hú + côn trùng đêm / gà gáy + chim sớm | E1 / E2 |
| Kịch tính | nhịp trống công bố chết; chuông làng khi treo cổ; sting thắng/thua theo phe | E5, E6, E8 |
| UI | tick 10s cuối đồng hồ; pop tin nhắn; click chốt hành động; ding tới lượt mình (cả khi tab blur) | suốt ván |
| Ambient (đợt 3) | loop đêm rất nhỏ (gió + dế), loop sảnh | nền |

- Nguồn: CC0 (freesound/Kenney), ghi credit; tổng tải ban đầu < 1.5MB, ambient lazy-load.
- Mixer trong Settings: master / SFX / ambient riêng; mặc định ambient 30%. Tôn trọng autoplay policy: chỉ phát sau tương tác đầu tiên.

**Cần verify sau:** soát cảm giác E6 (treo cổ) với người chơi thật — giữ "gợi" không "ghê"; đo fps trên máy Android tầm trung.

---

## 15. Đặc tả màn hình chi tiết

> 🟢 Đã chốt (2026-06-13 — diễn giải từ các quyết định §3, §4, §10)

### 15.1. Landing `/`

Hero: cảnh làng đêm parallax (§13.3) + trăng, tagline ngắn; 2 CTA: **"Chơi ngay"** (tạo guest → `/lobby`) và "Đăng nhập". Cuộn xuống: 3 bước chơi (nhận vai → đêm hành động → ngày luận tội) + link luật đầy đủ.

### 15.2. Sảnh `/lobby`

- Cột chính: card **Chơi nhanh** (1 nút + trạng thái hàng đợi khi đang tìm), card **Tạo phòng riêng**, dưới là **danh sách phòng công khai** (tên host, 5/8 chỗ, chip bộ vai, nút Vào).
- Sidebar (desktop) / tab (mobile): bạn bè online + nút mời; banner "Quay lại ván đang chơi" nếu có.

### 15.3. Modal tạo phòng

Số người (5–18, slider); **preset bộ vai tự gợi ý theo số người** (đúng bảng Mục 4 luật — số Sói tự tính, vai bật theo ngưỡng 8/10); chế độ "tuỳ chỉnh" cho phép bật/tắt vai mở rộng nhưng **engine validate** (không cho cấu hình vỡ cân bằng cơ bản: thiếu Sói, quá số vai); preset đồng hồ Nhanh/Chuẩn/Chậm; toggle công khai phòng. Mặc định = Chuẩn + preset gợi ý → host bấm 2 nút là xong.

### 15.4. Phòng chờ `/room/:code`

Mã phòng cực to + nút copy link; lưới slot avatar (người thật / bot có nhãn 🤖 / trống); host có nút thêm bot, kick, đổi cấu hình; panel xem trước bộ vai (mỗi vai 1 dòng: icon + tên + 1 câu mô tả — đây là chỗ người mới học luật); chat phòng chờ; nút **Bắt đầu** (chỉ host, sáng khi hợp lệ) → countdown 5s ai cũng thấy.

### 15.5. Màn chơi `/game/:roomCode` (màn quan trọng nhất)

**Desktop (≥1024px):** sân khấu giữa = vòng tròn avatar quanh "đống lửa làng" (điểm neo hiệu ứng); banner pha + đồng hồ trên cùng; ActionPanel nổi dưới sân khấu; ChatDock cố định bên phải (tab kênh); EventFeed thu gọn góc trái.

**Mobile (mặc định):** dọc 4 tầng — banner pha / lưới avatar (cuộn nếu >12) / ActionPanel (sticky khi cần hành động) / ChatDock chiếm phần còn lại; emote wheel = nút nổi.

**Hành vi theo pha** (tóm tắt — chi tiết quyền ở §4.2, §2.2):

| Pha | Mọi người thấy | Người có việc |
|---|---|---|
| NIGHT | overlay đêm, tiến độ tổng %, avatar ngủ (mờ + 💤) | vai tới lượt: ActionPanel mở, chọn mục tiêu ngay trên avatar (tap avatar = chọn), xác nhận, đổi được tới hết giờ; Sói thêm tab kênh Sói |
| ANNOUNCE | E5 + EventFeed cập nhật | Thợ săn (nếu vừa chết): panel bắn, đồng hồ riêng |
| DISCUSS | hàng đợi lượt nói + spotlight E4 | người tới lượt: input mở + nút Nói xong/Bỏ lượt; người khác: emote + accuse |
| VOTE | chấm "đã vote" trên avatar | mọi người sống: panel vote (danh sách + nút **Tha** to ngang hàng) |
| LYNCH_RESULT | bảng phiếu đầy đủ + E6 | — |
| GAME_OVER | E8 + GameOverModal: lật toàn bộ vai, timeline ván (đêm nào ai chết vì gì), nút **Chơi lại** | — |

### 15.6. Chế độ khán giả (khi chết)

Toàn UI desaturate nhẹ + badge "👻 Khán giả"; thấy mọi diễn biến công khai (vẫn KHÔNG thấy vai người sống — giữ kịch tính và chống stream-leak); chat người chết; vẫn xem được lá bài vai của mình.

### 15.7. Phụ trợ

- **Hồ sơ:** card avatar + stats §3.2, dải vai hay chơi.
- **Settings:** âm lượng 3 kênh, giảm hiệu ứng, đổi tên/avatar, liên kết tài khoản (nâng cấp guest).
- **Luật `/rules`:** render từ chính `LUAT_MA_SOI.md` (1 nguồn); trong ván, mọi icon vai/pha có tooltip "?" trích đúng đoạn luật liên quan — học luật tại chỗ thay vì tutorial riêng (tutorial tương tác để phase sau).

**Cần verify sau:** wireframe màn chơi mobile với 12+ người (lưới avatar có rối không) — test giấy trước khi code.

---

## 16. Chất lượng phi chức năng

> 🟢 Đã chốt (2026-06-13 — chuẩn assistant đề xuất, áp cho mọi GĐ)

### 16.1. Hiệu năng

- Bundle initial < 300KB gzip (code-split route; engine không vào bundle client trừ types); TTI < 3s trên 4G.
- Animation 60fps trên Android tầm trung (test thật từ GĐ1, không đợi cuối).
- Payload `game:stateSync` < 10KB; event thường < 1KB; latency cảm nhận hành động → phản hồi < 150ms (ack lạc quan ở UI).

### 16.2. Kiểm thử (tầng nào bắt lỗi tầng đó)

| Tầng | Công cụ | Phủ gì |
|---|---|---|
| Engine unit | Vitest | ma trận §6.7, mọi nhánh resolver — **mục tiêu ~100% nhánh `resolve/` và `win.ts`** |
| Engine property | fast-check | determinism (cùng seed+log → cùng state); "ván random luôn kết thúc" (không deadlock pha) |
| Leak test | Vitest snapshot | §11.1 — payload per vai × pha không chứa field cấm |
| Server integration | socket.io-client trong test | ván full-bot chạy từ create → game:over; reconnect giữa đêm; timeout các bước |
| E2E | Playwright | flow vàng: guest → tạo phòng → 2 client + bot → hết ván; smoke sau mỗi deploy |
| Manual playtest | bạn bè | nhịp đồng hồ, độ "giống người" của bot, cảm giác hiệu ứng |

### 16.3. Accessibility

- Contrast AA trên nền tối (vàng `#E8B44F` trên `#0B0F1A` đạt; kiểm bằng tooling khi chốt palette).
- Phe/trạng thái = màu **+ icon + chữ**; focus ring rõ (glow vàng); điều khiển được bàn phím ở các panel chính; `prefers-reduced-motion` (§14.2); font scale theo hệ thống không vỡ layout.

### 16.4. Bảo mật & vận hành

- HTTPS toàn bộ; cookie HttpOnly+Secure; CORS chỉ origin web; sanitize chat (escape — không render HTML); rate-limit §9; secrets qua env, không commit.
- Logging: pino JSON có `roomCode`/`gameId` để trace 1 ván; Sentry free-tier FE+BE; health endpoint + UptimeRobot; metric tối thiểu: phòng đang mở, ván/ngày, P95 latency event, lỗi engine (phải = 0).
- Backup: PG provider tự backup + dump tuần tải về.

---

## 17. Rủi ro, giả định & điểm cần chốt

> 🟢 Ghi nhận 2026-06-13 (sổ rủi ro — cập nhật liên tục)

### 17.1. Rủi ro chính & giảm thiểu

| Rủi ro | Ảnh hưởng | Giảm thiểu |
|---|---|---|
| Free-tier không nuôi nổi WS bền (sleep, giới hạn giờ) | rớt ván giữa chừng | snapshot Redis + recovery (§7.5); đo sớm ở M5; sẵn phương án VPS rẻ |
| Bot nói "vô duyên" làm trận nhạt | trải nghiệm ghép nhanh kém | bot được phép im lặng; playtest mẫu câu; nâng dần (§8.4) |
| Ít người online ngày đầu | hàng đợi trống | chính sách lấp bot đã là giải pháp; phòng riêng + link mời là kênh tăng trưởng chính |
| Scope 16 vai + hiệu ứng kéo dài vô hạn | không bao giờ ship | cắt GĐ cứng: GĐ1 chỉ 6 vai + hiệu ứng đợt 1; thêm vai theo cụm có test |
| Asset nghệ thuật vượt sức 1 người | UI nửa vời | phong cách silhouette/SVG + ánh sáng (§13) chọn vì rẻ công; role card là asset duy nhất cần đầu tư tay |
| Engine sai luật ở edge case hiếm | mất lòng tin người chơi | ma trận test §6.7 + property test + sổ điểm mở §17.3 chốt trước khi code vai liên quan |

### 17.2. Giả định

Người chơi chủ yếu mobile, tiếng Việt; ván điển hình 8 người; 1 server instance đủ cho giai đoạn đầu (< ~50 phòng song song); người chơi chấp nhận bot trong ghép nhanh nếu trận vẫn vui.

### 17.3. Điểm luật/sản phẩm — ĐÃ CHỐT TOÀN BỘ (2026-06-13)

O1–O3 do user chốt trực tiếp; O4–O8 user ủy quyền dùng đề xuất mặc định. **Chỉ đạo chung từ user (2026-06-13):** các điểm mở phát sinh sau này, assistant tự quyết theo phương án ưu tiên/khuyến nghị, không cần hỏi lại — chỉ hỏi khi không có phương án trội.

| # | Điểm | Quyết định | Nguồn |
|---|---|---|---|
| O1 | Bảng ai-vote-ai sau khi khóa phiếu | **Công khai đầy đủ** — tăng dữ liệu suy luận, hợp bản chất "giơ tay" của luật gốc | user |
| O2 | Nhãn bot | Phòng riêng hiện 🤖; **ghép nhanh ẩn nhãn trong ván**, mô tả chế độ ghi rõ "có thể có bot" | user |
| O3 | Sói Nguyền vs Bảo vệ/Phù thủy | **Bảo vệ chặn được nhiễm** (Sói Nguyền không mất quyền); đêm nhiễm thành công → Phù thủy được báo "không ai bị cắn" | user |
| O4 | Sói Trắng bị Bảo vệ chặn? | Đòn Sói Trắng tính là "Sói cắn" → Bảo vệ chặn được | mặc định |
| O5 | Kẻ Thổi Sáo: "toàn bộ người sống" có gồm chính hắn? | Không — thắng khi mọi người sống KHÁC hắn đều bị mê | mặc định |
| O6 | Trưởng làng truyền chức khi chết (luật ghi "tùy luật nhà") | v1 KHÔNG truyền chức; cân nhắc bật như biến thể sau | mặc định |
| O7 | Phù thủy cứu người đã được Bảo vệ chặn | Bình cứu vẫn bị tiêu (không lộ thông tin bảo vệ) | mặc định |
| O8 | Lịch Sói Trắng "cách đêm" | Đêm chẵn: 2, 4, 6… | mặc định |

---

## Lịch sử cập nhật

| Ngày | Section | Thay đổi |
|---|---|---|
| 2026-05-21 | (init) | Tạo skeleton + đề xuất 10 section. Chốt scope: 2 mode (phòng mã + ghép trận lấp bot), full vai, public có tài khoản, tech do assistant đề xuất |
| 2026-05-21 | §1 | Đề xuất tech stack (TS monorepo, React+Vite, Node+Socket.IO, Postgres+Redis) |
| 2026-05-21 | §1 | **Chốt 🟢** tech stack + ràng buộc ưu tiên free-tier |
| 2026-05-21 | (cấu trúc) | Thêm §3 (trải nghiệm ngoài trận & xã hội) và §4 (tương tác trong trận) theo phản hồi user: 10 section cũ thiên về luật, thiếu nghiệp vụ game + tính tương tác. Renumber còn 12 section |
| 2026-05-21 | §2 | **Chốt 🟢** nghiệp vụ theo luật bản cuối; bổ sung thảo luận ban ngày theo lượt nói (tầng ứng dụng) |
| 2026-05-21 | §3 | **Chốt 🟢** v1: Sảnh (chơi nhanh + tạo phòng/mã mời), Hồ sơ+thống kê, Bạn bè+online. Hoãn: MMR, thành tích, replay, cosmetic |
| 2026-05-21 | §4 | **Chốt 🟢** v1: lượt nói ngẫu nhiên + text, chat đa kênh, trạng thái/đồng hồ, emote, chỉ điểm, hiệu ứng+âm thanh. Hoãn: voice, last-words, reaction theo tin nhắn. Lý do lượt-nói: dễ quan sát + data dễ quản lý |
| 2026-05-21 | §5,§6,§10,§11 | **Chốt 🟢** các section kỹ thuật (user giao assistant đề xuất): data model Postgres+Redis & event contract redacted-view; engine luật thuần deterministic + seed RNG + test; frontend React/Vite mobile-first + Tailwind; visibility server-authoritative |
| 2026-05-21 | §7 | **Chốt 🟢** ghép trận chờ ~30–45s rồi lấp bot (tối thiểu 1 người thật); phòng riêng không auto-bot; mất kết nối cho re-join, quá hạn xử như rời |
| 2026-05-21 | §8 | **Chốt 🟢** bot mục tiêu suy luận theo thông tin, triển khai theo bậc (heuristic trước, sâu dần); bot dùng redacted-view + engine như người |
| 2026-05-21 | §9 | **Chốt 🟢** v1 hỗ trợ guest + Google + email; nâng cấp guest→tài khoản; argon2/bcrypt; email verify hoãn |
| 2026-05-21 | §12 | **Chốt 🟢** lộ trình 3 giai đoạn (MVP phòng-mã 6 vai → ghép trận+bot+tài khoản → mở rộng vai+bot sâu); free-tier deploy + CI |
| 2026-05-21 | (toàn bộ) | **12/12 section đã 🟢.** PLAN sẵn sàng chuyển Phase 2 (PROGRESS.md) |
| 2026-06-13 | §1–§12 | **Chi tiết hoá toàn bộ** theo yêu cầu user (plan thật chi tiết, kĩ lưỡng): giữ nguyên mọi quyết định 2026-05-21, bổ sung đặc tả triển khai — state machine + bước đêm (§2), schema DB + contract đầy đủ (§5), pipeline resolver + ma trận test + chống timing-leak (§6), vòng đời phòng + recovery (§7), kiến trúc bot + policy theo vai (§8), milestones M0–M5 với DoD (§12) |
| 2026-06-13 | §13–§17 | **Thêm mới 5 section** (user giao assistant diễn giải "giao diện hợp thể loại + hiệu ứng đẹp"): art theme "Ngôi làng trong sương đêm" + design tokens (§13); catalogue 10 hiệu ứng theo 3 đợt + âm thanh (§14); đặc tả từng màn hình (§15); chuẩn phi chức năng — hiệu năng/test/a11y/bảo mật (§16); sổ rủi ro + 8 điểm luật mở O1–O8 kèm đề xuất mặc định (§17) |
| 2026-06-13 | (di chuyển) | Khuyến nghị Lucia → tự cài session theo guide Lucia hoặc Auth.js (Lucia đã ngừng phát triển dạng library) (§9) |
| 2026-06-13 | §17.3 | **Chốt toàn bộ O1–O8:** O1 công khai bảng phiếu, O2 bot ghép nhanh ẩn nhãn, O3 Bảo vệ chặn nhiễm Sói Nguyền (user chốt trực tiếp); O4–O8 dùng đề xuất mặc định (user ủy quyền, không cần hỏi lại). Cập nhật khớp tại §4.3, §6.1, §6.3, §8. Chỉ đạo chung: điểm mở sau này tự quyết theo khuyến nghị |
