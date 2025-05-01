<template>
  <div class="event-card">
    <div class="card-header" @click="toggleExpand">
      <h3>{{ event.eventName }}</h3>
      <span :class="'status ' + event.status">{{ statusLabel[event.status] }}</span>
    </div>

    <div class="card-body">
      <p>建立人：{{ event.establishedBy || '（待補）' }}</p>
      <p>開始時間：{{ formatDate(event.startTime) }}</p>
      <p>結束時間：{{ formatDate(event.endTime) }}</p>
      <p>公告時間：{{ formatDate(event.announceTime) }}</p>
      <button @click="goToAddPrize">新增獎項</button>
    </div>

    <div v-if="expanded && event.eventPrizeList?.length">
      <h4>🎁 獎項清單</h4>
      <ul>
        <li v-for="prize in event.eventPrizeList" :key="prize.id">
          {{ prize.title }} - 機率：{{ prize.winRate }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  event: Object
})

const expanded = ref(false)
const router = useRouter()

const toggleExpand = () => {
  expanded.value = !expanded.value
}

const goToAddPrize = () => {
  router.push({ name: 'AddPrizeToEvent', params: { eventId: props.event.id } })
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleString()
}

const statusLabel = {
  ANNOUNCED: '已公佈',
  ACTIVED: '已開始',
  END: '已結束'
}
</script>

<style scoped>
.status {
  font-weight: bold;
  padding: 0.2em 0.5em;
  border-radius: 4px;
  margin-left: 1em;
}
.status.ANNOUNCED { color: orange; }
.status.ACTIVED { color: green; }
.status.END { color: gray; }

.event-card {
  border: 1px solid #ccc;
  padding: 1em;
  margin-bottom: 1em;
}
.card-header {
  display: flex;
  justify-content: space-between;
  cursor: pointer;
}
</style>
