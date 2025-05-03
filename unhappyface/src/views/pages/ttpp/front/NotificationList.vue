<template>
  <div class="container">
    <h1>站內通知</h1>

    <!-- 搜尋欄位 -->
    <div class="search-bar">
      <div class="filter-left">
        <div>
          <input
            v-model="filters.title"
            type="text"
            placeholder="輸入標題關鍵字..."
            class="search-input"
            maxlength="100"
            @input="validateField('title')"
          />
          <div class="error" v-if="errors.title">{{ errors.title }}</div>
        </div>
        <div>
          <select v-model="filters.noticeType" class="filter-select">
            <option :value="null">全部種類</option>
            <option value="ORDER">訂單通知</option>
            <option value="PROMOTION">促銷通知</option>
          </select>
        </div>
      </div>
      <div class="filter-right">
        <div class="radio-group">
          <label class="radio-label">
            <input type="radio" :value="null" v-model="filters.isRead" name="readStatus" />
            全部
          </label>
          <label class="radio-label">
            <input type="radio" :value="true" v-model="filters.isRead" name="readStatus" />
            已讀
          </label>
          <label class="radio-label">
            <input type="radio" :value="false" v-model="filters.isRead" name="readStatus" />
            未讀
          </label>
        </div>
        <button class="reset-button" type="button" @click="resetFilters">清空篩選</button>
      </div>
    </div>

    <!-- 批量操作 -->
    <div class="bulk-actions " v-if="notifications.length > 0">
      <button class="action-button" @click="markAllAsRead">全部標示為已讀</button>
      <button class="action-button delete-all" @click="deleteAll">全部刪除</button>
    </div>

    <!-- 通知清單 -->
    <div class="notification-list">
      <NotificationCard
        class="notification-card"
        v-for="item in notifications"
        :key="item.id"
        :notification="item"
        @open-detail="openDetail"
        @delete="deleteNotification"
      />
    </div>

    <!-- 空狀態 -->
    <div v-if="notifications.length === 0" class="empty-state">
      <p>暫無通知</p>
    </div>

    <!-- Modal -->
    <NotificationModal
      v-if="showModal"
      :notification="selectedNotification"
      @close="showModal = false"
      @delete="deleteNotification"
      @refresh="search"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import NotificationCard from '@/components/ttpp/NotificationCard.vue';
import NotificationModal from '@/components/ttpp/NotificationModal.vue';

const filters = ref({
  userId: 1002,
  title: '',
  noticeType: null,
  isRead: null,
});

const notifications = ref([]);
const selectedNotification = ref(null);
const showModal = ref(false);
const errors = ref({});

// Debounce function
const debounce = (fn, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

// Validate title input
const clientValidate = (field) => {
  if (field !== 'title') return null;
  const value = filters.value[field];
  if (value && value.length > 100) return '標題關鍵字不得超過100字';
  if (value && /[<>{}]/.test(value)) return '標題關鍵字包含無效字元';
  return null;
};

const validateField = debounce((field) => {
  errors.value[field] = clientValidate(field);
}, 300);

const search = debounce(async () => {
  errors.value = {};

  // Validate title
  const titleError = clientValidate('title');
  if (titleError) {
    errors.value.title = titleError;
    return;
  }

  try {
    const payload = Object.fromEntries(
      Object.entries(filters.value).filter(([_, value]) => value !== '' && value !== null)
    );
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/notifications/query`, payload);
    notifications.value = res.data.data.notificationList || [];
  } catch (err) {
    await Swal.fire({
      icon: 'error',
      title: '查詢失敗',
      text: err.response?.data?.message || '伺服器錯誤，請稍後再試',
      confirmButtonText: '確定',
    });
    notifications.value = [];
  }
}, 500);

// Open modal
const openDetail = async (notification) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/notifications/notification/${notification.id}`);
    selectedNotification.value = res.data.data;
    showModal.value = true;
  } catch (err) {
    await Swal.fire({
      icon: 'error',
      title: '查詢細節失敗',
      text: err.response?.data?.message || '伺服器錯誤，請稍後再試',
      confirmButtonText: '確定',
    });
  }
};

// Delete notification
const deleteNotification = async (notification) => {
  const result = await Swal.fire({
    icon: 'warning',
    title: '確認刪除',
    text: '確定要刪除此通知嗎？此操作無法復原。',
    showCancelButton: true,
    confirmButtonText: '確定',
    cancelButtonText: '取消',
  });

  if (!result.isConfirmed) return;

  try {
    await axios.delete(`${import.meta.env.VITE_API_URL}/api/user/notifications/delete/${notification.id}`);
    notifications.value = notifications.value.filter((n) => n.id !== notification.id);
    if (showModal.value && selectedNotification.value?.id === notification.id) {
      showModal.value = false;
    }
    await Swal.fire({
      icon: 'success',
      title: '刪除成功',
      text: '通知已刪除',
      confirmButtonText: '確定',
    });
  } catch (err) {
    await Swal.fire({
      icon: 'error',
      title: '刪除失敗',
      text: err.response?.data?.message || '伺服器錯誤，請稍後再試',
      confirmButtonText: '確定',
    });
  }
};

// Delete all notifications
const deleteAll = async () => {
  if (notifications.value.length === 0) return;

  const result = await Swal.fire({
    icon: 'warning',
    title: '確認全部刪除',
    text: '確定要刪除所有通知嗎？此操作無法復原。',
    showCancelButton: true,
    confirmButtonText: '確定',
    cancelButtonText: '取消',
  });

  if (!result.isConfirmed) return;

  try {
    // 確保 userId 存在且有效
    const userId = filters.value.userId;
    if (!userId) {
      throw new Error('用戶 ID 無效');
    }

    // 修正 API 端點，使用路徑參數傳遞 userId
    await axios.delete(`${import.meta.env.VITE_API_URL}/api/user/notifications/deleteAll/${userId}`);

    // 清空前端通知列表
    notifications.value = [];
    if (showModal.value) {
      showModal.value = false;
    }

    // 顯示成功提示
    await Swal.fire({
      icon: 'success',
      title: '刪除成功',
      text: '所有通知已刪除',
      confirmButtonText: '確定',
    });
  } catch (err) {
    // 處理錯誤
    await Swal.fire({
      icon: 'error',
      title: '刪除失敗',
      text: err.response?.data?.message || '伺服器錯誤，請稍後再試',
      confirmButtonText: '確定',
    });
  }
};

// Mark all as read
const markAllAsRead = async () => {
  if (notifications.value.every((n) => n.isRead)) return;

  const result = await Swal.fire({
    icon: 'question',
    title: '確認標示為已讀',
    text: '確定要將所有通知標示為已讀嗎？',
    showCancelButton: true,
    confirmButtonText: '確定',
    cancelButtonText: '取消',
  });

  if (!result.isConfirmed) return;

  try {
    // Placeholder: Assumes a mark-all-as-read endpoint; adjust when implemented
    await axios.post(`${import.meta.env.VITE_API_URL}/api/user/notifications/mark-all-read`, {
      userId: filters.value.userId,
    });
    notifications.value = notifications.value.map((n) => ({ ...n, isRead: true }));
    await Swal.fire({
      icon: 'success',
      title: '操作成功',
      text: '所有通知已標示為已讀',
      confirmButtonText: '確定',
    });
  } catch (err) {
    await Swal.fire({
      icon: 'error',
      title: '操作失敗',
      text: err.response?.data?.message || '伺服器錯誤，請稍後再試',
      confirmButtonText: '確定',
    });
  }
};

// Reset filters
const resetFilters = () => {
  filters.value = {
    userId: 1002,
    title: '',
    noticeType: null,
    isRead: null,
  };
  errors.value = {};
};

// Watch filters
watch(filters, search, { deep: true });

// Initial search
search();
</script>

<style scoped>
.container {
  animation: float-in 0.5s ease-out;
}

.search-bar {
  background: #f9f5f0;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-input,
.filter-select {
  border: 1px solid #e0d8c8;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.search-input:focus,
.filter-select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 4px rgba(164, 117, 81, 0.3);
  outline: none;
}

.radio-group {
  display: flex;
  gap: 15px;
  align-items: center;
}

.radio-label {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: var(--text-dark);
}

.radio-label input {
  margin-right: 5px;
}

.bulk-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.delete-all {
  background-color: #dc2626;
  border-color: #dc2626;
  color: var(--text-light);
}

.delete-all:hover {
  background-color: #b91c1c;
  border-color: #b91c1c;
}

.notification-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.notification-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}

.notification-card:hover {
  transform: translateY(-5px);
}

.empty-state {
  text-align: center;
  color: var(--text-dark);
  font-size: 1rem;
  margin: 20px 0;
  animation: float-in 0.5s ease-out;
}

.error {
  color: #dc2626;
  font-size: 0.85rem;
  margin-top: 4px;
}

@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-left,
  .filter-right {
    flex-direction: column;
    gap: 10px;
  }

  .notification-list {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }

  .bulk-actions {
    justify-content: center;
  }
}
</style>