// ✅ ZoomImage.vue
<template>
  <div 
    class="zoom-container"
    @mousemove="moveLens"
    @mouseenter="showLens = true"
    @mouseleave="showLens = false"
    ref="zoomContainer"
  >
    <img :src="productImage" alt="商品圖片" ref="productImageRef" class="zoom-image">
    <div v-show="showLens" class="lens" :style="lensStyle"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const props = defineProps({ productImage: String })
const showLens = ref(false)
const lensX = ref(0)
const lensY = ref(0)
const zoomFactor = 2.25
const zoomContainer = ref(null)
const productImageRef = ref(null)

const moveLens = (event) => {
  const rect = zoomContainer.value.getBoundingClientRect()
  lensX.value = event.clientX - rect.left
  lensY.value = event.clientY - rect.top
}

const lensStyle = computed(() => {
  const size = 150
  return {
    top: `${lensY.value - size / 2}px`,
    left: `${lensX.value - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    backgroundImage: `url(${productImageRef.value?.src})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${productImageRef.value?.width * zoomFactor}px ${productImageRef.value?.height * zoomFactor}px`,
    backgroundPosition: `-${lensX.value * zoomFactor - size / 2}px -${lensY.value * zoomFactor - size / 2}px`
  }
})
</script>