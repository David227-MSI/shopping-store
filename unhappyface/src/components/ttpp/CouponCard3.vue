<template>
<div class="coupon">
  <div class="left">
    <div>{{formatStatus}}</div>
  </div>
  <div class="center">
    <div>
      <h2>{{ formatCouponTitle }}</h2>
      <h3>{{ formatApplicableType }}</h3>
      <small>Valid until </small>
    </div>
  </div>
  
  <div class="right">
    <div><p>快給我買</p></div>
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
  margin: 0;
  padding: 0;
}
body {
  background: lightblue;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.coupon {
  width: 400px;
  height: 200px;
  border-radius: 10px;
  overflow: hidden;
  margin: auto;
  filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.5));
  display: flex;
  align-items: stretch;
  position: relative;
  text-transform: uppercase;
}
.coupon::before,
.coupon::after {
  content: "";
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  z-index: -1;
}

.coupon::before {
  left: 0;
  background-image: radial-gradient(
    circle at 0 50%,
    transparent 25px,
    rgb(148, 39, 63) 26px
  );
}

.coupon::after {
  right: 0;
  background-image: radial-gradient(
    circle at 100% 50%,
    transparent 25px,
    rgb(102, 33, 28) 26px
  );
}

.coupon > div {
  display: flex;
  align-items: center;
  justify-content: center;
}

.left {
  width: 20%;
  border-right: 2px dashed rgba(0, 0, 0, 0.13);
}
.left div {
  transform: rotate(-90deg);
  white-space: nowrap;
  font-weight: bold;
}

.center {
  flex-grow: 1;
  text-align: center;
}

.right {
  width: 120px;
  background-image: radial-gradient(
    circle at 100% 50%,
    transparent 25px,
    #fff 26px
  );
}
.right div {
  font-family: "Libre Barcode 128 Text", cursive;
  font-size: 1.8rem;
  font-weight: 400;
  transform: rotate(-90deg);
}
.center h2 {
  /* background: #000; */
  color: gold;
  padding: 0 10px;
  font-size: 2.15rem;
  white-space: nowrap;
}

.center h3 {
  font-size: 2.15rem;
}
.center small {
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 2px;
}

@media screen and (max-width:500px){
  .coupon {
    display:grid;
    grid-template-columns:1fr;
  }
  .left div {
    transform: rotate(0deg);
  }
  .right div {
    transform: rotate(0deg);
    
  }
}
</style>