export function deepClone(target, map = new WeakMap()) {
    // 处理 null 和基本类型
    if (target === null || typeof target !== 'object') {
        return target
    }

    // 处理循环引用
    if (map.has(target)) {
        return map.get(target)
    }

    // 内置对象不能走 for...in，否则会退化成空对象
    if (target instanceof Date) {
        return new Date(target.getTime())
    }
    if (target instanceof RegExp) {
        return new RegExp(target.source, target.flags)
    }
    if (target instanceof Error) {
        const clone = new target.constructor(target.message)
        clone.stack = target.stack
        map.set(target, clone)
        for (const key in target) {
            if (Object.prototype.hasOwnProperty.call(target, key)) {
                clone[key] = deepClone(target[key], map)
            }
        }
        return clone
    }

    // 处理数组
    if (Array.isArray(target)) {
        const clone = []
        map.set(target, clone)
        for (let i = 0; i < target.length; i++) {
            clone[i] = deepClone(target[i], map)
        }
        return clone
    }

    // 处理普通对象
    const clone = {}
    map.set(target, clone)
    for (const key in target) {
        if (Object.prototype.hasOwnProperty.call(target, key)) {
            clone[key] = deepClone(target[key], map)
        }
    }
    return clone
}

export function safeStringify(obj, space = 0) {
    // 只记录「当前链路上」的祖先，兄弟节点重复引用不算循环
    const ancestors = []
    const isDom = value =>
        (typeof Element !== 'undefined' && value instanceof Element) ||
        (typeof Window !== 'undefined' && value instanceof Window) ||
        (typeof Document !== 'undefined' && value instanceof Document)

    const replacer = function (key, value) {
        // this 是当前属性的持有者，据此把祖先栈回退到正确层级
        while (ancestors.length > 0 && ancestors[ancestors.length - 1] !== this) {
            ancestors.pop()
        }
        if (typeof value === 'object' && value !== null && isDom(value)) {
            return value.tagName ? `<${value.tagName.toLowerCase()}>` : '[Object]'
        }
        if (value instanceof Error) {
            return {
                message: value.message,
                stack: value.stack
            }
        }
        if (typeof value === 'object' && value !== null) {
            if (ancestors.includes(value)) {
                return '[Circular]'
            }
            ancestors.push(value)
        }
        return value
    }
    try {
        return JSON.stringify(obj, replacer, space)
    } catch {
        return '"[unserializable]"'
    }
}

let idCounter = 0

export function generateUniqueId() {
    // 同毫秒内靠自增序号区分，1296 = 36^2
    idCounter = (idCounter + 1) % 1296
    return Date.now().toString(36).substring(2) + idCounter.toString(36).padStart(2, '0')
}

// Ignore collector traffic, including image reports with a query payload.
export function isReportUrl(url, reportUrl) {
    if (!url || !reportUrl) return false
    try {
        const request = new URL(url, window.location.href)
        const collector = new URL(reportUrl, window.location.href)
        return request.origin === collector.origin && request.pathname === collector.pathname
    } catch {
        return false
    }
}

// 单个字段的字符上限，避免一次点击把队列体积撑爆
export function truncate(value, max = 200) {
    if (value === null || value === undefined) return value
    const text = String(value)
    return text.length > max ? `${text.slice(0, max)}…` : text
}

// 把相对 navigationStart 的时间换算成 Unix 毫秒。
// 差值计算继续用 performance.now()（单调，不受系统校时影响），
// 但对外必须给出绝对时间，否则无法和服务器日志对齐。
export function toEpochTime(relative) {
    const offset = Number.isFinite(relative) ? relative : performance.now()
    // timeOrigin 是页面开始导航时的绝对时间戳
    const origin = typeof performance.timeOrigin === 'number'
        ? performance.timeOrigin
        : Date.now() - performance.now()
    return Math.round(origin + offset)
}
