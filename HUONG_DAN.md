# 🌽 Bắp Học Vui – Hướng dẫn chi tiết

Ứng dụng học **Toán** và **Tiếng Việt** cho bé chuẩn bị vào lớp 1, chạy trên điện thoại
(Android và iPhone) dưới dạng **PWA**: một trang web có thể "cài" ra màn hình chính,
mở toàn màn hình như ứng dụng thật. Không cần lên CH Play / App Store, không tốn phí.

---

## 1. Ứng dụng có những gì?

### 🔢 Toán (phạm vi 10 hoặc 20, bố mẹ chọn)
| Dạng bài | Ví dụ | Hình minh hoạ |
|---|---|---|
| Phép cộng | `7 + 5 = ?` và `7 + ? = 12` | Hai nhóm đồ vật để bé đếm |
| Phép trừ | `9 − 3 = ?` và `9 − ? = 6` | Đồ vật bị gạch ✕ khi bớt đi |
| Cân thăng bằng | Trái `6 + 4`, phải `2 + ?` | Cái cân nghiêng về bên nặng hơn; chọn đúng thì cân thăng bằng |
| Trộn lẫn | Cả 3 dạng | |

- Mỗi lượt 10 câu, mỗi câu 4 đáp án to dễ bấm, có nút **🔊 Nghe đề** để máy đọc đề.
- Đúng: ✓ xanh + lời khen + pháo hoa. Sai: ✗ đỏ + "Bé đếm lại xem nào", được chọn lại.
- Cuối lượt chấm 1–3 sao.

### 📚 Tiếng Việt (phần làm kỹ nhất)
- **Bảng chữ cái**: 29 chữ, chạm để nghe cách đọc âm (bờ, cờ, dờ…).
- **Từ đơn** 3 cấp (62 từ): từ dễ `ba, bà, cá` → có vần `cam, mèo` → vần khó `chuối, trứng, bướm`.
- **Từ ghép** 5 chủ đề (64 từ): Gia đình & Trường, Con vật, Hoa quả, Đồ vật & Xe cộ, Thiên nhiên & Việc làm.
- **Câu ngắn** (10 câu): `Bé đi học.`, `Con mèo trèo cây cau.`…

**Mỗi thẻ học một từ có:**
1. Hình minh hoạ to.
2. Chữ to, **tách thành từng tiếng**, mỗi tiếng có **🔊 loa riêng**: bấm vào là máy đọc tiếng đó rồi đánh vần.
3. **🔊 Loa lớn** bên cạnh: đọc cả từ.
4. **Dòng đánh vần** theo cách dạy lớp 1, ví dụ:
   - `bà` → **bờ – a – ba – huyền – bà**
   - `cam` → **a – mờ – am – cờ – am – cam** (đánh vần vần trước, rồi ghép phụ âm)
   - `con gà` → **o – nờ – on – cờ – on – con** / **gờ – a – ga – huyền – gà**
5. **🐢 Đánh vần**: máy đánh vần chậm, chữ đang đọc sáng lên màu vàng.
6. **🎤 Bé đọc**: máy lắng nghe bé đọc rồi chấm:
   - ✅ **Đúng** → dấu tích xanh, khen bé, pháo hoa, bé được ⭐.
   - ⚠️ **Đúng âm nhưng sai dấu** (vd. đọc "ga" thay vì "gà") → ✗ đỏ, nhắc *"Tiếng gà có dấu huyền"*.
   - ❌ **Sai** → ✗ đỏ, **tiếng nào sai thì tô đỏ, tiếng đúng tô xanh**, máy **tự đánh vần lại đúng tiếng bé sai**, rồi nhắc *"Bây giờ bé đọc lại nhé!"*.
   - Dưới nút có dòng *"Máy nghe được: …"* để bố mẹ biết máy đã nghe ra gì.
7. Nếu điện thoại không nghe được giọng nói (trình duyệt cũ, không cho phép micro, mất mạng)
   → hiện 2 nút **"✓ Bé đọc đúng / ✗ Chưa đúng"** để bố mẹ chấm thay.
8. Tiến độ (số ⭐) được lưu trên máy, xem được ở menu.

---

## 2. "AI lắng nghe" hoạt động thế nào?

App dùng **Web Speech API** có sẵn trong điện thoại:
- **Đọc chữ (Text-to-Speech)**: giọng tiếng Việt của Google (Android) hoặc giọng Linh của Apple (iPhone).
- **Nghe bé đọc (Speech-to-Text)**: nhận dạng giọng nói tiếng Việt (`vi-VN`) của Google/Apple.
  Máy trả về tối đa 5 khả năng nghe được; app so sánh với chữ cần đọc
  (có xét **dấu thanh**) – xem hàm `VN.evaluate` trong `js/vietnamese.js`.

**Lưu ý thật lòng:**
- Nhận dạng giọng trẻ em **không chính xác 100%**, nhất là bé nói ngọng hoặc nói nhỏ.
  Bố mẹ nên ngồi cạnh bé, nhìn dòng "Máy nghe được" để động viên bé.
- Cần **có Internet** khi bé bấm 🎤 (việc nhận dạng chạy trên máy chủ Google/Apple).
- Dùng **Chrome** trên Android, **Safari** trên iPhone (iOS 14.5 trở lên). Firefox không hỗ trợ.
- Ở nơi yên tĩnh, để điện thoại cách miệng bé khoảng 20–30 cm.

---

## 3. Đưa app lên mạng (miễn phí bằng GitHub Pages) – từng bước

> Micro chỉ hoạt động trên trang **https**, nên cần đưa app lên mạng. GitHub Pages làm việc này miễn phí.

1. Mở https://github.com/nam85210/Du-an-hoc-tap-cua-Bap
2. Code đang nằm ở nhánh `claude/preschool-learning-app-5rl3v4`.
   Cách đơn giản: bấm **Pull requests → New pull request**, chọn nhánh này → **Create** → **Merge** vào `main`.
3. Vào **Settings** (Cài đặt của repo) → mục **Pages** (cột trái).
4. Ở **Build and deployment → Source** chọn **Deploy from a branch**.
5. **Branch** chọn `main`, thư mục `/ (root)` → **Save**.
6. Chờ 1–2 phút, tải lại trang, GitHub hiện địa chỉ dạng:
   **`https://nam85210.github.io/Du-an-hoc-tap-cua-Bap/`**

## 4. Cài app lên điện thoại

**Android (Chrome):**
1. Mở địa chỉ trên bằng Chrome.
2. Bấm **⋮** (góc trên phải) → **Thêm vào màn hình chính** / **Cài đặt ứng dụng**.
3. Lần đầu bấm 🎤, chọn **Cho phép** dùng micro.
4. Nếu máy đọc giọng nước ngoài: *Cài đặt → Hệ thống → Ngôn ngữ → Chuyển văn bản thành giọng nói
   → Công cụ của Google → tải **Tiếng Việt***.

**iPhone / iPad (Safari):**
1. Mở địa chỉ trên bằng **Safari**.
2. Bấm nút **Chia sẻ** (ô vuông có mũi tên) → **Thêm vào MH chính**.
3. Lần đầu bấm 🎤, cho phép **Micro** và **Nhận dạng giọng nói**.
4. Bật đọc chính tả: *Cài đặt → Cài đặt chung → Bàn phím → Bật Đọc chính tả*, và thêm bàn phím Tiếng Việt.
5. Giọng đọc: *Cài đặt → Trợ năng → Nội dung được đọc → Giọng nói → Tiếng Việt → tải giọng Linh*.

**Kiểm tra:** trong app bấm **⚙️ Cài đặt cho bố mẹ** → *Nghe thử* giọng đọc và *Thử micro*
(nói "con gà", máy hiện đúng chữ là được). Ở đây cũng chỉnh được **tốc độ đọc**.

---

## 5. Tự thêm / sửa bài học

Mọi từ nằm trong file **`js/data.js`**. Sửa ngay trên GitHub: mở file → bấm ✏️ → sửa → **Commit changes**.

Thêm một từ vào nhóm có sẵn, ví dụ thêm "con cua" vào *Từ ghép – Con vật*:
```js
{ w: "con cua", e: "🦀" },
```
Thêm một nhóm mới:
```js
"ghep-6": {
  title: "Từ ghép – Màu sắc",
  sub: "Các màu quen thuộc",
  type: "ghep",            // "don" = từ đơn, "ghep" = từ ghép, "cau" = câu
  items: [ { w: "màu đỏ", e: "🔴" }, { w: "màu xanh", e: "🟢" } ],
},
```
rồi thêm `"ghep-6"` vào danh sách `keys` của nhóm *Từ ghép* trong `VIET_MENU`.

Phần đánh vần **tự động** sinh ra từ chữ, không cần gõ tay.
Lời khen/lời nhắc cũng sửa được ở cuối file (`PRAISES`, `RETRY_MSGS`).

> Sau khi sửa code, mở `sw.js` và tăng `bap-hoc-vui-v1` thành `v2`, `v3`… để điện thoại tải bản mới.

---

## 6. Chạy thử trên máy tính

```bash
cd Du-an-hoc-tap-cua-Bap
python3 -m http.server 8000
```
Mở Chrome: http://localhost:8000 (localhost được phép dùng micro).
Bấm F12 → biểu tượng điện thoại để xem giao diện như trên di động.

---

## 7. Cấu trúc thư mục

```
index.html            Trang chính
css/style.css         Giao diện, màu sắc
js/data.js            ⭐ Dữ liệu từ, câu, lời khen (bố mẹ sửa ở đây)
js/vietnamese.js      Tách dấu, đánh vần, chấm điểm bé đọc
js/speech.js          Đọc chữ (loa) và nghe bé đọc (micro), âm thanh hiệu ứng
js/math.js            Tạo bài cộng, trừ, cân thăng bằng
js/app.js             Các màn hình của app
manifest.webmanifest  Thông tin để "cài" app ra màn hình chính
sw.js                 Lưu tạm để mở app nhanh, mạng yếu vẫn vào được
icons/                Biểu tượng app
```

---

## 8. Hướng nâng cấp sau này

1. **Ghi âm giọng bố mẹ / cô giáo** thay cho giọng máy (bé quen giọng người thân hơn).
2. **Chấm phát âm chuyên sâu hơn**: gửi file ghi âm lên dịch vụ nhận dạng tiếng Việt
   (Google Cloud Speech-to-Text, FPT.AI, Viettel AI) để chấm chi tiết từng âm.
3. **Thêm hình ảnh thật** thay emoji (đặt ảnh vào thư mục `images/`).
4. **Đóng gói lên CH Play / App Store** bằng Capacitor (giữ nguyên code web này).
5. Thêm dạng toán: so sánh `>`, `<`, `=`; đếm hình; nhận biết hình khối.
