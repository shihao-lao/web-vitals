# WebEye SDK

<p align="center">
  <strong>一款轻量级前端性能监控与错误追踪 SDK</strong>
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#安装使用">安装使用</a> •
  <a href="#API文档">API文档</a> •
  <a href="#项目结构">项目结构</a>
</p>

---

## 📖 项目简介

**WebEye SDK** 是一个专注于前端应用监控的 JavaScript SDK，提供 **性能指标采集**、**错误捕获**、**用户行为追踪** 三大核心能力。

### 为什么选择 WebEye？

- 🔍 **全方位监控** - 覆盖 JS 错误、Promise 错误、资源加载错误、XHR/Fetch 请求异常
- ⚡ **零侵入式接入** - 几行代码即可完成初始化，支持 Vue/React 多框架适配
- 📊 **性能数据采集** - 自动采集 FP、FCP、LCP 等关键性能指标
- 🎯 **用户行为分析** - 追踪点击事件、页面跳转等用户交互行为
- 🚀 **灵活上报策略** - 支持 Beacon/XHR/图片三种上报方式，可配置批量阈值

---

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

## 🚀 快速开始

### 方式一：CDN 引入（推荐测试）

```html
<script src="https://cdn.example.com/monitor.js"></script>
<script>
  window.__WebEyeSDK__.init({
    url: 'https://your-api.com/report',
    projectName: 'your-project',
    appId: 'your-app-id',
    userId: 'user-id',
    isImage: true,
    batchSize: 10,
  });
</script>
```

### 方式二：NPM 安装

```bash
npm install @webeye/sdk --save
# 或
pnpm add @webeye/sdk
```

```javascript
import WebEye from '@webeye/sdk';

WebEye.init({
  url: 'https://your-api.com/report',
  projectName: 'my-project',
  appId: 'app-123',
  userId: 'user-456',
});
```

---

## 📚 API 文档

### 初始化配置 `init(options)`

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| url | String | ✅ | - | 数据上报地址 |
| projectName | String | ✅ | - | 项目名称 |
| appId | String | ✅ | - | 应用 ID |
| userId | String | ❌ | - | 用户 ID |
| isImage | Boolean | ❌ | true | 是否使用图片方式上报 |
| batchSize | Number | ❌ | 10 | 批量上报阈值 |

### 手动上报错误 `reportError(data)`

适用于 React ErrorBoundary 场景：

```javascript
// main.jsx
import monitor from '@webeye/sdk';

const root = createRoot(container, {
  onCaughtError: (error, errorInfo) => {
    if (error.message !== "Known error") {
      monitor.reportError({
        error,
        componentStack: errorInfo.componentStack,
      });
    }
  },
});
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
- React 测试：http://localhost:5173/

---

## 📊 上报数据格式

```json
{
  "id": "unique-id",
  "type": "error",
  "subType": "js",
  "message": "Uncaught TypeError: ...",
  "stack": "Error at ...",
  "url": "http://example.com/page",
  "timestamp": 1704067200000,
  "projectName": "my-project",
  "appId": "app-123"
}
```

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 License

[ISC](./LICENSE)

---

## 📞 联系方式

- Issues: [GitHub Issues](https://github.com/yourname/web-vitals/issues)
- Email: your@email.com

---

<p align="center">
  Made with ❤️ by <strong>WebEye Team</strong>
</p>
