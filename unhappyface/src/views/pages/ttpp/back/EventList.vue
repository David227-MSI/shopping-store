<template>
  <div>
    <h2>活動清單</h2>

    <div class="filters">
      <input v-model="search" placeholder="搜尋活動名稱…" />
      <select v-model="statusFilter">
        <option value="">全部</option>
        <option value="ANNOUNCED">已公佈</option>
        <option value="ACTIVED">已開始</option>
        <option value="END">已結束</option>
      </select>
    </div>

    <EventCard
      v-for="event in filteredEvents"
      :key="event.id"
      :event="event"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import EventCard from '@/components/ttpp/EventCard.vue'

const search = ref('')
const statusFilter = ref('')
const events = ref([])

const calculateStatus = (announceTime, startTime, endTime) => {
  const now = new Date()
  const announce = new Date(announceTime)
  const start = new Date(startTime)
  const end = new Date(endTime)

  if (now < announce) return 'ANNOUNCED'
  if (now < start) return 'ANNOUNCED'
  if (now < end) return 'ACTIVED'
  return 'END'
}

onMounted(async () => {
  const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/events/findAll`, {})
  events.value = res.data.data.eventList.map(event => ({
    ...event,
    status: calculateStatus(event.announceTime, event.startTime, event.endTime)
  }))
})

const filteredEvents = computed(() => {
  return events.value.filter(e => {
    const matchesName = e.eventName.toLowerCase().includes(search.value.toLowerCase())
    const matchesStatus = statusFilter.value === '' || e.status === statusFilter.value
    return matchesName && matchesStatus
  })
})
</script>

<style scoped>
.filters {
  display: flex;
  gap: 1em;
  margin-bottom: 1em;
}
</style>
