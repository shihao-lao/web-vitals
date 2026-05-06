<script setup>
import HelloWorld from "./components/HelloWorld.vue";
function jsError() {
  const a = 10;
  throw new Error("这是一个js错误");
}
</script>

<template>
  <HelloWorld />
  <button @click="jsError">报出错误</button>
</template>
