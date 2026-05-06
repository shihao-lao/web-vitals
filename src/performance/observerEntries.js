import { lazyReport } from '../report.js';
export default function observerEntries() {
  if (document.readyState === "complete") {
    observerEvent();
  } else {
    const onLoad = () => {
      observerEvent();
      window.removeEventListener("load", onLoad, true);
    };
    window.addEventListener("load", onLoad, true);
  }
}

export function observerEvent() {
  const entryHandler = (list) => {
    const data = list.getEntries();
    for (let entry of data) {
      if (observer) {
        observer.disconnect();
      }
      const reportData = {
        name: entry.name, //资源名称
        type: "performance", // 类型
        subType: entry.entryType, // 子类型
        sourceType: entry.initiatorType, // 资源类型
        duration: entry.duration, // 资源加载时间
        dns: entry.domainLookupEnd - entry.domainLookupStart, // DNS查询时间
        ttp: entry.responseEnd - entry.requestStart, // TTP时间
        redirect: entry.redirectEnd - entry.redirectStart, // 重定向时间
        ttfb: entry.responseStart, // 接收到首字节的时间
        protocol: entry.nextHopProtocol, // 请求协议
        responseBodySize: entry.encodedBodySize, // 响应内容大小
        responseHeaderSize: entry.transferSize - entry.encodedBodySize, // 响应头大小
        transferSize: entry.transferSize, // 资源大小
        resourceSize: entry.decodedBodySize, // 资源大小
        startTime: performance.now(), // 资源开始加载的时间
      };
      lazyReport(reportData);
    }
  };
  //todo 上报性能数据
  let observer = new PerformanceObserver(entryHandler);
  observer.observe({ type: ["resource"], buffered: "true" });
}
