<template>
  <div class="container">
    <div class="filter-form">
      <div class="form-group">
        <label>適用類型</label>
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
          <option value="VALUE">金額折扣</option>
          <option value="PERCENTAGE">百分比折扣</option>
        </select>
      </div>

      <div class="form-actions">
        <button type="button" @click="resetQuery" :disabled="loading">清除</button>
      </div>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <p v-if="loading" class="loading">載入中...</p>

    <div v-if="!loading && templates.length > 0" class="template-list">
      <TemplateCard
        v-for="template in templates"
        :key="template.id"
        :template="template"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>

    <p v-if="!loading && templates.length === 0" class="no-data">無符合條件的優惠券模板</p>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import TemplateCard from '@/components/ttpp/back/AdminCouponTemplateCard.vue'; // 引入 TemplateCard 元件

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

// 初始化查詢 (保持不變)
fetchTemplates();
</script>

<style scoped>
.container {
  max-width: 1200px;
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

.template-list {
  display: grid;
  grid-template-columns: 1fr; /* 根據需要調整欄數 */
  gap: 16px;
}

@media (min-width: 768px) {
  .template-list {
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); /* 在較大螢幕上顯示多欄 */
  }
}
</style>