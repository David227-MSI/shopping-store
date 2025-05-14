<template>
  <div class="main-media-container">
    <template v-if="mediaItem?.mediaType === 'IMAGE' && mediaItem?.mediaUrl">
      <img :src="mediaItem.mediaUrl" :alt="mediaItem.altText || 'Product Image'" class="main-media zoomable-image"
        @mousemove="moveLens" @mouseenter="showLens = true" @mouseleave="handleMouseLeaveImage" ref="zoomTarget" />
      <div v-show="showLens && mediaItem?.mediaType === 'IMAGE'" class="lens" :style="lensStyle"></div>
    </template>

    <template v-else-if="mediaItem?.mediaType === 'VIDEO' && mediaItem?.mediaUrl">
      <video :src="mediaItem.mediaUrl" controls autoplay loop muted playsinline
        :alt="mediaItem.altText || 'Product Video'" class="main-media video-player" ref="videoPlayer"
        @mouseenter="showLens = false" @mouseleave="showLens = false"></video>
    </template>

    <div v-else class="main-media-placeholder">
      <span>No Media Available</span>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  mediaItem: {
    type: Object,
    default: () => ({ mediaUrl: '', mediaType: 'IMAGE', altText: '' })
  }
});

const zoomTarget = ref(null);
const videoPlayer = ref(null);

const showLens = ref(false);
const lensX = ref(0);
const lensY = ref(0);

const zoomFactor = 2.25;

const moveLens = (event) => {
  if (props.mediaItem?.mediaType === 'IMAGE' && zoomTarget.value) {
    const imgRect = zoomTarget.value.getBoundingClientRect();

    const mouseX = event.clientX - imgRect.left;
    const mouseY = event.clientY - imgRect.top;

    lensX.value = mouseX;
    lensY.value = mouseY;
  }
};

const handleMouseLeaveImage = () => {
  if (props.mediaItem?.mediaType === 'IMAGE') {
    showLens.value = false;
  }
};


const lensStyle = computed(() => {
  const size = 150;

  if (props.mediaItem?.mediaType !== 'IMAGE' || !zoomTarget.value) {
    return {};
  }

  const img = zoomTarget.value;

  const imgWidth = img.clientWidth;
  const imgHeight = img.clientHeight;


  return {
    position: 'absolute',
    top: `${lensY.value - size / 2}px`,
    left: `${lensX.value - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    border: '1px solid #ccc',
    borderRadius: '50%',
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: 10,

    backgroundImage: `url(${props.mediaItem.mediaUrl})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${imgWidth * zoomFactor}px ${imgHeight * zoomFactor}px`,
    backgroundPosition: `-${lensX.value * zoomFactor - size / 2}px -${lensY.value * zoomFactor - size / 2}px`
  };
});


watch(() => props.mediaItem, (newMedia, oldMedia) => {
  if (oldMedia?.mediaType === 'VIDEO' && videoPlayer.value) {
    videoPlayer.value.pause();
  }

  if (newMedia?.mediaType === 'VIDEO' && newMedia?.mediaUrl !== oldMedia?.mediaUrl) {
    setTimeout(() => {
      if (videoPlayer.value) {
        videoPlayer.value.load();
        videoPlayer.value.play().catch(e => console.error("Error playing new video:", e));
      }
    }, 50);
  }

  if (newMedia?.mediaType !== oldMedia?.mediaType) {
    showLens.value = false;
  }

}, { deep: true });

onMounted(() => {
  if (props.mediaItem?.mediaType === 'VIDEO') {
    setTimeout(() => {
      if (videoPlayer.value) {
        videoPlayer.value.play().catch(e => console.error("Error playing video on mount:", e));
      }
    }, 50);
  }
});

onUnmounted(() => {
  if (videoPlayer.value) {
    videoPlayer.value.pause();
    videoPlayer.value.src = '';
    videoPlayer.value.load();
  }
});

</script>

<style scoped>
.main-media-container {
  width: 400px;
  height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  background-color: #f8f8f8;
}

.main-media {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.main-media-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  color: #ccc;
  font-size: 18px;
}

.video-player {
  background-color: black;
  object-fit: contain;
}

.lens {
  
}
</style>