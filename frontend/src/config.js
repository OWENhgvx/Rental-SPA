/**
 * 智能 API 地址切换
 * 无需依赖 Vercel 环境变量设置
 */

// 1. 获取当前网页的域名
const hostname = window.location.hostname;

// 2. 判断是否为本地开发环境
const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

// 3. 【手动填入】你的真实 Render 后端地址（注意：末尾不要斜杠 /）
const RENDER_BACKEND_URL = 'https://rental-spa.onrender.com';

// 4. 导出最终地址
// 修正：本地环境下直接写死 http://localhost:5005，不要引用变量名自身
export const BACKEND_URL = isLocalhost 
  ? 'http://localhost:5005' 
  : RENDER_BACKEND_URL;

// 调试用：发布后你可以在浏览器控制台看到它到底连的是哪
console.log(`🚀 API 运行模式: ${isLocalhost ? '本地测试' : '线上生产'}`);
console.log(`🔗 后端连接地址: ${BACKEND_URL}`);