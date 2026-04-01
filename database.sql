-- Run this in your Supabase SQL Editor

CREATE TABLE lps_inventory (
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

-- Bật tính năng Row Level Security (RLS) để bảo mật nếu cần
-- ALTER TABLE lps_inventory ENABLE ROW LEVEL SECURITY;
-- Do app nội bộ, có thể tắt tạm hoặc cho phép toàn quyền
-- CREATE POLICY "Cho phép tất cả" ON lps_inventory FOR ALL USING (true);
