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

-- 2. Bảng mới: Lưu danh mục từ Excel (Master Data)
CREATE TABLE IF NOT EXISTS master_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rpro TEXT NOT NULL,
  vai TEXT,
  pu TEXT,
  bom TEXT,
  so_luong_don INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tạo Index để tìm kiếm RPRO siêu tốc
CREATE INDEX IF NOT EXISTS idx_master_data_rpro ON master_data (rpro);
