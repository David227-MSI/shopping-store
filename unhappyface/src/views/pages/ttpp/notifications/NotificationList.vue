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
          />
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
      </div>
    </div>

    <!-- 通知清單 -->
    <div class="notification-list">
      <div
        v-for="item in notifications"
        :key="item.id"
        class="notification-card"
        @click="openDetail(item.id)"
      >
        <h2 class="notification-title">{{ item.title }}</h2>
        <div class="notification-info">
          <span class="notice-type">{{ formatNoticeType(item.noticeType) }}</span>
          <span class="created-date">{{ formatDate(item.createdAt) }}</span>
          <span v-if="item.isRead" class="status read">已讀</span>
          <span v-else class="status unread">未讀</span>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <NotificationModal
      v-if="showModal"
      :notification="selectedNotification"
      @close="showModal = false"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import NotificationModal from '@/components/ttpp/NotificationDetailModal.vue'

const filters = ref({
  userId: 1001,
  isRead: '',
  title: '',
})

const notifications = ref([])
const selectedNotification = ref(null)
const showModal = ref(false)

const search = async () => {
  try {
    // user query for notification list
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/notifications/user/query`, filters.value)
    notifications.value = res.data.data.notificationList
  } catch (err) {
    Swal.fire('查詢失敗', err.response.data.message || '錯誤', 'error')
  }
}

// open modal
const openDetail = async (id) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications/user/notification/${id}`)
    selectedNotification.value = res.data.data
    showModal.value = true
  } catch (err) {
    Swal.fire('查詢細節失敗', err.response.data.message || '錯誤', 'error')
  }
}

// format date to locale
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}


// listen filters 
watch(filters, search, { deep: true })

search()
</script>




<style scoped>
.container {
  animation: float-in 0.5s ease-out;
}

.search-bar {
  background: #fffaf4;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-input,
.filter-select {
  transition: border-color 0.3s;
}

.search-input:focus,
.filter-select:focus {
  border-color: var(--accent);
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

.notification-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.notification-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.05);
  padding: 15px;
  transition: transform 0.2s;
  cursor: pointer;
}

.notification-card:hover {
  transform: translateY(-5px);
}

.notification-title {
  font-size: 1.2rem;
  color: var(--primary);
  margin-bottom: 10px;
  font-weight: bold;
}

.notification-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 0.9rem;
  color: var(--text-dark);
}

.notice-type {
  background-color: var(--accent);
  color: var(--text-light);
  padding: 4px 8px;
  border-radius: 8px;
  display: inline-block;
}

.status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.85rem;
}

.read {
  background-color: #ccc;
  color: #fff;
}

.unread {
  background-color: #4CAF50;
  color: #fff;
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
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}
</style>
