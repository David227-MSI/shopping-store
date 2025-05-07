<template>

  <Navbar />
  <RouterView />

</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Navbar from '@/components/order/Navbar.vue';
</script>

<style scoped>
</style>
