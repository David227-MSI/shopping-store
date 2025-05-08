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
              />
            </div>
            <div v-else class="no-prizes">此活動目前沒有獎品喔！</div>
          </div>
        </div>
      </div>
    </teleport>
  </template>
  
  <script setup>
  import { defineProps, defineEmits, ref } from 'vue';
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
  
  const handleAttend = async (eventId, prizeId) => {
    if (!userId.value) {
      return Swal.fire('請先登入', '您需要登入才能參加活動', 'warning');
    }
    
    const payload = { 
        userId: userId.value, 
        prizeId, 
        eventId 
    };

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/events/attendEvent`, payload);
      if (res.data?.success) {
        Swal.fire({
          icon: 'success',
          title: '參加成功！',
          text: res.data.data.status === 'WINNER' ? `恭喜您中獎！獎品：${res.data.prizeTitle}` : '已成功參加本次抽獎',
        timer: 2000,
        showConfirmButton: false
      });
      emit('close'); // 參加成功後關閉 modal
      // 可以發送事件通知父組件重新載入活動列表
      window.location.reload(); // 重新載入頁面以更新數據
    } else {
      Swal.fire('參加失敗', res.data?.message || '無法參加本次活動', 'error');
    }
  } catch (error) {
    console.error('參加活動錯誤', error);
    Swal.fire('錯誤', '參加活動時發生錯誤', 'error');
  }
};
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