import { generateUniqueId } from '../utils.js';
import { lazyReport } from '../report.js';

export default function click() {
    ['mousedown', 'touchstart'].forEach((eventType) => {
        window.addEventListener(eventType, (e) => {
            const target = e.target
            if (target.tagName) {
                const reportData = {
                    type: 'behavior',
                    subType: 'click',
                    startTime: performance.now(),
                    innerHTML: target.innerHTML,
                    outerHTML: target.outerHTML,
                    uuid: generateUniqueId(),
                    eventType: eventType,// 点击事件类型
                    path: e.path
                }
                lazyReport(reportData)
            }
        })
    })
}