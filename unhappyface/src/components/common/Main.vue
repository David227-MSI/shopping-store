<template>
    <div>
      <Header />
      <Nav />
      <main class="container">
        <router-view />
      </main>
      <Footer />
      <BackToTop />
    </div>
  </template>
  
  <script setup>
  import Header from '@/components/common/Header.vue'
/*   import Nav from '@/components/common/Nav.vue' */
  import Footer from '@/components/common/Footer.vue'
  import BackToTop from '@/components/common/BackToTop.vue'
  </script>
  
  <style scoped>
  /* 可以放少量特定樣式，主題樣式建議集中在 styles.css */
  </style>
  