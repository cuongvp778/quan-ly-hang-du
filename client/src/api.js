import axios from 'axios';

// Dùng '/api' khi deploy thực tế (Vercel rewrite), và localhost:5001 khi chạy local dev
const baseURL = import.meta.env.PROD ? '/api' : 'http://localhost:5001/api';

const api = axios.create({
  baseURL
});

export default api;
