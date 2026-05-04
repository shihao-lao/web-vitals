export const config = {
    url: 'http://127.0.0.1:8080/api',
    projectName: 'eyeSDK',
    appId: '861583654321',
    userId: '123456',
    isImage: true,
    batchSize: 100,
}
export function setConfig(options) {
    for (const key in config) {
        if (options[key]) {
            config[key] = options[key]
        }
    }
}

export default config
