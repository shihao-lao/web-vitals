export function deepClone(target, map = new WeakMap()) {
    // 处理 null 和基本类型
    if (target === null || typeof target !== 'object') {
        return target
    }

    // 处理循环引用
    if (map.has(target)) {
        return map.get(target)
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
        if (target.hasOwnProperty(key)) {
            clone[key] = deepClone(target[key], map)
        }
    }
    return clone
}

export function safeStringify(obj, space = 0) {
    const seen = new WeakSet()
    const replaceCircular = (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular]'
            }
            seen.add(value)
        }
        // 过滤 DOM 对象、window、document 等
        if (value instanceof Element || value instanceof Window || value instanceof Document) {
            return value.tagName ? `<${value.tagName.toLowerCase()}>` : '[Object]'
        }
        // 过滤 Error 对象的循环引用
        if (value instanceof Error) {
            return {
                message: value.message,
                stack: value.stack
            }
        }
        return value
    }
    return JSON.stringify(obj, replaceCircular, space)
}

export function generateUniqueId() {
    return Date.now().toString(36).substring(2)
}