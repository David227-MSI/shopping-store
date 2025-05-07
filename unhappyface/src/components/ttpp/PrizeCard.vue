<template>
  <div class="event-prizes animate-float-in">
    <h3 class="font-bold mb-2 text-primary">獎品列表：</h3>
    <div v-for="(prize, prizeIndex) in event.eventPrizeList" :key="prizeIndex" class="prize-card">
      <h4 class="prize-title">{{ prize.title }}</h4>
      <p class="prize-quota">
        剩餘名額：{{ prize.remainingQuota || 0 }} / {{ prize.quantity }}
      </p>
      <button
        class="action-button animate-bounce-on-click attend-button"
        @click.stop="$emit('attend', event.id, prize.id)"
        :disabled="(prize.remainingQuota || 0) <= 0"
      >
        {{ (prize.remainingQuota || 0) <= 0 ? '名額已滿' : '參加抽獎' }}
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['attend']);
</script>

<style scoped>
.event-prizes {
  margin-top: 15px;
  padding: 15px;
  background-color: #f9f5f0; /* 淺棕色背景 */
  border-radius: 12px;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.05);
}

.prize-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.03);
  padding: 10px;
  margin-bottom: 10px;
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

.attend-button {
  font-size: 0.9rem;
  padding: 6px 12px;
  background-color: var(--accent); /* 主題強調色 */
  color: var(--text-light);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.attend-button:hover {
  background-color: darken(var(--accent), 10%);
}

.attend-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>