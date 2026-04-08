import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, QrCode, Search, History, Download, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import api from '../api';

const SIZES = ['3','3.5','4','4.5','5','5.5','6','6.5','7','7.5','8','8.5','9','9.5','10','10.5','11','11.5','12','13','14','15','16','17','18'];

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${type}`}>
      {type === 'success' ? <CheckCircle color="var(--success)" /> : <AlertCircle color="var(--danger)" />}
      <span>{message}</span>
    </div>
  );
};

const LPS = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('input'); // 'input' | 'history'
  
  // Form State
  const [formData, setFormData] = useState({
    rpro: '', vai: '', pu: '', bom: '', so_luong_don: '', ghi_chu: ''
  });
  const [sizes, setSizes] = useState(SIZES.reduce((acc, size) => ({ ...acc, [size]: '' }), {}));
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [rproSuggestions, setRproSuggestions] = useState([]);
  
  // History State
  const [historyData, setHistoryData] = useState([]);
  const [filterRpro, setFilterRpro] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);

  // Scanner handling
  useEffect(() => {
    let html5QrCode;
    if (showScanner) {
      html5QrCode = new Html5Qrcode("reader");
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      html5QrCode.start({ facingMode: "environment" }, config, (decodedText) => {
        // Assume format: RPRO-BOM (e.g., RP12345-BOM999) or just JSON/QR
        // Simplified mapping from raw scan to fields
        let parsed = decodedText;
        if (decodedText.includes('RPRO:')) {
           // Example of parsing rules
           const match = decodedText.match(/RPRO:(\w+)/);
           if (match) parsed = match[1];
        }
        setFormData(prev => ({ ...prev, rpro: parsed }));
        showToast('Quét mã thành công!', 'success');
        
        // Stop scanning, auto focus, fetch data
        html5QrCode.stop().then(() => setShowScanner(false));
        handleSearch(parsed);
      }, (error) => {}).catch(err => {
        console.warn("Camera start error:", err);
      });
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [showScanner]);

  const showToast = (msg, type='success') => setToast({ msg, type });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'rpro' && value.length > 2) {
      // Auto complete suggestions
      api.get(`/lps/search?rpro=${value}`).then(res => setRproSuggestions(res.data)).catch(() => {});
    } else if (name === 'rpro') {
      setRproSuggestions([]);
    }
  };

  const selectSuggestion = (item) => {
    setFormData(prev => ({
      ...prev,
      rpro: item.rpro,
      vai: item.vai,
      pu: item.pu,
      bom: item.bom,
      so_luong_don: item.so_luong_don
    }));
    setRproSuggestions([]);
    showToast('Tự động điền dữ liệu thành công!', 'success');
  };

  const handleSearch = async (rproValue = formData.rpro) => {
    if (!rproValue) return;
    try {
      const { data } = await api.get(`/lps/search?rpro=${rproValue}`);
      if (data && data.length > 0) {
        selectSuggestion(data[0]);
      } else {
        showToast('Không tìm thấy dữ liệu mẫu cho RPRO này', 'error');
      }
    } catch (err) {
      showToast('Lỗi tìm kiếm!', 'error');
    }
  };

  const handleSizeChange = (size, value) => {
    setSizes(prev => ({ ...prev, [size]: value }));
  };

  const handleSave = async () => {
    if (!formData.rpro) return showToast('Vui lòng nhập RPRO', 'error');
    
    const hasSizes = Object.values(sizes).some(v => v !== '' && Number(v) > 0);
    if (!hasSizes) return showToast('Vui lòng nhập ít nhất 1 size có hàng dư', 'error');

    setLoading(true);
    try {
      await api.post('/lps', {
        ...formData,
        sizes
      });
      showToast('Lưu dữ liệu thành công!', 'success');
      
      // Clear specific fields
      setSizes(SIZES.reduce((acc, size) => ({ ...acc, [size]: '' }), {}));
      setFormData(prev => ({ ...prev, ghi_chu: '' })); // keep rpro info for next
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      showToast(err.response?.data?.error || 'Lỗi lưu dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  };

  // History Tab
  useEffect(() => {
    if (tab === 'history') loadHistory();
  }, [tab, filterRpro, filterDate]);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data } = await api.get('/lps', { params: { rpro: filterRpro, date: filterDate } });
      setHistoryData(data);
    } catch (err) {
      showToast('Lỗi tải lịch sử', 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/lps/export', {
        params: { rpro: filterRpro, date: filterDate },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `LPS_Bao_Cao_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      showToast('Tải xuống Excel thành công');
    } catch (err) {
      showToast('Lỗi khi xuất tĩnh', 'error');
    }
  };

  return (
    <div className="animate-in" style={{ paddingBottom: '80px' }}>
      {toast && (
        <div className="toast-container">
          <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      <div className="header">
        <button className="back-btn" onClick={() => navigate('/')}><ArrowLeft size={20} /></button>
        <h1 style={{color: 'var(--primary)'}}>LPS - Hàng Dư</h1>
        <div style={{ width: 44 }}></div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          className={`btn ${tab==='input' ? '' : 'btn-secondary'}`} 
          style={{ padding: '12px', flex: 1 }}
          onClick={() => setTab('input')}
        >
          Nhập Liệu
        </button>
        <button 
          className={`btn ${tab==='history' ? '' : 'btn-secondary'}`} 
          style={{ padding: '12px', flex: 1 }}
          onClick={() => setTab('history')}
        >
          Lịch Sử
        </button>
      </div>

      {tab === 'input' && (
        <div>
          {/* Form */}
          <div className="card">
            <h2 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Thông Tin Mệnh Lệnh</h2>
            
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">RPRO</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input type="text" name="rpro" value={formData.rpro} onChange={handleChange} className="form-input" placeholder="Nhập hoặc quét mã" />
                  {rproSuggestions.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', zIndex: 10, border: '1px solid var(--border)', borderRadius: '8px', boxShadow: 'var(--shadow-md)', maxHeight: '200px', overflowY: 'auto' }}>
                      {rproSuggestions.map((s, idx) => (
                        <div key={idx} style={{ padding: '12px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => selectSuggestion(s)}>
                          <strong>{s.rpro}</strong> <br/> <small style={{ color: 'var(--text-muted)' }}>{s.bom} - {s.pu}</small>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button type="button" className="btn btn-secondary" style={{ width: '56px', padding: 0 }} onClick={() => setShowScanner(!showScanner)}>
                  <QrCode size={24} />
                </button>
                <button type="button" className="btn btn-secondary" style={{ width: '56px', padding: 0 }} onClick={() => handleSearch(formData.rpro)}>
                  <Search size={24} />
                </button>
              </div>
            </div>

            {showScanner && (
              <div style={{ marginBottom: '16px' }}>
                <div id="reader" style={{ background: '#000' }}></div>
                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                  <button className="btn btn-secondary" onClick={() => setShowScanner(false)} style={{ padding: '10px' }}>Đóng Camera</button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontSize: '0.8.5rem' }}>Vải</label>
                <input type="text" name="vai" value={formData.vai} onChange={handleChange} className="form-input" placeholder="Mã Vải..." style={{ fontSize: '0.85rem' }} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontSize: '0.8.5rem' }}>PU</label>
                <input type="text" name="pu" value={formData.pu} onChange={handleChange} className="form-input" placeholder="Mã PU..." style={{ fontSize: '0.85rem' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">BOM</label>
              <input type="text" name="bom" value={formData.bom} onChange={handleChange} className="form-input" placeholder="Nhập BOM" />
            </div>

            <div className="form-group">
              <label className="form-label">Số Lượng Đơn</label>
              <input type="number" name="so_luong_don" value={formData.so_luong_don} onChange={handleChange} className="form-input" placeholder="VD: 500" />
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Nhập Số Lượng Dư (*Từng Size)</h2>
            <div className="size-grid">
              {SIZES.map(size => (
                <div key={size} className="size-item">
                  <div className="size-label">{size}</div>
                  <input type="number" min="0" className="size-input" value={sizes[size]} onChange={(e) => handleSizeChange(size, e.target.value)} placeholder="-" />
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Ghi chú</h2>
            <div className="form-group">
              <input type="text" name="ghi_chu" value={formData.ghi_chu} onChange={handleChange} className="form-input" placeholder="Lý do dư hoặc ghi chú khác..." />
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '-8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.8rem', background: 'var(--bg-color)', padding: '6px 12px', borderRadius: '12px', cursor: 'pointer' }} onClick={() => setFormData(p => ({...p, ghi_chu: 'Dư theo BOM'}))}>Dư theo BOM</span>
              <span style={{ fontSize: '0.8rem', background: 'var(--bg-color)', padding: '6px 12px', borderRadius: '12px', cursor: 'pointer' }} onClick={() => setFormData(p => ({...p, ghi_chu: 'Khách hàng đổi ý'}))}>Khách đổi ý</span>
              <span style={{ fontSize: '0.8rem', background: 'var(--bg-color)', padding: '6px 12px', borderRadius: '12px', cursor: 'pointer' }} onClick={() => setFormData(p => ({...p, ghi_chu: 'Lỗi in/dán'}))}>Lỗi in/dán</span>
            </div>
          </div>

          <button className="btn btn-success" style={{ width: '100%', marginBottom: '20px' }} onClick={handleSave} disabled={loading}>
            <Save size={24} />
            {loading ? 'Đang lưu...' : 'LƯU DỮ LIỆU'}
          </button>
        </div>
      )}

      {tab === 'history' && (
        <div className="card">
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <input type="text" className="form-input" placeholder="Tìm RPRO..." value={filterRpro} onChange={(e) => setFilterRpro(e.target.value)} style={{ padding: '12px', flex: 1 }} />
            <input type="date" className="form-input" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{ padding: '12px' }} />
          </div>
          
          <button className="btn" style={{ padding: '12px', marginBottom: '16px' }} onClick={handleExport}>
            <Download size={20} /> Xuất Excel
          </button>

          {historyLoading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Đang tải...</div>
          ) : historyData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Không có dữ liệu.</div>
          ) : (
            <div className="history-list">
              {historyData.map((item, idx) => (
                <div key={item.id || idx} className="history-item">
                  <div className="history-info">
                    <strong>{item.rpro}</strong>
                    <span>Size {item.size} • {new Date(item.created_at).toLocaleString('vi-VN')}</span>
                    {item.ghi_chu && <div style={{ fontSize: '0.8rem', marginTop: '4px', color: '#888' }}>{item.ghi_chu}</div>}
                  </div>
                  <div className="history-qty">+{item.so_luong_du}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LPS;
