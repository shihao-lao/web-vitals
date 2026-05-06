import { lazyReport } from '../report.js';

export default function error() {
  // 捕获资源加载失败的错误 js css img 主要是静态资源
  window.addEventListener(
    "error",
    (e) => {
      const target = e.target;
      if (!target) {
        return;
      }
      if (target.src || target.href) {
        const url = target.src || target.href;
        const reportData = {
          url,
          type: "error",
          subType: "resource",
          html: target.outerHTML,
          pageUrl: window.location.href,
          path: e.path,
        };
        lazyReport(reportData);
      }
    },
    true,
  );
  window.onerror = function (msg, url, lineNo, colNo, error) {
    const reportData = {
      url,
      type: "error",
      subType: "js",
      message: msg,
      stack: error.stack,
      lineNo, // 错误发生行号
      colNo, // 错误发生列号
      error,
      pageUrl: window.location.href,
      startTime: performance.now(),
    };
    lazyReport(reportData);
  };
  // 捕获promise错误
  window.addEventListener("unhandledrejection", (e) => {
    const reportData = {
      type: "error",
      subType: "promise",
      reason: e.reason,
      stack: e.reason ? e.reason.stack : undefined,
      pageUrl: window.location.href,
      startTime: e.timeStamp,
    };
    lazyReport(reportData);
  }, true);
}
