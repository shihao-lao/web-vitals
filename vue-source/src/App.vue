<template>
  <div id="app">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-brand">WebEye SDK</div>
      <router-link to="/" class="nav-link" active-class="active">首页</router-link>
      <router-link to="/about" class="nav-link" active-class="active">关于</router-link>
    </nav>

    <!-- 页面内容区域 -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.navbar {
  display: flex;
  align-items: center;
  padding: 15px 30px;
  background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav-brand {
  font-size: 20px;
  font-weight: bold;
  margin-right: 40px;
}

.nav-link {
  color: rgba(255,255,255,0.85);
  text-decoration: none;
  margin-right: 25px;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-size: 16px;
}

.nav-link:hover {
  background: rgba(255,255,255,0.15);
  color: white;
}

.nav-link.active {
  background: rgba(255,255,255,0.25);
  color: white;
  font-weight: 500;
}

.main-content {
  min-height: calc(100vh - 64px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 40px;
  background: #f8f9fa;
}

/* 路由切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
