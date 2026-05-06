import { lazyReport } from '../report.js';

export default function observerPaint() {
  const entryHandler = (list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === "first-paint") {
        observer.disconnect();
        const json = entry.toJSON();
        const reportData = {
          ...json,
          type: "performance",
          subType: entry.name,
          pageUrl: window.location.href,
        };
        // 发送数据 todo
        lazyReport(reportData);
      }
    }
  };
  const observer = new PerformanceObserver(entryHandler);
  // 监听 paint 事件，发送 paint 事件数据到服务器
  observer.observe({ type: "paint", buffered: true });
}
