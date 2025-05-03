<template>
  <div class="notification">
    <div class="notification-image">
      <img
        v-if="notification?.imageData"
        :src="getImageSrc(notification.imageData)"
        alt="notification image"
        class="notification-img"
      />
      <span v-else class="no-image">無圖片</span>
    </div>

    <div class="notification-content">
      <div class="notification-header">
        <h3 class="notification-title">{{ notification?.title || '無標題' }}</h3>
        <span class="status-tag" :class="statusClass">{{ formatStatus }}</span>
      </div>

      <div class="notification-details">
        <p class="detail-item">
          <strong>類型:</strong> {{ formatNoticeType }}
        </p>
        <p class="detail-item">
          <strong>日期:</strong> {{ formatDate(notification?.createdAt) }}
        </p>
        <p class="detail-item">
          <strong>狀態:</strong> {{ notification?.isRead ? '已讀' : '未讀' }}
        </p>
      </div>

      <div class="notification-actions">
        <button class="action-button" @click="emit('open-detail', notification)">
          查看詳情
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  notification: {
    type: Object,
    required: true,
    default: () => ({}),
  },
});

const emit = defineEmits(['open-detail']);

// Format notice type
const formatNoticeType = computed(() => {
  const types = {
    ORDER: '訂單通知',
    PROMOTION: '促銷通知',
  };
  return types[props.notification?.noticeType] || '未知類型';
});

// Format status
const formatStatus = computed(() => {
  return props.notification?.isRead ? '已讀' : '未讀';
});

// Status class
const statusClass = computed(() => {
  return props.notification?.isRead ? 'status-read' : 'status-unread';
});

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '未知日期';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

// Get image source
const getImageSrc = (base64) => {
  if (!base64) return '';
  return base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`;
};
</script>

<style scoped>
.notification {
  display: flex;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
  animation: float-in 0.5s ease-out;
  overflow: hidden;
}

.notification:hover {
  transform: translateY(-5px);
}

.notification-image {
  flex: 0 0 120px;
  text-align: center;
  background: var(--background);
  padding: 10px;
}

.notification-img {
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

.notification-content {
  flex: 1;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.notification-title {
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

.status-read {
  background-color: #6b7280;
}

.status-unread {
  background-color: #4CAF50;
}

.notification-details {
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

.notification-actions {
  text-align: right;
}

@media (max-width: 768px) {
  .notification {
    flex-direction: column;
    padding: 10px;
  }

  .notification-image {
    flex: 0 0 auto;
    width: 100%;
  }

  .notification-img {
    height: 120px;
  }

  .no-image {
    line-height: normal;
    padding: 10px 0;
  }

  .notification-title {
    font-size: 1rem;
  }

  .detail-item {
    font-size: 0.85rem;
  }
}
</style>