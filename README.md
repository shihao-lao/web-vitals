

## 📖 项目简介

**web-vitals** 是一个专注于前端应用监控的 JavaScript SDK，提供 **性能指标采集**、**错误捕获**、**用户行为追踪** 三大核心能力。


## ✨ 功能特性 
 
### 1. 错误监控 (Error Monitoring)
 
| 类型 | 说明 | 状态 |
|------|------|------|
| JavaScript 错误 | 捕获运行时 JS 异常 | ✅ |
| Promise 错误 | 捕获 unhandledrejection | ✅ |
| 资源加载错误 | 监控 img/script/css 加载失败 | ✅ |
| XHR/Fetch 错误 | 接口请求异常捕获 | ✅ |
| React ErrorBoundary | React 组件渲染错误 | ✅ |
| Vue errorHandler | Vue 全局错误处理 | ✅ | 

### 2. 性能监控 (Performance Monitoring)

| 指标 | 说明 | 状态 |
|------|------|------|
| FP (First Paint) | 首次绘制时间 | ✅ |
| FCP (First Contentful Paint) | 首次内容绘制 | ✅ |
| LCP (Largest Contentful Paint) | 最大内容绘制 | ✅ |
| 资源加载耗时 | JS/CSS/图片加载时间 | ✅ |
| XHR 请求耗时 | 接口请求响应时间 | ✅ |

### 3. 行为监控 (Behavior Tracking)

| 类型 | 说明 | 状态 |
|------|------|------|
| 点击行为 | 记录用户点击操作 | ✅ |
| 页面访问 (PV) | 页面浏览量统计 | ✅ |
| 路由变化 | Hash 路由切换记录 | ✅ |
---

## 🛠️ 开发指南

### 本地开发

```bash
# 安装依赖
pnpm install

# 构建 SDK
pnpm build

# 启动测试服务器
node server.js
```

### 测试页面

启动服务器后访问：
- 错误测试：http://127.0.0.1:8080/error/index.html


## 🚀 框架演示

```bash
cd vue-test
npm install
npm run dev

cd react-test
npm install
npm run dev
```

---
### Vue 插件方式

```javascript
import { createApp } from 'vue';
import App from './App.vue';
import WebEye from '@webeye/sdk';

const app = createApp(App);
app.use(WebEye, { url: '...', projectId: '...' });
app.mount('#app');
```
### React 组件方式

```javascript
import WebEye from '@webeye/sdk';

const BoundBoundary = WebEye.BoundBoundary;
```
---

## 🏗️ 项目结构

```
web-vitals/
├── src/                      # SDK 核心代码
│   ├── WebEyeSDK.js          # 主入口文件
│   ├── config.js             # 配置管理
│   ├── report.js             # 数据上报模块
│   ├── cache.js              # 缓存队列
│   ├── utils.js              # 工具函数
│   ├── behavior/             # 行为监控
│   │   ├── index.js
│   │   ├── onClick.js        # 点击事件
│   │   ├── pageChange.js     # 路由变化
│   │   └── pv.js             # PV 统计
│   ├── error/                # 错误监控
│   │   └── index.js          # 错误捕获
│   └── performance/          # 性能监控
│       ├── index.js
│       ├── observerPaint.js  # FP/FCP
│       ├── observerLCP.js    # LCP
│       ├── xhr.js            # XHR 监控
│       └── fetch.js          # Fetch 监控
├── demo/                     # 演示页面
│   └── error/                # 错误测试页
├── react-test/               # React 测试项目
├── vue-test/                 # Vue 测试项目
├── rollup/                   # 构建配置
│   └── build.js              # Rollup 配置
├── dist/                     # 构建输出
│   └── monitor.js            # 打包后的 SDK
├── server.js                 # Express 测试服务器
└── package.json
```

---

