<template>
  <div class="container">
    <h2>優惠券模板管理</h2>

    <div class="filter-form">
      <div class="form-group">
        <label>適用範圍</label>
        <select v-model="query.applicableType">
          <option value="">全部</option>
          <option value="ALL">全品項適用</option>
          <option value="PRODUCT">商品適用</option>
          <option value="BRAND">品牌適用</option>
        </select>
      </div>

      <div class="form-group">
        <label>開始時間</label>
        <input type="datetime-local" v-model="query.startTime" />
      </div>

      <div class="form-group">
        <label>到期時間</label>
        <input type="datetime-local" v-model="query.endTime" />
      </div>

      <div class="form-group">
        <label>最小折扣值</label>
        <input type="number" v-model.number="query.minDiscountValue" min="0" step="0.01" />
        <p class="error" v-if="errors.minDiscountValue">{{ errors.minDiscountValue }}</p>
      </div>

      <div class="form-group">
        <label>最大折扣值</label>
        <input type="number" v-model.number="query.maxDiscountValue" min="0" step="0.01" />
        <p class="error" v-if="errors.maxDiscountValue">{{ errors.maxDiscountValue }}</p>
      </div>

      <div class="form-group">
        <label>折扣類型</label>
        <select v-model="query.discountType">
          <option value="">全部</option>
          <option value="VALUE">面額折扣</option>
          <option value="PERCENTAGE">百分比折扣</option>
        </select>
      </div>

      <div class="form-actions">
        <button type="button" @click="resetQuery" :disabled="loading">清除</button>
      </div>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <p v-if="loading" class="loading">載入中...</p>

    <div class="template-table-container" v-if="!loading && templates.length > 0">
      <table class="template-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>適用範圍</th>
            <th>適用 ID</th>
            <th>折扣類型</th>
            <th>折扣值</th>
            <th>最大折扣</th>
            <th>可交易</th>
            <th>開始時間</th>
            <th>到期時間</th>
            <th>建立時間</th>
            <th>更新時間</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="template in templates" :key="template.id">
            <td>{{ template.id }}</td>
            <td>{{ formatApplicableType(template.applicableType) }}</td>
            <td>{{ template.applicableId || '-' }}</td>
            <td>{{ formatDiscountType(template.discountType) }}</td>
            <td>
              <span v-if="template.discountType === 'VALUE'">{{ template.discountValue }}</span>
              <span v-else-if="template.discountType === 'PERCENTAGE'">{{ template.discountValue }}%</span>
            </td>
            <td>{{ template.maxDiscount ? `${template.maxDiscount}` : '-' }}</td>
            <td>{{ template.tradeable ? '是' : '否' }}</td>
            <td>{{ formatDateTime(template.startTime) }}</td>
            <td>{{ formatDateTime(template.endTime) }}</td>
            <td>{{ formatDateTime(template.createdAt) }}</td>
            <td>{{ formatDateTime(template.updatedAt) }}</td>
            <td>
              <button @click="handleEdit(template.id)">編輯</button>
              <button @click="handleDelete(template.id)">刪除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="!loading && templates.length === 0" class="no-data">無符合條件的優惠券模板</p>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

// 查詢條件 (保持不變)
const query = ref({
  applicableType: '',
  startTime: null,
  endTime: null,
  minDiscountValue: null,
  maxDiscountValue: null,
  discountType: ''
});

// 狀態管理 (保持不變)
const templates = ref([]);
const loading = ref(false);
const error = ref(null);
const errors = ref({});

// 防抖函數 (保持不變)
const debounce = (fn, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

// 驗證輸入 (保持不變)
const validateQuery = () => {
  errors.value = {};
  let valid = true;

  if (query.value.minDiscountValue !== null && query.value.minDiscountValue < 0) {
    errors.value.minDiscountValue = '最小折扣值不能為負';
    valid = false;
  }

  if (query.value.maxDiscountValue !== null && query.value.maxDiscountValue < 0) {
    errors.value.maxDiscountValue = '最大折扣值不能為負';
    valid = false;
  }

  if (
    query.value.minDiscountValue !== null &&
    query.value.maxDiscountValue !== null &&
    query.value.minDiscountValue > query.value.maxDiscountValue
  ) {
    errors.value.maxDiscountValue = '最大折扣值必須大於或等於最小折扣值';
    valid = false;
  }

  return valid;
};

// 查詢優惠券模板 (保持不變)
const fetchTemplates = debounce(async () => {
  if (!validateQuery()) {
    error.value = '請修正篩選條件中的錯誤';
    return;
  }

  loading.value = true;
  error.value = null;
  templates.value = [];

  try {
    const payload = Object.fromEntries(
      Object.entries(query.value).filter(([_, value]) => value !== '' && value !== null)
    );

    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/coupons/templates/findAll`, payload);

    if (res.data.success) {
      templates.value = res.data.data.templateList;
    } else {
      error.value = res.data.message || '查詢失敗';
    }
  } catch (err) {
    error.value = err.response?.data?.message || '伺服器錯誤，請稍後再試';
  } finally {
    loading.value = false;
  }
}, 500);

// 監聽 query 變化，自動查詢 (保持不變)
watch(
  query,
  () => {
    fetchTemplates();
  },
  { deep: true }
);

// 重設查詢條件 (保持不變)
const resetQuery = () => {
  query.value = {
    applicableType: '',
    startTime: null,
    endTime: null,
    minDiscountValue: null,
    maxDiscountValue: null,
    discountType: ''
  };
  errors.value = {};
};

// 格式化適用類型
const formatApplicableType = (type) => {
  const types = {
    ALL: '全品項',
    PRODUCT: '特定商品',
    BRAND: '特定品牌',
    CATEGORY: '特定種類'
  };
  return types[type] || type;
};

// 格式化折扣類型
const formatDiscountType = (type) => {
  const types = {
    VALUE: '面額折扣',
    PERCENTAGE: '百分比折扣'
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

// 處理編輯功能
const handleEdit = (id) => {
  console.log(`編輯模板 ID: ${id}`);
  // 在這裡處理編輯邏輯，例如跳轉到編輯頁面
};

// 處理刪除功能
const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: '確定要刪除這個優惠券模板嗎？',
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
      const res = await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/coupons/templates/${id}`);
      if (res.data.success) {
        Swal.fire(
          '已刪除！',
          '優惠券模板已成功刪除。',
          'success'
        );
        fetchTemplates();
      } else {
        Swal.fire(
          '刪除失敗！',
          res.data.message || '刪除優惠券模板時發生錯誤。',
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

// 初始化查詢
fetchTemplates();
</script>

<style scoped>
.container {
  max-width: 1400px; /* 調整容器寬度以適應更多表格欄位 */
  margin: 0 auto;
  padding: 20px;
}

.filter-form {
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
  gap: 8px;
  align-items: flex-end;
}

.form-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #6c757d;
  color: white;
}

.form-actions button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  color: red;
  font-size: 0.85em;
  margin-top: 4px;
}

.loading {
  color: #007bff;
  font-weight: bold;
}

.no-data {
  color: #6c757d;
  font-style: italic;
}

.template-table-container {
  overflow-x: auto;
}

.template-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.template-table th,
.template-table td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
  white-space: nowrap; /* 防止文字在單元格內換行 */
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

.template-table td button:last-child {
  margin-right: 0;
}
</style>