<template>
    <div class="swiper mySwiper">
      <div class="swiper-wrapper">
        <div class="swiper-slide" v-for="(banner, index) in banners" :key="index">
          <img :src="banner" alt="banner圖片" />
        </div>
      </div>
      <div class="swiper-pagination"></div>
    </div>
  </template>
  
  <script setup>
  import { onMounted } from 'vue'
  import { defineProps } from 'vue'
  import Swiper from 'swiper'
  import 'swiper/css'
  
  const props = defineProps({
    banners: {
      type: Array,
      required: true
    }
  })
  
  onMounted(() => {
    new Swiper('.mySwiper', {
      loop: true,
      autoplay: { delay: 3000, disableOnInteraction: false },
      pagination: { el: '.swiper-pagination', clickable: true }
    })
  })
  </script>
  