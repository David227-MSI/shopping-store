<template>
  <div class="notification-container">
    <h1 class="title">站內通知</h1>

    <!-- 搜尋欄位 -->
    <div class="filters">
      <input 
        v-model="filters.title" 
        type="text" 
        placeholder="輸入標題關鍵字..." 
        class="filter-input"
      />

      <select v-model="filters.noticeType" class="filter-select">
        <option :value=null>全部種類</option>
        <option value="ORDER">訂單通知</option>
        <option value="PROMOTION">促銷通知</option>
      </select>

      <div class="checkbox-group">
        <label class="checkbox-label">
          <input type="radio" :value="null" v-model="filters.isRead" name="readStatus" />
          全部
        </label>
        <label class="checkbox-label">
          <input type="radio" :value="true" v-model="filters.isRead" name="readStatus" />
          已讀
        </label>
        <label class="checkbox-label">
          <input type="radio" :value="false" v-model="filters.isRead" name="readStatus" />
          未讀
        </label>
      </div>

    </div>

    <!-- 通知清單 -->
    <div class="notification-list">
      <div 
        v-for="item in notifications" 
        :key="item.id" 
        class="notification-item"
        @click="openDetail(item.id)"
      >
        <h2 class="notification-title">{{ item.title }}</h2>
        <div class="notification-info">
          <span>{{ item.noticeType }}</span>
          <span>{{ formatDate(item.createdAt) }}</span>
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
.notification-container {
  padding: 1.5rem;
  background-color: #1c1a2e; /* Deep navy for a sleek, modern dark background */
  min-height: 100vh;
  color: #e0e0e0; /* Light gray for readable text */
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff; /* Pure white for emphasis */
  margin-bottom: 1.5rem;
  letter-spacing: 0.025em; /* Subtle spacing for elegance */
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.filter-input, .filter-select {
  padding: 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #3a3a5a; /* Muted blue-gray border for contrast */
  background-color: #2a2a3e; /* Slightly lighter than container for depth */
  color: #e0e0e0; /* Light text for readability */
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

.filter-input:focus, .filter-select:focus {
  outline: none;
  border-color: #6b7280; /* Soft gray for focus state */
  background-color: #555590; /* Slightly brighter on focus */
}

.filter-select {
  flex: 1;
  appearance: none; /* Remove default select styling */
  background-image: url("data:image/svg+xml;utf8,<svg fill='%23e0e0e0' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>"); /* Custom arrow */
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.5rem;
}

.checkbox-group {
  display: flex;
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  font-weight: 500;
  color: #d1d5db; /* Light gray for secondary text */
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  background-color: #2a2a3e;
  transition: background-color 0.3s ease;
}

.checkbox-label:hover {
  background-color: #33334d; /* Subtle hover effect */
}

.checkbox-label input {
  accent-color: #6b7280; /* Gray checkbox for consistency */
}

.notification-list {
  display: grid;
  gap: 1.5rem;
}

.notification-item {
  background-color: #2a2a3e; /* Dark card background */
  padding: 1.25rem;
  border-radius: 0.5rem;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2); /* Deeper shadow for depth */
  cursor: pointer;
  transition: transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;
}

.notification-item:hover {
  transform: translateY(-4px); /* Lift effect instead of scale for elegance */
  background-color: #33334d; /* Subtle hover background */
  box-shadow: 0px 6px 16px rgba(0, 0, 0, 0.3); /* Stronger shadow on hover */
}

.notification-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff; /* White for prominence */
}

.notification-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #9ca3af; /* Muted gray for secondary info */
  margin-top: 0.5rem;
}
</style>
