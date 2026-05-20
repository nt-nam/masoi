# LUẬT GAME MA SÓI (WEREWOLF) — BẢN CHUẨN MỞ RỘNG

> Tài liệu mô tả **đầy đủ thành phần và lối chơi** của game Ma Sói.
> Đây là bản luật tham chiếu (rules reference), không chứa thông tin kỹ thuật/code.
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
Gồm Ma Sói thường và các biến thể Sói.
- **Thắng khi:** số Ma Sói **≥** số Dân làng còn sống (Sói áp đảo, không thể bị treo cổ một cách dân chủ nữa). Một số nhóm chơi luật: **Sói thắng khi số Sói = số Dân còn sống**.

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
- **Tối thiểu:** 5 người chơi + 1 Quản trò (lý tưởng từ 8 người).
- **Số Ma Sói** ≈ 1/4 đến 1/3 tổng số người chơi.
- Luôn có ít nhất các vai chức năng cốt lõi: **Tiên tri**, **Bảo vệ**, **Phù thủy**.

### Bảng gợi ý cấu hình theo số người

| Người chơi | Ma Sói | Vai chức năng Dân gợi ý | Dân thường |
|---|---|---|---|
| 6  | 1 | Tiên tri | 4 |
| 8  | 2 | Tiên tri, Bảo vệ, Phù thủy | 3 |
| 10 | 2 | Tiên tri, Bảo vệ, Phù thủy, Thợ săn | 3 |
| 12 | 3 | Tiên tri, Bảo vệ, Phù thủy, Thợ săn, Cupid | 4 |
| 14 | 3 | + Thầy đồng, Trưởng làng | 5 |
| 16 | 4 | + Sói trắng, Thằng Ngố | 5 |
| 18 | 4 | + Kẻ Thổi Sáo, Cô bé | 6 |

> Quản trò tự cân bằng: thêm vai mạnh cho Dân thì có thể thêm Sói, và ngược lại.

### Cách chia vai
1. Quản trò chọn bộ vai phù hợp số người và đảm bảo cân bằng.
2. Phát vai **ngẫu nhiên** mỗi người 1 vai (trực tiếp: úp bài, xáo trộn, bốc; online: gán kín cho từng người).
3. Người chơi **xem bí mật** vai của mình, **không tiết lộ**.
4. Quản trò ghi nhớ ai là vai gì (hoặc dùng bảng theo dõi).

---

## 5. VÒNG CHƠI: ĐÊM VÀ NGÀY

Game lặp lại chu kỳ **Đêm → Ngày** cho tới khi có phe thắng.

```
[Đêm 0 / Đêm đầu]  → các vai khởi tạo (Cupid bắn tên, Sói nhận mặt nhau, Tiên tri soi…)
        ↓
[Ngày 1]           → công bố người chết đêm qua → thảo luận → biểu quyết treo cổ
        ↓
[Đêm 2]            → các vai hành động
        ↓
[Ngày 2]           → ... lặp lại ...
```

- **Đêm đầu tiên** đặc biệt: Cupid bắn tên, các Sói nhận diện nhau lần đầu. Một số luật cho Đêm đầu **không có ai chết** (chỉ khởi tạo).
- **Đêm thường:** các vai hành động theo trình tự (Mục 6).
- **Ngày:** công bố cái chết, thảo luận, biểu quyết.

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
| 3 | **Thầy đồng / Người gọi hồn** | Mỗi đêm (tùy luật) | Giao tiếp với người đã chết (theo luật nhà). |
| 4 | **Tiên tri (Seer)** | Mỗi đêm | Chọn 1 người → được báo **kín** người đó là Sói / không phải Sói. |
| 5 | **Bảo vệ (Guard)** | Mỗi đêm | Chọn 1 người để bảo vệ đêm đó (không trùng đêm trước). |
| 6 | **Ma Sói (tất cả Sói)** | Mỗi đêm | Cùng thống nhất **1 nạn nhân** để cắn (trao đổi qua kênh riêng của Sói). |
| 6b | **Sói Trắng** | Cách đêm | (Mỗi 2 đêm) có thể giết thêm 1 **Sói khác** một mình. |
| 6c | **Sói Tiên tri** | Mỗi đêm | Soi 1 người để biết vai chính xác (thay vì chỉ Sói/không). |
| 7 | **Phù thủy (Witch)** | Mỗi đêm | Được biết kín ai bị Sói cắn; có thể dùng **Bình Cứu** (cứu nạn nhân) và/hoặc **Bình Độc** (giết thêm 1 người). Mỗi bình dùng 1 lần cả ván. |
| 8 | **Kẻ Thổi Sáo (Pied Piper)** | Mỗi đêm | Mê hoặc 2 người (1 nếu ít người còn sống). |
| 9 | **Cô bé (Little Girl)** | Mỗi đêm | Cố nhận diện Sói khi Sói hành động — rủi ro bị Sói phát hiện (xem Mục 8.1). |

Sau khi tất cả hành động xong, game chuyển sang Ngày (trực tiếp: hô *"Trời sáng, mọi người mở mắt"*). Quản trò công bố ai đã chết đêm qua (không tiết lộ vai trừ khi luật yêu cầu).

> 📌 Trình tự có thể điều chỉnh theo luật nhà, nhưng **nguyên tắc bất biến**: Bảo vệ chọn **trước** khi Sói cắn; Phù thủy hành động **sau** khi Sói cắn (vì cần biết nạn nhân).

---

## 7. PHA NGÀY: THẢO LUẬN & BIỂU QUYẾT

### 7.1. Công bố cái chết
- Quản trò thông báo (những) người chết đêm qua. Người chết chuyển sang trạng thái **đã chết**: **rời cuộc chơi**, **không được giao tiếp** với người còn sống nữa (trực tiếp: úp/lật bài rồi im lặng; online: chuyển sang chế độ khán giả, chỉ xem hoặc trò chuyện trong kênh riêng của người đã chết).
- Một số vai kích hoạt khi chết (Thợ săn bắn, Cặp đôi chết theo nhau) — xử lý ngay.

### 7.2. Thảo luận
- Tất cả người còn sống thảo luận tự do: buộc tội, biện hộ, suy luận (trực tiếp: nói chuyện; online: kênh trò chuyện chung bằng văn bản hoặc thoại, **chỉ người còn sống** tham gia).
- Người chơi có thể "claim" (khai) vai của mình để tạo lòng tin — nhưng đó cũng là rủi ro lộ mặt cho Sói.

### 7.3. Biểu quyết treo cổ (Lynch)
1. Đề cử các ứng viên bị nghi.
2. Mỗi người còn sống bỏ **1 phiếu** (trực tiếp: giơ tay; online: chọn tên người muốn treo cổ, trong thời gian biểu quyết).
3. **Người nhiều phiếu nhất bị treo cổ**, lộ kết cục và rời game.
4. **Hòa phiếu:** áp dụng luật nhà — phổ biến là **không ai chết**, hoặc bỏ phiếu lại giữa những người hòa, hoặc **Trưởng làng** phá hòa.

> Mỗi ngày treo cổ **tối đa 1 người** (trừ biến thể đặc biệt). Có thể có luật "bỏ qua không treo ai" nếu làng đồng thuận. Khi chơi online, ai **không bỏ phiếu** trước khi hết giờ coi như **phiếu trắng**.

---

## 8. DANH SÁCH VAI TRÒ CHI TIẾT

### 8.1. PHE DÂN LÀNG 🟢

#### Dân làng (Villager)
- **Phe:** Dân. **Chức năng:** Không có năng lực đặc biệt.
- **Nhiệm vụ:** Suy luận, thảo luận, biểu quyết treo cổ Sói. Lá bài "nền" tạo số đông cho làng.

#### Tiên tri (Seer / Fortune Teller) 🔮
- **Phe:** Dân. **Hành động:** Mỗi đêm soi **1 người**; Quản trò ra hiệu người đó **là Sói hay không phải Sói**.
- **Lưu ý:** Vai mạnh nhất của Dân; thường là mục tiêu số 1 của Sói. Phải khéo léo dẫn dắt mà không lộ mặt sớm.

#### Bảo vệ / Hộ vệ (Guard / Bodyguard) 🛡️
- **Phe:** Dân. **Hành động:** Mỗi đêm chọn **1 người** (có thể chọn chính mình tùy luật) để bảo vệ. Người được bảo vệ **không chết nếu bị Sói cắn** đêm đó.
- **Ràng buộc:** **Không được bảo vệ cùng một người 2 đêm liên tiếp.**
- **Lưu ý:** Bảo vệ **không** chặn được Bình Độc của Phù thủy (tùy luật nhà).

#### Phù thủy (Witch) 🧪
- **Phe:** Dân. **Tài nguyên:** 1 **Bình Cứu** + 1 **Bình Độc**, mỗi bình dùng **1 lần duy nhất** cả ván.
- **Hành động:** Mỗi đêm được Quản trò cho biết **ai bị Sói cắn**.
  - **Bình Cứu:** cứu sống nạn nhân đêm đó (có thể cứu chính mình tùy luật).
  - **Bình Độc:** giết chết thêm **1 người** bất kỳ.
- **Lưu ý:** Có thể dùng cả 2 bình trong cùng 1 đêm hoặc để dành.

#### Thợ săn (Hunter) 🏹
- **Phe:** Dân. **Hành động:** Khi **chết** (bị Sói cắn, bị treo cổ, hay bị đầu độc), Thợ săn được **bắn chết ngay 1 người bất kỳ** trước khi rời game.
- **Lưu ý:** Phát súng có thể bắn nhầm Dân — cần suy luận kỹ.

#### Trưởng làng / Già làng (Mayor / Village Elder) 🎖️
- **Phe:** Dân. **Năng lực (theo biến thể):**
  - **Phiếu đôi:** phiếu biểu quyết của Trưởng làng tính **2 phiếu**, và **phá hòa** khi biểu quyết hòa.
  - (Biến thể Già làng) **Chịu được 1 lần bị Sói cắn** mới chết.
- **Lưu ý:** Khi Trưởng làng chết, có thể **truyền chức** cho người khác (tùy luật).

#### Thầy đồng / Người gọi hồn (Medium) 👻
- **Phe:** Dân. **Hành động:** Mỗi đêm, Quản trò cho phép Thầy đồng "giao tiếp" với **người đã chết** (ví dụ: người chết được chỉ 1 lần ra hiệu Sói/Dân về một người). Luật chi tiết tùy nhà.
- **Lưu ý:** Cầu nối thông tin giữa người chết và người sống.

#### Cô bé (Little Girl) 👧
- **Phe:** Dân. **Hành động:** Trong lúc Sói hành động ban đêm, Cô bé được **hé nhìn** để cố nhận diện Sói (trực tiếp: hé mắt rình; online: được phép "rình" kênh Sói trong giây lát, theo luật nhà).
- **Rủi ro:** Nếu bị Sói **phát hiện** đang rình, Sói có thể chọn **giết Cô bé** thay vì nạn nhân dự định (luật nhà). Năng lực mạo hiểm cao.

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
| **Bảo vệ + Phù thủy độc cùng người** | Bảo vệ **không** chặn Bình Độc (tùy luật nhà) → người đó vẫn chết. |
| **Tiên tri soi Sói Trắng** | Hiện ra là **Sói**. |
| **Tiên tri soi người yêu Sói (cặp đôi)** | Hiện đúng vai gốc (Dân thì là Dân). |
| **Thợ săn bị Sói cắn chết** | Vẫn được **bắn 1 người** trước khi rời game. |
| **Thợ săn bị treo cổ** | Vẫn được **bắn 1 người**. |
| **Một nửa cặp đôi chết** | Người còn lại **chết theo ngay**. Nếu người đó là Thợ săn → vẫn được bắn. |
| **Trưởng làng chết** | Truyền chức cho người khác (nếu dùng luật truyền chức). |
| **Sói Trắng giết Sói cuối cùng** | Phe Sói còn lại chỉ là Sói trắng → tiếp tục đua tới khi còn 1 mình. |
| **Nhiều cái chết cùng lúc kích hoạt dây chuyền** | Xử lý theo thứ tự nguyên nhân, áp dụng hết hiệu ứng rồi mới kiểm tra điều kiện thắng. |
| **Biểu quyết hòa** | Luật nhà: không ai chết / bỏ phiếu lại / Trưởng làng phá hòa. |

> **Nguyên tắc vàng:** giải quyết **toàn bộ hiệu ứng dây chuyền** (chết theo, bắn súng…) **xong xuôi**, **rồi mới** kiểm tra điều kiện thắng của các phe theo thứ tự: độc lập → Sói → Dân.

---

## 10. VAI TRÒ QUẢN TRÒ (MODERATOR)

Quản trò là **trọng tài trung lập**, không thuộc phe nào, là người duy nhất biết toàn bộ vai.

**Trách nhiệm:**
1. Chọn cấu hình vai, chia bài, ghi nhớ ai là vai gì.
2. Điều phối pha Đêm: gọi từng vai đúng trình tự, ghi nhận hành động bí mật.
3. Tính toán kết quả đêm (ai chết, ai được cứu) **chính xác và công bằng**.
4. Điều phối pha Ngày: dẫn dắt thảo luận, tổ chức biểu quyết, công bố treo cổ.
5. Kiểm tra điều kiện thắng sau mỗi pha và **tuyên bố kết thúc** khi đạt.
6. Giữ bí mật tuyệt đối, **không gợi ý, không thiên vị**.

**Mẹo cho Quản trò:**
- Dùng bảng theo dõi trạng thái: ai sống/chết, bình thuốc còn không, ai được bảo vệ đêm trước, ai bị mê hoặc, cặp đôi là ai.
- Luôn hiệu lệnh nhất quán khi chuyển pha; khi chơi online thì hiển thị rõ **pha hiện tại** và **thời gian còn lại**.
- Khi nhiều vai cùng nhắm 1 người, xử lý theo bảng tương tác (Mục 9).
- Khi chơi online, Quản trò (người hoặc trọng tài tự động) còn lo: đặt **đồng hồ pha**, nhận **lựa chọn kín** của từng vai, giữ **kênh riêng cho Sói** và **kênh người đã chết**, và xử lý **người vắng mặt** (Mục 11).

---

## 11. ĐIỀU CHỈNH CHO CHƠI ONLINE

Phần này **chỉ là luật chơi** áp dụng khi mọi người chơi từ xa, không ngồi cùng phòng. Mục tiêu: giữ nguyên trải nghiệm Ma Sói nhưng thay các thao tác "nhắm/mở mắt, ra hiệu tay" bằng **lựa chọn kín theo thời gian**.

### 11.1. Thông tin ai được thấy gì
- **Người còn sống:** thấy danh sách người chơi và trạng thái còn sống/đã chết; tham gia kênh trò chuyện chung ban ngày.
- **Phe Sói:** có **kênh trao đổi riêng** ban đêm; chỉ Sói thấy nội dung và biết mặt nhau.
- **Cặp đôi yêu nhau:** được cho biết kín danh tính người kia, và có thể có kênh riêng (tùy luật).
- **Người đã chết:** chuyển sang **chế độ khán giả** — xem được diễn biến nhưng **không được nhắn/gợi ý** cho người sống; có thể có kênh trò chuyện riêng giữa những người đã chết.
- **Vai chức năng:** kết quả riêng (Tiên tri soi, Phù thủy biết nạn nhân…) chỉ hiển thị **kín cho đúng người đó**.

### 11.2. Hành động theo đồng hồ
- Mỗi pha có **thời gian giới hạn**; trong pha Đêm, mỗi vai **chọn mục tiêu kín** trước khi hết giờ.
- Các hành động đêm được **chốt đồng loạt** khi pha kết thúc, rồi mới tính kết quả theo trình tự ở Mục 6 (Bảo vệ trước Sói, Phù thủy sau Sói…).
- Kết quả đêm (ai chết/được cứu) **chỉ công bố** khi sang Ngày, không lộ trong lúc Đêm.

### 11.3. Người vắng mặt / rời giữa chừng
- Ai **không kịp chọn** hành động trước khi hết giờ: coi như **bỏ lượt** (không hành động đêm đó); khi biểu quyết thì tính **phiếu trắng**.
- Nếu một người **rời hẳn** giữa ván, áp dụng luật nhà: (a) giữ nhân vật ở trạng thái "không hành động/không bỏ phiếu", hoặc (b) coi như **chết** và xử lý các hiệu ứng khi chết (Thợ săn bắn, cặp đôi chết theo…). Nên chốt cách xử lý **trước khi bắt đầu**.
- Để tránh bế tắc: nếu cả phe Sói không ai chọn nạn nhân, **đêm đó không ai bị cắn** (hoặc theo luật "Sói cắn không thống nhất" ở Mục 12).

### 11.4. Giữ công bằng (fair-play)
- Vai trò và lựa chọn của mỗi người là **bí mật tuyệt đối**; không tiết lộ ra kênh chung.
- Người đã chết **không được** mách nước cho người sống bằng bất kỳ kênh nào.
- Khuyến nghị **khóa đổi phiếu** sau khi đã chốt biểu quyết, để tránh giằng co phút chót (tùy luật nhà).

---

## 12. CÁC BIẾN THỂ & LUẬT TÙY CHỌN

- **Đêm đầu không ai chết:** chỉ khởi tạo (Cupid, nhận mặt Sói), Sói chưa cắn. Giúp game không mất vai sớm.
- **Lật bài khi chết hay không:** giấu vai người chết để tăng độ khó suy luận, hoặc lật bài để minh bạch.
- **Cấm "claim" vai:** một số nhóm cấm khai vai để tăng tính suy luận.
- **Giới hạn thời gian thảo luận:** đặt đồng hồ (vd 2–3 phút) mỗi ngày để game nhanh.
- **Sói cắn không thống nhất:** nếu Sói không đồng thuận, Quản trò chọn ngẫu nhiên trong các mục tiêu, hoặc không ai chết.
- **Bỏ phiếu treo cổ kiểu phát biểu cuối:** người bị đề cử được nói 1 câu biện hộ cuối.
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
| Thầy đồng | | |
| Cô bé | | |
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
