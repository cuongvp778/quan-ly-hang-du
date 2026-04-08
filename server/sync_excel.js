const exceljs = require('exceljs');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function syncExcelToSupabase() {
  try {
    console.log('--- ĐANG BẮT ĐẦU ĐỒNG BỘ EXCEL LÊN DATABASE ---');
    
    // 1. Đọc file
    const xlDataPath = path.join(__dirname, '../Data1.xlsx');
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile(xlDataPath);
    const worksheet = workbook.worksheets[0];
    
    const rows = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const vals = row.values;
        if (vals[4]) {
          rows.push({
            rpro: String(vals[4]).trim(),
            pu: vals[7] ? String(vals[7]).trim() : '',
            vai: vals[8] ? String(vals[8]).trim() : '',
            bom: vals[26] ? String(vals[26]).trim() : '',
            so_luong_don: vals[10] ? Number(vals[10]) : 0
          });
        }
      }
    });

    console.log(`[1] Đã đọc xong ${rows.length} dòng từ Excel.`);

    // 2. Xóa dữ liệu cũ (Tùy chọn: có thể xóa hoặc chỉ insert thêm)
    // Ở đây tôi chọn xóa để dữ liệu luôn khớp với Excel mới nhất
    console.log('[2] Đang xóa dữ liệu cũ trong bảng master_data...');
    const { error: deleteError } = await supabase.from('master_data').delete().neq('rpro', 'ROOT_USER_ADMIN');
    if (deleteError) throw deleteError;

    // 3. Insert theo lô (Batch insert - mỗi lô 500 dòng để tránh lỗi timeout)
    console.log('[3] Đang đẩy dữ liệu mới lên Supabase...');
    const chunkSize = 500;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const { error } = await supabase.from('master_data').insert(chunk);
      if (error) {
        console.error(`Lỗi tại lô ${i}:`, error.message);
      } else {
        console.log(`   > Đã đẩy thành công: ${Math.min(i + chunkSize, rows.length)} / ${rows.length}`);
      }
    }

    console.log('--- ĐÃ HOÀN TẤT ĐỒNG BỘ ---');
    process.exit(0);

  } catch (err) {
    console.error('LỖI ĐỒNG BỘ:', err.message);
    process.exit(1);
  }
}

syncExcelToSupabase();
