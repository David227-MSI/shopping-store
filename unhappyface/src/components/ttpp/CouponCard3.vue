<template>
  <div class="coupon">
    <div class="coupon-image">
      <img
        v-if="coupon?.couponMedia?.mediaData"
        :src="getImageSrc(coupon.couponMedia.mediaData)"
        alt="coupon image"
        class="coupon-img"
      />
      <span v-else class="no-image">無圖片</span>
    </div>

    <div class="coupon-content">
      <div class="coupon-header">
        <h3 class="coupon-title">{{ formatCouponTitle }}</h3>
        <span class="status-tag" :class="statusClass">{{ formatStatus }}</span>
      </div>

      <div class="coupon-details">
        <p class="detail-item">
          <strong>適用:</strong> {{ formatApplicableType }}
        </p>
        <p class="detail-item">
          <strong>有效期限:</strong> {{ formatDateRange }}
        </p>
        <p class="detail-item">
          <strong>所有權:</strong> {{ coupon?.tradeable ? '可轉移' : '不可轉移' }}
        </p>
      </div>

      <div class="coupon-actions" v-if="coupon.isUsed || coupon.tradeable">
        <button
          class="action-button"
          v-if="coupon.isUsed"
          @click="emit('open-detail', coupon)"
        >
          查看詳情
        </button>

        <button
          class="action-button"
          v-else-if="coupon.tradeable"
          @click="emit('transfer-coupon', coupon)"
        >
          轉移優惠券
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  coupon: {
    type: Object,
    required: true,
    default: () => ({}),
  },
})

const emit = defineEmits(['open-detail', 'transfer-coupon'])

const formatCouponTitle = computed(() => {
  if (!props.coupon) return '無折扣資訊'
  const { discountType, discountValue, maxDiscount } = props.coupon
  if (discountType === 'VALUE') {
    return `$${discountValue} 折扣`
  }
  return `${discountValue}% 折扣${maxDiscount ? ` (最高 $${maxDiscount})` : ''}`
})

const formatApplicableType = computed(() => {
  if (!props.coupon) return '未知類型'
  const types = {
    ALL: '全品項適用',
    BRAND: '特定品牌',
    PRODUCT: '特定商品',
    CATEGORY: '特定類別',
  }
  return types[props.coupon.applicableType] || props.coupon.applicableType || '未知'
})

const formatDateRange = computed(() => {
  if (!props.coupon) return '無日期'
  const { startTime, endTime } = props.coupon
  return `${formatDate(startTime)} - ${formatDate(endTime)}`
})

const formatDate = (dateString) => {
  if (!dateString) return '無'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

const isExpiring = (endTime) => {
  const end = new Date(endTime)
  const now = new Date()
  const diffDays = (end - now) / (1000 * 60 * 60 * 24)
  return diffDays > 0 && diffDays <= 7
}

const isExpired = (endTime) => {
  const end = new Date(endTime)
  const now = new Date()
  return end < now
}

const formatStatus = computed(() => {
  const { isUsed, endTime, tradeable } = props.coupon
  if (isUsed) return '已使用'
  if (isExpiring(endTime)) return '即將到期'
  if (isExpired(endTime)) return '已過期'
  return tradeable ? '可交易' : '有效'
})

const statusClass = computed(() => {
  const { isUsed, endTime } = props.coupon
  if (isUsed) return 'status-used'
  if (isExpiring(endTime)) return 'status-expiring'
  if (isExpired(endTime)) return 'status-expired'
  return 'status-valid'
})

const getImageSrc = (base64) => {
  if (!base64) return ''
  return base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`
}
</script>











<style scoped>
.coupon {
  display: flex;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
  animation: float-in 0.5s ease-out;
  overflow: hidden;
}

.coupon:hover {
  transform: translateY(-5px);
}

.coupon-image {
  flex: 0 0 120px;
  text-align: center;
  background: var(--background);
  padding: 10px;
}

.coupon-img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.no-image {
  color: var(--text-dark);
  font-size: 0.9rem;
  line-height: 100px;
}

.coupon-content {
  flex: 1;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.coupon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.coupon-title {
  color: var(--primary);
  font-size: 1.2rem;
  margin: 0;
  font-weight: bold;
}

.status-tag {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: bold;
  color: var(--text-light);
}

.status-valid {
  background-color: #4CAF50;
}

.status-used {
  background-color: #dc2626;
}

.status-expiring {
  background-color: #f59e0b;
}

.status-expired {
  background-color: #6b7280;
}

.status-unknown {
  background-color: #6b7280;
}

.coupon-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-item {
  color: var(--text-dark);
  font-size: 0.9rem;
  margin: 0;
}

.detail-item strong {
  color: var(--accent);
}

.coupon-actions {
  text-align: right;
}

@media (max-width: 768px) {
  .coupon {
    flex-direction: column;
    padding: 10px;
  }

  .coupon-image {
    flex: 0 0 auto;
    width: 100%;
  }

  .coupon-img {
    height: 120px;
  }

  .no-image {
    line-height: normal;
    padding: 10px 0;
  }

  .coupon-title {
    font-size: 1rem;
  }

  .detail-item {
    font-size: 0.85rem;
  }
}
</style>