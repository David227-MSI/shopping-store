<template>
  <div class="notification-template-list">
    <h2>查詢通知訊息模板</h2>

    <form @submit.prevent class="search-form">
      <div>
        <label>標題（模糊查詢）</label>
        <input type="text" v-model="query.title" />
      </div>

      <div>
        <label>通知類型</label>
        <select v-model="query.noticeType">
          <option value="">全部</option>
          <option value="ORDER">ORDER</option>
          <option value="PROMOTION">PROMOTION</option>
          <option value="WISHLIST">WISHLIST</option>
          <option value="SUBSCRIPTION">SUBSCRIPTION</option>
        </select>
      </div>

      <div class="button-group">
        <button type="button" @click="resetQuery">重置</button>
      </div>
    </form>

    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="templates.length > 0" class="result-list">
      <h3>查詢結果：</h3>
      <ul>
        <li v-for="tpl in templates" :key="tpl.id" class="template-item">
          <strong>{{ tpl.title }}</strong>（{{ tpl.noticeType }}）<br />
          <span>{{ tpl.content }}</span>
        </li>
      </ul>
    </div>

    <div v-else-if="queried" class="no-result">
      查無符合條件的通知模板。
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'

// 初始查詢物件
const defaultQuery = {
  title: '',
  noticeType: ''
}

const query = ref({ ...defaultQuery })
const templates = ref([])
const error = ref(null)
const queried = ref(false)

const fetchTemplates = async () => {
  error.value = null
  queried.value = false
  templates.value = []

  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/notifications/templates/findAll`, {
      title: query.value.title || null,
      noticeType: query.value.noticeType || null
    })
    templates.value = res.data.data.templateList
    queried.value = true
  } catch (err) {
    error.value = err.response?.data?.message || '查詢發生錯誤，請稍後再試'
  }
}

// 即時監控查詢條件，debounce 可加強效能（未加）
watch(query, fetchTemplates, { deep: true, immediate: true })

const resetQuery = () => {
  query.value = { ...defaultQuery }
}
</script>

<style scoped>
.notification-template-list {
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
}
.search-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}
.button-group {
  display: flex;
  gap: 10px;
}
.result-list {
  margin-top: 20px;
}
.template-item {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ccc;
}
.error {
  color: red;
  font-weight: bold;
}
.no-result {
  color: #777;
  margin-top: 20px;
}
</style>
