import { lazyReport } from '../report.js';

let reported = false;

// 之前的实现是 performance.now() - pageshowEvent.timeStamp，
// 而 timeStamp 本身就是相对 navigationStart 的，减出来恒等于 0，指标没有意义。
// 这里改为直接读 navigation timing 的 loadEventEnd。
export default function observerLoad() {
  const flush = () => {
    if (reported) return;
    reported = true;
    const nav = typeof performance.getEntriesByType === 'function'
      ? performance.getEntriesByType('navigation')[0]
      : null;
    const reportData = nav
      ? {
          name: 'load',
          type: 'performance',
          subType: 'load',
          startTime: nav.loadEventEnd,
          duration: nav.loadEventEnd - nav.startTime,
          domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
          ttfb: nav.responseStart - nav.startTime,
          domReady: nav.domComplete - nav.startTime,
        }
      : {
          // 不支持 navigation timing 时保留一条负载完成记录，不再伪造耗时
          name: 'load',
          type: 'performance',
          subType: 'load',
          startTime: performance.now(),
        };
    lazyReport(reportData);
  };

  if (document.readyState === 'complete') {
    flush();
    return;
  }
  // bfcache 恢复时 load 不会再触发，由 pageshow 兜底
  window.addEventListener('load', flush, { once: true });
  window.addEventListener('pageshow', flush);
}
