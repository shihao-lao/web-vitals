import { generateUniqueId } from '../utils.js';
import { lazyReport } from '../report.js';
export default function pv() {
    reportPv();
}

// SPA 路由切换也应算一次新的页面访问，由 pageChange 复用
export function reportPv(extra = {}) {
    const reportData = {
        type: 'behavior',
        subType: 'pv',
        startTime: performance.now(),
        pageUrl: window.location.href,
        referer: document.referrer,
        uuid: generateUniqueId(),
        ...extra,
    }
    lazyReport(reportData)
}
