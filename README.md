# PHIÊN CHỢ ĐÔNG — VS Code Project

## Mở dự án
1. Giải nén `phien_cho_dong_vscode.zip`.
2. Mở Visual Studio Code.
3. Chọn **File → Open Folder...** và chọn thư mục `phien_cho_dong_vscode`.
4. Mở `index.html` bằng trình duyệt, hoặc cài extension **Live Server** trong VS Code rồi nhấn **Go Live**.

## Các tệp
- `index.html`: cấu trúc trang và các khu vực giao diện.
- `style.css`: giao diện Giáng Sinh, màu sắc, bố cục responsive.
- `script.js`: luật chơi, quản lý lượt, mua hàng, thành tựu và bảng điểm.

## Chạy offline
Game không cần máy chủ hay thư viện JavaScript bên ngoài. Có thể mở trực tiếp `index.html` sau khi tải project về.
Lưu ý: Google Fonts chỉ tải được khi có Internet; khi offline trang sẽ dùng font dự phòng của máy.

## Luật được triển khai
- Mỗi đội có 7 xu, túi tối đa 9 ô.
- Mỗi lượt mua tối đa 1 món hoặc bỏ lượt.
- Khi một đội không thể mua hoặc chủ động dừng, các đội còn lại có thêm một lượt cuối.
- Vòng tay chỉ có 1 suất; các món khác không giới hạn.
- Điểm cuối = điểm hàng + xu dư + thành tựu được MC công bố.
- Thành tựu Heo đất: còn ít nhất 2 xu (+3).
- Tài khoản kim cương: đủ 9/9 ô (+2).
- Nhanh như chớp: đội đầu tiên kết thúc mua sắm (+2) nếu MC đã công bố thành tựu.

## Chỉnh sửa nhanh
- Thay đổi tên/giá/điểm sản phẩm trong mảng `products` ở đầu `script.js`.
- Thay đổi màu sắc trong `:root` ở đầu `style.css`.
- Chỉnh số đội tối đa trong `index.html` và hàm `renderTeamInputs()` trong `script.js`.
