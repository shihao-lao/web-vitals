<template>
  <div class="home">
    <h1>🏠 首页</h1>
    <p>这是首页内容，欢迎来到 WebEye SDK Vue 测试项目！</p>
    <div class="card">
      <h3>功能列表</h3>
      <ul>
        <li>✅ 错误监控</li>
        <li>✅ 性能监控</li>
        <li>✅ 行为追踪</li>
        <li>✅ 路由切换测试</li>
      </ul>
    </div>
    <button @click="throwError" class="error-btn">触发错误</button>
  </div>
</template>

<script setup lang="ts">
const throwError = () => {
  throw new Error('这是一个测试错误')
}
</script>

<style scoped>
.home {
  text-align: center;
  padding: 40px 20px;
}

.card {
  margin-top: 30px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 12px;
  display: inline-block;
  text-align: left;
}

.card h3 {
  margin-bottom: 10px;
  color: #42b883;
}

.card ul {
  list-style: none;
  padding: 0;
}

.card li {
  padding: 8px 0;
  font-size: 16px;
}

.error-btn {
  margin-top: 20px;
  padding: 10px 24px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.error-btn:hover {
  background: #ff7875;
}
</style>
