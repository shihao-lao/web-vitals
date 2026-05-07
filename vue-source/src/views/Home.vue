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
  </div>
</template>

<script setup lang="ts">
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
</style>
