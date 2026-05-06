import { lazyReport } from '../report.js';

export const originalProto = XMLHttpRequest.prototype;
export const originalSend = originalProto.send;
export const originalOpen = originalProto.open;

function overwriteOpenAndSend() {
  originalProto.open = function newOpen(...args) {
    this.url = args[1];
    this.method = args[0];
    originalOpen.apply(this, args);
  };

  originalProto.send = function newSend(...args) {
    this.startTime = Date.now();

    const onRequestComplete = () => {
      this.endTime = Date.now();
      this.duration = this.endTime - this.startTime;
      const { url, method, startTime, endTime, duration, status } = this;
      const reportData = {
        url,
        duration,
        method: method ? method.toUpperCase() : 'UNKNOWN',
        startTime,
        endTime,
        status,
        type: "performance",
        subType: "xhr",
        success: status >= 200 && status < 300 && status !== 204,
      };
      lazyReport(reportData);
    };

    this.addEventListener('load', onRequestComplete, true);
    this.addEventListener('error', onRequestComplete, true);
    this.addEventListener('abort', onRequestComplete, true);

    originalSend.apply(this, args);
  };
}

export default function xhr() {
  overwriteOpenAndSend();
}
