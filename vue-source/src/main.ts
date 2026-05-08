import { createApp } from 'vue'
import './style.css'
import {findErrBySourceMap } from './utils/index.js'
import App from './App.vue'
import router from './router/index.ts'
import ErrorStackParser from 'error-stack-parser'

const app = createApp(App)

app.config.errorHandler = (err) => {
    const errorParser = ErrorStackParser.parse(err as Error)
    findErrBySourceMap(errorParser[0])
    console.log(errorParser)
}

app.use(router)
app.mount('#app')
