<template>
    <div class="container">
      <h1>活動列表</h1>
      <div class="mb-4">
        <div class="search-filter">
          <label for="eventName" class="label-style">活動名稱：</label>
          <input type="text" id="eventName" v-model="searchName" placeholder="輸入活動名稱" class="input-style">
        </div>
        <div class="search-filter">
          <label for="startTime" class="label-style">開始時間：</label>
          <input type="datetime-local" id="startTime" v-model="searchStartTime" class="input-style">
        </div>
        <div class="search-filter">
          <label for="endTime" class="label-style">結束時間：</label>
          <input type="datetime-local" id="endTime" v-model="searchEndTime" class="input-style">
        </div>
        <div class="button-group">
          <button class="action-button search-button" @click="searchEvents">搜尋活動</button>
          <button class="action-button reset-button" @click="resetSearch">重置搜尋</button>
        </div>
      </div>
  
      <div v-if="loading" class="text-center py-4 text-dark">載入中...</div>
      <div v-else>
        <div v-if="filteredEvents.length === 0" class="text-dark opacity-70 text-center">目前沒有符合條件的活動</div>
        <div v-else class="event-list">
          <EventCard
            v-for="(event, index) in filteredEvents"
            :key="event.id"
            :event="event"
            :expanded="expanded[index]"
            @toggle="toggleEvent(index)"
            @attend="attendEvent"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue';
  import axios from 'axios';
  import Swal from 'sweetalert2';
  import EventCard from '@/components/ttpp/UserEventCard.vue';
  
  const events = ref([]);
  const loading = ref(false);
  const userId = 1003;
  const expanded = ref([]);
  const searchName = ref('');
  const searchStartTime = ref('');
  const searchEndTime = ref('');
  const originalEvents = ref([]);
  
  const fetchEvents = async (searchParams = {}) => {
    loading.value = true;
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/events/query`, searchParams);
      if (res.data?.success) {
        events.value = res.data.data.eventList || [];
        originalEvents.value = [...events.value];
        expanded.value = new Array(events.value.length).fill(false);
      }
    } catch (err) {
      console.error('載入活動失敗', err);
    } finally {
      loading.value = false;
    }
  };
  
  const searchEvents = () => {
    const searchPayload = {};
    if (searchName.value) {
      searchPayload.eventName = searchName.value;
    }
    if (searchStartTime.value) {
      searchPayload.startTime = searchStartTime.value ? new Date(searchStartTime.value).toISOString() : null;
    }
    if (searchEndTime.value) {
      searchPayload.endTime = searchEndTime.value ? new Date(searchEndTime.value).toISOString() : null;
    }
    fetchEvents(searchPayload);
  };
  
  const resetSearch = () => {
    searchName.value = '';
    searchStartTime.value = '';
    searchEndTime.value = '';
    events.value = [...originalEvents.value];
    expanded.value = new Array(events.value.length).fill(false);
  };
  
  const toggleEvent = (index) => {
    expanded.value[index] = !expanded.value[index];
  };
  
  const attendEvent = async (eventId, prizeId) => {
    try {
      const payload = {
        userId,
        eventId,
        prizeId,
      };
      await axios.post(`${import.meta.env.VITE_API_URL}/api/user/events/attendEvent`, payload);
  
      Swal.fire({
        icon: 'success',
        title: '參加成功！',
        text: '祝你好運！',
        timer: 2000,
        showConfirmButton: false,
      });
      // 參加成功後，你可能需要重新載入活動列表以更新剩餘參加次數等資訊
      fetchEvents();
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || '發生未知錯誤，請稍後再試';
  
      Swal.fire({
        icon: 'error',
        title: '參加失敗',
        text: message,
      });
    }
  };
  
  const filteredEvents = computed(() => {
    return events.value.filter(event => {
      const nameMatch = !searchName.value || event.eventName.toLowerCase().includes(searchName.value.toLowerCase());
      const startTimeMatch = !searchStartTime.value || new Date(event.startTime) >= new Date(searchStartTime.value);
      const endTimeMatch = !searchEndTime.value || new Date(event.endTime) <= new Date(searchEndTime.value);
      return nameMatch && startTimeMatch && endTimeMatch;
    });
  });
  
  onMounted(() => {
    fetchEvents();
  });
  </script>
  
  <style scoped>
  .container {
    padding: 20px;
  }
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 20px;
    color: var(--primary);
  }
  
  .search-filter {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .label-style {
    margin-right: 10px;
    font-weight: bold;
    color: var(--text-dark);
    min-width: 80px; /* 確保標籤寬度一致 */
  }
  
  .input-style {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    flex-grow: 1;
  }
  
  .button-group {
    display: flex;
    gap: 10px;
    margin-top: 15px;
  }
  
  .search-button,
  .reset-button {
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    color: white;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s ease;
  }
  
  .search-button {
    background-color: var(--primary);
  }
  
  .search-button:hover {
    background-color: darken(var(--primary), 10%);
  }
  
  .reset-button {
    background-color: #6c757d;
  }
  
  .reset-button:hover {
    background-color: darken(#6c757d, 10%);
  }
  
  .event-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-top: 20px;
  }
  
  .text-dark {
    color: var(--text-dark);
  }
  
  .opacity-70 {
    opacity: 0.7;
  }
  
  .text-center {
    text-align: center;
  }
  
  .py-4 {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
  </style>