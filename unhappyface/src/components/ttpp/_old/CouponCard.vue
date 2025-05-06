<template>
    <div class="wrap animate pop" @click="$emit('open-detail', coupon.id)">
      <div class="overlay">
        <div class="overlay-content animate slide-left delay-2">
          <h1 class="animate slide-left pop delay-4">{{ formatCouponTitle }}</h1>
          <p
            class="animate slide-left pop delay-5"
            style="color: white; margin-bottom: 2.5rem;"
          >
            {{ formatStatus }}
            <em>{{ formatApplicableType }}</em>
          </p>
        </div>
        <div class="image-content animate slide delay-5"></div>
        <div class="dots animate">
          <div class="dot animate slide-up delay-6"></div>
          <div class="dot animate slide-up delay-7"></div>
          <div class="dot animate slide-up delay-8"></div>
        </div>
      </div>
      <div class="text">
        <p>
          <!-- <img class="inset" src="https://assets.codepen.io/4787486/oak_1.jpg" alt="" /> -->
          {{ formatDateRange }}
        </p>
        <p>{{ formatApplicableType }}</p>
        <p>{{ formatCouponTitle }}</p>
      </div>
    </div>
  </template>









<script setup>
import { computed } from 'vue';

const props = defineProps({
  coupon: {
    type: Object,
    required: true,
    default: () => ({}), // Provide a default empty object
  },
});

const emit = defineEmits(['open-detail']);

// 格式化優惠券標題
const formatCouponTitle = computed(() => {
  if (!props.coupon) {
    return '無折扣資訊'; // Fallback if coupon is undefined
  }
  const { discountType, discountValue, maxDiscount } = props.coupon;
  if (discountType === 'VALUE') {
    return `$${discountValue} 折扣`;
  }
  return `${discountValue}% 折扣${maxDiscount ? ` (最高 $${maxDiscount})` : ''}`;
});

// 格式化適用類型
const formatApplicableType = computed(() => {
  if (!props.coupon) {
    return '未知類型';
  }
  const types = {
    ALL: '全品項適用',
    BRAND: '特定品牌',
    PRODUCT: '特定商品',
    CATEGORY: '特定類別',
  };
  return types[props.coupon.applicableType] || props.coupon.applicableType || '未知';
});

// 格式化日期範圍
const formatDateRange = computed(() => {
  if (!props.coupon) {
    return '無日期';
  }
  const { startTime, endTime } = props.coupon;
  return `${formatDate(startTime)} - ${formatDate(endTime)}`;
});

// 格式化單個日期
const formatDate = (dateString) => {
  if (!dateString) return '無';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

// 判斷是否即將到期
const isExpiring = (endTime) => {
  if (!endTime) return false;
  const end = new Date(endTime);
  const now = new Date();
  const daysUntilExpiry = (end - now) / (1000 * 60 * 60 * 24);
  return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
};

// 判斷是否已過期
const isExpired = (endTime) => {
  if (!endTime) return false;
  const end = new Date(endTime);
  const now = new Date();
  return end < now;
};

// 格式化狀態
const formatStatus = computed(() => {
  if (!props.coupon) {
    return '未知狀態';
  }
  const { isUsed, endTime, tradeable } = props.coupon;
  if (isUsed) return '已使用';
  if (isExpiring(endTime)) return '即將到期';
  if (isExpired(endTime)) return '已過期';
  return tradeable ? '可交易' : '有效';
});
</script>











<style scoped>
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}
body {
  min-height: 100vh;
  display: grid;
  place-items: center;
  margin: 0;
  padding: 0;
  background: linear-gradient(
    to right,
    #9b2d20,
    #ff6f61,
    #5c1e2d,
    #8a2e3a,
    #3e1b2f
  );
  font-family: "Martel Sans", sans-serif;
}

h1 {
  font-size: 5.25vmin;
  text-align: center;
  color: white;
}
p {
  font-size: max(10pt, 2.5vmin);
  line-height: 1.4;
  color: #fcdfc9;
  margin-bottom: 1.5rem;
}

.wrap {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  width: 59.5vmin; /* Reduced by 30% from 85vmin */
  height: 45.5vmin; /* Reduced by 30% from 65vmin */
  margin: 1rem auto; /* Adjusted margin for smaller cards */
  border: 6px solid; /* Slightly reduced border thickness */
  border-image: linear-gradient(
      -50deg,
      #9b2d20,
      #ff6f61,
      #5c1e2d,
      #8a2e3a,
      #3e1b2f
    )
    1;
  transition: 0.3s ease-in-out;
  position: relative;
  overflow: hidden;
}
.overlay {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  padding: 0.7rem 0.525rem; /* Reduced padding by 30% */
  background: #5c1e2d;
  transition: 0.4s ease-in-out;
  z-index: 1;
}
.overlay-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 10.5vmin; /* Reduced by 30% from 15vmin */
  height: 100%;
  padding: 0.35rem 0 0 0.35rem; /* Reduced padding by 30% */
  border: 2px solid; /* Slightly reduced border thickness */
  border-image: linear-gradient(
      to bottom,
      #bc3a38 5%,
      #5c1e2d 35% 65%,
      #bc3a38 95%
    )
    0 0 0 100%;
  transition: 0.3s ease-in-out 0.2s;
  z-index: 1;
}
.image-content {
  position: absolute;
  top: 0;
  right: 0;
  width: 42vmin; /* Reduced by 30% from 60vmin */
  height: 100%;
  background-image: url("https://media.istockphoto.com/id/2161406468/zh/%E5%90%91%E9%87%8F/golden-ticket-gold-vector-coupon-sticker-or-discount-tag-mockup-isolated-on-black-background.jpg?s=1024x1024&w=is&k=20&c=fb9VVR3iBEWU0CBOGpr90Ro_JxUspIP0qTXU4sJtHJU=");
  background-size: cover;
  transition: 0.3s ease-in-out;
}
.inset {
  max-width: 50%;
  margin: 0.175em 0.7em 0.7em 0; /* Reduced margins by 30% */
  border-radius: 0.25em;
  float: left;
}
.dots {
  position: absolute;
  bottom: 0.7rem; /* Reduced by 30% from 1rem */
  right: 1.4rem; /* Reduced by 30% from 2rem */
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  width: 38.5px; /* Reduced by 30% from 55px */
  height: 2.8vmin; /* Reduced by 30% from 4vmin */
  transition: 0.3s ease-in-out 0.3s;
}
.dot {
  width: 9.8px; /* Reduced by 30% from 14px */
  height: 9.8px; /* Reduced by 30% from 14px */
  background: #ffd700; /* 金色 */
  border: 1px solid indigo;
  border-radius: 50%;
  transition: 0.3s ease-in-out 0.3s;
}
.text {
  position: absolute;
  top: 0;
  right: 0;
  width: 42vmin; /* Reduced by 30% from 60vmin */
  height: 100%;
  padding: 2.1vmin 2.8vmin; /* Reduced by 30% from 3vmin 4vmin */
  background: #fff;
  box-shadow: inset 1px 1px 15px 0 rgba(0 0 0 / 0.4);
  overflow-y: scroll;
}
.wrap:hover .overlay {
  transform: translateX(-42vmin); /* Adjusted for 30% smaller width */
}
.wrap:hover .image-content {
  width: 21vmin; /* Reduced by 30% from 30vmin */
}
.wrap:hover .overlay-content {
  border: none;
  transition-delay: 0.2s;
  transform: translateX(42vmin); /* Adjusted for 30% smaller width */
}
.wrap:hover .dots {
  transform: translateX(0.7rem); /* Reduced by 30% from 1rem */
}
.wrap:hover .dots .dot {
  background: white;
}
.animate {
  animation-duration: 0.7s;
  animation-timing-function: cubic-bezier(0.26, 0.53, 0.74, 1.48);
  animation-fill-mode: backwards;
}
.pop {
  animation-name: pop;
}
@keyframes pop {
  0% {
    opacity: 0;
    transform: scale(0.5, 0.5);
  }
  100% {
    opacity: 1;
    transform: scale(1, 1);
  }
}
.slide {
  animation-name: slide;
}
@keyframes slide {
  0% {
    opacity: 0;
    transform: translate(4em, 0);
  }
  100% {
    opacity: 1;
    transform: translate(0, 0);
  }
}
.slide-left {
  animation-name: slide-left;
}
@keyframes slide-left {
  0% {
    opacity: 0;
    transform: translate(-40px, 0);
  }
  100% {
    opacity: 1;
    transform: translate(0, 0);
  }
}
.slide-up {
  animation-name: slide-up;
}
@keyframes slide-up {
  0% {
    opacity: 0;
    transform: translateY(3em);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.delay-1 {
  animation-delay: 0.2s;
}
.delay-2 {
  animation-delay: 0.4s;
}
.delay-3 {
  animation-delay: 0.6s;
}
.delay-4 {
  animation-delay: 0.8s;
}
.delay-5 {
  animation-delay: 1.0s;
}
.delay-6 {
  animation-delay: 1.2s;
}
.delay-7 {
  animation-delay: 1.4s;
}
.delay-8 {
  animation-delay: 1.6s;
}
</style>
