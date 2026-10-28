import performance from "./performance/index.js";
import behavior from "./behavior/index.js";
import error from "./error/index.js";
import { setConfig } from "./config.js";
import { lazyReport } from "./report.js";

let initialized = false;
const installedApps = new WeakSet();

// 定义 install 函数
function install(Vue, options = {}) {
  init(options);
  if (installedApps.has(Vue)) return;
  installedApps.add(Vue);
  const handler = Vue.config.errorHandler;
  Vue.config.errorHandler = function (err, vm, info) {
    const reportData = {
      error: err && err.stack,
      message: err && err.message,
      subType: 'vue',
      type: 'error',
      info,
      startTime: window.performance.now(),
      pageUrl: window.location.href,
    };
    lazyReport(reportData);
    if (handler) {
      handler.call(this, err, vm, info);
    }
  };
}

// 针对 react 错误边界处理
function errorBoundary(err, info) {
  const reportData = {
    error: err && err.stack,
    message: err && err.message,
    subType: 'react',
    type: 'error',
    info,
    startTime: window.performance.now(),
    pageUrl: window.location.href,
  };
  lazyReport(reportData);
}

// 初始化函数
function init(options = {}) {
  setConfig(options);
  if (initialized) return;
  initialized = true;
  performance()
  error()
  behavior()
}

// 挂载到 window 上
window.__WebEyeSDK__ = {
  version: "0.0.1",
  init,
  performance,
  behavior,
  error,
  errorBoundary,
  install
};

// 导出
export { install, performance, behavior, error, errorBoundary, init };
export default { install, performance, behavior, error, errorBoundary, init };

