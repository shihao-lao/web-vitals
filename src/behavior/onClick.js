import { generateUniqueId, truncate } from '../utils.js';
import { lazyReport } from '../report.js';
import { newTraceId } from '../context.js';

// 只记录可交互元素，排除 HTML / BODY 等容器
const INTERACTIVE_TAGS = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA', 'LABEL', 'OPTION'];

function selectorOf(node) {
    if (!node) return null;
    if (node === window) return 'window';
    if (node === document) return 'document';
    if (!node.tagName) return null;
    const tag = node.tagName.toLowerCase();
    if (node.id) return `${tag}#${node.id}`;
    const className = typeof node.className === 'string' ? node.className.trim() : '';
    return className ? `${tag}.${className.split(/\s+/).slice(0, 2).join('.')}` : tag;
}

// composedPath 里是真实 DOM 节点，直接上报会让 deepClone 遍历上百个继承属性，
// 这里压成 6 层以内的选择器字符串
function pathOf(event) {
    const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
    return path.slice(0, 6).map(selectorOf).filter(Boolean);
}

function textOf(target) {
    const text = target.innerText || target.value || target.getAttribute?.('aria-label') || '';
    return truncate(String(text).trim(), 120);
}

export default function click() {
    ['mousedown', 'touchstart'].forEach((eventType) => {
        window.addEventListener(eventType, (e) => {
            const target = e.target;
            if (!target || !target.tagName) return;
            if (!INTERACTIVE_TAGS.includes(target.tagName.toUpperCase())) return;

            // 一次点击开启一条新链路，后续请求与错误都会带上同一个 traceId
            newTraceId();

            lazyReport({
                type: 'behavior',
                subType: 'click',
                startTime: performance.now(),
                tagName: target.tagName.toLowerCase(),
                text: textOf(target),
                path: pathOf(e),
                uuid: generateUniqueId(),
                eventType: eventType,
            });
        }, true);
    });
}
