<template>
  <div ref="container" class="lottie-player"></div>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue';
import lottie from 'lottie-web';

// 傳入動畫資料
const props = defineProps({
  animationData: Object,
  loop: {
    type: Boolean,
    default: false
  },
  autoplay: {
    type: Boolean,
    default: true
  }
});

const container = ref(null);
let animationInstance = null;

onMounted(() => {
  animationInstance = lottie.loadAnimation({
    container: container.value,
    renderer: 'svg',
    loop: props.loop,
    autoplay: props.autoplay,
    animationData: props.animationData
  });
});

onBeforeUnmount(() => {
  if (animationInstance) {
    animationInstance.destroy();
  }
});
</script>

<style scoped>
.lottie-player {
  width: 300px;
  height: 300px;
  margin: 0 auto;
}
</style>
