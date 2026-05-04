import { generateUniqueId } from '../utils.js';
import { lazyReport } from '../report.js';
export default function pageChange() {
    let oldUrl = ''
    window.addEventListener('hashChange', (e) => {
        const newUrl = e.target.href
        const reportData = {
            type: 'behavior',
            subType: 'pageChange',
            startTime: performance.now(),
            from: oldUrl,
            to: newUrl,
            uuid: generateUniqueId(),
        }
        lazyReport(reportData)
        oldUrl = newUrl
    }, true)
    // 与上面进行区分
    let from = ''
    window.addEventListener('hashChange', (e) => {
        const to = this.window.location.href
        const reportData = {
            type: 'behavior',
            subType: 'popState',
            startTime: performance.now(),
            from: from,
            to: to,
            uuid: generateUniqueId(),
        }
        lazyReport(reportData)
        from = to
    }, true)
}