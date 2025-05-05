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
  import Header from '@/components/Header.vue'
  import Nav from '@/components/Nav.vue'
  import Footer from '@/components/Footer.vue'
  import BackToTop from '@/components/BackToTop.vue'
  </script>
  
  <style scoped>
  /* 可以放少量特定樣式，主題樣式建議集中在 styles.css */
  </style>
  