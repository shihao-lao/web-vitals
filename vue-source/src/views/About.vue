<template>
  <div class="about">
    <h1>ℹ️ 关于</h1>
    <p>这是关于页面的内容。</p>
    <div class="info-card">
      <h3>项目信息</h3>
      <p><strong>名称：</strong>WebEye SDK Vue Test</p>
      <p><strong>版本：</strong>v1.0.0</p>
      <p><strong>框架：</strong>Vue 3 + TypeScript + Vite</p>
      <p><strong>路由：</strong>Vue Router 4 (Hash 模式)</p>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.about {
  text-align: center;
  padding: 40px 20px;
}

.info-card {
  margin-top: 30px;
  padding: 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  display: inline-block;
  text-align: left;
  min-width: 300px;
}

.info-card h3 {
  margin-bottom: 15px;
  border-bottom: 1px solid rgba(255,255,255,0.3);
  padding-bottom: 10px;
}

.info-card p {
  padding: 6px 0;
  font-size: 15px;
}
</style>
