import config from './config.js';
import { deepClone } from './utils.js';

const cache = []

export function getCache() {
    return deepClone(cache)
}

export function addCache(data) {
    const limit = Number.isFinite(config.maxCache) && config.maxCache > 0 ? config.maxCache : 200
    // 超出上限丢最旧的，保证内存有界
    if (cache.length >= limit) {
        cache.splice(0, cache.length - limit + 1)
    }
    cache.push(data)
}

export function getCacheSize() {
    return cache.length
}

export function clearCache() {
    cache.length = 0
}
