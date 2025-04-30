<template>
    <div class="container">
      <!-- 篩選表單 -->
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
          <input type="number" v-model.number="query.maxDiscountricksValue" min="0" step="0.01" />
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
  
      <!-- 錯誤與成功訊息 -->
      <p v-if="error" class="error">{{ error }}</p>
  
      <!-- 載入狀態 -->
      <p v-if="loading" class="loading">載入中...</p>
  
      <!-- 結果表格 -->
      <div v-if="!loading && templates.length > 0" class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>適用類型</th>
              <th>適用 ID</th>
              <th>折扣值</th>
              <th>開始時間</th>
              <th>到期時間</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="template in templates" :key="template.id">
              <td>{{ template.id }}</td>
              <td>{{ formatApplicableType(template.applicableType) }}</td>
              <td>{{ template.applicableId || '-' }}</td>
              <td>{{ template.discountValue }}</td>
              <td>{{ formatDateTime(template.startTime) }}</td>
              <td>{{ formatDateTime(template.endTime) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- 無數據提示 -->
      <p v-if="!loading && templates.length === 0" class="no-data">無符合條件的優惠券模板</p>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  import axios from 'axios'
  
  // 查詢條件
  const query = ref({
    applicableType: '',
    startTime: null,
    endTime: null,
    minDiscountValue: null,
    maxDiscountValue: null,
    discountType: ''
  })
  
  // 狀態管理
  const templates = ref([])
  const loading = ref(false)
  const error = ref(null)
  const errors = ref({})
  
  // 防抖函數
  const debounce = (fn, delay) => {
    let timeout
    return (...args) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => fn(...args), delay)
    }
  }
  
  // 格式化適用類型
  const formatApplicableType = (type) => {
    const types = {
      ALL: '全品項適用',
      PRODUCT: '商品適用',
      BRAND: '品牌適用'
    }
    return types[type] || type
  }
  
  // 格式化日期時間
  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-'
    return new Date(dateTime).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // 驗證輸入
  const validateQuery = () => {
    errors.value = {}
    let valid = true
  
    if (query.value.minDiscountValue !== null && query.value.minDiscountValue < 0) {
      errors.value.minDiscountValue = '最小折扣值不能為負'
      valid = false
    }
  
    if (query.value.maxDiscountValue !== null && query.value.maxDiscountValue < 0) {
      errors.value.maxDiscountValue = '最大折扣值不能為負'
      valid = false
    }
  
    if (
      query.value.minDiscountValue !== null &&
      query.value.maxDiscountValue !== null &&
      query.value.minDiscountValue > query.value.maxDiscountValue
    ) {
      errors.value.maxDiscountValue = '最大折扣值必須大於或等於最小折扣值'
      valid = false
    }
  
    return valid
  }
  
  // 獲取優惠券模板列表（帶防抖）
  const fetchTemplates = debounce(async () => {
    if (!validateQuery()) {
      error.value = '請修正篩選條件中的錯誤'
      return
    }
  
    loading.value = true
    error.value = null
    templates.value = []
  
    try {
      // 清理空的查詢條件
      const payload = Object.fromEntries(
        Object.entries(query.value).filter(([_, value]) => value !== '' && value !== null)
      )
  
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/coupons/templates/findAll`, payload)
      if (res.data.success) {
        templates.value = res.data.data.templateList
      } else {
        error.value = res.data.message || '查詢失敗'
      }
    } catch (err) {
      error.value = err.response?.data?.message || '伺服器錯誤，請稍後再試'
    } finally {
      loading.value = false
    }
  }, 500)
  
  // 監聽 query 變化
  watch(
    query,
    () => {
      fetchTemplates()
    },
    { deep: true }
  )
  
  // 重置查詢條件
  const resetQuery = () => {
    query.value = {
      applicableType: '',
      startTime: null,
      endTime: null,
      minDiscountValue: null,
      maxDiscountValue: null,
      discountType: ''
    }
    errors.value = {}
  }
  
  // 初始化時載入數據
  fetchTemplates()
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
  
  .table-container {
    overflow-x: auto;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th,
  td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  th {
    background: #007bff;
    color: white;
  }
  
  tr:nth-child(even) {
    background: #f9f9f9;
  }
  
  tr:hover {
    background: #e9ecef;
  }
  </style>