<!-- 回頂端按鈕 SVG版 -->
<template>
    <button 
      id="backToTopBtn" 
      title="回頂端" 
      @click="scrollToTopAnimated" 
      v-show="showBackToTop"
      class="back-to-top-button"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
        <path d="M12 4l-8 8h5v8h6v-8h5z"/>
      </svg>
    </button>
</template>

<script setup>

const showBackToTop = ref(false);

// 畫面載入 / 離開
const handleScroll = () => {
  showBackToTop.value = window.scrollY > 200;
}

// 回到頂端功能
const scrollToTopAnimated = () => {
  const scrollDuration = 500;
  const scrollStep = -window.scrollY / (scrollDuration / 15);

  const scrollInterval = setInterval(() => {
    if (window.scrollY !== 0) {
      window.scrollBy(0, scrollStep);
    } else {
      clearInterval(scrollInterval);
      triggerShakeAnimation();
    }
  }, 15);
};

</script>

<style scoped>
#backToTopBtn:hover {
  background-color: #4B2E1E; /* 深咖啡色 */
}

.back-to-top-button {
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 60px;
  height: 60px;
  font-size: 24px;
  background-color: #8B4513; /* 按鈕背景咖啡色 */
  color: #ffffff; /* ← 控制箭頭顏色（SVG會繼承這個） */
  border: none;
  border-radius: 50%;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.3s, transform 0.3s, background 0.3s;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: float-in 0.6s ease;
}

.back-to-top-button:hover {
  opacity: 1;
  transform: scale(1.2);
  background-color: #A0522D; /* hover 時再深一點 */
}
</style>