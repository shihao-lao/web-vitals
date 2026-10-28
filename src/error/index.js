import { lazyReport } from '../report.js';
import { truncate } from '../utils.js';

let installed = false;

// 同一个资源地址只报一次，避免图片重试把队列刷满
const reportedResources = new Set();
const RESOURCE_CACHE_LIMIT = 500;

function readStack(error) {
  return error && typeof error.stack === 'string' ? error.stack : undefined;
}

function messageOf(reason) {
  if (reason === null || reason === undefined) return 'unhandled rejection';
  if (typeof reason === 'string') return reason;
  if (reason.message) return String(reason.message);
  try {
    return JSON.stringify(reason);
  } catch {
    return String(reason);
  }
}

export default function error() {
  if (installed) return;
  installed = true;

  // 通道一：资源加载失败。error 事件不冒泡，只有捕获阶段能拿到真实 target
  window.addEventListener(
    'error',
    event => {
      const target = event.target;
      // 目标不是元素时说明是 JS 错误，交给下面的通道，避免同一条报两次
      if (!target || target === window) return;
      const url = target.src || target.href;
      if (!url) return;
      if (reportedResources.has(url)) return;
      if (reportedResources.size >= RESOURCE_CACHE_LIMIT) reportedResources.clear();
      reportedResources.add(url);
      lazyReport({
        type: 'error',
        subType: 'resource',
        url,
        tagName: target.tagName ? target.tagName.toLowerCase() : undefined,
        html: truncate(target.outerHTML, 300),
        startTime: performance.now(),
      });
    },
    true,
  );

  // 通道二：JS 运行时错误。target 就是 window，冒泡阶段即可收到；
  // 用 addEventListener 而不是 window.onerror，避免覆盖业务方或其它 SDK 的处理器
  window.addEventListener('error', event => {
    if (!event || event.target !== window) return;
    if (!event.message && !event.error) return;
    lazyReport({
      type: 'error',
      subType: 'js',
      message: event.message || messageOf(event.error),
      // 跨域脚本未带 crossorigin 时 error 为 null，这里不能直接取 .stack
      stack: readStack(event.error),
      url: event.filename,
      lineNo: event.lineno,
      colNo: event.colno,
      startTime: performance.now(),
    });
  });

  // 通道三：未处理的 Promise 拒绝。它不会触发 error 事件，必须单独监听
  window.addEventListener(
    'unhandledrejection',
    event => {
      const reason = event.reason;
      const isError = reason instanceof Error;
      lazyReport({
        type: 'error',
        subType: 'promise',
        message: messageOf(reason),
        stack: readStack(reason),
        // Error 交给上报层统一序列化，其它类型的 reason 原样带上
        reason: isError ? undefined : reason,
        startTime: performance.now(),
      });
    },
    true,
  );
}
