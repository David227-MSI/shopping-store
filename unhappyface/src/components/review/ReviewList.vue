<!-- ✅ ReviewList.vue -->
<template>
    <div class="review-section">
      <h2>💬 使用者評論</h2>
      <div v-if="reviews.length" class="review-list">
        <div v-for="review in reviews" :key="review.id" class="review">
          <template v-if="review.visible === undefined || review.visible">
            <p><strong>{{ review.userName || '使用者' }}</strong>
              <span v-if="review.verified" class="verified-tag">已購買</span>
              <span class="created-date">{{ formatDate(review.createdAt) }}</span>
            </p>
            <p>
              品質：{{ renderStars(review.scoreQuality) }}<br>
              描述符合：{{ renderStars(review.scoreDescription) }}<br>
              運送速度：{{ renderStars(review.scoreDelivery) }}
            </p>
            <p v-if="review.tagName">#{{ review.tagName }}</p>
            <p class="review-text">{{ review.reviewText }}</p>
          </template>
          <hr>
        </div>
      </div>
      <p v-else>尚無評論。</p>
    </div>
  </template>
  
  <script setup>
  const props = defineProps({ reviews: Array })
  const renderStars = (count) => '★'.repeat(count || 0)
  const formatDate = (dateStr) => new Date(dateStr).toISOString().split('T')[0]
  </script>