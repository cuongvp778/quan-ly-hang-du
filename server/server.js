const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const exceljs = require('exceljs');
const fs = require('fs');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const path = require('path');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl || 'https://example.supabase.co', supabaseKey || 'KEY');

// ======= BOOTSTRAP EXCEL DATA ========
let masterData = [];
async function loadMasterData() {
  try {
    const xlDataPath = path.join(__dirname, '../Data1.xlsx');
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile(xlDataPath);
    const worksheet = workbook.worksheets[0];
    const newData = []; // Dùng mảng tạm để tránh làm gián đoạn search khi đang nạp
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const vals = row.values;
        if (vals[4]) {
          newData.push({
            rpro: String(vals[4]).trim(),
            pu: vals[7] ? String(vals[7]).trim() : '',
            vai: vals[8] ? String(vals[8]).trim() : '',
            bom: vals[26] ? String(vals[26]).trim() : '',
            so_luong_don: vals[10] ? Number(vals[10]) : 0
          });
        }
      }
    });
    masterData = newData; // Cập nhật mảng master
    console.log(`[INFO] [${new Date().toLocaleTimeString()}] Đã nạp thành công ${masterData.length} mã RPRO từ Data1.xlsx!`);
  } catch (err) {
    console.log(`[WARNING] Không nạp được Data1.xlsx: ${err.message}`);
  }
}

// Khởi động nạp lần đầu
loadMasterData();

// Tự động nạp lại khi file thay đổi (có khử rung - debounce)
if (process.env.NODE_ENV !== 'production') {
  const xlDataPath = path.join(__dirname, '../Data1.xlsx');
  let watchTimeout;
  fs.watch(xlDataPath, (eventType) => {
    if (eventType === 'change') {
      clearTimeout(watchTimeout);
      watchTimeout = setTimeout(() => {
        console.log('[WATCHER] Phát hiện file Data1.xlsx thay đổi, đang nạp lại...');
        loadMasterData();
      }, 500); // Đợi 500ms sau khi file lưu xong hẳn
    }
  });
}
// =======================================

// Tạo router riêng cho /api để đồng bộ với Vercel
const apiRouter = express.Router();
app.use('/api', apiRouter);

// ======== API Routes ========

// 1. Thêm dữ liệu (POST /lps)
apiRouter.post('/lps', async (req, res) => {
  try {
    const { rpro, vai, pu, bom, so_luong_don, sizes, ghi_chu } = req.body;
    
    // sizes is an object { [size_name]: quantity }
    // Convert to multiple insert records
    const insertData = [];
    for (const [size, qty] of Object.entries(sizes)) {
      if (qty && Number(qty) > 0) {
        insertData.push({
          rpro,
          vai,
          pu,
          bom,
          so_luong_don: Number(so_luong_don) || 0,
          size,
          so_luong_du: Number(qty),
          ghi_chu: ghi_chu || ''
        });
      }
    }

    if (insertData.length === 0) {
      return res.status(400).json({ error: 'Không có dữ liệu số lượng dư hợp lệ' });
    }

    const { data, error } = await supabase
      .from('lps_inventory')
      .insert(insertData)
      .select();

    if (error) throw error;
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('Lỗi POST /lps:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 2. Lấy danh sách (GET /lps)
apiRouter.get('/lps', async (req, res) => {
  try {
    const { rpro, date } = req.query;
    
    let query = supabase
      .from('lps_inventory')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (rpro) {
      query = query.ilike('rpro', `%${rpro}%`);
    }
    
    if (date) {
      // date filter: YYYY-MM-DD
      const startOfDay = `${date}T00:00:00.000Z`;
      const endOfDay = `${date}T23:59:59.999Z`;
      query = query.gte('created_at', startOfDay).lte('created_at', endOfDay);
    }
    
    // limit for performance
    query = query.limit(100);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Tìm theo RPRO để auto-fill (GET /lps/search)
apiRouter.get('/lps/search', async (req, res) => {
  try {
    const { rpro } = req.query;
    if (!rpro) return res.json([]);
    
    // Ưu tiên tìm trong Excel gốc trước (Trim khoảng trắng đầu cuối)
    const searchString = rpro.trim().toLowerCase();
    let hits = masterData.filter(m => m.rpro && m.rpro.toLowerCase().includes(searchString)).slice(0, 5);

    // Nếu không có trong Excel, Fallback gọi xuống Database
    if (hits.length === 0) {
      const { data, error } = await supabase
        .from('lps_inventory')
        .select('rpro, vai, pu, bom, so_luong_don')
        .ilike('rpro', `%${rpro}%`)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        // Filter duplicate
        const rproSet = new Set();
        for (const item of data) {
          if (!rproSet.has(item.rpro)) {
            rproSet.add(item.rpro);
            hits.push(item);
          }
        }
      }
    } else {
       // Filter duplicated RPROs if they exist in Excel as well
       const unique = [];
       const rproSet = new Set();
       for (const item of hits) {
         if (!rproSet.has(item.rpro)) {
           rproSet.add(item.rpro);
           unique.push(item);
         }
       }
       hits = unique;
    }

    res.json(hits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Xuất excel (GET /lps/export)
apiRouter.get('/lps/export', async (req, res) => {
  try {
    const { rpro, date } = req.query;

    let query = supabase.from('lps_inventory').select('*').order('created_at', { ascending: false });
    if (rpro) query = query.ilike('rpro', `%${rpro}%`);
    if (date) {
      const startOfDay = `${date}T00:00:00.000Z`;
      const endOfDay = `${date}T23:59:59.999Z`;
      query = query.gte('created_at', startOfDay).lte('created_at', endOfDay);
    }

    const { data, error } = await query;
    if (error) throw error;

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Báo Cáo Hàng Dư');

    worksheet.columns = [
      { header: 'Ngày tạo', key: 'created_at', width: 20 },
      { header: 'RPRO', key: 'rpro', width: 15 },
      { header: 'Vải', key: 'vai', width: 10 },
      { header: 'PU', key: 'pu', width: 10 },
      { header: 'BOM', key: 'bom', width: 25 },
      { header: 'SL Đơn', key: 'so_luong_don', width: 10 },
      { header: 'Size', key: 'size', width: 10 },
      { header: 'SL Dư', key: 'so_luong_du', width: 10 },
      { header: 'Ghi Chú', key: 'ghi_chu', width: 30 },
    ];

    data.forEach(item => {
      worksheet.addRow({
        created_at: new Date(item.created_at).toLocaleString('vi-VN'),
        rpro: item.rpro,
        vai: item.vai,
        pu: item.pu,
        bom: item.bom,
        so_luong_don: item.so_luong_don,
        size: item.size,
        so_luong_du: item.so_luong_du,
        ghi_chu: item.ghi_chu
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=' + 'Bao_Cao_Hang_Du.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Standard route for Vercel functions (optional, usually handled differently on vercel, but good for local)
const PORT = process.env.PORT || 5001;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
