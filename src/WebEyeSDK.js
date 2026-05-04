window.__WebEyeSDK__ = {
  version: "0.0.1",
};
export function install(Vue, options) {
  if (__WebEyeSDK__.vue) {
    return;
  }
  __WebEyeSDK__.vue = true;
  const handler = Vue.config.handler;
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
  // todo :上报具体错误信息
}
export default { install, errorBoundary };
