<template>
  <teleport to="body">
    <div v-if="show" class="modal-backdrop">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ event?.eventName }} - 獎品清單</h3>
          <button type="button" class="close-button" @click="$emit('close')">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="event?.eventPrizeList?.length > 0" class="prize-list-container">
            <PrizeCard
              v-for="prize in event.eventPrizeList"
              :key="prize.id"
              :prize="prize"
              :event-id="event.id"
              @attend="handleAttend"
              @eligibility-updated="updatePrizeInfo" />
          </div>
          <div v-else class="no-prizes">此活動目前沒有獎品喔！</div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue';
import PrizeCard from '@/components/ttpp/UserPrizeCard2.vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();
const userId = ref(userStore.userId || null);

const props = defineProps({
  event: {
    type: Object,
    default: null,
  },
  show: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close']);
const prizeInfoMap = ref({}); // 用於儲存每個獎品的最新資訊

const updatePrizeInfo = (prizeId, updatedInfo) => {
  if (prizeInfoMap.value[prizeId]) {
    prizeInfoMap.value[prizeId] = { ...prizeInfoMap.value[prizeId], ...updatedInfo };
  } else {
    prizeInfoMap.value[prizeId] = updatedInfo;
  }

  // 這裡可以嘗試觸發子組件的重新渲染，如果需要更即時的更新
  // 例如，你可以遍歷子組件的 refs 並手動更新它們的 props
};

const handleAttend = async (eventId, prizeId) => {
  if (!userId.value) {
    return Swal.fire('請先登入', '您需要登入才能參加活動', 'warning');
  }

  const payload = {
    userId: userId.value,
    prizeId,
    eventId,
  };

  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/events/attendEvent`, payload);
    if (res.data?.success) {
      Swal.fire({
        icon: 'success',
        title: res.data.data.status === 'WINNER' ? '恭喜您中獎！' : '本次未中獎',
        text: res.data.data.status === 'WINNER' ? `獲得獎品：${res.data.data.prizeTitle}` : '再接再厲!',
        timer: 3000,
        showConfirmButton: false,
      });
      // 更新獎品資訊
      if (res.data.data.prize) {
        updatePrizeInfo(prizeId, { remainingSlots: res.data.data.prize.remainingSlots });
      }
      // 關閉 modal
      emit('close');
      // 可以發送事件通知父組件重新載入活動列表，或者在這裡直接更新父組件的資料
      // window.location.reload(); // 暫時移除重新載入，改為嘗試局部更新
    } else {
      Swal.fire('參加失敗', res.data?.message || '無法參加本次活動', 'error');
    }
  } catch (error) {
    console.error('參加活動錯誤', error);
    Swal.fire('錯誤', '參加活動時發生錯誤', 'error');
  }
};

// 監聽 show prop 的變化，當 modal 開啟且有 event 時，觸發子組件的資格檢查
watch(() => props.show, (newShow, oldShow) => {
  if (newShow && props.event?.eventPrizeList) {
    // 遍歷 PrizeCard 子組件，並觸發資格檢查
    // 注意：你可能需要使用 ref 來獲取 PrizeCard 的實例，然後呼叫其方法
    // 這裡我們假設 PrizeCard 會在 mounted 或 props 更新時自動檢查資格
  }
});
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 80%;
  max-width: 600px;
  overflow: hidden;
}

.modal-header {
  padding: 15px;
  background-color: #f9f5f0;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  color: var(--primary);
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: #aaa;
  font-size: 1.5rem;
  cursor: pointer;
}

.close-button:hover {
  color: #888;
}

.modal-body {
  padding: 15px;
}

.prize-list-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.no-prizes {
  color: var(--text-dark);
  opacity: 0.7;
  text-align: center;
  padding: 20px;
}
</style>