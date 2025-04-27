<!-- src/components/NotificationModal.vue -->
<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <button @click="$emit('close')" class="close-button">✖️</button>
      <h2 class="modal-title">{{ notification.title }}</h2>
      <span class="notice-type-badge">
        {{ noticeTypeText(notification.noticeType) }}
      </span>
      <p class="modal-content-text">{{ notification.content }}</p>
      <div class="created-at">訊息發送時間：{{ formatDate(notification.createdAt) }}</div>
      <div v-if="notification.isRead" class="read-status read">已讀</div>
      <div v-else class="read-status unread">未讀</div>
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
    default:
      return type
  }
}
</script>

<style scoped>
/* 模態框背景遮罩 */
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.6); /* 稍深的遮罩，增加對比 */
  z-index: 50;
  backdrop-filter: blur(4px); /* 模糊效果，提升現代感 */
  transition: opacity 0.3s ease;
}

/* 模態框內容 */
.modal-content {
  background-color: #2a2a3e; /* 與父元件卡片背景一致 */
  padding: 1.5rem;
  border-radius: 0.75rem; /* 稍大的圓角，顯得更柔和 */
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3); /* 與父元件懸停陰影對齊 */
  width: 28rem; /* 略寬於原始 w-96，顯得更大氣 */
  max-width: 90%; /* 適應小螢幕 */
  position: relative;
  color: #e0e0e0; /* 與父元件文字顏色一致 */
  transition: transform 0.3s ease, opacity 0.3s ease;
}

/* 模態框出現動畫 */
.modal-content {
  transform: translateY(20px);
  opacity: 0;
}
.modal-overlay .modal-content {
  transform: translateY(0);
  opacity: 1;
}

/* 關閉按鈕 */
.close-button {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  color: #9ca3af; /* 與父元件次要文字一致 */
  font-size: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease, transform 0.2s ease;
}

.close-button:hover {
  color: #ffffff; /* 懸停時變白，與父元件強調色一致 */
  transform: scale(1.2); /* 輕微放大，增加交互感 */
}

/* 標題 */
.modal-title {
  font-size: 1.5rem; /* 保持與原始一致 */
  font-weight: 700; /* 與父元件標題字重一致 */
  color: #ffffff; /* 與父元件標題顏色一致 */
  margin-bottom: 0.75rem;
  letter-spacing: 0.025em; /* 與父元件標題間距一致 */
}

/* 通知類型標籤 */
.notice-type-badge {
  display: inline-block;
  background-color: #3a3a5a; /* 與父元件邊框色調一致 */
  color: #e0e0e0; /* 與父元件文字一致 */
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  margin-bottom: 1rem;
  transition: background-color 0.2s ease;
}

.notice-type-badge:hover {
  background-color: #555590; /* 與父元件焦點背景一致 */
}

/* 內容文字 */
.modal-content-text {
  color: #d1d5db; /* 與父元件次要文字一致 */
  white-space: pre-line;
  line-height: 1.6; /* 增加行距，提升可讀性 */
}

/* 建立時間 */
.created-at {
  font-size: 0.875rem;
  color: #9ca3af; /* 與父元件次要資訊一致 */
  margin-top: 1rem;
}

/* 閱讀狀態 */
.read-status {
  font-size: 0.875rem;
  margin-top: 0.25rem;
  font-weight: 500;
}

.read-status.read {
  color: #34d399; /* 更現代的綠色，與紅色形成對比 */
}

.read-status.unread {
  color: #f87171; /* 更柔和的紅色，提升精緻感 */
}
</style>