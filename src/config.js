export const config = {
    url: 'http://127.0.0.1:8080/reportData',
    projectName: 'eyeSDK',
    appId: '861583654321',
    userId: '123456',
    release: '',
    isImage: true,
    batchSize: 10,
    flushInterval: 3000,
    // 队列上限，防止上报一直失败时内存无限增长
    maxCache: 200,
    // 上报前的最后一道加工口，返回 false 可丢弃该条事件
    beforeSend: null,
}
export function setConfig(options = {}) {
    for (const key in config) {
        if (options[key] !== undefined) {
            config[key] = options[key]
        }
    }
}

export default config
