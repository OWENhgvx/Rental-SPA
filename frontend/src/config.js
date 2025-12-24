/**
 * 这是一个“不求人”的地址切换逻辑
 * 它直接判断当前浏览器地址栏：如果是 localhost 就在本地找后端，否则去 Render 找后端
 */

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

// 把这里的地址改成你真实的 Render 后端地址
const RENDER_BACKEND_URL = 'https://你的项目名.onrender.com';

export const BACKEND_URL = isLocalhost 
  ? 'http://localhost:5005' 
  : RENDER_BACKEND_URL;

console.log('🚀 当前 API 连接地址:', BACKEND_URL);