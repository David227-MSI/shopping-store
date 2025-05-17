<template>
  <div>
    <Header />
    <main class="container">
      <router-view /> <!-- 頁面內容將在此渲染 -->
    </main>
    <!-- <BackToTop /> -->
    <Footer />
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Header from '@/components/common/Header.vue'
import Nav from '@/components/common/Nav.vue'
import BackToTop from '@/components/common/BackToTop.vue'
import Footer from '@/components/common/Footer.vue'


</script>


<style scoped>
/* 可加全局樣式調整 */
</style>
