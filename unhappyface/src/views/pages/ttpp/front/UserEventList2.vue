<template>
    <div class="container">
      <h1>最新活動</h1>
  
      <div v-if="events.length > 0" class="swiper-container">
        <div class="swiper-wrapper">
          <div v-for="event in events.slice(0, 3)" :key="event.id" class="swiper-slide">
            <img v-if="event.eventMedia?.mediaData" :src="getImageSrc(event.eventMedia.mediaData)" :alt="event.eventName">
            <div class="event-overlay">
              <h2 class="event-title">{{ event.eventName }}</h2>
              <p class="event-time">{{ formatDate(event.startTime) }} - {{ formatDate(event.endTime) }}</p>
              <button class="action-button detail-button" @click="openPrizeModal(event)">查看獎品</button>
            </div>
          </div>
        </div>
      </div>

      <div class="filter-bar">
        <div class="search-input">
          <label for="eventName">活動名稱：</label>
          <input type="text" id="eventName" v-model="searchName" placeholder="輸入活動名稱">
        </div>
        <div class="filter-select">
          <label for="statusFilter">活動狀態：</label>
          <select id="statusFilter" v-model="statusFilter">
            <option value="all">全部活動</option>
            <option value="not_started">尚未開始</option>
            <option value="ongoing">活動中</option>
            <option value="ended">已結束</option>
          </select>
        </div>
      </div>
  
      
  
      <div class="event-list-grid">
        <div v-for="event in filteredEvents" :key="event.id" class="event-card">
          <div class="event-image-container">
            <img v-if="event.eventMedia?.mediaData" :src="getImageSrc(event.eventMedia.mediaData)" :alt="event.eventName">
            <div v-else class="no-image-placeholder">無圖片</div>
          </div>
          <div class="event-info">
            <h3 class="event-title">{{ event.eventName }}</h3>
            <p class="detail-item">
              <strong>開始時間:</strong> {{ formatDate(event.startTime) }}
            </p>
            <p class="detail-item">
              <strong>結束時間:</strong> {{ formatDate(event.endTime) }}
            </p>
            <p class="detail-item" v-if="event.minSpend > 0">
              <strong>參加資格:</strong> 消費滿 {{ event.minSpend }}
            </p>
            <button class="action-button" @click="openPrizeModal(event)">
              <i class="iconfont icon-gift"></i> 查看獎品
            </button>
          </div>
        </div>
      </div>
  
      <PrizeModal :event="selectedEvent" :show="showPrizeModal" @close="closePrizeModal" />
  
      <div v-if="loading" class="loading-indicator">載入中...</div>
      <div v-else-if="filteredEvents.length === 0" class="no-events">目前沒有符合條件的活動喔！</div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed, watch } from 'vue';
  import axios from 'axios';
  import Swal from 'sweetalert2';
  import { useUserStore } from '@/stores/userStore';
  import PrizeModal from '@/components/ttpp/UserPrizeModal2.vue';
  import 'swiper/css';
  
  const userStore = useUserStore();
  const events = ref([]);
  const loading = ref(true);
  const userId = ref(userStore.userId || null);
  const searchName = ref('');
  const statusFilter = ref('all');
  const showPrizeModal = ref(false);
  const selectedEvent = ref(null);
  
  const fetchEvents = async (query = {}) => {
    loading.value = true;
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/events/query`, query);
      if (res.data?.success) {
        events.value = res.data.data.eventList || [];
      } else {
        Swal.fire('載入失敗', res.data?.message || '無法載入活動列表', 'error');
      }
    } catch (error) {
      console.error('載入活動列表錯誤', error);
      Swal.fire('載入錯誤', '載入活動列表時發生錯誤', 'error');
    } finally {
      loading.value = false;
    }
  };
  
  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }) +
           ' ' + date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
  };
  
  const getImageSrc = (base64) => {
    return base64.startsWith('data:') ? base64 : `data:image/*;base64,${base64}`;
  };
  
  const openPrizeModal = (event) => {
    selectedEvent.value = event;
    showPrizeModal.value = true;
  };
  
  const closePrizeModal = () => {
    selectedEvent.value = null;
    showPrizeModal.value = false;
  };
  
  const filteredEvents = computed(() => {
    return events.value.filter(event => {
      const nameMatch = !searchName.value || event.eventName.toLowerCase().includes(searchName.value.toLowerCase());
      const now = new Date();
      const startTime = new Date(event.startTime);
      const endTime = new Date(event.endTime);
      let statusMatch = true;
  
      if (statusFilter.value === 'not_started') {
        statusMatch = startTime > now;
      } else if (statusFilter.value === 'ongoing') {
        statusMatch = startTime <= now && endTime >= now;
      } else if (statusFilter.value === 'ended') {
        statusMatch = endTime < now;
      }
  
      return nameMatch && statusMatch;
    });
  });
  
  watch([searchName, statusFilter], () => {
    // 這裡可以選擇在每次篩選條件改變時重新呼叫 API，
    // 或者直接使用 computed 屬性 `filteredEvents` 進行前端篩選。
    // 目前選擇前端篩選以減少 API 請求。
  });
  
  onMounted(() => {
    fetchEvents({}); // 初始載入所有活動
  });
  </script>
  
  <style scoped>
  /* ... (EventList.vue 的樣式，與之前的樣式基本相同，但可能需要調整 filter-bar 的樣式) ... */
  .container {
    padding: 20px;
  }
  
  h1 {
    text-align: center;
    color: var(--primary);
    font-size: 2.5rem;
    margin-bottom: 20px;
  }
  
  .filter-bar {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    align-items: center;
    background-color: #f9f5f0;
    padding: 15px;
    border-radius: 8px;
  }
  
  .search-input {
    display: flex;
    align-items: center;
  }
  
  .search-input label {
    margin-right: 10px;
    color: var(--text-dark);
  }
  
  .search-input input {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    flex-grow: 1;
  }
  
  .filter-select {
    display: flex;
    align-items: center;
  }
  
  .filter-select label {
    margin-right: 10px;
    color: var(--text-dark);
  }
  
  .filter-select select {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .swiper-container {
    width: 100%;
    height: 300px;
    margin-bottom: 20px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  
  .swiper-slide {
    position: relative;
  }
  
  .swiper-slide img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .event-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 100%);
    color: var(--text-light);
    padding: 20px;
    text-align: center;
  }
  
  .event-overlay .event-title {
    font-size: 1.5rem;
    margin-bottom: 5px;
  }
  
  .event-overlay .event-time {
    font-size: 0.9rem;
    margin-bottom: 10px;
  }
  
  .event-list-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }
  
  .event-card {
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s;
  }
  
  .event-card:hover {
    transform: translateY(-5px);
  }
  
  .event-image-container {
    width: 100%;
    height: 180px;
    overflow: hidden;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    background-color: #f9f5f0; /* 預設背景色 */
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .event-image-container img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .no-image-placeholder {
    color: #ccc;
    font-size: 1.2rem;
  }
  
  .event-info {
    padding: 15px;
    text-align: center;
  }
  
  .event-info .event-title {
    color: var(--primary);
    font-size: 1.2rem;
    margin-bottom: 8px;
    font-weight: bold;
  }

  .event-info .detail-item {
  color: var(--text-dark);
  font-size: 0.9rem;
  margin: 0;
  }
  
  .event-info .iconfont {
    margin-right: 5px;
  }
  
  .action-button {
    display: inline-block;
    background-color: var(--accent);
    color: var(--text-light);
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-top: 10px;
  }
  
  .loading-indicator,
  .no-events {
    text-align: center;
    padding: 20px;
    color: var(--text-dark);
    opacity: 0.8;
  }
  
  @media (max-width: 768px) {
    .event-list-grid {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
  
    .event-image-container {
      height: 120px;
    }
  
    .event-info .event-title {
      font-size: 1rem;
    }
  
    .action-button {
      font-size: 0.9rem;
      padding: 6px 12px;
    }
  
    h1 {
      font-size: 2rem;
      margin-bottom: 15px;
    }
  
    .swiper-container {
      height: 200px;
      margin-bottom: 15px;
    }
  
    .event-overlay {
      padding: 10px;
    }
  
    .event-overlay .event-title {
      font-size: 1.2rem;
      margin-bottom: 3px;
    }
  
    .event-overlay .event-time {
      font-size: 0.8rem;
      margin-bottom: 5px;
    }
  
    .filter-bar {
      flex-direction: column;
      gap: 10px;
      align-items: stretch;
    }
  
    .search-input,
    .filter-select {
      display: flex;
      flex-direction: column;
    }
  
    .search-input label,
    .filter-select label {
      margin-bottom: 5px;
    }
  }
  </style>