import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Factory, LayoutDashboard, Database } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="animate-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div className="text-center" style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '8px' }}>BÁO CÁO HÀNG DƯ</h1>
        <p style={{ color: 'var(--text-muted)' }}>Quản lý và nhập liệu thông tin hàng dư</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <button className="btn" style={{ padding: '24px', fontSize: '1.25rem', justifyContent: 'flex-start' }} onClick={() => navigate('/lps')}>
          <Database size={28} />
          <span style={{ marginLeft: '12px' }}>Công đoạn LPS</span>
        </button>
        
        <button className="btn btn-secondary" style={{ padding: '24px', fontSize: '1.25rem', justifyContent: 'flex-start' }} onClick={() => navigate('/molding')}>
          <Factory size={28} />
          <span style={{ marginLeft: '12px' }}>Công đoạn Molding</span>
        </button>
        
        <button className="btn btn-secondary" style={{ padding: '24px', fontSize: '1.25rem', justifyContent: 'flex-start' }} onClick={() => navigate('/leanline')}>
          <LayoutDashboard size={28} />
          <span style={{ marginLeft: '12px' }}>Công đoạn Leanline</span>
        </button>
      </div>
    </div>
  );
};

export default Home;
