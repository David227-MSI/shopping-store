<!-- src/components/NotificationModal.vue -->
<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="bg-white p-6 rounded-lg shadow-lg w-96 relative">
      <button @click="$emit('close')" class="absolute top-2 right-2 text-gray-400 hover:text-gray-600">✖️</button>
      <h2 class="text-2xl font-bold mb-2">{{ notification.title }}</h2>
      <span class="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full mb-4">
        {{ noticeTypeText(notification.noticeType) }}
      </span>
      <p class="text-gray-700 whitespace-pre-line">{{ notification.content }}</p>
      <div class="text-sm text-gray-400 mt-4">建立時間：{{ formatDate(notification.createdAt) }}</div>
      <div v-if="notification.isRead" class="text-green-500 text-sm mt-1">已讀</div>
      <div v-else class="text-red-500 text-sm mt-1">未讀</div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  notification: {
    type: Object,
    required: true
  }
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}

const noticeTypeText = (type) => {
  switch (type) {
    case 'SYSTEM':
      return '系統通知'
    case 'PROMOTION':
      return '促銷通知'
    default:
      return '其他'
  }
}
</script>
