<template>
    <div class="event-prizes animate-float-in">
      <h3 class="font-bold mb-2 text-primary">獎品列表：</h3>
      <ul class="space-y-2">
        <li
          v-for="(prize, prizeIndex) in event.eventPrizeList"
          :key="prizeIndex"
          class="flex justify-between items-center bg-accent bg-opacity-10 px-3 py-2 rounded-lg"
        >
          <div class="text-dark">
            {{ prize.title }}（數量：{{ prize.quantity }}）
          </div>
          <button
            class="action-button animate-bounce-on-click"
            @click.stop="$emit('attend', event.id, prize.id)"
          >
            參加抽獎
          </button>
        </li>
      </ul>
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
  </style>