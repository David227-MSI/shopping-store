<template>
  <div class="notification-template-list">
    <h2>通知訊息模板管理</h2>

    <form @submit.prevent class="search-form">
      <div class="form-group">
        <label>標題</label>
        <input type="text" v-model="query.title" />
      </div>

      <div class="form-group">
        <label>通知類型</label>
        <select v-model="query.noticeType">
          <option value="">全部</option>
          <option value="ORDER">訂單通知</option>
          <option value="PROMOTION">促銷通知</option>
          <option value="WISHLIST">願望清單通知</option>
          <option value="SUBSCRIPTION">訂閱通知</option>
        </select>
      </div>

      <div class="form-actions">
        <button type="button" @click="resetQuery">重置</button>
      </div>
    </form>

    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="templates.length > 0" class="template-table-container">
      <table class="template-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>標題</th>
            <th>通知類型</th>
            <th>內容</th>
            <th>建立時間</th>
            <th>更新時間</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tpl in templates" :key="tpl.id">
            <td>{{ tpl.id }}</td>
            <td>{{ tpl.title }}</td>
            <td>{{ formatNoticeType(tpl.noticeType) }}</td>
            <td>{{ tpl.content }}</td>
            <td>{{ formatDateTime(tpl.createdAt) }}</td>
            <td>{{ formatDateTime(tpl.updatedAt) }}</td>
            <td>
              <button @click="handleEdit(tpl.id)">編輯</button>
              <button @click="handleDelete(tpl.id)">刪除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="queried" class="no-result">
      查無符合條件的通知模板。
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

// 初始查詢物件
const defaultQuery = {
  title: '',
  noticeType: ''
};

const query = ref({ ...defaultQuery });
const templates = ref([]);
const error = ref(null);
const queried = ref(false);

const fetchTemplates = async () => {
  error.value = null;
  queried.value = false;
  templates.value = [];

  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/notifications/templates/findAll`, {
      title: query.value.title || null,
      noticeType: query.value.noticeType || null
    });
    templates.value = res.data.data.templateList;
    queried.value = true;
  } catch (err) {
    error.value = err.response?.data?.message || '查詢發生錯誤，請稍後再試';
  }
};

// 格式化通知類型
const formatNoticeType = (type) => {
  const types = {
    ORDER: '訂單通知',
    PROMOTION: '促銷通知',
    WISHLIST: '願望清單通知',
    SUBSCRIPTION: '訂閱通知'
  };
  return types[type] || type;
};

// 格式化日期時間
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-';
  return new Date(dateTime).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 即時監控查詢條件，debounce 可加強效能（未加）
watch(query, fetchTemplates, { deep: true, immediate: true });

const resetQuery = () => {
  query.value = { ...defaultQuery };
};

const handleEdit = (id) => {
  console.log(`編輯通知模板 ID: ${id}`);
  // 在這裡處理編輯邏輯，例如跳轉到編輯頁面
};

const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: '確定要刪除這個通知嗎？',
    text: '刪除後將無法恢復！',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
    confirmButtonText: '是的，刪除它！',
    cancelButtonText: '取消'
  });

  if (result.isConfirmed) {
    try {
      const res = await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/notifications/templates/${id}`);
      if (res.data.success) {
        Swal.fire(
          '已刪除！',
          '通知模板已成功刪除。',
          'success'
        );
        fetchTemplates();
      } else {
        Swal.fire(
          '刪除失敗！',
          res.data.message || '刪除通知模板時發生錯誤。',
          'error'
        );
      }
    } catch (err) {
      Swal.fire(
        '刪除失敗！',
        err.response?.data?.message || '伺服器錯誤，請稍後再試。',
        'error'
      );
    }
  }
};
</script>

<style scoped>
.notification-template-list {
  /* max-width: 900px; */
  margin: 0 auto;
  padding: 20px;
}

.search-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
  background: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 4px;
  font-weight: bold;
}

.form-group input,
.form-group select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.form-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #6c757d;
  color: white;
}

.error {
  color: red;
  font-weight: bold;
  margin-top: 16px;
}

.template-table-container {
  overflow-x: auto;
  margin-top: 20px;
}

.template-table {
  width: 100%;
  border-collapse: collapse;
}

.template-table th,
.template-table td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
  white-space: nowrap;
}

.template-table th {
  background-color: #f8f8f8;
  font-weight: bold;
}

.template-table tbody tr:nth-child(even) {
  background-color: #f2f2f2;
}

.template-table tbody tr:hover {
  background-color: #e0e0e0;
}

.template-table td button {
  padding: 6px 10px;
  margin-right: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
}

.template-table td button:hover {
  background-color: #f0f0f0;
}

.no-result {
  color: #777;
  margin-top: 20px;
  font-style: italic;
}
</style>