import config from './config.js'
import { addCache, clearCache, getCache, getCacheSize } from './cache.js'
import { baseContext } from './context.js'
import { generateUniqueId, safeStringify, toEpochTime } from './utils.js'

export const originalProto = XMLHttpRequest.prototype
export const originalSend = originalProto.send
export const originalOpen = originalProto.open
// Preserve a transport that cannot recursively enter fetch instrumentation.
const originalFetch = window.fetch

const DEFAULT_URL = 'http://127.0.0.1:8080/reportData'

let flushTimer = null
let initialized = false
let warned = false

function warn(message) {
    if (warned || typeof console === 'undefined' || !console.warn) return
    warned = true
    console.warn(`[WebEye] ${message}`)
}

function ensureEndpoint() {
    if (!config.url) {
        warn('config.url 为空，事件只会留在内存队列中')
        return false
    }
    if (config.url === DEFAULT_URL) {
        warn('仍在向默认地址 127.0.0.1:8080 上报，请通过 init({ url }) 配置采集端')
    }
    return true
}

export default function report(data, { immediate = false } = {}) {
    if (!ensureEndpoint()) return false
    const payload = {
        id: generateUniqueId(),
        ...(Array.isArray(data) ? { events: data } : data),
    }
    // Lifecycle flushes bypass scheduling and prefer an unload-safe transport.
    if (immediate || !config.isImage) return beaconRequest(payload)
    return imgRequest(payload)
}

export function imgRequest(data) {
    const img = new Image()
    const separator = config.url.includes('?') ? '&' : '?'
    img.src = `${config.url}${separator}data=${encodeURIComponent(safeStringify(data))}`
    return true
}

export function xhrRequest(data) {
    const xhr = new XMLHttpRequest()
    originalOpen.call(xhr, 'POST', config.url)
    originalSend.call(xhr, safeStringify(data))
    return true
}

export function isSupportSendBeacon() {
    return typeof window.navigator.sendBeacon === 'function'
}

export function beaconRequest(data) {
    const payload = safeStringify(data)
    if (isSupportSendBeacon()) {
        try {
            if (window.navigator.sendBeacon(config.url, payload)) return true
        } catch {
            // Try the fallback if the browser rejects the beacon payload.
        }
    }
    if (typeof originalFetch === 'function') {
        // Avoid reporting a transport failure as an unhandled application error.
        originalFetch.call(window, config.url, {
            method: 'POST', body: payload, keepalive: true,
        }).catch(() => {})
        return true
    }
    return xhrRequest(data)
}

export function initReporting() {
    if (initialized) return
    initialized = true
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') flushReport({ immediate: true })
    })
    window.addEventListener('pagehide', () => flushReport({ immediate: true }))
}

export function flushReport(options) {
    if (flushTimer !== null) {
        clearTimeout(flushTimer)
        flushTimer = null
    }
    if (!getCacheSize()) return
    const data = getCache()
    try {
        // Clear only after a transport has accepted the payload synchronously.
        if (report(data, options) === false) return
        clearCache()
    } catch (error) {
        // 上报链路自身的异常不能外溢到业务代码；队列保留，等下次重试
        warn(`上报失败：${error && error.message}`)
    }
}

export function lazyReport(data) {
    initReporting()
    // 每条事件统一补上应用/用户/会话/链路上下文
    let event = { ...baseContext(), pageUrl: window.location.href, ...data }
    if (typeof config.beforeSend === 'function') {
        try {
            event = config.beforeSend(event)
        } catch (error) {
            warn(`beforeSend 执行异常：${error && error.message}`)
        }
        if (!event) return
    }
    // startTime 保持相对时间（用于算差值），timestamp 给绝对时间（用于和服务端日志对齐）
    if (!Number.isFinite(event.timestamp)) {
        const startTime = Number.isFinite(event.startTime) ? event.startTime : performance.now()
        // 兼容仍以 Date.now() 作为 startTime 的旧采集器：已是绝对时间就不再叠加 timeOrigin
        event.timestamp = startTime > 1e12 ? Math.round(startTime) : toEpochTime(startTime)
    }
    addCache(event)
    const batchSize = Number.isFinite(config.batchSize) && config.batchSize > 0 ? config.batchSize : 10
    if (getCacheSize() >= batchSize || document.visibilityState === 'hidden') {
        flushReport({ immediate: document.visibilityState === 'hidden' })
    } else if (flushTimer === null) {
        const interval = Number.isFinite(config.flushInterval) && config.flushInterval > 0 ? config.flushInterval : 3000
        flushTimer = setTimeout(() => flushReport(), interval)
    }
}
