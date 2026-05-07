import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index.ts'
import ErrorStackParser from 'error-stack-parser'

const app = createApp(App)

app.config.errorHandler = (err, instance, info) => {
    const errorParser = ErrorStackParser.parse(err as Error)
    console.log(errorParser)
}

app.use(router)
app.mount('#app')
