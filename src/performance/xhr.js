import { lazyReport } from '../report.js';
import config from '../config.js';
import { isReportUrl } from '../utils.js';

let installed = false;

export const originalProto = XMLHttpRequest.prototype;
export const originalSend = originalProto.send;
export const originalOpen = originalProto.open;

function overwriteOpenAndSend() {
  originalProto.open = function newOpen(...args) {
    this.__webeye = { url: args[1], method: args[0], startTime: 0, reported: false };
    originalOpen.apply(this, args);
  };

  originalProto.send = function newSend(...args) {
    const meta = this.__webeye;
    if (!meta || isReportUrl(meta.url, config.url)) return originalSend.apply(this, args);
    // 与 fetch / FP / LCP 统一使用相对时间基准
    meta.startTime = performance.now();

    // loadend 覆盖 load / error / abort / timeout 全部结局，
    // 之前只监听 load+error+abort，超时的请求一条都收不到
    this.addEventListener(
      'loadend',
      () => {
        if (meta.reported) return;
        meta.reported = true;
        const endTime = performance.now();
        const status = this.status || 0;
        lazyReport({
          url: meta.url,
          method: meta.method ? String(meta.method).toUpperCase() : 'UNKNOWN',
          startTime: meta.startTime,
          endTime,
          duration: endTime - meta.startTime,
          status,
          // 204 是标准成功状态，之前被当成了失败
          success: status >= 200 && status < 300,
          type: 'performance',
          subType: 'xhr',
        });
      },
      true,
    );

    originalSend.apply(this, args);
  };
}

export default function xhr() {
  if (installed) return;
  installed = true;
  overwriteOpenAndSend();
}
