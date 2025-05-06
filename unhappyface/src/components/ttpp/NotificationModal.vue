<!-- src/components/NotificationModal.vue -->
<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <button class="close-button" @click="$emit('close')">✖️</button>
      <h2 class="modal-title">{{ notification.title }}</h2>
      <span class="notice-type">{{ noticeTypeText(notification.noticeType) }}</span>
      <p class="modal-text">{{ notification.content }}</p>
      <div class="created-at">訊息發送時間：{{ formatDate(notification.createdAt) }}</div>

    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  notification: {
    type: Object,
    required: true
  }
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}

const noticeTypeText = (type) => {
  switch (type) {
    case 'ORDER':
      return '下單通知'
    case 'PROMOTION':
      return '促銷通知'
    case 'WISHLIST':
      return '追蹤通知'
    case 'SUBSCRIPTION':
      return '訂閱通知'
    default:
      return type
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
  position: relative;
  animation: float-in 0.3s ease-out;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--text-dark);
  cursor: pointer;
  transition: color 0.3s;
}

.close-button:hover {
  color: var(--primary);
}

.modal-title {
  font-size: 1.5rem;
  color: var(--primary);
  margin-bottom: 10px;
  font-weight: bold;
}

.notice-type {
  display: inline-block;
  background-color: var(--accent);
  color: var(--text-light);
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.modal-text {
  font-size: 1rem;
  line-height: 1.5;
  color: var(--text-dark);
  margin-bottom: 15px;
}

.created-at {
  font-size: 0.85rem;
  color: var(--text-dark);
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    padding: 15px;
  }

  .modal-title {
    font-size: 1.3rem;
  }

  .modal-text {
    font-size: 0.95rem;
  }
}
</style>