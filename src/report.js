import config from './config.js'
import { addCache, clearCache, getCache } from './cache.js'
import { generateUniqueId, safeStringify } from './utils.js'

export const originalProto = XMLHttpRequest.prototype
export const originalSend = originalProto.send
export const originalOpen = originalProto.open

export default function report(data) {
    if (!config.url) {
        throw new Error('config.url is required')
    }
    const payload = {
        id: generateUniqueId(),
        ...data
    }
    const reportData = safeStringify(payload)
    // 发送数据
    if (config.isImage) {
        imgRequest(payload)
    } else {
        if (window.navigator.sendBeacon) {
            return beaconRequest(payload)
        } else {
            xhrRequest(payload)
        }
    }
}

export function imgRequest(data) {
    const img = new Image()
    // http://127.0.0.1:8080/api?data={...data}
    img.src = `${config.url}?data=${encodeURIComponent(safeStringify(data))}`
}

export function xhrRequest(data) {
    const payload = safeStringify(data)
    if (window.requestIdleCallback) {
        const xhr = new XMLHttpRequest()
        originalOpen.call(xhr, 'POST', config.url)
        originalSend.call(xhr, payload)
    } else {
        setTimeout(() => {
            const xhr = new XMLHttpRequest()
            originalOpen.call(xhr, 'POST', config.url)
            originalSend.call(xhr, payload)
        }, 3000)
    }

}

export function isSupportSendBeacon() {
    return 'sendBeacon' in navigator
}
// const sendBeacon = isSupportSendBeacon() ? navigator.sendBeacon : xhrRequest
export function beaconRequest(data) {
    const payload = safeStringify(data)
    let flag = true
    // 浏览器空闲的时候调用
    if (window.requestIdleCallback) {
        window.requestIdleCallback(() => {
            return flag = navigator.sendBeacon(config.url, payload)
        }, { timeout: 3000 })
    } else {
        setTimeout(() => {
            return flag = navigator.sendBeacon(config.url, payload)
        }, 3000)
    }
}
// 批量上报数据
export function lazyReport(data) {
    addCache(data)
    const ReportData = getCache()
    console.error('错误cache', data);
    if (ReportData.length && ReportData.length > config.batchSize) {
        report(ReportData)
        console.error('监控数据~~~', ReportData);
        clearCache()
    }
}