/**
 * 智能 API 地址切换
 * 无需依赖 Vercel 环境变量设置
 */

// 1. 获取当前网页的域名
const hostname = window.location.hostname;

// 2. 判断是否为本地开发环境
const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

// 3. 【修改这里】填入你刚配置好的 Cloudflare 域名
// 注意：以后你的后端就告别 Render 那种慢吞吞的唤醒了，RackNerd 是秒回的
const VPS_BACKEND_URL = 'https://api.owenzhanywn.work';

// 4. 导出最终地址
export const BACKEND_URL = isLocalhost 
  ? 'http://localhost:5005' 
  : VPS_BACKEND_URL;

// 调试用
console.log(`🚀 API 运行模式: ${isLocalhost ? '本地测试' : '线上生产'}`);
console.log(`🔗 后端连接地址: ${BACKEND_URL}`);