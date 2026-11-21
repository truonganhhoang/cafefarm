# Cà phê Tây Bắc 2.0 — bản trình diễn cho tỉnh Sơn La

Ứng dụng hỗ trợ người trồng cà phê chè (Arabica) và bảng điều hành cấp tỉnh.

- **Ứng dụng nông dân:** cảnh báo sương muối, gỉ sắt, mọt đục quả theo độ cao và địa hình từng vườn; bác sĩ cây (AI xem ảnh); hỏi cán bộ khuyến nông; báo giá quả tươi; hồ sơ vườn và nhật ký theo yêu cầu EUDR; kho kiến thức dùng offline.
- **Bảng điều hành tỉnh:** bản đồ hộ, bảng theo 15 xã, phường (tên theo Nghị quyết 1681/NQ-UBTVQH15), gửi cảnh báo theo xã, danh sách hộ thiếu hồ sơ EUDR, xuất GeoJSON.

## Dữ liệu

| Phần | Nguồn |
|---|---|
| Thời tiết 14 ngày | Open-Meteo, lấy trực tiếp mỗi lần mở trang (nếu lỗi mạng dùng bản chụp ngày 21/11/2026) |
| Đợt rét 6–19/1/2025 | Tái phân tích ERA5 qua Open-Meteo |
| Số liệu toàn tỉnh | Sở NN&MT Sơn La, Báo Đại biểu Nhân dân (có ghi trên trang) |
| 294 hộ, HTX, mã số vùng trồng | **Giả lập để trình diễn** |
| Câu hỏi, giá, thông báo | Mẫu; phần người dùng thêm được lưu trên trình duyệt (localStorage) |

## Chạy và triển khai

Trang tĩnh, không cần build. Mở `index.html` hoặc bật GitHub Pages (Settings → Pages → Deploy from a branch → `main` / root).

## Bật AI (tuỳ chọn)

Bác sĩ cây và Trợ lý cần một máy chủ trung gian giữ khoá API:

```bash
cd worker
npx wrangler deploy
npx wrangler secret put ANTHROPIC_API_KEY
```

Sửa `ALLOWED_ORIGINS` trong `worker/wrangler.toml` thành địa chỉ trang, rồi điền địa chỉ Worker vào `config.js`:

```js
window.CPTB_CONFIG = { AI_ENDPOINT: "https://caphe-taybac-ai.<tai-khoan>.workers.dev" };
```

## Giới hạn của bản demo

- Toạ độ tâm xã là ước lượng; độ phân giải mô hình thời tiết vài km.
- Hệ số khí lạnh đọng ở thung lũng (−3 °C) và chênh lệch mặt lá cần hiệu chỉnh bằng trạm đo thực địa.
- Nội dung kỹ thuật cần chuyên gia khuyến nông, bảo vệ thực vật thẩm định.
