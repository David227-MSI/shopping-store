<template>
    <div class="event-item animate-float-in">
      <div class="event-header">
        <h2 class="text-2xl font-bold text-primary">{{ event.eventName }}</h2>
        <button
          class="action-button toggle-button animate-bounce-on-click"
          @click="toggleExpanded"
        >
          {{ isExpanded ? '收起獎品清單' : '查看活動獎品清單' }}
        </button>
      </div>
  
      <div class="event-body">
        <div class="event-image">
          <img
            v-if="event.eventMedia?.mediaData"
            :src="getImageSrc(event.eventMedia.mediaData)"
            alt="event image"
            class="event-img rounded-lg"
          />
          <span v-else class="no-image rounded-lg">無圖片</span>
        </div>
  
        <div class="event-info">
          <p class="info-item"><strong>活動時間：</strong>{{ formatDate(event.startTime) }} ~ {{ formatDate(event.endTime) }}</p>
          <p class="info-item"><strong>消費門檻：</strong>{{ formatCurrency(event.minSpend) }}</p>
          <p class="info-item"><strong>限制參加次數：</strong>{{ event.maxEntries }}</p>
        </div>
      </div>
  
      <PrizeCard
        v-if="isExpanded"
        :event="event"
        @attend="$emit('attend', event.id, $event)"
      />
  
      <div v-if="index < eventsLength - 1" class="divider"></div>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits, ref, computed } from 'vue';
  import PrizeCard from '@/components/ttpp/PrizeCard.vue';
  
  const props = defineProps({
    event: {
      type: Object,
      required: true,
    },
    expanded: {
      type: Boolean,
      default: false,
    },
    index: {
      type: Number,
      required: true,
    },
    eventsLength: {
      type: Number,
      required: true,
    },
  });
  
  const emit = defineEmits(['toggle', 'attend']);
  const isExpanded = ref(props.expanded);
  
  const toggleExpanded = () => {
    isExpanded.value = !isExpanded.value;
    emit('toggle', props.index); // 通知父組件哪個活動的展開狀態改變了
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
    if (!base64) return '';
    return base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`;
  };
  </script>
  
  <style scoped>
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