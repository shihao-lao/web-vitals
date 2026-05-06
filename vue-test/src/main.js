import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import monitor from "../../src/WebEyeSDK.js";

const app = createApp(App)
app.use(monitor, {
    url: 'http://localhost:8080/reportData'
})
app.mount('#app')
