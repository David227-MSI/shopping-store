<template>
    <div class="container">
      <h1>活動列表</h1>
      <div v-if="loading" class="text-center py-4 text-dark">載入中...</div>
      <div v-else>
        <div v-if="events.length === 0" class="text-dark opacity-70 text-center">目前沒有進行中的活動</div>
        <div v-else class="event-list">
          <div
            v-for="(event, index) in events"
            :key="event.id"
            class="event-item animate-float-in"
          >
            <div class="event-header">
              <h2 class="text-2xl font-bold text-primary">{{ event.eventName }}</h2>
              <button
                class="action-button toggle-button animate-bounce-on-click"
                @click="toggleEvent(index)"
              >
                {{ expanded[index] ? '收起獎品清單' : '查看活動獎品清單' }}
              </button>
            </div>
  
            <div class="event-body">
              <div class="event-image">
                <img
                  v-if="event.eventMedia?.mediaData"
                  :src="getImageSrc(event.eventMedia.mediaData)"
                  alt="event image"
                  class="event-img"
                />
                <span v-else class="no-image">無圖片</span>
              </div>
  
              <div class="event-info">
                <p class="info-item"><strong>活動時間：</strong>{{ formatDate(event.startTime) }} ~ {{ formatDate(event.endTime) }}</p>
                <p class="info-item"><strong>消費門檻：</strong>{{ formatCurrency(event.minSpend) }}</p>
                <p class="info-item"><strong>限制參加次數：</strong>{{ event.maxEntries }}</p>
              </div>
            </div>
  
            <PrizeCard
              v-if="expanded[index]"
              :event="event"
              @attend="attendEvent"
            />
  
            <div v-if="index < events.length - 1" class="divider"></div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import Swal from 'sweetalert2';
  import axios from 'axios';
  import PrizeCard from '@/components/ttpp/PrizeCard.vue';
  
  const events = ref([]);
  const loading = ref(false);
  const userId = 1003;
  const expanded = ref([]);
  
  const fetchEvents = async () => {
    loading.value = true;
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/events/query`, {});
      if (res.data?.success) {
        events.value = res.data.data.eventList || [];
        expanded.value = new Array(events.value.length).fill(false);
      }
    } catch (err) {
      console.error('載入活動失敗', err);
    } finally {
      loading.value = false;
    }
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
  
  const toggleEvent = (index) => {
    expanded.value[index] = !expanded.value[index];
  };
  
  // 時間格式化
  const formatDate = (dateString) => {
    if (!dateString) return '未知日期';
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // 貨幣格式化
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };
  
  // 圖片格式處理
  const getImageSrc = (base64) => {
    if (!base64) return ''
    return base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`
  };
  
  onMounted(() => {
    fetchEvents();
  });
  </script>
  
  <style scoped>
  .event-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .event-item {
    background: #fff;
    border-radius: 12px;
    box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.05);
    padding: 15px;
    transition: transform 0.2s;
  }
  
  .event-item:hover {
    transform: translateY(-5px);
  }
  
  .event-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 8px;
    border-bottom: 1px solid #ddd;
  }
  
  .event-body {
    display: grid;
    grid-template-columns: 1fr 1fr; /* 將圖片和資訊分成兩欄 */
    gap: 15px;
    align-items: center; /* 垂直置中 */
    padding: 10px 0;
  }
  
  .toggle-button {
    font-size: 0.9rem;
    padding: 6px 12px;
  }
  
  .event-info {
    padding: 0; /* 移除 event-info 的內距，避免與 grid 衝突 */
  }
  
  .event-image {
    text-align: center;
  }
  
  .event-img {
    max-width: 100%;
    max-height: 200px; /* 調整圖片最大高度 */
    object-fit: contain;
    border-radius: 8px;
    margin-bottom: 0; /* 移除圖片下方的 margin */
  }
  
  .no-image {
    display: inline-block;
    padding: 20px;
    color: #999;
    font-style: italic;
  }
  
  .event-prizes {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #ddd;
  }
  
  .divider {
    height: 1px;
    background-color: #d2b48c;
    margin: 15px 0;
  }
  
  .text-dark {
    color: var(--text-dark);
  }
  
  .text-primary {
    color: var(--primary);
  }
  
  .rounded-lg {
    border-radius: 12px;
  }
  
  .animate-float-in {
    animation: float-in 0.5s ease-out;
  }
  
  .animate-bounce-on-click {
    transition: transform 0.3s;
  }
  
  .animate-bounce-on-click:active {
    animation: bounce 0.5s;
  }
  
  .info-item {
    margin-bottom: 6px;
    font-size: 1rem;
    color: var(--text-dark);
    white-space: nowrap;
  }
  
  @media (max-width: 768px) {
    .event-body {
      grid-template-columns: 1fr; /* 手機螢幕上圖片和資訊堆疊顯示 */
    }
  
    .event-image {
      margin-bottom: 10px; /* 手機螢幕上圖片下方增加間距 */
    }
  
    .info-item {
      font-size: 0.9rem;
    }
  
    .toggle-button {
      font-size: 0.8rem;
      padding: 5px 10px;
    }
  }
  </style>