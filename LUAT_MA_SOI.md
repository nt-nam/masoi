# LUẬT GAME MA SÓI (WEREWOLF) — BẢN CHUẨN MỞ RỘNG

> **Phiên bản cuối — cập nhật 2026-05-21.** Đã chốt toàn bộ luật mặc định cho cả chơi trực tiếp lẫn online (không Quản trò).
> Tài liệu mô tả **đầy đủ thành phần và lối chơi** của game Ma Sói.
> Đây là bản luật tham chiếu (rules reference), không chứa thông tin kỹ thuật.
> Dựa trên bản gốc *The Werewolves of Miller's Hollow* (Les Loups-garous de Thiercelieux)
> kết hợp các biến thể phổ biến trong cộng đồng Việt Nam.

---

## MỤC LỤC

1. [Tổng quan](#1-tổng-quan)
2. [Thành phần game](#2-thành-phần-game)
3. [Các phe & điều kiện thắng](#3-các-phe--điều-kiện-thắng)
4. [Số người chơi & cách chia vai](#4-số-người-chơi--cách-chia-vai)
5. [Vòng chơi: Đêm và Ngày](#5-vòng-chơi-đêm-và-ngày)
6. [Trình tự pha Đêm (Night Order)](#6-trình-tự-pha-đêm-night-order)
7. [Pha Ngày: Thảo luận & Biểu quyết](#7-pha-ngày-thảo-luận--biểu-quyết)
8. [Danh sách vai trò chi tiết](#8-danh-sách-vai-trò-chi-tiết)
9. [Luật xử lý tương tác & xung đột](#9-luật-xử-lý-tương-tác--xung-đột)
10. [Vai trò Quản trò (Moderator)](#10-vai-trò-quản-trò-moderator)
11. [Điều chỉnh cho chơi Online](#11-điều-chỉnh-cho-chơi-online)
12. [Các biến thể & luật tùy chọn](#12-các-biến-thể--luật-tùy-chọn)
13. [Bảng tra nhanh](#13-bảng-tra-nhanh)
14. [Thuật ngữ](#14-thuật-ngữ)

---

## 1. TỔNG QUAN

Ma Sói là game suy luận xã hội (social deduction) chơi theo nhóm, có **một Quản trò (người điều phối hoặc trọng tài trung lập tự động)** và **các người chơi** được chia bí mật vào hai phe đối lập (và đôi khi phe thứ ba độc lập).

- **Phe Dân làng**: đa số, không biết ai là Sói, phải tìm và treo cổ hết Sói.
- **Phe Ma Sói**: thiểu số, biết nhau, mỗi đêm giết một Dân làng, ngụy trang ban ngày.
- **Phe độc lập (phe thứ ba)**: có mục tiêu thắng riêng, không thuộc Dân hay Sói.

Game diễn ra theo các **vòng (round)**, mỗi vòng gồm **pha Đêm** (các vai có chức năng hành động bí mật) và **pha Ngày** (mọi người thảo luận và biểu quyết treo cổ một người).

Game kết thúc khi một phe đạt điều kiện thắng.

> 🎮 **Game này chơi được cả hai hình thức:** *trực tiếp* (mọi người ngồi vòng tròn, nhắm/mở mắt theo hiệu lệnh Quản trò) và *online* (mỗi người ở một nơi, hành động được chọn **kín** và tính theo **đồng hồ pha chơi**). Bản luật này mô tả thống nhất cho cả hai; các điểm **riêng cho online** được nêu ở **Mục 11**.

---

## 2. THÀNH PHẦN GAME

| Thành phần | Mô tả |
|---|---|
| **Bộ vai trò** | Tập hợp vai trò được phát cho ván (Dân, Sói, Tiên tri…). Số vai phát ra = số người chơi. Khi chơi trực tiếp là bộ bài; khi chơi online là vai được gán kín cho từng người. |
| **Quản trò (Moderator)** | Bên **không tham gia phe nào**, điều phối toàn bộ game: chia vai, gọi pha, nhận hành động kín, tính kết quả, công bố. Có thể là một người dẫn, hoặc một trọng tài trung lập tự động (khi chơi online). |
| **Người chơi** | Từ 5 người trở lên (lý tưởng 8–18). Mỗi người nhận 1 vai bí mật và có **trạng thái** riêng (còn sống / đã chết, và các dấu hiệu như được bảo vệ, bị mê hoặc, thuộc cặp đôi…). |
| **Phòng chơi** | Nơi tập hợp đủ người trước khi bắt đầu (chơi trực tiếp: ngồi vòng tròn; chơi online: một phòng chung có danh sách người chơi và trạng thái còn sống/đã chết). |
| **Đồng hồ pha chơi** | Giới hạn thời gian cho mỗi pha (đặc biệt cần khi chơi online): hết giờ thì pha tự kết thúc và chốt các hành động đã chọn. |
| **(Tùy chọn) Dấu đánh dấu trạng thái** | Ghi nhận Trưởng làng, cặp đôi yêu nhau, người được bảo vệ, người bị mê hoặc… để Quản trò quản lý chính xác. |

---

## 3. CÁC PHE & ĐIỀU KIỆN THẮNG

### Phe Dân làng (Villagers) 🟢
Gồm Dân thường và mọi vai trò có chức năng thuộc phe Dân (Tiên tri, Bảo vệ, Phù thủy, Thợ săn, Thầy đồng…).
- **Thắng khi:** **toàn bộ Ma Sói** (và Sói trắng) bị loại khỏi game.

### Phe Ma Sói (Werewolves) 🔴
Gồm Ma Sói thường và các biến thể Sói **theo phe** (Sói Tiên tri, Sói Nguyền).
- **Thắng khi:** số Sói **≥** số Dân làng còn sống (Sói áp đảo, không thể bị treo cổ một cách dân chủ nữa). Một số nhóm chơi luật: **Sói thắng khi số Sói = số Dân còn sống**.
- ⚠️ **Sói Trắng KHÔNG tính** vào "số Sói" khi xét điều kiện này, vì nó là **phe độc lập** (xem dưới). Khi trên bàn chỉ còn Sói Trắng và (các) Dân, phe Sói thường **không thắng**; ván tiếp tục để Sói Trắng đua tới khi còn một mình.

### Phe độc lập / phe thứ ba (Solo) 🟣
Mỗi vai có điều kiện thắng **riêng**, được kiểm tra **ưu tiên** trước khi xét Dân/Sói:
- **Thằng Ngố (Tanner/Fool):** thắng nếu **bị treo cổ** ban ngày.
- **Kẻ Thổi Sáo (Pied Piper):** thắng nếu **mê hoặc toàn bộ người còn sống**.
- **Sói Trắng (White Werewolf):** thắng nếu là **người duy nhất sống sót** cuối cùng.
- **Cặp đôi yêu nhau khác phe (Cupid):** nếu cặp đôi gồm 1 Dân + 1 Sói, họ thắng khi **chỉ còn lại 2 người là chính họ**.

> ⚠️ **Thứ tự kiểm tra thắng mỗi lượt:** (1) điều kiện phe độc lập → (2) phe Sói → (3) phe Dân. Nếu nhiều điều kiện cùng đúng, áp dụng luật nhà (thường ưu tiên phe độc lập).

---

## 4. SỐ NGƯỜI CHƠI & CÁCH CHIA VAI

### Quy tắc chung
- **Tối thiểu:** 5 người chơi (chơi trực tiếp cần thêm 1 Quản trò; chơi online thì không — xem Mục 11).
- Số Ma Sói bám theo **bảng chuẩn** dưới đây.

### Số Ma Sói chuẩn (theo dải số người)

| Số người chơi | Số Ma Sói |
|---|---:|
| 5–7   | 1 |
| 8–11  | 2 |
| 12–15 | 3 |
| 16–18 | 4 |

> Trên 18 người: số Sói = phần nguyên của (số người ÷ 4), tối thiểu 1.

### Vai chức năng bật theo số người

| Vai | Bật từ |
|---|---:|
| **Tiên tri** | 5 người (luôn có) |
| **Bảo vệ** | 8 người |
| **Phù thủy** | 8 người |
| **Thợ săn** | 10 người |

> Lý do cân bằng: ván 5–7 người chỉ nên có Tiên tri để phe Dân không quá mạnh; từ 8 người mới thêm Bảo vệ + Phù thủy; từ 10 người thêm Thợ săn để tăng tương tác. Các vai mở rộng (Cupid, Trưởng làng, Già làng, Sói Trắng, Thằng Ngố, Kẻ Thổi Sáo, Thầy đồng…) thêm vào tùy ý khi đông người, nhưng càng nhiều vai càng phức tạp.

### Ví dụ cấu hình gợi ý

| Người chơi | Ma Sói | Vai chức năng Dân gợi ý | Dân thường |
|---|---|---|---|
| 6  | 1 | Tiên tri | 4 |
| 8  | 2 | Tiên tri, Bảo vệ, Phù thủy | 3 |
| 10 | 2 | Tiên tri, Bảo vệ, Phù thủy, Thợ săn | 3 |
| 12 | 3 | + Cupid | 4 |
| 14 | 3 | + Thầy đồng, Trưởng làng | 5 |
| 16 | 4 | + Sói Trắng, Thằng Ngố | 5 |
| 18 | 4 | + Kẻ Thổi Sáo | 6 |

> Đây chỉ là **ví dụ**; số Sói luôn lấy theo bảng chuẩn ở trên. Nguyên tắc cân bằng: thêm vai mạnh cho Dân thì có thể tăng độ khó bằng cách thêm vai Sói biến thể, và ngược lại.

### Cách chia vai
1. Quản trò chọn bộ vai phù hợp số người và đảm bảo cân bằng.
2. Phát vai **ngẫu nhiên** mỗi người 1 vai (trực tiếp: úp bài, xáo trộn, bốc; online: gán kín cho từng người).
3. Người chơi **xem bí mật** vai của mình, **không tiết lộ**.
4. Quản trò ghi nhớ ai là vai gì (hoặc dùng bảng theo dõi).

---

## 5. VÒNG CHƠI: ĐÊM VÀ NGÀY

Game lặp lại chu kỳ **Đêm → Ngày** cho tới khi có phe thắng.

```
[Đêm 0]   → khởi tạo (Cupid bắn tên, Sói nhận mặt nhau). KHÔNG ai chết.
   ↓
[Ngày 1]  → "thảo luận mở đầu": làm quen, dò xét. KHÔNG biểu quyết treo cổ.
   ↓
[Đêm 1]   → các vai hành động; Sói BẮT ĐẦU được cắn.
   ↓
[Ngày 2]  → công bố người chết đêm qua → thảo luận → BẮT ĐẦU biểu quyết treo cổ.
   ↓
[Đêm 2] → [Ngày 3] → ... lặp lại tới khi có phe thắng.
```

- **Đêm 0 (đêm khởi tạo) — KHÔNG ai chết:** chỉ dùng để khởi tạo (Cupid bắn tên, các Sói nhận diện nhau). Sói **chưa được cắn** ở Đêm 0. *(Biến thể: cho Sói cắn ngay Đêm đầu — Mục 12.)*
- **Ngày 1 — "thảo luận mở đầu", KHÔNG treo cổ:** vì chưa ai chết và Tiên tri chưa có thông tin, Ngày 1 chỉ để mọi người làm quen/dò xét, **không biểu quyết treo cổ** (tránh treo cổ may rủi). Biểu quyết treo cổ **bắt đầu từ Ngày 2**.
- **Đêm thường (từ Đêm 1):** các vai hành động theo trình tự (Mục 6); cái chết sớm nhất xuất hiện sáng Ngày 2.
- **Ngày thường (từ Ngày 2):** công bố cái chết, thảo luận, biểu quyết treo cổ.

> ⏱️ **Mỗi pha có giới hạn thời gian** (đồng hồ pha chơi). Hết giờ, pha tự kết thúc: hành động nào chưa chọn coi như **bỏ qua** (xem luật người vắng mặt ở Mục 11). Thời lượng gợi ý: Đêm 30–60 giây cho mỗi nhóm hành động, Ngày 2–5 phút thảo luận + 30–60 giây biểu quyết. Quản trò tùy chỉnh theo số người.

---

## 6. TRÌNH TỰ PHA ĐÊM (NIGHT ORDER)

Khi vào Đêm, Quản trò gọi từng vai theo thứ tự dưới đây. Vai nào không có trong ván thì bỏ qua.
- **Chơi trực tiếp:** Quản trò hô *"Trời tối, tất cả nhắm mắt"*, gọi từng vai mở mắt hành động bằng **ra hiệu (chỉ tay/gật đầu)**, không nói thành tiếng.
- **Chơi online:** mỗi vai **chọn mục tiêu kín** trong thời gian của pha; không ai thấy lựa chọn của người khác. Các Sói có **kênh trao đổi riêng** chỉ Sói thấy. Kết quả đêm chỉ được công bố khi sang Ngày.

### Trình tự chuẩn

| # | Vai trò | Tần suất | Hành động |
|---|---|---|---|
| 1 | **Cupid** | Chỉ Đêm đầu | Chọn 2 người làm cặp đôi yêu nhau. |
| 2 | **Cặp đôi yêu nhau** | Chỉ Đêm đầu | Được cho biết kín người kia là ai. |
| 3 | **Thầy đồng / Người gọi hồn** | Mỗi đêm | Chọn **1 người đã chết** → biết kín người đó thuộc phe Sói hay không. |
| 4 | **Tiên tri (Seer)** | Mỗi đêm | Chọn 1 người → được báo **kín** người đó là Sói / không phải Sói. |
| 5 | **Bảo vệ (Guard)** | Mỗi đêm | Chọn 1 người **khác mình** để bảo vệ (không trùng người đã bảo vệ ở **đêm liền trước**). |
| 6 | **Ma Sói (tất cả Sói)** | Mỗi đêm | Cùng thống nhất **1 nạn nhân** để cắn (trao đổi qua kênh riêng của Sói). |
| 6b | **Sói Trắng** | Cách đêm | (Mỗi 2 đêm) có thể giết thêm 1 **Sói khác** một mình. |
| 6c | **Sói Tiên tri** | Mỗi đêm | Soi 1 người để biết vai chính xác (thay vì chỉ Sói/không). |
| 7 | **Phù thủy (Witch)** | Mỗi đêm | Được biết kín ai bị Sói cắn; có thể dùng **Bình Cứu** (cứu nạn nhân) và/hoặc **Bình Độc** (giết thêm 1 người). Mỗi bình dùng 1 lần cả ván. |
| 8 | **Kẻ Thổi Sáo (Pied Piper)** | Mỗi đêm | Mê hoặc 2 người (1 nếu ít người còn sống). |
| 9 | **Cô bé (Little Girl)** *(chỉ chơi trực tiếp)* | Mỗi đêm | Hé mắt rình nhận diện Sói — rủi ro bị Sói phát hiện. Không dùng online (Mục 8.1). |

Sau khi tất cả hành động xong, game chuyển sang Ngày (trực tiếp: hô *"Trời sáng, mọi người mở mắt"*). Công bố ai đã chết đêm qua — **mặc định chỉ báo là họ đã chết, không lộ vai trò** (xem Mục 7.1).

> 📌 Trình tự có thể điều chỉnh theo luật nhà, nhưng **nguyên tắc bất biến**: Bảo vệ chọn **trước** khi Sói cắn; Phù thủy hành động **sau** khi Sói cắn (vì cần biết nạn nhân). Khi chơi online, Đêm chạy **lần lượt từng bước** theo đúng thứ tự này (xem Mục 11.2).

> 🎯 **Luật chọn mục tiêu hợp lệ (mặc định, áp dụng cho mọi hành động đêm):**
> - Chỉ được chọn **người còn sống**; **không** được chọn người đã chết.
> - **Tiên tri** được soi **bất kỳ** người sống, kể cả người mình đã soi trước đó.
> - **Bảo vệ** không được **tự bảo vệ mình**, và không bảo vệ cùng một người **hai đêm liền**.
> - **Ma Sói** không được cắn **người thuộc phe Sói** (mục tiêu phải ngoài phe Sói).
> - **Phù thủy** được **tự cứu** nếu chính mình là nạn nhân bị cắn, nhưng **không được tự đầu độc**; Bình Độc chỉ nhắm người khác.
> - Khi nhiều Sói: nạn nhân được chốt theo **đa số phiếu trong nội bộ Sói**; nếu **hòa** hoặc **không ai chọn** thì **đêm đó không ai bị cắn**.

---

## 7. PHA NGÀY: THẢO LUẬN & BIỂU QUYẾT

### 7.1. Công bố cái chết
- Thông báo (những) người chết đêm qua. Người chết chuyển sang trạng thái **đã chết**: **rời cuộc chơi**, **không được giao tiếp** với người còn sống nữa (trực tiếp: úp bài, ngồi im; online: chuyển sang chế độ khán giả, chỉ xem hoặc trò chuyện trong kênh riêng của người đã chết).
- **Mặc định KHÔNG lộ vai khi chết:** chỉ công bố **ai chết** và **chết kiểu gì** (chết ban đêm / bị treo cổ / bị Thợ săn bắn), **không** công bố vai trò, phe, hay ai gây ra cái chết bí mật. (Muốn lộ vai thì bật biến thể ở Mục 12.)
- Nếu nhiều người chết cùng một đêm: công bố **đồng thời một danh sách**, không tách ai chết vì lý do gì.
- Một số vai kích hoạt khi chết (Thợ săn bắn, Cặp đôi chết theo nhau) — xử lý ngay.

### 7.2. Thảo luận
- Tất cả người còn sống thảo luận tự do: buộc tội, biện hộ, suy luận (trực tiếp: nói chuyện; online: kênh trò chuyện chung bằng văn bản hoặc thoại, **chỉ người còn sống** tham gia).
- Người chơi có thể "claim" (khai) vai của mình để tạo lòng tin — nhưng đó cũng là rủi ro lộ mặt cho Sói.

### 7.3. Biểu quyết treo cổ (Lynch)
> ⚠️ **Ngày 1 KHÔNG biểu quyết treo cổ** (chỉ thảo luận mở đầu — xem Mục 5). Biểu quyết treo cổ bắt đầu từ **Ngày 2** trở đi.

1. Mỗi người còn sống bỏ **1 phiếu**: chọn **một người muốn treo cổ**, hoặc chọn **"Tha"** (không treo ai). Trực tiếp: giơ tay; online: chọn tên (hoặc "Tha") trong thời gian biểu quyết. **Mặc định không có bước đề cử riêng** — bỏ phiếu thẳng vào bất kỳ ai.
2. Được **đổi phiếu tự do** cho tới khi hết giờ; hết giờ thì **khóa phiếu cuối cùng**. Ai không bỏ phiếu coi như **phiếu trắng** (online: tính như chọn "Tha").
3. **Người nhiều phiếu nhất bị treo cổ** (luật **nhiều phiếu nhất** — không cần quá bán), **bị loại khỏi ván** (không lộ vai). Nếu **"Tha"** nhiều phiếu nhất thì **không ai bị treo**.
4. **Hòa phiếu (mặc định): không ai bị treo** ngày đó; không bỏ phiếu lại. ("Tha" hòa với một người ở vị trí dẫn đầu cũng tính là hòa → không treo ai.)

> Mỗi ngày treo cổ **tối đa 1 người**. *(Biến thể: bắt buộc quá bán, bỏ phiếu lại khi hòa, hoặc cho Trưởng làng phá hòa — xem Mục 12.)*

---

## 8. DANH SÁCH VAI TRÒ CHI TIẾT

### 8.1. PHE DÂN LÀNG 🟢

#### Dân làng (Villager)
- **Phe:** Dân. **Chức năng:** Không có năng lực đặc biệt.
- **Nhiệm vụ:** Suy luận, thảo luận, biểu quyết treo cổ Sói. Lá bài "nền" tạo số đông cho làng.

#### Tiên tri (Seer / Fortune Teller) 🔮
- **Phe:** Dân. **Hành động:** Mỗi đêm soi **1 người sống** (được soi lại cả người mình đã soi trước đó); được báo **kín** người đó **là Sói hay không phải Sói**.
- **Lưu ý:** Vai mạnh nhất của Dân; thường là mục tiêu số 1 của Sói. Phải khéo léo dẫn dắt mà không lộ mặt sớm.

#### Bảo vệ / Hộ vệ (Guard / Bodyguard) 🛡️
- **Phe:** Dân. **Hành động:** Mỗi đêm chọn **1 người khác mình** để bảo vệ. Người được bảo vệ **không chết nếu bị Sói cắn** đêm đó.
- **Ràng buộc:** **Không tự bảo vệ mình**, và **không bảo vệ cùng một người ở hai đêm liền.**
- **Lưu ý:** Bảo vệ **chỉ chặn Sói cắn**, **không** chặn Bình Độc của Phù thủy.

#### Phù thủy (Witch) 🧪
- **Phe:** Dân. **Tài nguyên:** 1 **Bình Cứu** + 1 **Bình Độc**, mỗi bình dùng **1 lần duy nhất** cả ván.
- **Hành động:** Mỗi đêm được cho biết **kín** ai vừa bị Sói cắn, rồi mới quyết định:
  - **Bình Cứu:** cứu sống nạn nhân đêm đó. **Được tự cứu** nếu chính mình là nạn nhân.
  - **Bình Độc:** giết chết thêm **1 người khác** (**không được tự đầu độc**).
- **Lưu ý:** Có thể dùng cả 2 bình trong cùng 1 đêm hoặc để dành.

#### Thợ săn (Hunter) 🏹
- **Phe:** Dân. **Hành động:** Khi **chết** (bị Sói cắn, bị treo cổ, hay bị đầu độc), Thợ săn được **bắn chết ngay 1 người bất kỳ** trước khi rời game.
- **Lưu ý:** Phát súng có thể bắn nhầm Dân — cần suy luận kỹ.

#### Trưởng làng (Mayor) 🎖️
- **Phe:** Dân. **Năng lực (mặc định):** khi biểu quyết treo cổ **hòa**, phiếu của Trưởng làng **phá hòa** (quyết định ai bị treo trong số những người hòa).
- **Biến thể mạnh hơn:** phiếu của Trưởng làng tính **2 phiếu** (phiếu đôi). *Không nên bật phiếu đôi ở ván ít người vì làm vai quá mạnh.*
- **Lưu ý:** Khi Trưởng làng chết, có thể **truyền chức** cho người khác (tùy luật nhà).

#### Già làng (Village Elder) 🧓
- **Phe:** Dân. **Năng lực:** **Chịu được 1 lần bị Sói cắn** mà không chết (lần cắn thứ hai mới chết). Không chống được Bình Độc của Phù thủy hay bị treo cổ.
- **Lưu ý:** Là vai riêng, **không gộp** với Trưởng làng. Nếu chết, không có năng lực truyền chức.

#### Thầy đồng / Người gọi hồn (Medium) 👻
- **Phe:** Dân. **Hành động:** Mỗi đêm chọn **1 người đã chết**; được biết **kín** người đó **thuộc phe Sói hay không thuộc phe Sói**.
- **Ngoại lệ:** đây là vai **duy nhất** được nhắm vào **người đã chết** (trái với luật chọn mục tiêu hợp lệ ở Mục 6).
- **Lưu ý:** **Không** mở kênh trò chuyện giữa người chết và người sống; người chết không "nhắn" gì — Thầy đồng chỉ đọc được phe của họ. (Chốt theo hướng này để chống lộ thông tin, dùng được cả online.)

#### Cô bé (Little Girl) 👧 — *biến thể chỉ dùng khi chơi trực tiếp*
- **Phe:** Dân. **Hành động:** Trong lúc Sói hành động ban đêm, Cô bé **hé mắt rình** để cố nhận diện Sói.
- **Rủi ro:** Nếu bị Sói **phát hiện** đang rình, Sói có thể chọn **giết Cô bé** thay vì nạn nhân dự định. Năng lực mạo hiểm cao.
- ⚠️ **Không dùng trong bản online tự động:** cơ chế "rình kênh Sói" khó công bằng và dễ lộ thông tin, nên Cô bé chỉ giữ như một biến thể khi mọi người chơi trực tiếp.

#### Cupid / Thần Tình Yêu 💘
- **Phe:** Dân (nhưng tạo ra cơ chế phe thứ ba). **Hành động:** Chỉ **Đêm đầu**, chọn **2 người** (có thể gồm chính mình) thành **Cặp đôi yêu nhau**.
- **Cơ chế cặp đôi:**
  - Hai người yêu nhau nhận diện nhau đêm đầu.
  - **Nếu 1 người trong cặp chết, người còn lại chết theo ngay lập tức** (vì đau buồn).
  - Nếu cặp đôi **khác phe** (1 Dân + 1 Sói), họ trở thành **phe độc lập**: mục tiêu mới là **chỉ còn 2 người sống sót là chính họ**.

### 8.2. PHE MA SÓI 🔴

#### Ma Sói (Werewolf) 🐺
- **Phe:** Sói. **Hành động:** Mỗi đêm cùng các Sói khác **mở mắt, thống nhất 1 nạn nhân** để cắn chết.
- **Ban ngày:** giả làm Dân, đánh lạc hướng, bảo vệ đồng đội Sói, vu oan cho Dân.

#### Sói Trắng (White Werewolf) 🤍🐺
- **Phe:** Sói khi hành động chung, **nhưng mục tiêu thắng độc lập**.
- **Hành động riêng:** **Cách 1 đêm** (mỗi 2 đêm), Sói trắng thức dậy **một mình** và có thể **giết thêm 1 Sói khác**.
- **Điều kiện thắng:** là **người duy nhất còn sống cuối cùng**. Phản bội cả Dân lẫn Sói.

#### Sói Tiên tri (Wolf Seer / Sorcerer) 🔴🔮
- **Phe:** Sói. **Hành động:** Mỗi đêm soi **1 người** và biết **vai trò chính xác** của người đó (mạnh hơn Tiên tri thường ở chỗ biết vai cụ thể), giúp Sói săn vai chức năng của Dân.

#### Sói Nguyền / Kẻ Lây Nhiễm (Accursed Wolf-Father) 🩸 *(tùy chọn)*
- **Phe:** Sói. **Hành động:** **1 lần duy nhất cả ván**, thay vì giết nạn nhân, **biến nạn nhân thành Sói** (gia nhập phe Sói từ đêm sau).

### 8.3. PHE ĐỘC LẬP / PHE THỨ BA 🟣

#### Thằng Ngố (Tanner / Village Idiot) 🤪
- **Phe:** Độc lập. **Điều kiện thắng:** **bị làng treo cổ** ban ngày → thắng **ngay lập tức** (một số luật: game tiếp tục nhưng anh ta đã thắng).
- **Lưu ý:** Nếu chết ban đêm (bị Sói cắn/đầu độc) thì **không** thắng. Mục tiêu là làm làng nghi ngờ và treo cổ mình.
- *(Biến thể "Thằng Khờ":)* nếu **bị treo cổ vẫn sống** nhưng **mất quyền biểu quyết** suốt phần còn lại — đây là vai thuộc phe Dân.

#### Kẻ Thổi Sáo (Pied Piper / Flute Player) 🎶
- **Phe:** Độc lập. **Hành động:** Mỗi đêm **mê hoặc 2 người** (1 người nếu còn ít người sống). Người bị mê hoặc được đánh dấu (Quản trò cho họ biết riêng).
- **Điều kiện thắng:** khi **toàn bộ người còn sống đều bị mê hoặc** → Kẻ Thổi Sáo thắng tuyệt đối, không cần giết ai.

---

## 9. LUẬT XỬ LÝ TƯƠNG TÁC & XUNG ĐỘT

Đây là phần dễ tranh cãi nhất — cần thống nhất trước khi chơi:

| Tình huống | Cách xử lý chuẩn |
|---|---|
| **Bảo vệ trùng nạn nhân của Sói** | Nạn nhân **sống sót** (được cứu). |
| **Phù thủy cứu trùng nạn nhân của Sói** | Nạn nhân **sống sót**. |
| **Bảo vệ + Phù thủy độc cùng người** | Bảo vệ **chỉ chặn Sói cắn**, **không** chặn Bình Độc → người đó vẫn chết. |
| **Tiên tri soi Sói Trắng** | Hiện ra là **Sói**. |
| **Tiên tri soi người yêu Sói (cặp đôi)** | Hiện đúng vai gốc (Dân thì là Dân). |
| **Thợ săn bị Sói cắn chết** | Vẫn được **bắn 1 người** trước khi rời game. |
| **Thợ săn bị treo cổ** | Vẫn được **bắn 1 người**. |
| **Một nửa cặp đôi chết** | Người còn lại **chết theo ngay**. Nếu người đó là Thợ săn → vẫn được bắn. |
| **Trưởng làng chết** | Truyền chức cho người khác (nếu dùng luật truyền chức). |
| **Sói Trắng giết Sói cuối cùng** | Phe Sói còn lại chỉ là Sói trắng → tiếp tục đua tới khi còn 1 mình. |
| **Già làng bị Sói cắn lần đầu** | **Sống sót** (chịu được 1 lần cắn); lần cắn thứ hai mới chết. Không chống được Độc/treo cổ. |
| **Nhiều cái chết cùng lúc kích hoạt dây chuyền** | Xử lý theo thứ tự nguyên nhân, áp dụng hết hiệu ứng rồi mới kiểm tra điều kiện thắng. |
| **Biểu quyết hòa** | **Mặc định: không ai bị treo.** Nếu có **Trưởng làng**, phiếu Trưởng làng **phá hòa**. |

> **Nguyên tắc vàng:** giải quyết **toàn bộ hiệu ứng dây chuyền** (chết theo, bắn súng…) **xong xuôi**, **rồi mới** kiểm tra điều kiện thắng của các phe theo thứ tự: độc lập → Sói → Dân.

---

## 10. VAI TRÒ QUẢN TRÒ (MODERATOR)

Quản trò là **trọng tài trung lập**, không thuộc phe nào, là bên duy nhất biết toàn bộ vai. **Chơi trực tiếp thì cần một người làm Quản trò.**

> 🤖 **Chơi online thì KHÔNG cần Quản trò người.** Toàn bộ việc của Quản trò được thay bằng **luật cố định + thứ tự lượt công khai**: tới lượt vai nào thì **chính người giữ vai đó tự thao tác** (chọn mục tiêu kín), hết lượt thì sang vai kế. Kết quả và điều kiện thắng được suy ra **máy móc theo đúng các luật trong tài liệu này**, không cần ai phán xử. Xem Mục 11.

**Trách nhiệm (do người Quản trò làm khi chơi trực tiếp, hoặc do luật/thứ tự lượt tự lo khi online):**
1. Chọn cấu hình vai, chia vai, biết ai là vai gì.
2. Điều phối pha Đêm: cho từng vai hành động **đúng trình tự** (Mục 6), nhận hành động bí mật.
3. Tính kết quả đêm (ai chết, ai được cứu) **chính xác và công bằng**, theo bảng tương tác Mục 9.
4. Điều phối pha Ngày: mở thảo luận, tổ chức biểu quyết, công bố treo cổ.
5. Kiểm tra điều kiện thắng sau mỗi pha và **kết thúc** khi đạt.
6. Giữ bí mật tuyệt đối, **không gợi ý, không thiên vị**.

**Khi chơi trực tiếp, mẹo cho người Quản trò:**
- Dùng bảng theo dõi trạng thái: ai sống/chết, bình thuốc còn không, ai được bảo vệ đêm trước, ai bị mê hoặc, cặp đôi là ai.
- Hiệu lệnh nhất quán khi chuyển pha.
- Khi nhiều vai cùng nhắm 1 người, xử lý theo bảng tương tác (Mục 9).

---

## 11. ĐIỀU CHỈNH CHO CHƠI ONLINE

Phần này **chỉ là luật chơi** áp dụng khi mọi người chơi từ xa, không ngồi cùng phòng. Mục tiêu: giữ nguyên trải nghiệm Ma Sói nhưng **không cần một người làm Quản trò** — thay các thao tác "nhắm/mở mắt, ra hiệu tay" bằng **lượt chơi cố định + lựa chọn kín theo thời gian**.

### 11.0. Chơi không cần Quản trò (theo lượt)
- Game đi theo một **thứ tự lượt cố định, công khai** (đúng trình tự Mục 6 cho Đêm, và Mục 7 cho Ngày). Mọi người chơi đều biết trước thứ tự này.
- **Tới lượt vai nào thì chính người giữ vai đó được thao tác** (chọn mục tiêu kín). Vai khác chưa tới lượt thì chờ; vai không có hành động ở pha đó thì tự bỏ qua.
- Sau khi mọi lượt trong pha kết thúc, **kết quả được suy ra máy móc theo đúng luật** (bảng tương tác Mục 9, thứ tự xử lý chết) — không ai "phán" cả.
- **Điều kiện thắng tự kiểm tra** sau mỗi pha theo thứ tự ở Mục 3 (độc lập → Sói → Dân). Đạt là game kết thúc.
- Nhờ vậy không cần một người trung lập biết hết vai: **luật + thứ tự lượt chính là trọng tài**.

### 11.1. Thông tin ai được thấy gì
- **Người còn sống:** thấy danh sách người chơi và trạng thái còn sống/đã chết; tham gia kênh trò chuyện chung ban ngày.
- **Phe Sói:** có **kênh trao đổi riêng** ban đêm; chỉ Sói thấy nội dung và biết mặt nhau.
- **Cặp đôi yêu nhau:** được cho biết kín danh tính người kia, và có thể có kênh riêng (tùy luật).
- **Người đã chết:** chuyển sang **chế độ khán giả** — xem được diễn biến nhưng **không được nhắn/gợi ý** cho người sống; có thể có kênh trò chuyện riêng giữa những người đã chết.
- **Vai chức năng:** kết quả riêng (Tiên tri soi, Phù thủy biết nạn nhân…) chỉ hiển thị **kín cho đúng người đó**.

### 11.2. Đêm diễn ra theo các bước có thứ tự (không phải khóa cùng lúc)
- Pha Đêm **không** chốt mọi hành động cùng một lúc. Nó chạy **lần lượt từng bước** theo đúng trình tự Mục 6, mỗi bước có **đồng hồ riêng**:
  1. Bước của vai trước **chốt xong** mới sang bước của vai sau.
  2. Nhờ vậy các vai phụ thuộc nhau hoạt động đúng: **Bảo vệ** chọn trước → **Sói** cắn → **Phù thủy** được biết kín ai vừa bị cắn rồi mới quyết định **cứu/độc**.
- Mỗi bước, vai tới lượt **chọn mục tiêu kín** trước khi hết giờ của bước đó. Hết giờ mà chưa chọn → **bỏ lượt** (xem 11.3).
- Trong khi Đêm đang diễn ra, **không lộ** kết quả từng bước cho người ngoài. Kết quả tổng (ai chết/được cứu) **chỉ công bố khi sang Ngày**.

### 11.3. Người vắng mặt / rời giữa chừng
Vì không có Quản trò can thiệp, các tình huống này có **luật mặc định cố định** để game tự chạy thông suốt:
- **Hết giờ chưa chọn:** coi như **bỏ lượt** — vai đó không hành động đêm đó; khi biểu quyết thì tính **phiếu trắng**. Không có hành động "mặc định ngầm" nào thay người chơi.
- **Phe Sói không chọn được nạn nhân** (không ai chọn, hoặc chọn lệch nhau không ra kết quả): **đêm đó không ai bị Sói cắn**. (Nhóm nào muốn quyết liệt hơn có thể bật biến thể "Sói cắn không thống nhất" ở Mục 12.)
- **Rời hẳn giữa ván:** người đó bị coi như **chết** ngay (và **kích hoạt đủ hiệu ứng khi chết**: Thợ săn được bắn, cặp đôi chết theo…), để ván không bị treo vì chờ một người không quay lại.
- Mọi mốc thời gian (đồng hồ từng bước Đêm, thảo luận Ngày, biểu quyết) đều **công khai và như nhau** với mọi người để đảm bảo công bằng.

### 11.4. Giữ công bằng (fair-play)
- Vai trò và lựa chọn của mỗi người là **bí mật tuyệt đối**; không tiết lộ ra kênh chung.
- Người đã chết **không được** mách nước cho người sống bằng bất kỳ kênh nào.
- Khuyến nghị **khóa đổi phiếu** sau khi đã chốt biểu quyết, để tránh giằng co phút chót (tùy luật nhà).

---

## 12. CÁC BIẾN THỂ & LUẬT TÙY CHỌN

> Các luật dưới đây là **tùy chọn**, dùng để thay cho luật **mặc định** đã nêu ở các mục trên.

- **Cho Sói cắn ngay Đêm đầu:** ngược với mặc định "Đêm 0 không ai chết" (Mục 5) — có thể có người chết ngay sau đêm đầu.
- **Lộ vai khi chết:** ngược với mặc định "không lộ vai" (Mục 7.1) — lật bài/công bố vai người chết để minh bạch, dễ suy luận hơn nhưng giảm độ khó.
- **Treo cổ cần quá bán:** thay cho mặc định "nhiều phiếu nhất" (Mục 7.3) — chỉ treo khi có **trên 50%** số người sống đồng ý.
- **Bỏ phiếu lại khi hòa:** thay cho mặc định "hòa thì không treo ai" — bỏ phiếu vòng hai giữa những người hòa.
- **Trưởng làng phiếu đôi:** nếu trong ván có Trưởng làng, cho phiếu của Trưởng làng tính **2 phiếu** (mạnh hơn năng lực phá-hòa mặc định — Mục 8.1). Cân nhắc ở ván ít người.
- **Sói cắn ngẫu nhiên khi không thống nhất:** thay cho mặc định "không ai chết" (Mục 11.3) — nạn nhân được chọn **ngẫu nhiên** trong các mục tiêu Sói đã nhắm.
- **Cấm "claim" vai:** cấm khai vai để tăng tính suy luận.
- **Bỏ phiếu kiểu phát biểu cuối:** người dẫn đầu phiếu được nói 1 câu biện hộ trước khi chốt.
- **Thêm/bớt vai:** tự cân bằng theo trình độ người chơi; càng nhiều vai chức năng, game càng phức tạp.

---

## 13. BẢNG TRA NHANH

### Phân loại vai theo phe

| Phe 🟢 Dân | Phe 🔴 Sói | Phe 🟣 Độc lập |
|---|---|---|
| Dân làng | Ma Sói | Thằng Ngố |
| Tiên tri | Sói Trắng* | Kẻ Thổi Sáo |
| Bảo vệ | Sói Tiên tri | (Cặp đôi khác phe) |
| Phù thủy | Sói Nguyền | |
| Thợ săn | | |
| Trưởng làng | | |
| Già làng | | |
| Thầy đồng | | |
| Cô bé (trực tiếp) | | |
| Cupid | | |

\* Sói trắng hành động cùng phe Sói nhưng thắng độc lập.

### Vai có hành động ban đêm (theo trình tự)
`Cupid → Cặp đôi → Thầy đồng → Tiên tri → Bảo vệ → Ma Sói → Sói Trắng/Sói Tiên tri → Phù thủy → Kẻ Thổi Sáo → Cô bé`

### Vai kích hoạt khi chết
- **Thợ săn** → bắn 1 người.
- **Cặp đôi yêu nhau** → người còn lại chết theo.
- **Trưởng làng** → truyền chức (tùy luật).

### Tài nguyên dùng 1 lần
- **Phù thủy:** Bình Cứu (1), Bình Độc (1).
- **Sói Nguyền:** biến nạn nhân thành Sói (1).

---

## 14. THUẬT NGỮ

| Thuật ngữ | Ý nghĩa |
|---|---|
| **Quản trò (Mod)** | Người điều phối trung lập, biết mọi vai. |
| **Cắn (Kill)** | Sói chọn giết 1 người mỗi đêm. |
| **Treo cổ (Lynch)** | Làng biểu quyết loại 1 người ban ngày. |
| **Soi (Check)** | Tiên tri kiểm tra 1 người ban đêm. |
| **Claim** | Người chơi công khai khai vai của mình. |
| **Cặp đôi (Lovers)** | 2 người do Cupid ghép, chết theo nhau. |
| **Mê hoặc (Charm)** | Trạng thái do Kẻ Thổi Sáo gây ra. |
| **Phe độc lập (Solo)** | Vai thắng theo điều kiện riêng, không thuộc Dân/Sói. |
| **Pha (Phase)** | Một giai đoạn trong vòng chơi: Đêm hoặc Ngày. |
| **Vòng (Round)** | Một chu kỳ đầy đủ gồm 1 Đêm + 1 Ngày. |
| **Lựa chọn kín** | Hành động được chọn riêng tư, không ai khác thấy (cơ chế chính khi chơi online). |
| **Đồng hồ pha** | Thời gian giới hạn của mỗi pha; hết giờ pha tự chốt. |
| **Phiếu trắng** | Không bỏ phiếu treo cổ ai (do chủ động hoặc hết giờ). |
| **Chế độ khán giả** | Trạng thái của người đã chết: xem được nhưng không tác động vào ván. |

---

> **Ghi chú cuối:** Đây là bản luật tham chiếu, dùng được cho cả chơi trực tiếp lẫn online. Trước mỗi ván, Quản trò nên **chốt rõ luật nhà** ở các điểm dễ tranh cãi (Mục 9, 11 và 12) để mọi người chơi thống nhất.
