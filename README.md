# KIỂM SOÁT HÀNG DƯ - FULLSTACK APP

Đây là hệ thống quản lý hàng dư trong sản xuất, được thiết kế tối ưu cho trải nghiệm trên thiết bị di động tại chuyền, thao tác nhanh, hạn chế gõ tay, quét mã vạch và có giao diện (UI) rất cao cấp & mượt mà.

## 🛠 Cấu trúc thư mục (Folder Structure)

Dự án được ứng dụng mô hình monorepo đơn giản với `client` & `server` độc lập để dễ dàng triển khai (deploy).

```text
Kiem_soat_hang_du/
├── client/                 # React (Vite) Frontend
│   ├── package.json
│   ├── vite.config.js      # Cấu hình Vite
│   └── src/
│       ├── api.js          # Cấu hình Axios gọi API
│       ├── index.css       # Design System (UI/UX)
│       ├── App.jsx         # Cấu hình React Router
│       ├── main.jsx
│       └── pages/
│           ├── Home.jsx    # Trang chủ có 3 nút lớn
│           └── LPS.jsx     # Trang nhập liệu chính thống
├── server/                 # Node.js (Express) Backend
│   ├── package.json
│   ├── .env.example        # Thông tin kết nối Supabase
│   └── server.js           # API REST (POST/GET/Xuất Excel)
├── database.sql            # Script tạo bảng CSDL Supabase
└── vercel.json             # File cấu hình deploy Vercel Mono
```

---

## 🚀 1. Thiết Lập Cơ Sở Dữ Liệu (Supabase)
1. Đăng nhập [Supabase](https://supabase.com).
2. Tạo Project mới (chọn Region Singapore/Tokyo cho nhanh).
3. Mở **SQL Editor** trong Supabase và copy/paste đoạn code từ file `database.sql` để chạy:
4. Vào Project Settings -> API để lấy `SUPABASE_URL` và `SUPABASE_ANON_KEY`.

---

## 💻 2. Chạy Dự Án Ở Local (Máy Tính Của Bạn)

**Bước 1: Chạy Backend (Server)**
- Mở terminal và `cd` vào thư mục `server`.
- Copy file `.env.example` thành `.env`, điền thông tin Supabase của bạn:
  ```env
  SUPABASE_URL=của_bạn
  SUPABASE_ANON_KEY=của_bạn
  PORT=5000
  ```
- Cài Node.js Modules nếu chưa có: `npm install`
- Chạy Server: `npm start`. (Sẽ chạy ở `http://localhost:5000`)

**Bước 2: Chạy Frontend (Client)**
- Mở terminal MỚI, `cd` vào thư mục `client`.
- Chạy: `npm run dev`.
- Mở URL do Vite cung cấp (ví dụ: `http://localhost:5173`) ở trình duyệt.

---

## 🌐 3. Hướng Dẫn Deploy (Vercel)

Dự án đã được cấu hình sẵn Vercel (`vercel.json`) để bạn có thể host cả Frontend và Backend miễn phí cùng 1 lúc trên nền tảng Vercel Workspace.

1. **Đẩy code lên GitHub**:
   - `git init` (tại thư mục chính `Kiem_soat_hang_du`).
   - `git add .` -> `git commit -m "Initial commit"` -> Chuyển lên Repo Github.
2. **Deploy lên Vercel**:
   - Đăng nhập [Vercel](https://vercel.com).
   - Bấm **Add New** -> **Project** -> Chọn repo GitHub vừa tạo.
   - Vercel tự động nhận diện dựa trên `vercel.json`!
   - Kéo xuống mục **Environment Variables** trong Vercel, thêm 2 biến của Server:
     `SUPABASE_URL` = <url của bạn>
     `SUPABASE_ANON_KEY` = <key của bạn>
   - Bấm **Deploy**.

🎉 **Xong!** Ứng dụng Quản lý Hàng dư lúc này đã sống động trên Web dành cho điện thoại xưởng làm việc!
