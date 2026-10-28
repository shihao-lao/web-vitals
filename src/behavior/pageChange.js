import { generateUniqueId } from '../utils.js';
import { lazyReport } from '../report.js';
import { reportPv } from './pv.js';
import { newTraceId } from '../context.js';

let initialized = false;

export default function pageChange() {
    if (initialized) return;
    initialized = true;
    let currentUrl = window.location.href;

    const trackChange = eventType => {
        const nextUrl = window.location.href;
        // Hash navigation can emit both popstate and hashchange.
        if (nextUrl === currentUrl) return;
        const from = currentUrl;
        currentUrl = nextUrl;
        newTraceId();
        lazyReport({
            type: 'behavior',
            subType: 'pageChange',
            eventType,
            startTime: performance.now(),
            from,
            to: nextUrl,
            pageUrl: nextUrl,
            uuid: generateUniqueId(),
        });
        // 每次路由变化视为一次新的页面访问，否则 SPA 的 PV 永远只有 1
        reportPv({ from, to: nextUrl, eventType });
    };

    window.addEventListener('hashchange', () => trackChange('hashchange'), true);
    window.addEventListener('popstate', () => trackChange('popstate'), true);
    for (const method of ['pushState', 'replaceState']) {
        const original = window.history[method];
        window.history[method] = function (...args) {
            const result = original.apply(this, args);
            trackChange(method);
            return result;
        };
    }
}
