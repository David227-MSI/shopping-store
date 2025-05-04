<template>
  <div class="review-entry">
    <button v-if="loading" disabled>載入中...</button>
    <button v-else-if="hasReview" @click="showModal = true">編輯我的評論</button>
    <button v-else @click="showModal = true">撰寫評論</button>
    <ReviewFormModal
      :show="showModal"
      :orderItemId="orderItemId"
      :userId="userId"
      @close="showModal = false"
      @submitted="checkReview"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import ReviewFormModal from './ReviewFormModal.vue' // 同目錄

const props = defineProps({
  orderItemId: Number,
  userId: Number
})

const showModal = ref(false)
const hasReview = ref(false)
const loading = ref(true)

async function checkReview() {
  try {
    const response = await axios.get(`/api/reviews/${props.orderItemId}/exists?userId=${props.userId}`)
    hasReview.value = response.data.data.exists
    console.log(`檢查評論是否存在 (orderItemId=${props.orderItemId}):`, response.data)
  } catch (e) {
    console.error('檢查評論失敗:', e)
    hasReview.value = false
  } finally {
    loading.value = false
  }
}

onMounted(checkReview)
</script>

<style scoped>
.review-entry {
  display: inline-block;
}
button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: var(--primary, #5C4033);
  color: #fff;
  cursor: pointer;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
button:hover:not(:disabled) {
  opacity: 0.9;
}
</style>