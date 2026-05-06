import { lazyReport } from '../report.js';
export default function observerLCP() {
  //todo 上报性能数据
  const entryHandler = (list) => {
    if (observer) {
      observer.disconnect();
    }
    for (const entry of list.getEntries()) {
      const json = entry.toJSON();
      const reportData = {
        ...json,
        name: 'LCP',
        type: "performance",
        subType: entry.name,
        pageUrl: window.location.href,
      };
      // 发送数据 todo
      lazyReport(reportData);
    }
  };
  const observer = new PerformanceObserver(entryHandler);
  observer.observe({ type: "largest-contentful-paint", buffered: true });
}
