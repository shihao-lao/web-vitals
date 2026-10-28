import config from './config.js'
import { generateUniqueId } from './utils.js'

// 一次页面会话固定一个，用于串联「同一用户在同一次访问里」的所有事件
const sessionId = generateUniqueId()

// 链路 id：一次点击会开启一条新链路，后续的请求与错误都挂在同一条上
let traceId = generateUniqueId()

export function newTraceId() {
    traceId = generateUniqueId()
    return traceId
}

export function getTraceId() {
    return traceId
}

// 每条事件都带的公共上下文，解决「数据收上来但不知道是谁、属于哪个应用」
export function baseContext() {
    return {
        appId: config.appId,
        projectName: config.projectName,
        userId: config.userId,
        release: config.release,
        sessionId,
        traceId,
    }
}
