import { lazyReport } from '../report.js';
export default function observerFCP() {
  //todo 上报性能数据
  const entryHandler = (list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === "first-contentful-paint") {
        observer.disconnect();
        const json = entry.toJSON();
        console.log(json);
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
  observer.observe({ name: "paint", buffer: true });
}
