<template>
  <div class="banner-swiper">
    <div class="swiper-container" ref="swiperRef">
      <div class="swiper-wrapper">
        <div class="swiper-slide" v-for="(banner, index) in banners" :key="index">
          <img :src="banner" :alt="`Banner ${index + 1}`" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Swiper from 'swiper/bundle'
import 'swiper/css/bundle'

const props = defineProps({
  banners: Array
})

const swiperRef = ref(null)

onMounted(() => {
  new Swiper(swiperRef.value, {
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false
    },
    speed: 600
  })
})
</script>

<style scoped>
.banner-swiper {
  height: 450px;  /* ✅ 原本可能是 400px，改小一些 */
  max-width: 1200px;
  margin: 10px auto;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f4f0; /* 可自訂背景色 */
}

.swiper-slide {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.swiper-slide img {
  width: 100%;     /* ✅ 填滿整個寬度 */
  height: 100%;    /* ✅ 高度也撐滿（會變形） */
  object-fit: fill; /* ✅ 強制圖片拉伸填滿容器 */
  display: block;
}
.swiper-container {
  width: 100%;
  height: 100%; /* ✅ 這是關鍵，讓 Swiper 有高度可呈現 */
}
</style>
