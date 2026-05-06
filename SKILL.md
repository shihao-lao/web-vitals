# WebEye SDK 工程化升级路线图

> 本文档记录 SDK 从基础功能到完整工程化体系的演进计划

---

## 📋 总览

```
┌─────────────────────────────────────────────────────────────┐
│                    WebEye SDK 工程化体系                      │
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌─────────────┐  │
│  │   SDK   │  │   CLI   │  │  CI/CD   │  │ 高级功能     │  │
│  │ 核心功能 │  │ 命令工具 │  │ 自动流水线 │  │ Sourcemap等 │  │
│  └────┬────┘  └────┬────┘  └─────┬────┘  └──────┬──────┘  │
│       │            │             │               │          │
│       ▼            ▼             ▼               ▼          │
│    ✅ 完成      🔲 待开发      🔲 待配置       🔲 规划中    │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: 基础工程化 (预计 1-2 周)

### 1.1 TypeScript 重构 [ ]

**目标：** 为 SDK 添加完整的类型定义

- [ ] 配置 TypeScript 环境
- [ ] 为 `config.js` 添加类型接口
```typescript
interface WebEyeConfig {
  url: string;
  projectName: string;
  appId: string;
  userId?: string;
  isImage?: boolean;
  batchSize?: number;
}
```
- [ ] 为 `report.js` 上报数据添加类型
- [ ] 为 `utils.js` 工具函数添加类型
- [ ] 为各监控模块添加类型导出
- [ ] 生成 `.d.ts` 类型声明文件

### 1.2 单元测试 [ ]

**目标：** 核心模块测试覆盖率达到 80%+

- [ ] 安装 Vitest 测试框架
```bash
pnpm add -D vitest @vitest/coverage-v8
```
- [ ] 编写 `utils.js` 测试用例
  - [ ] `deepClone()` 深拷贝函数
  - [ ] `safeStringify()` 安全序列化
  - [ ] `generateUniqueId()` ID 生成
- [ ] 编写 `cache.js` 测试用例
  - [ ] `addCache()` 添加数据
  - [ ] `getCache()` 获取缓存
  - [ ] `clearCache()` 清空缓存
- [ ] 编写 `error/index.js` 测试用例
  - [ ] JS 错误捕获
  - [ ] Promise 错误捕获
- [ ] 编写 `behavior/onClick.js` 测试用例
- [ ] 配置覆盖率报告

### 1.3 代码规范 [ ]

**目标：** 统一代码风格，自动格式化

- [ ] 配置 ESLint
```javascript
// .eslintrc.js
module.exports = {
  extends: ['eslint:recommended'],
  parserOptions: { ecmaVersion: 2022 },
  env: { browser: true, es2022: true }
};
```
- [ ] 配置 Prettier
```json
// .prettierrc
{ "semi": false, "singleQuote": true, "tabWidth": 2 }
```
- [ ] 添加 `lint-staged` + `husky` Git 钩子
- [ ] 配置 VSCode 工作区设置

### 1.4 文档完善 [ ]

- [ ] API 文档（使用 TypeDoc 自动生成）
- [ ] 快速开始指南
- [ ] 常见问题 FAQ
- [ ] 更新 README.md 示例代码

---

## Phase 2: CI/CD 自动化 (预计 1 周)

### 2.1 GitHub Actions 工作流 [ ]

**文件位置：** `.github/workflows/`

#### ci.yml - 持续集成

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm lint        # 代码检查
      - run: pnpm test        # 单元测试
      - run: pnpm build       # 构建检查
```

- [ ] 创建 `ci.yml` 工作流
- [ ] 配置 Node.js 环境
- [ ] 添加 Lint 检查步骤
- [ ] 添加单元测试步骤
- [ ] 添加构建验证步骤

#### release.yml - 自动发布

```yaml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
          
      - run: pnpm install
      
      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: npx semantic-release
```

- [ ] 创建 `release.yml` 工作流
- [ ] 配置 GitHub Secrets（`NPM_TOKEN`）
- [ ] 接入 semantic-release

#### deploy-demo.yml - Demo 部署

```yaml
name: Deploy Demo

on:
  push:
    branches: [main]
    paths:
      - 'demo/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './demo'
      - uses: actions/deploy-pages@v4
```

- [ ] 创建 `deploy-demo.yml` 工作流
- [ ] 启用 GitHub Pages
- [ ] 配置自定义域名（可选）

### 2.2 Semantic Release 配置 [ ]

**目标：** 基于 Commit 自动管理版本号和 Changelog

- [ ] 安装依赖
```bash
pnpm add -D semantic-release \
  @semantic-release/git \
  @semantic-release/npm \
  @semantic-release/changelog \
  @semantic-release/github
```
- [ ] 创建 `.releaserc.json` 配置
```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/github",
    "@semantic-release/git"
  ]
}
```
- [ ] 配置 Commit 规范
```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具变更
```
- [ ] 配置 npm 发布权限
- [ ] 测试自动发布流程

### 2.3 自动 Changelog 生成 [ ]

- [ ] 配置 CHANGELOG.md 模板
- [ ] 设置版本号格式：`v1.0.0`
- [ ] 配置 issue 和 PR 关联
- [ ] 添加对比链接

---

## Phase 3: CLI 工具开发 (预计 1-2 周)

### 3.1 项目初始化 [ ]

**目标：** 创建独立的 CLI 包

```bash
# 项目结构
webeye-cli/
├── src/
│   ├── index.js           # 入口
│   ├── commands/
│   │   ├── init.js        # 初始化命令
│   │   ├── build.js       # 构建命令
│   │   ├── upload.js      # 上传 sourcemap
│   │   └── report.js      # 报告生成
│   └── utils/
│       └── helpers.js
├── package.json
└── README.md
```

- [ ] 初始化 CLI 项目
- [ ] 使用 Commander.js 框架
- [ ] 配置 bin 入口
```json
{
  "bin": {
    "webeye": "./src/index.js"
  }
}
```

### 3.2 命令实现 [ ]

#### init 命令 - 项目初始化

```bash
$ webeye init

? 项目名称: my-project
? 上报地址: https://api.example.com/report
? App ID: app-123
? 是否启用性能监控: Yes
? 是否启用错误监控: Yes
✅ 配置文件已生成: webeye.config.js
```

- [ ] 实现交互式问答
- [ ] 生成配置文件模板
- [ ] 支持预设模板选择

#### build 命令 - 构建打包

```bash
$ webeye build

📦 构建中...
✅ 构建完成: dist/monitor.js (12KB)
⚠️  警告: 未上传 sourcemap
💡 提示: 运行 webeye upload-sourcemap
```

- [ ] 调用 Rollup 构建
- [ ] 显示构建统计信息
- [ ] 自动检查 sourcemap

#### upload-sourcemap 命令 - 上传 Source Map

```bash
$ webeye upload-sourcemap

📤 上传中...
  ✓ monitor.js.map (45KB)
  ✓ monitor.esm.js.map (48KB)
✅ 上传成功！共 2 个文件
```

- [ ] 扫描 dist 目录下的 .map 文件
- [ ] 支持批量上传
- [ ] 显示上传进度
- [ ] 错误重试机制

#### report 命令 - 生成错误报告

```bash
$ webeye report --days 7

📊 错误报告 (最近 7 天)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
总错误数:    1,234
JS 错误:      892 (72.3%)
Promise 错误:  234 (19.0%)
资源错误:      108 (8.7%)

Top 5 错误:
1. TypeError: Cannot read property... (156次)
2. ReferenceError: xxx is not defined (89次)
...

📄 报告已保存: error-report-2024-01-15.html
```

- [ ] 拉取后端数据 API
- [ ] 数据聚合分析
- [ ] 生成 HTML/PDF 报告
- [ ] 支持时间范围筛选

### 3.3 CLI 发布 [ ]

- [ ] 注册 npm 包名 `@webeye/cli`
- [ ] 编写 CLI 使用文档
- [ ] 添加帮助信息
- [ ] 支持 Tab 自动补全

---

## Phase 4: Sourcemap 上传链路 (预计 1 周)

### 4.1 服务端接收 [ ]

**API 设计：**

```
POST /api/sourcemap
Content-Type: multipart/form-data

Body:
- file: monitor.js.map
- version: 1.0.0
- project: my-project
```

- [ ] 在 server.js 添加 `/api/sourcemap` 路由
- [ ] 文件存储到本地或 OSS
- [ ] 版本号关联
- [ ] 存储过期清理策略

### 4.2 Rollup 插件集成 [ ]

```javascript
// rollup/plugins/uploadSourcemap.js
export default function uploadSourcemap(options) {
  return {
    name: 'upload-sourcemap',
    async writeBundle(outputOptions, bundle) {
      for (const fileName of Object.keys(bundle)) {
        if (fileName.endsWith('.map')) {
          await uploadFile(bundle[fileName], options);
        }
      }
    }
  };
}
```

- [ ] 开发 Rollup 插件
- [ ] 集成到构建流程
- [ ] 支持环境变量配置
- [ ] 上传失败降级处理

### 4.3 错误还原服务 [ ]

**流程：**

```
用户上报错误 → 后端匹配 sourcemap → 还原真实堆栈 → 存储展示
```

- [ ] 解析 sourcemap 文件
- [ ] 行列号转换
- [ ] 源码定位展示
- [ ] 缓存优化

### 4.4 安全性 [ ]

- [ ] Sourcemap 访问鉴权
- [ ] 生产环境自动删除本地 map
- [ ] 加密传输

---

## Phase 5: 高级功能 (持续迭代)

### 5.1 多框架适配器 [ ]

- [ ] Vue 3 Composition API 版本
- [ ] React Hooks 版本
- [ ] Svelte 适配器
- [ ] Angular 适配器

### 5.2 数据可视化 Dashboard [ ]

- [ ] 错误趋势图表
- [ ] 性能指标看板
- [ ] 用户行为热力图
- [ ] 实时监控大屏

### 5.3 告警系统 [ ]

- [ ] 错误率阈值告警
- [ ] 性能指标异常检测
- [ ] 多渠道通知（邮件/钉钉/企微）
- [ ] 告警规则配置

### 5.4 插件体系 [ ]

```javascript
WebEye.use(AnalyticsPlugin, { trackId: 'xxx' });
WebEye.use(PerformancePlugin, { sampleRate: 0.5 });
```

- [ ] 插件注册机制
- [ ] 生命周期钩子
- [ ] 第三方插件市场

---

## 📈 进度追踪

| 阶段 | 状态 | 进度 | 预计完成 |
|------|------|------|----------|
| Phase 1: 基础工程化 | 🔲 进行中 | 0% | - |
| Phase 2: CI/CD | 🔲 待开始 | 0% | - |
| Phase 3: CLI 工具 | 🔲 待开始 | 0% | - |
| Phase 4: Sourcemap | 🔲 待开始 | 0% | - |
| Phase 5: 高级功能 | 🔲 待开始 | 0% | - |

---

## 🎯 下一步行动

**立即开始：**

1. **Phase 1.1** - 先跑通 TypeScript 重构
2. **Phase 1.2** - 添加核心模块的单元测试
3. **Phase 2.1** - 配置 GitHub Actions CI

**需要帮助？** 查看 [README.md](./README.md) 或提交 Issue

---

<p align="center">
  <strong>让我们一起打造更好的前端监控工具！</strong> 🚀
</p>
