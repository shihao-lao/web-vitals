import { generateUniqueId } from '../utils.js';
import { lazyReport } from '../report.js';

export default function click() {

    ['mousedown', 'touchstart'].forEach((eventType) => {
        window.addEventListener(eventType, (e) => {
            const target = e.target
            // 只记录可交互元素的点击，排除 HTML、BODY 等容器元素
            const interactiveTags = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA', 'LABEL', 'OPTION']
            if (target.tagName && interactiveTags.includes(target.tagName.toUpperCase())) {
                const reportData = {                                                                                                                                                              
                    type: 'behavior',
                    subType: 'click',
                    startTime: performance.now(),
                    innerHTML: target.innerHTML,
                    outerHTML: target.outerHTML,
                    uuid: generateUniqueId(),
                    eventType: eventType,
                    path: e.composedPath(),
                }
                lazyReport(reportData)
            }
        }, true)
    })
}