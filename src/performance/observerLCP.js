export default function observerLCP() {
  const entryHandler = (list) => {
    if (observer) {
      observer.disconnect();
    }
    for (const entry of list.getEntries()) {
      const json = entry.toJSON();
      console.log(json);
      const reportData = {
        ...json,
        type: "performance",
        subType: entry.name,
        pageUrl: window.location.href,
      };
      // 发送数据 todo
      console.log(reportData);
    }
  };
  const observer = new PerformanceObserver(entryHandler);
  observer.observe({ type: "largest-contentful-paint", buffered: true });
}
