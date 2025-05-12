<template>
    <button
      v-show="show"
      @click="scrollToTop"
      class="back-to-top-button"
      title="回到頂端"
    >
      ⬆
    </button>
  </template>

  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue'

  const show = ref(false)

  const handleScroll = () => {
    show.value = window.scrollY > 200
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  onMounted(() => window.addEventListener('scroll', handleScroll))
  onUnmounted(() => window.removeEventListener('scroll', handleScroll))
  </script>

  <style scoped>
  .back-to-top-button {
    position: fixed;
    bottom: 40px;
    right: 40px;
    width: 60px;
    height: 60px;
    font-size: 24px;
    background-color: #8B4513;
    color: #ffffff;
    border: none;
    border-radius: 50%;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    cursor: pointer;
    opacity: 0.8;
    transition: opacity 0.3s, transform 0.3s;
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .back-to-top-button:hover {
    opacity: 1;
    transform: scale(1.2);
    background-color: #A0522D;
  }
  </style>
