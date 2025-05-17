<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal">
      <h3>選擇優惠券模板</h3>
      <div class="search-bar">
        <input type="text" v-model="searchQuery" placeholder="搜尋標題或 ID" />
      </div>
      <div class="coupon-template-table-container">
        <table class="coupon-template-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>折扣值</th>
              <th>適用類型</th>
              <th>折扣類型</th>
              <th>開始時間</th>
              <th>結束時間</th>
              <th>選擇</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="template in filteredTemplates"
              :key="template.id"
              @click="selectTemplate(template)"
              :class="{ 'selected': selectedTemplate && selectedTemplate.id === template.id }"
            >
              <td>{{ template.id }}</td>
              <td>
                <span v-if="template.discountType === 'VALUE'">{{ template.discountValue }}</span>
                <span v-else-if="template.discountType === 'PERCENTAGE'">{{ template.discountValue }}%</span>
              </td>
              <td>{{ template.applicableType }}</td>
              <td>{{ template.discountType }}</td>
              <td>{{ formatDate(template.startTime) }}</td>
              <td>{{ formatDate(template.endTime) }}</td>
              <td>
                <input
                  type="radio"
                  name="selected-template"
                  :value="template.id"
                  :checked="selectedTemplate && selectedTemplate.id === template.id"
                  @change="selectTemplate(template)"
                />
              </td>
            </tr>
            <tr v-if="filteredTemplates.length === 0 && searchQuery">
              <td colspan="8">找不到符合的優惠券模板</td>
            </tr>
            <tr v-if="couponTemplates.length === 0 && !loading && !searchQuery">
              <td colspan="8">暫無優惠券模板資料</td>
            </tr>
            <tr v-if="loading">
              <td colspan="8">載入中...</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="modal-actions">
        <button @click="closeModal">取消</button>
        <button @click="applySelection" :disabled="!selectedTemplate">套用</button>
      </div>
    </div>
  </div>
</template>














<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps({
  eventId: {
    type: Number,
    required: true,
  },
  selectedId: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits(['coupon-template-selected', 'close']);

const couponTemplates = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const selectedTemplate = ref(null);

onMounted(async () => {
  loading.value = true;
  try {
    console.log(props.eventId);
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/admin/coupons/templateSelector/${props.eventId}`
    );
    
    if (response.data.success) {
      couponTemplates.value = response.data.data;
      selectedTemplate.value = couponTemplates.value.find(t => t.id === props.selectedId) || null;
    } else {
      console.error('載入優惠券模板資料失敗:', response.data.message);
    }
  } catch (error) {
    console.error('載入優惠券模板資料時發生錯誤', error);
  } finally {
    loading.value = false;
  }
});

const filteredTemplates = computed(() => {
  if (!searchQuery.value) {
    return couponTemplates.value;
  }
  const query = searchQuery.value.toLowerCase();
  return couponTemplates.value.filter(
    (template) =>
      (template.title && template.title.toLowerCase().includes(query)) ||
      String(template.id).includes(query)
  );
});

const selectTemplate = (template) => {
  selectedTemplate.value = template;
};

const applySelection = () => {
  emit('coupon-template-selected', selectedTemplate.value);
  closeModal();
};

const closeModal = () => {
  emit('close');
};

const formatDate = (dateTimeString) => {
  if (!dateTimeString) return '';
  const date = new Date(dateTimeString);
  return date.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }) +
         ' ' + date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
};
</script>















<style scoped>
.modal-overlay {
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
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

.search-bar {
  margin-bottom: 15px;
}

.search-bar input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.coupon-template-table-container {
  overflow-x: auto;
}

.coupon-template-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

.coupon-template-table th,
.coupon-template-table td {
  padding: 8px 10px;
  border: 1px solid #eee;
  text-align: left;
}

.coupon-template-table th {
  background-color: #f8f8f8;
  font-weight: bold;
}

.coupon-template-table tbody tr:hover {
  background-color: #f5f5f5;
  cursor: pointer;
}

.coupon-template-table tbody tr.selected {
  background-color: #f0f7ff;
  font-weight: bold;
}

.modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.modal-actions button {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-left: 10px;
}

.modal-actions button:first-child {
  background-color: #ddd;
  color: #333;
}

.modal-actions button:last-child {
  background-color: #007bff;
  color: white;
}

.modal-actions button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>