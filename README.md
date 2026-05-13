# web-vitals

前端应用监控 JavaScript SDK，提供**性能指标采集**、**错误捕获**、**用户行为追踪**三大核心能力。

## 功能特性

### 错误监控

| 类型 | 说明 | 状态 |
|------|------|------|
| JavaScript 错误 | 捕获运行时 JS 异常 | ✅ |
| Promise 错误 | 捕获 unhandledrejection | ✅ |
| 资源加载错误 | 监控 img/script/css 加载失败 | ✅ |
| XHR/Fetch 错误 | 接口请求异常捕获 | ✅ |
| React ErrorBoundary | React 组件渲染错误 | ✅ |
| Vue errorHandler | Vue 全局错误处理 | ✅ |

### 性能监控

| 指标 | 说明 | 状态 |
|------|------|------|
| FP (First Paint) | 首次绘制时间 | ✅ |
| FCP (First Contentful Paint) | 首次内容绘制 | ✅ |
| LCP (Largest Contentful Paint) | 最大内容绘制 | ✅ |
| 资源加载耗时 | JS/CSS/图片加载时间 | ✅ |
| XHR 请求耗时 | 接口请求响应时间 | ✅ |

### 行为监控

| 类型 | 说明 | 状态 |
|------|------|------|
| 点击行为 | 记录用户点击操作 | ✅ |
| 页面访问 (PV) | 页面浏览量统计 | ✅ |
| 路由变化 | Hash 路由切换记录 | ✅ |

## 快速开始

### 安装与构建

```bash
pnpm install
pnpm build
```

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

// 使用 ErrorBoundary 捕获组件渲染错误
const ErrorBoundary = WebEye.ErrorBoundary;
```

## 本地开发

```bash
# 启动测试服务器
node server.js
```

启动后访问测试页面：

- 错误测试：<http://127.0.0.1:8080/error/index.html>

### 框架演示项目

```bash
# Vue 演示
cd vue-test && npm install && npm run dev

# React 演示
cd react-test && npm install && npm run dev
```

## 项目结构

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
├── react-test/               # React 测试项目
├── vue-test/                 # Vue 测试项目
├── rollup/                   # 构建配置
│   └── build.js              # Rollup 配置
├── dist/                     # 构建输出
│   └── monitor.js            # 打包后的 SDK
├── server.js                 # Express 测试服务器
└── package.json
```
