<template>
    <div class="create-event">
      <h2>建立促銷活動</h2>
  
      <form @submit.prevent="onSubmit" class="event-form">
        <div v-if="formError" class="form-error">{{ formError }}</div>
  
        <div class="form-left">
          <div class="form-group upload-container">
            <label>上傳圖片</label>
            <div class="upload-box">
              <div v-if="!imgURL" class="add">+</div>
              <img v-if="imgURL" :src="imgURL" style="width: 100%; height: 100%; object-fit: contain" />
              <input type="file" class="theFile" @change="fileChange" />
            </div>
          </div>
        </div>
  
        <div class="form-right">
          <div class="form-group">
            <label for="eventName">活動名稱</label>
            <input id="eventName" v-model="form.eventName" @input="validateField('eventName')" type="text" maxlength="100" />
            <div class="error">{{ errors.eventName }}</div>
          </div>
  
          <div class="form-group">
            <label for="minSpend">最低消費金額</label>
            <input id="minSpend" v-model.number="form.minSpend" @input="validateField('minSpend')" type="number" min="0" step="0.01" />
            <div class="error">{{ errors.minSpend }}</div>
          </div>
  
          <div class="form-group">
            <label for="maxEntries">最大參加次數</label>
            <input id="maxEntries" v-model.number="form.maxEntries" @input="validateField('maxEntries')" type="number" min="0" />
            <div class="error">{{ errors.maxEntries }}</div>
          </div>
  
          <div class="form-group">
            <label for="announceTime">發佈時間</label>
            <input id="announceTime" v-model="form.announceTime" @input="validateField('announceTime')" type="datetime-local" />
            <div class="error">{{ errors.announceTime }}</div>
          </div>
  
          <div class="form-group">
            <label for="startTime">開始時間</label>
            <input id="startTime" v-model="form.startTime" @input="validateField('startTime')" type="datetime-local" />
            <div class="error">{{ errors.startTime }}</div>
          </div>
  
          <div class="form-group">
            <label for="endTime">結束時間</label>
            <input id="endTime" v-model="form.endTime" @input="validateField('endTime')" type="datetime-local" />
            <div class="error">{{ errors.endTime }}</div>
          </div>
  
          <div class="form-group">
            <label for="establishedBy">建立人</label>
            <input id="establishedBy" v-model="form.establishedBy" @input="validateField('establishedBy')" type="text" maxlength="100" />
            <div class="error">{{ errors.establishedBy }}</div>
          </div>
  
          <button type="submit">建立活動</button>
        </div>
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
    establishedBy: '',
    mediaType: 'IMAGE'
  })
  
  const errors = ref({})
  const formError = ref(null)
  
  const selectedFile = ref(null)
  const imgURL = ref(null)
  
  const fileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
  
    selectedFile.value = file
  
    const reader = new FileReader()
    reader.readAsDataURL(file)
  
    reader.onload = () => {
      imgURL.value = reader.result
    }
  }
  
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
  
    const fields = Object.keys(form.value).filter(f => f !== 'mediaType')
    for (const field of fields) {
      const err = clientValidate(field)
      if (err) errors.value[field] = err
    }
  
    if (Object.values(errors.value).some(e => e)) {
      formError.value = '請修正表單錯誤後再送出'
      return
    }
  
    const formData = new FormData()
    formData.append('eventName', form.value.eventName)
    formData.append('minSpend', form.value.minSpend)
    formData.append('maxEntries', form.value.maxEntries)
    formData.append('announceTime', form.value.announceTime)
    formData.append('startTime', form.value.startTime)
    formData.append('endTime', form.value.endTime)
    formData.append('establishedBy', form.value.establishedBy)
    formData.append('mediaType', form.value.mediaType)
  
    if (selectedFile.value) {
      formData.append('mediaData', selectedFile.value)
    }
  
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/events/createEvent`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      )
  
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
        establishedBy: '',
        mediaType: 'IMAGE'
      }
      imgURL.value = null
      selectedFile.value = null
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: '建立失敗',
        text: err.response?.data?.message || err.message
      })
    }
  }
  </script>
  
  <style scoped>
.create-event {
  max-width: 1000px; /* 稍微增加最大寬度 */
  margin: auto;
  padding: 30px; /* 增加外邊距 */
}

.event-form {
  display: grid;
  grid-template-columns: 400px 1fr; /* 稍微增加左欄寬度 */
  gap: 30px; /* 增加欄位之間的間距 */
  align-items: start;
}

.form-left {
  /* 左欄樣式 - 可以根據需要添加內邊距 */
  padding-right: 20px; /* 增加左欄右邊的內邊距，與右欄隔開 */
}

.form-right {
  display: flex;
  flex-direction: column;
  gap: 1.5em; /* 增加右欄內部元素之間的間距 */
  padding-left: 20px; /* 增加右欄左邊的內邊距，與左欄隔開 */
}

.form-group {
  margin-bottom: 1.5em; /* 增加每個表單群組之間的間距 */
}

label {
  display: block;
  margin-bottom: 0.75em; /* 增加標籤下方的間距 */
  font-weight: bold;
  color: #333; /* 使標籤更清晰 */
}

input,
select {
  width: 100%;
  padding: 0.75em; /* 增加輸入框的內邊距 */
  box-sizing: border-box;
  border: 1px solid #ddd; /* 更柔和的邊框 */
  border-radius: 6px; /* 更圓潤的邊角 */
  font-size: 1rem; /* 稍微增加字體大小 */
}

button {
  padding: 0.8em 1.5em; /* 增加按鈕的內邊距 */
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px; /* 與輸入框一致的圓角 */
  cursor: pointer;
  font-size: 1.1rem; /* 稍微增加按鈕文字大小 */
  transition: background-color 0.3s ease; /* 添加hover效果過渡 */
}

button:hover {
  background-color: #0056b3;
}

.error {
  color: #dc3545; /* 更明顯的錯誤顏色 */
  font-size: 0.9rem;
  margin-top: 0.25em; /* 錯誤訊息與輸入框之間增加間距 */
}

.form-error {
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 1em;
  border-radius: 6px;
  margin-bottom: 1.5em;
}

.upload-container {
  /* 可以根據需要調整上傳容器的額外樣式 */
}

.upload-box {
  border: 10px dashed #eee; /* 更柔和的虛線邊框 */
  width: 100%;
  height: 350px; /* 稍微增加高度 */
  text-align: center;
  position: relative;
  overflow: hidden;
  border-radius: 6px;
  background-color: #f9f9f9; /* 增加背景色 */
}

.add {
  font: bold 120px Tahoma; /* 更大的加號 */
  color: #eee;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.theFile {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  cursor: pointer;
  opacity: 0;
}

@media (max-width: 768px) {
  .create-event {
    padding: 20px;
  }

  .event-form {
    grid-template-columns: 1fr; /* 小螢幕上改為單欄 */
    gap: 20px;
  }

  .form-left,
  .form-right {
    width: 100%;
    padding: 0; /* 移除小螢幕上的左右內邊距 */
  }

  .upload-box {
    height: 250px; /* 調整小螢幕上的高度 */
  }
}
</style>