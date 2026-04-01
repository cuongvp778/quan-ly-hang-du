import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LPS from './pages/LPS';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lps" element={<LPS />} />
          <Route path="/molding" element={
            <div className="card animate-in text-center mt-5">
              <h2 className="text-xl">Molding (Đang phát triển)</h2>
              <button className="btn btn-secondary mt-4" onClick={() => window.location.href='/'}>Quay lại</button>
            </div>
          } />
          <Route path="/leanline" element={
            <div className="card animate-in text-center mt-5">
              <h2 className="text-xl">Leanline (Đang phát triển)</h2>
              <button className="btn btn-secondary mt-4" onClick={() => window.location.href='/'}>Quay lại</button>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
