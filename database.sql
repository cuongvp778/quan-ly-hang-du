-- Run this in your Supabase SQL Editor

-- 1. Bảng lưu lịch sử nhập liệu (Đã tạo trước đó)
CREATE TABLE IF NOT EXISTS lps_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rpro TEXT NOT NULL,
  vai TEXT,
  pu TEXT,
  bom TEXT,
  so_luong_don INTEGER DEFAULT 0,
  size TEXT NOT NULL,
  so_luong_du INTEGER DEFAULT 0,
  ghi_chu TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- XÓA BẢNG MASTER_DATA CŨ (Cẩn thận: sẽ xóa hết dữ liệu hiện có trong bảng này)
DROP TABLE IF EXISTS master_data;

-- 2. Bảng mới: Lưu danh mục từ Excel/CSV với tên cột khớp 100% (bao gồm dấu cách và ký tự đặc biệt)
CREATE TABLE master_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "Brand" TEXT,
  "Customer" TEXT,
  "POV with batches" TEXT,
  "RPRO 365" TEXT NOT NULL,
  "Mold#" TEXT,
  "Gender" TEXT,
  "PU" TEXT,
  "Cloth" TEXT,
  "Logo" TEXT,
  "PO Q'TY" TEXT,
  "Load material" TEXT,
  "Laminate Date" TEXT,
  "Sawing cutting date" TEXT,
  "Molding Date" TEXT,
  "Cutting Pairs Date" TEXT,
  "Finished date" TEXT,
  "PPC CFM" TEXT,
  "Leadtime" TEXT,
  "LUXIN" TEXT,
  "Last #" TEXT,
  "Material Pu 365" TEXT,
  "Dosage Pu" TEXT,
  "Cloth 365" TEXT,
  "Dosage Fabric" TEXT,
  "Match Color" TEXT,
  "BOM SKU 365" TEXT,
  "Load liệu" TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tạo Index để tìm kiếm RPRO siêu tốc theo cột "RPRO 365" mới
CREATE INDEX IF NOT EXISTS idx_master_data_rpro_365 ON master_data ("RPRO 365");
