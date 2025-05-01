<template>
    <div class="add-prize">
      <h2>為活動新增獎項</h2>
      <p>活動 ID：{{ eventId }}</p>
  
      <form @submit.prevent="onSubmit">
        <div v-if="formError" class="form-error">{{ formError }}</div>
  
        <div class="form-group">
          <label>獎品類型</label>
          <select v-model="form.itemType" @change="validateField('itemType')">
            <option disabled value="">請選擇</option>
            <option value="PRODUCT">商品</option>
            <option value="COUPON_TEMPLATE">折價券模板</option>
          </select>
          <div class="error">{{ errors.itemType }}</div>
        </div>
  
        <div class="form-group">
          <label>獎品 ID</label>
          <input v-model.number="form.itemId" @input="validateField('itemId')" type="number" min="1" />
          <div class="error">{{ errors.itemId }}</div>
        </div>
  
        <div class="form-group">
          <label>數量</label>
          <input v-model.number="form.quantity" @input="validateField('quantity')" type="number" min="0" />
          <div class="error">{{ errors.quantity }}</div>
        </div>
  
        <div class="form-group">
          <label>總名額</label>
          <input v-model.number="form.totalSlots" @input="validateField('totalSlots')" type="number" min="1" />
          <div class="error">{{ errors.totalSlots }}</div>
        </div>
  
        <div class="form-group">
          <label>中獎機率（0 ~ 1）</label>
          <input v-model="form.winRate" @input="validateField('winRate')" type="text" />
          <div class="error">{{ errors.winRate }}</div>
        </div>
  
        <div class="form-group">
          <label>獎項名稱</label>
          <input v-model="form.title" @input="validateField('title')" type="text" maxlength="100" />
          <div class="error">{{ errors.title }}</div>
        </div>
  
        <button type="submit">新增獎項</button>
      </form>
  
      <hr />
  
      <div v-if="prizes.length > 0">
        <h3>已新增的獎項</h3>
        <ul>
          <li v-for="(p, idx) in prizes" :key="idx">
            {{ p.title }}（{{ p.itemType }} - ID: {{ p.itemId }}）中獎率：{{ p.winRate }}，總名額：{{ p.totalSlots }}
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import axios from 'axios'
  import Swal from 'sweetalert2'
  
  const route = useRoute()
  const eventId = ref(parseInt(route.params.eventId || 0))
  
  const form = ref({
    itemType: '',
    itemId: null,
    quantity: 1,
    totalSlots: 1,
    winRate: '0.2',
    title: ''
  })
  
  const errors = ref({})
  const formError = ref(null)
  const prizes = ref([])
  
  const debounce = (fn, delay) => {
    let timeout
    return (...args) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => fn(...args), delay)
    }
  }
  
  const clientValidate = (field) => {
    const val = form.value[field]
  
    switch (field) {
      case 'itemType':
        return !val ? '請選擇獎品類型' : null
      case 'itemId':
        return !val || val <= 0 ? '請輸入有效的獎品 ID' : null
      case 'quantity':
        return val < 0 ? '數量不得為負' : null
      case 'totalSlots':
        return val <= 0 ? '總名額必須大於 0' : null
      case 'winRate':
        const num = parseFloat(val)
        return isNaN(num) || num < 0 || num > 1 ? '中獎機率需在 0 到 1 之間' : null
      case 'title':
        return !val ? '請輸入獎項名稱' : null
    }
  
    return null
  }
  
  const validateField = debounce((field) => {
    errors.value[field] = clientValidate(field)
  }, 300)
  
  const onSubmit = async () => {
    errors.value = {}
    formError.value = null
  
    for (const field of Object.keys(form.value)) {
      const err = clientValidate(field)
      if (err) errors.value[field] = err
    }
  
    if (Object.values(errors.value).some(e => e)) {
      formError.value = '請修正錯誤後再送出'
      return
    }
  
    try {
      const payload = {
        ...form.value,
        eventId: eventId.value
      }
  
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/events/addPrize`, payload)
  
      prizes.value.push(res.data.data)
  
      await Swal.fire({
        icon: 'success',
        title: '獎項新增成功',
        text: res.data.data.title,
        confirmButtonText: '繼續新增'
      })
  
      form.value = {
        itemType: '',
        itemId: null,
        quantity: 1,
        totalSlots: 1,
        winRate: '0.2',
        title: ''
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: '新增失敗',
        text: err.response?.data?.message || '請稍後再試'
      })
    }
  }
  </script>
  
  <style scoped>
  .add-prize {
    max-width: 600px;
    margin: auto;
  }
  .form-group {
    margin-bottom: 1em;
  }
  input, select {
    width: 100%;
    padding: 0.5em;
  }
  button {
    padding: 0.6em 1.2em;
  }
  .error {
    color: red;
    font-size: 0.875em;
  }
  .form-error {
    color: darkred;
    margin-bottom: 1em;
  }
  </style>
  