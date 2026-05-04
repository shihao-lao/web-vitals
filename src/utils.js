export function deepClone(target) {
    if (typeof target !== 'object') {
        return target
    } else {
        const result = Array.isArray(target) ? [] : {}
        for (const key in target) {
            if (typeof target[key] === 'object') {
                result[key] = deepClone(target[key])
            } else {
                result[key] = target[key]
            }
        }
    }
    return result
}

export function generateUniqueId() {
    return Date.now().toString(36).substring(2)
}