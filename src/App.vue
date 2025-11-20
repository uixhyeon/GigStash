<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useDarkMode } from './composables/useDarkMode'

// 다크모드 초기화
const { initDarkMode } = useDarkMode()

onMounted(() => {
  initDarkMode()
})
</script>

<template>
  <!-- 라우터가 레이아웃을 결정 -->
  <RouterView />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
}
</style>
