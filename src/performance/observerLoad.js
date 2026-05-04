import { lazyReport } from '../report.js';
export default function observerLoad() {
  //todo 上报性能数据
  window.addEventListener("pageshow", function (event) {
    requestAnimationFrame(() => {
      ["load"].forEach((type) => {
        const reportData = {
          name: type,
          type: "performance",
          subType: type,
          pageUrl: window.location.href,
          startTime: performance.now() - event.timeStamp,
        };
        lazyReport(reportData);
      });
    });
  });
}
