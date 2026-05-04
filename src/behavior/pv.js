import { generateUniqueId } from '../utils.js';
import { lazyReport } from '../report.js';
export default function pv() {
    const reportData = {
        type: 'behavior',
        subType: 'pv',
        startTime: performance.now(),
        pageUrl: window.location.href,
        referer: document.referrer,
        uuid: generateUniqueId(),
    }
    lazyReport(reportData)
}