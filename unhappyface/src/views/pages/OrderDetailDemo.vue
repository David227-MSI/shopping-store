<template>
  <div class="order-detail-demo">
    <h2>訂單詳情 Demo</h2>
    <div v-if="loading" class="loading">載入中...</div>
    <div v-else-if="orderItems.length === 0" class="empty">無訂單項目</div>
    <div v-else>
      <div v-for="item in orderItems" :key="item.id" class="order-item">
        <div class="item-info">
          <p><strong>訂單項目 ID:</strong> {{ item.id }}</p>
          <p><strong>產品:</strong> {{ item.productName }}</p>
          <p><strong>狀態:</strong> {{ item.status }}</p>
          <p><strong>使用者 ID:</strong> {{ item.userId }}</p>
        </div>
        <!-- 僅對已完成訂單顯示評論入口 -->
        <ReviewEntry
          v-if="item.status === 'completed'"
          :orderItemId="item.id"
          :userId="item.userId"
          @reviewSubmitted="handleReviewSubmitted"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ReviewEntry from '@/components/ra/review/ReviewEntry.vue' // 正確路徑

// 模擬訂單資料（實際應從後端 API 或 props 取得）
const orderItems = ref([
  { id: 1, userId: 1003, productName: '商品 A', status: 'completed' },
  { id: 2, userId: 1003, productName: '商品 C', status: 'pending' }
])
const loading = ref(false)

// 處理評論提交事件（可選）
function handleReviewSubmitted({ orderItemId, reviewId }) {
  console.log(`評論已提交: orderItemId=${orderItemId}, reviewId=${reviewId}`)
}

// 模擬從後端獲取訂單資料
async function fetchOrderItems() {
  loading.value = true
  try {
    // 假設後端提供訂單 API，例如 GET /api/orders/details
    console.log('載入訂單資料:', orderItems.value)
  } catch (e) {
    console.error('載入訂單失敗:', e)
    orderItems.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchOrderItems)
</script>

<style scoped>
.order-detail-demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}
.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  background: #fff;
}
.item-info {
  flex: 1;
}
.item-info p {
  margin: 4px 0;
}
.loading, .empty {
  text-align: center;
  padding: 24px;
  color: #777;
}
</style>