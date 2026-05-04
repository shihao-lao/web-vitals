import performance from "./performance/index.js";
import behavior from "./behavior/index.js";
import error from "./error/index.js";
import { setConfig } from "./config.js";

window.__WebEyeSDK__ = {
  version: "0.0.1",
};

export function install(Vue, options) {
  if (__WebEyeSDK__.vue) {
    return;
  }
  __WebEyeSDK__.vue = true;
  const handler = Vue.config.errorHandler;
  Vue.config.errorHandler = function (err, vm, info) {
    // todo :上报具体错误信息
    if (handler) {
      handler.call(this, err, vm, info);
    }
  };
}
// 针对react错误边界处理
function errorBoundary(err) {
  if (__WebEyeSDK__.react) {
    return;
  }
  __WebEyeSDK__.react = true;
}
export function init(options) {
  try {
    setConfig(options)
  } catch (error) {
    console.error("初始化配置失败:", error);
  }
}
export default { install, performance, behavior, error, errorBoundary, init };
