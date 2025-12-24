// 根据环境自动选择后端地址
// 如果是在本地运行，process.env.REACT_APP_BACKEND_URL 为空，则使用 localhost
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5005';