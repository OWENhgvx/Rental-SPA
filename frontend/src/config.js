// Vite 专用读取方式
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5005';

console.log('Current Backend URL:', BACKEND_URL); // 建议加上这行调试，上线后可以在控制台看到地址

