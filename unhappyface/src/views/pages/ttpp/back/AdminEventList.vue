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

    <div class="event-table-container">
      <table class="event-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>活動名稱</th>
            <th>建立人</th>
            <th>開始時間</th>
            <th>結束時間</th>
            <th>公告時間</th>
            <th>狀態</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in filteredEvents" :key="event.id">
            <td>{{ event.id }}</td>
            <td>{{ event.eventName }}</td>
            <td>{{ event.establishedBy || '（待補）' }}</td>
            <td>{{ formatDate(event.startTime) }}</td>
            <td>{{ formatDate(event.endTime) }}</td>
            <td>{{ formatDate(event.announceTime) }}</td>
            <td>
              <span :class="'status ' + event.status">{{ statusLabel[event.status] }}</span>
            </td>
            <td>
              <button @click="editEvent(event.id)">編輯</button>
              <button @click="deleteEvent(event.id)">刪除</button>
              <button @click="viewPrizes(event.id)">查看獎項</button>
            </td>
          </tr>
          <tr v-if="filteredEvents.length === 0 && (search || statusFilter)">
            <td colspan="8">找不到符合條件的活動</td>
          </tr>
          <tr v-else-if="events.length === 0 && !loading">
            <td colspan="8">暫無活動資料</td>
          </tr>
          <tr v-if="loading">
            <td colspan="8">載入中...</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const search = ref('');
const statusFilter = ref('');
const events = ref([]);
const loading = ref(false);
const router = useRouter();

const calculateStatus = (announceTime, startTime, endTime) => {
  const now = new Date();
  const announce = new Date(announceTime);
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (now < announce) return 'ANNOUNCED';
  if (now < start) return 'ANNOUNCED';
  if (now < end) return 'ACTIVED';
  return 'END';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString();
};

const statusLabel = {
  ANNOUNCED: '已公佈',
  ACTIVED: '已開始',
  END: '已結束',
};

onMounted(async () => {
  loading.value = true;
  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/events/findAll`, {});
    events.value = res.data.data.eventList.map(event => ({
      ...event,
      status: calculateStatus(event.announceTime, event.startTime, event.endTime),
    }));
  } catch (error) {
    console.error('載入活動列表失敗', error);
    // 可以在這裡顯示錯誤訊息給使用者
  } finally {
    loading.value = false;
  }
});

const filteredEvents = computed(() => {
  return events.value.filter(e => {
    const matchesName = e.eventName.toLowerCase().includes(search.value.toLowerCase());
    const matchesStatus = statusFilter.value === '' || e.status === statusFilter.value;
    return matchesName && matchesStatus;
  });
});

const editEvent = (eventId) => {
  // 導航到編輯活動的頁面，你需要定義這個路由
  console.log(`編輯活動 ID: ${eventId}`);
  // router.push({ name: 'AdminEditEvent', params: { id: eventId } });
};

const deleteEvent = (eventId) => {
  // 實作刪除活動的邏輯，可能需要使用者確認
  console.log(`刪除活動 ID: ${eventId}`);
  // axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/events/${eventId}`)
  //   .then(response => {
  //     // 處理刪除成功後的邏輯，例如重新載入列表
  //   })
  //   .catch(error => {
  //     // 處理刪除失敗的邏輯
  //   });
};

const viewPrizes = (eventId) => {
  // 導航到查看活動獎項清單的頁面，你需要定義這個路由
  console.log(`查看活動 ${eventId} 的獎項`);
  router.push({ name: 'AdminEventPrizes', params: { eventId: eventId } });
};
</script>

<style scoped>
.filters {
  display: flex;
  gap: 1em;
  margin-bottom: 1em;
}

.event-table-container {
  overflow-x: auto; /* 如果表格過寬，允許水平滾動 */
}

.event-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1em;
}

.event-table th,
.event-table td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
}

.event-table th {
  background-color: #f8f8f8;
  font-weight: bold;
}

.status {
  font-weight: bold;
  padding: 0.2em 0.5em;
  border-radius: 4px;
  margin-left: 0.5em;
}

.status.ANNOUNCED {
  color: orange;
  background-color: rgba(255, 165, 0, 0.2);
}

.status.ACTIVED {
  color: green;
  background-color: rgba(0, 128, 0, 0.2);
}

.status.END {
  color: gray;
  background-color: rgba(128, 128, 128, 0.2);
}

.event-table tbody tr:nth-child(even) {
  background-color: #f2f2f2;
}

.event-table tbody tr:hover {
  background-color: #e0e0e0;
}

.event-table td button {
  padding: 6px 10px;
  margin-right: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
}

.event-table td button:hover {
  background-color: #f0f0f0;
}

.event-table td button:last-child {
  margin-right: 0;
}
</style>


