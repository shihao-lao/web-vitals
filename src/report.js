import config from './config.js'
import { addCache, clearCache, getCache } from './cache.js'
import { generateUniqueId } from './utils.js'

export const originalProto = XMLHttpRequest.prototype
export const originalSend = originalProto.send
export const originalOpen = originalProto.open

export default function report(data) {
    if (!config.url) {
        throw new Error('config.url is required')
    }
    const reportData = JSON.stringify({
        id: generateUniqueId(),
        ...data
    })

    // 发送数据
    const value = beaconRequest(config.url, reportData)
    if (!value) {
        config.isImage ? imgRequest(reportData) : xhrRequest(reportData)
    }
}

export function imgRequest(data) {
    const img = new Image()
    // http://127.0.0.1:8080/api?data={...data}
    img.src = `${config.url}?data=${encodeURIComponent(JSON.stringify(data))}`
}

export function xhrRequest(data) {
    if (window.requestIdleCallback) {
        const xhr = new XMLHttpRequest()
        originalOpen.call(xhr, 'POST', config.url)
        originalSend.call(xhr, JSON.stringify(data))
    } else {
        setTimeout(() => {
            const xhr = new XMLHttpRequest()
            originalOpen.call(xhr, 'POST', config.url)
            originalSend.call(xhr, JSON.stringify(data))
        }, 3000)
    }

}

export function isSupportSendBeacon() {
    return 'sendBeacon' in navigator
}
// const sendBeacon = isSupportSendBeacon() ? navigator.sendBeacon : xhrRequest
export function beaconRequest(data) {
    let flag = true
    // 浏览器空闲的时候调用
    if (window.requestIdleCallback) {
        window.requestIdleCallback(() => {
            return flag = sendBeacon(config.url, JSON.stringify(data))
        }, { timeout: 3000 })
    } else {
        setTimeout(() => {
            return flag = sendBeacon(config.url, JSON.stringify(data))
        }, 3000)
    }
}
// 批量上报数据
export function lazyReport(data) {
    addCache(data)
    const ReportData = getCache()
    if (ReportData.length && ReportData.length > config.batchSize) {
        report(ReportData)
        clearCache()
    }
}