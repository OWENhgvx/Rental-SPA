# Rental-SPA 🏠

基于 **React 18** 和 **Mantine UI** 构建的高性能响应式房源租赁单页应用（SPA）。

vercel部署网址：https://z5505892-airbrb-fe.vercel.app
---

## 🚀 项目概述

**Rental-SPA** 是一个现代化的全栈度假房源租赁平台，支持用户作为房东发布房源，或作为租客进行搜索与在线预订。项目深度应用了单页应用（SPA）架构，确保在复杂的业务流程切换中实现零刷新、丝滑的交互体验。

### [点击访问在线演示] | [前端仓库地址] | [后端仓库地址]

---

## ✨ 核心功能展示

### 👤 身份认证与安全
- **端到端认证**：实现了完整的登录与注册流程，包含密码一致性校验及实时错误反馈。
- **智能导航**：应用根据用户登录状态动态调整 UI，提供受保护的路由访问机制。

### 🏠 房源管理系统 (Host)
- **动态编辑**：支持房源标题、地址、设施及阶梯价格的完整 CRUD 操作。
- **多媒体增强**：支持 Base64 图片上传，并集成 **YouTube 嵌入式视频** 缩略图功能。
- **排期控制**：房东可以灵活定义多个房源可用日期区间，支持复杂的预约时间管理。
- **利润分析仪表盘**：通过交互式图表展示过去 30 天的营收数据，辅助房东进行财务决策。

### 🔍 搜索与预订引擎 (Guest)
- **多维度过滤**：支持日期范围、卧室/床位数量、价格区间及评价等级的交叉搜索。
- **实时预订流**：租客可实时提交预订申请，系统自动计算入住天数并追踪申请状态。
- **深度评价体系**：集成星级评分与文字反馈，并提供评分百分比详细分布视图。

---

## 🛠️ 技术栈与工程规范

- **Frontend**: React 18 (Hooks & Context API)
- **UI Framework**: [Mantine UI](https://mantine.dev/) (组件化程度高，支持响应式布局)
- **Routing**: React Router v6
- **Visualization**: Recharts / Chart.js
- **Standardization**: ESLint, Prettier
- **Quality Assurance**:
  - **Component Testing**: 基于 Jest 编写的核心组件单元测试。
  - **E2E Testing**: 使用 Cypress 覆盖从注册到预订完成的完整业务流程。

---

## 🔧 环境搭建与运行指南

###  1.后端应用启动
```Bash
cd backend
npm install
npm start
```

###  2.前端应用启动 (React)
```Bash
cd frontend
npm install
npm start
```