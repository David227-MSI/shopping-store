<template>
    <div class="prize-card">
      <h4 class="prize-title">
        <strong>獎品名稱:</strong> {{ prize.title }}
      </h4>
  
      <h4 class="prize-quota">
        <strong>剩餘名額 / 總名額：</strong>{{ prize.remainingSlots || 0 }} / {{ prize.totalSlots }}
      </h4>
      <div v-if="!userId">
      <button class="action-button" @click="navigateToLogin">登入查看抽獎資格</button>
      </div>
      <div v-else>
        <p>{{ eligibilityText }}</p>
        <div v-if="isEligible" ref="attendButtonDiv"></div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import Swal from 'sweetalert2';
  import { useUserStore } from '@/stores/userStore';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const userId = ref(useUserStore().userId || null);
  const eligibilityText = ref('載入資格中...');
  const isEligible = ref(false);
  const attendButtonDiv = ref(null);
  
  const props = defineProps({
    prize: {
      type: Object,
      required: true,
    },
    eventId: {
      type: Number,
      required: true,
    },
  });
  
  const emit = defineEmits(['attend']);

  const navigateToLogin = () => {
  router.push('/secure/login');
  };
  
  const checkEligibilityAndRender = async () => {
    eligibilityText.value = '載入資格中...';
    isEligible.value = false;
  
    try {
      const payload = {
        userId: userId.value,
        prizeId: props.prize.id,
        eventId: props.eventId,
      };
  
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/events/checkEligibility`, payload);
  
      if (res.data?.success) {
        const data = res.data.data;
        if (data.eligible) {
          eligibilityText.value = `您已具備資格，剩餘抽獎次數：${data.remainingEntries}`;
          isEligible.value = true;
          // 使用 ref 直接操作 DOM 元素
          const attendButton = document.createElement('button');
          attendButton.textContent = '參加抽獎';
          attendButton.className = 'action-button attend-now-button';
          attendButton.addEventListener('click', () => emit('attend', props.eventId, props.prize.id));
          if (attendButtonDiv.value) {
            attendButtonDiv.value.innerHTML = ''; // 清空之前的按鈕
            attendButtonDiv.value.appendChild(attendButton);
          }
        } else {
          eligibilityText.value = `不具資格，已參加 ${data.participatedTimes} 次，剩餘可參加次數 ${data.maxAllowedEntries} 次，再消費 ${data.amountToNextEntry} 元即可獲得下次抽獎機會`;
          if (data.maxAllowedEntries > data.participatedTimes && data.amountToNextEntry > 0) {
            eligibilityText.value += `<br><small>消費滿額即可增加抽獎機會</small>`;
          }
          isEligible.value = false;
          if (attendButtonDiv.value) {
            attendButtonDiv.value.innerHTML = '';
          }
        }
      } else {
        eligibilityText.value = '無法檢查資格';
        isEligible.value = false;
        if (attendButtonDiv.value) {
          attendButtonDiv.value.innerHTML = '';
        }
      }
    } catch (error) {
      console.error('檢查資格錯誤', error);
      eligibilityText.value = '檢查資格時發生錯誤';
      isEligible.value = false;
      if (attendButtonDiv.value) {
        attendButtonDiv.value.innerHTML = '';
      }
    }
  };
  
  onMounted(() => {
    if (userId.value) {
      checkEligibilityAndRender();
    } else {
      eligibilityText.value = '請先登入以查看資格';
    }
  });
  </script>
  
  <style scoped>
  .prize-card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.03);
    padding: 10px;
    margin-bottom: 10px;
    text-align: center;
  }
  
  .prize-title {
    font-size: 1.1rem;
    font-weight: bold;
    color: var(--primary);
    margin-bottom: 5px;
  }
  
  .prize-quota {
    font-size: 0.9rem;
    color: var(--text-dark);
    margin-bottom: 8px;
  }
  
  .attend-now-button {
    font-size: 0.9rem;
    padding: 6px 12px;
    background-color: var(--accent); /* 主題強調色 */
    color: var(--text-light);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-top: 10px;
  }
  
  .attend-now-button:hover {
    background-color: darken(var(--accent), 10%);
  }
  
  .attend-now-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  </style>