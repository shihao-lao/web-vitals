import { lazyReport } from '../report.js';
const originalFetch = window.fetch;
function overwriteFetch() {
  window.fetch = function newFetch(url, config) {
    const startTime = Date.now();
    const reportData = {
      type: "performance",
      subType: "fetch",
      url,
      method: config.method,
    };
    return originalFetch(url, config)
      .then((res) => {
        const endTime = Date.now();
        reportData.endTime = endTime;
        reportData.duration = endTime - startTime;
        const data = res.clone();
        //structCloneDeep
        reportData.status = res.status;
        reportData.success = res.ok;
        // todo 上报性能数据
        lazyReport(reportData);
        return res;
      })
      .catch((err) => {
        const endTime = Date.now();
        reportData.endTime = endTime;
        reportData.duration = endTime - startTime;
        reportData.status = 0;
        reportData.success = false;
        // todo 上报性能数据
        lazyReport(reportData);
      });
  };
}
export default function fetch() {
  overwriteFetch();
}
