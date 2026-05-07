import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import monitor from "../../src/WebEyeSDK.js";

const app = createApp(App);
app.use(monitor, {
  url: "http://localhost:8080/reportData",
});
app.config.errorHandler = (err, instance, info) => {
  console.error("Vue 错误:", err, instance, info);
  // 可以添加自定义的错误处理逻辑
};
app.mount("#app");
