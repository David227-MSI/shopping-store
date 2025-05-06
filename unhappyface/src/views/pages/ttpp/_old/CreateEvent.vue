<template>
    <div class="create-event">
      <h2>建立促銷活動</h2>
  
      <form @submit.prevent="onSubmit">
        <div v-if="formError" class="form-error">{{ formError }}</div>
  
        <div class="form-group">
          <label>活動名稱</label>
          <input v-model="form.eventName" @input="validateField('eventName')" type="text" maxlength="100" />
          <div class="error">{{ errors.eventName }}</div>
        </div>
  
        <div class="form-group">
          <label>最低消費金額</label>
          <input v-model.number="form.minSpend" @input="validateField('minSpend')" type="number" min="0" step="0.01" />
          <div class="error">{{ errors.minSpend }}</div>
        </div>
  
        <div class="form-group">
          <label>最大參加次數</label>
          <input v-model.number="form.maxEntries" @input="validateField('maxEntries')" type="number" min="0" />
          <div class="error">{{ errors.maxEntries }}</div>
        </div>
  
        <div class="form-group">
          <label>發佈時間</label>
          <input v-model="form.announceTime" @input="validateField('announceTime')" type="datetime-local" />
          <div class="error">{{ errors.announceTime }}</div>
        </div>
  
        <div class="form-group">
          <label>開始時間</label>
          <input v-model="form.startTime" @input="validateField('startTime')" type="datetime-local" />
          <div class="error">{{ errors.startTime }}</div>
        </div>
  
        <div class="form-group">
          <label>結束時間</label>
          <input v-model="form.endTime" @input="validateField('endTime')" type="datetime-local" />
          <div class="error">{{ errors.endTime }}</div>
        </div>
  
        <div class="form-group">
          <label>建立人</label>
          <input v-model="form.establishedBy" @input="validateField('establishedBy')" type="text" maxlength="100" />
          <div class="error">{{ errors.establishedBy }}</div>
        </div>
  
        <button type="submit">建立活動</button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import axios from 'axios'
  import Swal from 'sweetalert2'

  const router = useRouter()
  
  const form = ref({
    eventName: '',
    minSpend: 0,
    maxEntries: 1,
    announceTime: '',
    startTime: '',
    endTime: '',
    establishedBy: ''
  })
  
  const errors = ref({})
  const formError = ref(null)
  
  const debounce = (fn, delay) => {
    let timeout
    return (...args) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => fn(...args), delay)
    }
  }
  
  const clientValidate = (field) => {
    const value = form.value[field]
    const now = new Date()
    const announce = new Date(form.value.announceTime)
    const start = new Date(form.value.startTime)
    const end = new Date(form.value.endTime)
  
    switch (field) {
      case 'eventName':
        return !value ? '活動名稱不可為空' : null
      case 'minSpend':
        return value < 0 ? '最低消費金額不能為負數' : null
      case 'maxEntries':
        return value < 0 ? '最大參加次數不能為負數' : null
      case 'announceTime':
        if (!value) return '請輸入發佈時間'
        if (announce < now) return '發佈時間不能早於目前時間'
        if (form.value.startTime && announce >= start) return '發佈時間必須早於開始時間'
        return null
      case 'startTime':
        if (!value) return '請輸入開始時間'
        if (start < now) return '開始時間不能早於目前時間'
        if (form.value.announceTime && announce >= start) return '開始時間必須晚於發佈時間'
        if (form.value.endTime && start >= end) return '開始時間必須早於結束時間'
        return null
      case 'endTime':
        if (!value) return '請輸入結束時間'
        if (form.value.startTime && end <= start) return '結束時間必須晚於開始時間'
        return null
      case 'establishedBy':
        return !value ? '請輸入建立人名稱' : null
    }
    return null
  }
  
  const validateField = debounce((field) => {
    errors.value[field] = clientValidate(field)
  }, 300)
  
  const onSubmit = async () => {
    errors.value = {}
    formError.value = null
  
    const fields = Object.keys(form.value)
    for (const field of fields) {
      const err = clientValidate(field)
      if (err) errors.value[field] = err
    }
  
    if (Object.values(errors.value).some(e => e)) {
      formError.value = '請修正表單錯誤後再送出'
      return
    }
  
    try {
      const payload = {
        ...form.value,
        startTime: new Date(form.value.startTime).toISOString(),
        endTime: new Date(form.value.endTime).toISOString(),
        announceTime: new Date(form.value.announceTime).toISOString()
      }
  
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/events/createEvent`, payload)
  
      await Swal.fire({
        icon: 'success',
        title: '活動建立成功',
        text: `活動 ID：${res.data.data.id}`,
        confirmButtonText: '新增獎項'
      })

      router.push({ name: 'AddPrizeToEvent', params: { eventId: res.data.data.id } })

  
      form.value = {
        eventName: '',
        minSpend: 0,
        maxEntries: 1,
        announceTime: '',
        startTime: '',
        endTime: '',
        establishedBy: ''
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: '建立失敗',
        text: err.response?.data?.message || '發生錯誤，請稍後再試'
      })
    }
  }
  </script>
  
  <style scoped>
  .create-event {
    max-width: 600px;
    margin: auto;
  }
  .form-group {
    margin-bottom: 1em;
  }
  input {
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
  