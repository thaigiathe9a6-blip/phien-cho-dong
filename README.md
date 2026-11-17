# Phiên Chợ Đông Online

Ứng dụng web realtime cho mô hình **MC điều khiển – không cần tài khoản đội – tham gia bằng link riêng**.

## Có gì trong dự án?

- MC tạo phòng, thêm đội và tạo link tham gia riêng cho từng đội.
- Link đội có thể gửi vào nhóm chat hoặc mở bằng QR được tạo từ link.
- Các đội dùng link chung của đội trên điện thoại; không cần đăng ký tài khoản. Firebase Anonymous Auth chỉ tạo phiên kỹ thuật ẩn danh.
- Bảng xu, số ô, điểm hàng, lượt mua và nhật ký đồng bộ realtime.
- Giao dịch mua hàng được xử lý bằng Cloud Functions + transaction, tránh việc hai thiết bị mua vượt số xu hoặc mua trùng món giới hạn.
- MC công bố thành tích và chốt phiên chợ.
- Giao diện ưu tiên làm nổi bật **SỐ Ô** và **ĐIỂM**, đặc biệt trên thẻ hàng.

## Luật đang cài trong mã

- Mỗi đội bắt đầu với 7 xu, sức chứa tối đa 9 ô.
- Mỗi lần mua một món.
- Điểm cuối = điểm hàng + xu còn lại + điểm thưởng.
- Hàng hóa:
  - Bình nước: 2 xu, 1 ô, 2 điểm (giá gốc 5 xu).
  - Combo “Tránh mưa”: 3 xu, 2 ô, 4 điểm.
  - Thiệp Noel: 1 xu, 1 ô, 1 điểm.
  - Hộp mù: 3 xu, 2 ô, 4 điểm.
  - Hộp mù VIP: 4 xu, 2 ô, 6 điểm.
  - Hộp Bánh Quy: 2 xu, 1 ô, 2 điểm (niêm yết 1,99 xu).
  - Vòng tay: 3 xu, 1 ô, 3 điểm, chỉ có 1 chiếc.
- Thành tích MC có thể công bố:
  - Heo đất: còn ít nhất 2 xu, +3 điểm.
  - Tài khoản kim cương: đúng 9/9 ô, +2 điểm.
  - Nhanh như chớp: +2 điểm.

> Ghi chú luật: trong bản này, đội đang đến lượt tự động chuyển lượt khi không còn món nào có thể mua; đội cũng có thể bấm “Kết thúc lượt đội”. Nếu tất cả đội đã kết thúc/không thể mua, phiên chợ kết thúc. MC có thể đóng chợ thủ công. Hãy xác nhận cách tính “Nhanh như chớp” trước khi tổ chức; hiện tại đây là thành tích MC chủ động gán cho đội.

## 1. Tạo Firebase project

1. Vào https://console.firebase.google.com/ và tạo project.
2. Trong **Build → Realtime Database**, tạo database ở khu vực gần Việt Nam (ví dụ Singapore nếu có).
3. Trong **Build → Authentication → Sign-in method**, bật **Anonymous**.
4. Trong **Project settings → General → Your apps**, thêm ứng dụng Web và lấy Firebase config.
5. Cài Node.js 20+ và Firebase CLI:

```bash
npm install -g firebase-tools
```

## 2. Cấu hình project

Tại thư mục dự án:

```bash
cp .firebaserc.example .firebaserc
firebase login
firebase use --add
```

Chọn đúng Firebase project của bạn. Sau đó tạo `public/firebase-config.json` theo mẫu:

```json
{
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_PROJECT_ID.firebaseapp.com",
  "databaseURL": "https://YOUR_DATABASE_NAME-default-rtdb.asia-southeast1.firebasedatabase.app",
  "projectId": "YOUR_PROJECT_ID",
  "appId": "YOUR_APP_ID"
}
```

Thay bằng giá trị thật trong Firebase Console. `databaseURL` phải đúng URL Realtime Database mà Firebase cấp cho project.

## 3. Cài và triển khai

```bash
npm install
cd functions
npm install
cd ..
firebase deploy
```

Lần đầu deploy Functions có thể yêu cầu bật Billing/Blaze plan theo yêu cầu hiện hành của Firebase. Kiểm tra chi phí và hạn mức trong Firebase Console trước khi dùng sự kiện đông người.

Nếu muốn deploy riêng:

```bash
firebase deploy --only database,functions,hosting
```

## 4. Chạy thử local

```bash
firebase emulators:start
```

Để thử đầy đủ callable functions và realtime database bằng emulator, cần cấu hình emulator endpoints trong `public/app.js`; mặc định bản này kết nối project Firebase thật. Với lần chạy đầu, nên deploy lên project thử nghiệm riêng.

## 5. Cách vận hành

1. MC mở URL Hosting sau khi deploy.
2. Nhấn **Tạo phiên chợ mới**.
3. Nhập tên từng đội và nhấn **Thêm đội**. Link đội được tự động sao chép vào clipboard.
4. Gửi link tương ứng cho từng đội. Mọi thành viên trong cùng đội có thể mở cùng link trên nhiều điện thoại.
5. Nhấn **Khai chợ**. MC xem bảng xu/ô/điểm và lượt hiện tại; đội chỉ mua được khi đến lượt.
6. MC bấm thành tích cạnh đúng đội khi muốn công bố.
7. Nhấn **Đóng chợ** để chốt bảng xếp hạng.

## Lưu ý bảo mật và vận hành

- Không chia sẻ link quản trị MC. Phiên MC được nhận diện bằng session của trình duyệt đã tạo phòng.
- Link đội là quyền tham gia đội; ai có link đều có thể thao tác trong đội đó. Chỉ gửi link cho thành viên đúng đội.
- Database chặn client ghi trực tiếp; thay đổi trò chơi đi qua Cloud Functions.
- Nếu đổi vùng Realtime Database, hãy cập nhật `databaseURL`. Nếu đổi vùng Functions, cập nhật `getFunctions(app, "asia-southeast1")` trong `public/app.js` cho trùng vùng deploy.
- Bản mẫu không có chức năng xóa phòng tự động, đổi tên đội, hoàn tác giao dịch hoặc khóa link đội. Nên tạo phòng mới cho mỗi buổi chơi.
- Link đội chứa token truy cập. Không đăng công khai link đó.
- Chỉ dùng Firebase project bạn quản lý; không đưa API key bí mật hoặc mật khẩu vào mã nguồn. Firebase Web API key vốn là định danh ứng dụng, còn quyền ghi được bảo vệ bằng Authentication, Rules và Functions.
