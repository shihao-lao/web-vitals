import performance from "./performance/index.js";
import behavior from "./behavior/index.js";
import error from "./error/index.js";
import { setConfig } from "./config.js";
import { lazyReport } from "./report.js";

// 定义 install 函数
function install(Vue, options) {
  if (window.__WebEyeSDK__.vue) {
    return;
  }
  window.__WebEyeSDK__.vue = true;
  const handler = Vue.config.errorHandler;
  Vue.config.errorHandler = function (err, vm, info) {
    const reportData = {
      error: err.stack,
      subType: 'vue',
      type: 'error',
      info,
      startTime: Date.now(),
      pageUrl: window.location.href,
    };
    console.log('vue error', reportData)
    lazyReport(reportData);
    if (handler) {
      handler.call(this, err, vm, info);
    }
  };
}

// 针对 react 错误边界处理
function errorBoundary(err, info) {
  if (window.__WebEyeSDK__.react) {
    return;
  }
  window.__WebEyeSDK__.react = true;
  const reportData = {
    error: err.stack,
    subType: 'react',
    type: 'error',
    info,
    startTime: Date.now(),
    pageUrl: window.location.href,
  };
  lazyReport(reportData);
}

// 初始化函数
function init(options) {
  setConfig(options);
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

