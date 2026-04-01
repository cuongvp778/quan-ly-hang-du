import axios from 'axios';

// Default to Vercel/production or local for dev
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL
});

export default api;
