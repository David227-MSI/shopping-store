<template>
    <div class="form-container">
      <h2>建立優惠券模板</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <div class="input-wrapper">
            <label :class="{ 'active': form.applicableType }" for="applicableType">適用類型</label>
            <select
              v-model="form.applicableType"
              @change="onApplicableTypeChange"
              id="applicableType"
              :class="{ 'error': errors.applicableType }"
              aria-describedby="applicableType-error"
            >
              <option value="ALL">全部</option>
              <option value="BRAND">品牌</option>
              <option value="PRODUCT">產品</option>
            </select>
          </div>
          <p v-if="errors.applicableType" class="error-msg" id="applicableType-error">❌ {{ errors.applicableType }}</p>
        </div>
  
        <div class="form-group" v-if="form.applicableType !== 'ALL'">
          <div class="input-wrapper">
            <label :class="{ 'active': form.applicableId }" for="applicableId">適用 ID</label>
            <input
              type="number"
              v-model.number="form.applicableId"
              placeholder="請輸入適用 ID"
              id="applicableId"
              :class="{ 'error': errors.applicableId }"
              aria-describedby="applicableId-error"
            />
          </div>
          <p v-if="errors.applicableId" class="error-msg" id="applicableId-error">❌ {{ errors.applicableId }}</p>
        </div>
  
        <div class="form-group">
          <div class="input-wrapper">
            <label :class="{ 'active': form.minSpend !== null }" for="minSpend">最低消費金額</label>
            <input
              type="number"
              v-model.number="form.minSpend"
              min="0"
              @input="validateMinSpend"
              placeholder="金額不得為負值"
              id="minSpend"
              :class="{ 'error': errors.minSpend }"
              aria-describedby="minSpend-error"
            />
          </div>
          <p v-if="errors.minSpend" class="error-msg" id="minSpend-error">❌ {{ errors.minSpend }}</p>
        </div>
  
        <div class="form-group">
          <div class="input-wrapper">
            <label :class="{ 'active': form.discountType }" for="discountType">折扣類型</label>
            <select
              v-model="form.discountType"
              @change="onDiscountTypeChange"
              id="discountType"
              :class="{ 'error': errors.discountType }"
              aria-describedby="discountType-error"
            >
              <option value="VALUE">固定金額</option>
              <option value="PERCENTAGE">百分比</option>
            </select>
          </div>
          <p v-if="errors.discountType" class="error-msg" id="discountType-error">❌ {{ errors.discountType }}</p>
        </div>
  
        <div class="form-group">
          <div class="input-wrapper">
            <label :class="{ 'active': form.discountValue }" for="discountValue">折扣值</label>
            <input
              type="number"
              v-model.number="form.discountValue"
              step="0.01"
              min="0.01"
              @input="debounceValidateDiscountValue"
              placeholder="折扣值需大於 0"
              id="discountValue"
              :class="{ 'error': errors.discountValue }"
              aria-describedby="discountValue-error"
            />
          </div>
          <p v-if="errors.discountValue" class="error-msg" id="discountValue-error">❌ {{ errors.discountValue }}</p>
        </div>
  
        <div class="form-group" v-if="form.discountType === 'PERCENTAGE'">
          <div class="input-wrapper">
            <label :class="{ 'active': form.maxDiscount }" for="maxDiscount">最大折扣金額</label>
            <input
              type="number"
              v-model.number="form.maxDiscount"
              step="0.01"
              min="0.01"
              placeholder="百分比折扣需設定"
              id="maxDiscount"
              :class="{ 'error': errors.maxDiscount }"
              aria-describedby="maxDiscount-error"
            />
          </div>
          <p v-if="errors.maxDiscount" class="error-msg" id="maxDiscount-error">❌ {{ errors.maxDiscount }}</p>
        </div>
  
        <div class="form-group">
          <div class="input-wrapper">
            <label :class="{ 'active': form.tradeable !== null }" for="tradeable">是否可轉贈</label>
            <select
              v-model="form.tradeable"
              id="tradeable"
              :class="{ 'error': errors.tradeable }"
              aria-describedby="tradeable-error"
            >
              <option :value="true">可轉贈</option>
              <option :value="false">不可轉贈</option>
            </select>
          </div>
          <p v-if="errors.tradeable" class="error-msg" id="tradeable-error">❌ {{ errors.tradeable }}</p>
        </div>
  
        <div class="form-group">
          <div class="input-wrapper">
            <label :class="{ 'active': form.startTime }" for="startTime">開始時間</label>
            <input
              type="datetime-local"
              v-model="form.startTime"
              @input="validateDateTime"
              id="startTime"
              :class="{ 'error': errors.startTime }"
              aria-describedby="startTime-error"
            />
          </div>
          <p v-if="errors.startTime" class="error-msg" id="startTime-error">❌ {{ errors.startTime }}</p>
        </div>
  
        <div class="form-group">
          <div class="input-wrapper">
            <label :class="{ 'active': form.endTime }" for="endTime">結束時間</label>
            <input
              type="datetime-local"
              v-model="form.endTime"
              @input="validateDateTime"
              id="endTime"
              :class="{ 'error': errors.endTime }"
              aria-describedby="endTime-error"
            />
          </div>
          <p v-if="errors.endTime" class="error-msg" id="endTime-error">❌ {{ errors.endTime }}</p>
        </div>
  
        <div class="form-group">
          <div class="input-wrapper">
            <label :class="{ 'active': form.mediaType }" for="mediaType">媒體類型</label>
            <select
              v-model="form.mediaType"
              id="mediaType"
              :class="{ 'error': errors.mediaType }"
              aria-describedby="mediaType-error"
            >
              <option value="IMAGE">圖片</option>
              <option value="VIDEO">影片</option>
            </select>
          </div>
          <p v-if="errors.mediaType" class="error-msg" id="mediaType-error">❌ {{ errors.mediaType }}</p>
        </div>
  
        <div class="form-group">
          <div class="input-wrapper">
            <label for="mediaData">媒體檔案</label>
            <input
              type="file"
              @change="onFileChange"
              id="mediaData"
              :class="{ 'error': errors.mediaData }"
              aria-describedby="mediaData-error"
            />
          </div>
          <p v-if="errors.mediaData" class="error-msg" id="mediaData-error">❌ {{ errors.mediaData }}</p>
          <img v-if="mediaPreview" :src="mediaPreview" alt="媒體預覽" class="preview-img" />
        </div>
  
        <div class="button-group">
          <button type="submit" :disabled="isSubmitting" class="submit-btn">
            {{ isSubmitting ? '提交中...' : '提交' }}
          </button>
          <button type="button" @click="resetForm" class="reset-btn">重置</button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import axios from 'axios'
  import Swal from 'sweetalert2'
  
  // Custom debounce function
  const debounce = (fn, delay) => {
    let timeoutId
    return (...args) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => fn(...args), delay)
    }
  }
  
  const form = ref({
    id: null,
    applicableType: 'ALL',
    applicableId: null,
    minSpend: 0,
    discountType: 'VALUE',
    discountValue: 50,
    maxDiscount: null,
    tradeable: true,
    startTime: '',
    endTime: '',
    mediaType: 'IMAGE',
    mediaData: null,
  })
  
  const errors = ref({})
  const isSubmitting = ref(false)
  
  // --- 前端基本驗證 (不使用 AJAX) ---
  const validateMinSpend = () => {
    if (form.value.minSpend === null || form.value.minSpend < 0) {
      errors.value.minSpend = '最低消費金額必須 >= 0'
    } else {
      delete errors.value.minSpend
    }
  }
  
  const validateDateTime = () => {
    if (form.value.startTime && form.value.endTime && new Date(form.value.startTime) >= new Date(form.value.endTime)) {
      errors.value.endTime = '結束時間不能早於或等於開始時間'
      errors.value.startTime = '開始時間不能晚於或等於結束時間'
    } else {
      delete errors.value.endTime
      delete errors.value.startTime
      if (!form.value.startTime) errors.value.startTime = '請選擇開始時間'
      if (!form.value.endTime) errors.value.endTime = '請選擇結束時間'
    }
  }
  
  const onDiscountTypeChange = () => {
    if (form.value.discountType !== 'PERCENTAGE') {
      form.value.maxDiscount = null
      delete errors.value.maxDiscount
    }
  }
  
  const onFileChange = (event) => {
    const file = event.target.files[0]
    form.value.mediaData = file
  
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        form.value.mediaPreview = e.target.result
      }
      reader.readAsDataURL(file)
    } else {
      form.value.mediaPreview = null
    }
  
    if (file) delete errors.value.mediaData
  }
  
  const validateBeforeSubmit = () => {
    errors.value = {}
    if (!form.value.applicableType) errors.value.applicableType = '請選擇適用類型'
    if (form.value.minSpend === null) errors.value.minSpend = '請輸入最低消費金額'
    if (!form.value.discountType) errors.value.discountType = '請選擇折扣類型'
    if (!form.value.discountValue) errors.value.discountValue = '請輸入折扣值'
    if (form.value.discountType === 'PERCENTAGE' && form.value.maxDiscount === null)
      errors.value.maxDiscount = '請輸入最大折扣金額'
    if (form.value.tradeable === null) errors.value.tradeable = '請選擇是否可轉贈'
    if (!form.value.startTime) errors.value.startTime = '請選擇開始時間'
    if (!form.value.endTime) errors.value.endTime = '請選擇結束時間'
    if (!form.value.mediaType) errors.value.mediaType = '請選擇媒體類型'
    if (!form.value.mediaData) errors.value.mediaData = '請上傳媒體檔案'
  
    return Object.keys(errors.value).length === 0
  }
  
  const resetForm = () => {
    form.value = {
      id: null,
      applicableType: 'ALL',
      applicableId: null,
      minSpend: 0,
      discountType: 'VALUE',
      discountValue: 50,
      maxDiscount: null,
      tradeable: true,
      startTime: '',
      endTime: '',
      mediaType: 'IMAGE',
      mediaData: null,
    }
    errors.value = {}
  }
  
  const handleSubmit = async () => {
    validateMinSpend()
    validateDateTime()
  
    if (!validateBeforeSubmit() || Object.keys(errors.value).length > 0) {
      Swal.fire({
        icon: 'error',
        title: '表單錯誤',
        text: '請檢查並修正所有錯誤欄位',
      })
      return
    }
  
    isSubmitting.value = true
    const formData = new FormData()
    for (const key in form.value) {
      if (form.value[key] !== null && form.value[key] !== undefined) {
        if (key === 'mediaData') {
          formData.append('mediaData', form.value.mediaData)
        } else {
          formData.append(key, form.value[key])
        }
      }
    }
  
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/coupons/template`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      Swal.fire({
        icon: 'success',
        title: '建立成功',
        text: '優惠券模板已成功創建！',
      })
      resetForm()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: '提交失敗',
        text: `錯誤訊息: ${error.response?.data?.message || '請稍後再試'}`,
      })
      console.error(error)
    } finally {
      isSubmitting.value = false
    }
  }
  </script>

<style scoped>
/* General container styling */
.form-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Heading styling */
.form-container h2 {
  text-align: center;
  color: #333;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 600;
}

/* Form group styling */
.form-group {
  margin-bottom: 1.5rem;
}

/* Input wrapper for consistent spacing */
.input-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
}

/* Label styling */
label {
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 0.5rem;
  transition: all 0.2s ease;
}

/* Label active state */
label.active {
  color: #007bff;
  font-weight: 500;
}

/* Input, select, and file input styling */
input,
select {
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input:focus,
select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
}

/* Placeholder styling */
input::placeholder {
  color: #999;
  font-style: italic;
}

/* Error state for inputs */
input.error,
select.error {
  border-color: #dc3545;
}

/* Error message styling */
.error-msg {
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* File input specific styling */
input[type="file"] {
  padding: 0.5rem;
}

/* Media preview image */
.preview-img {
  max-width: 100%;
  height: auto;
  margin-top: 1rem;
  border-radius: 4px;
  border: 1px solid #ddd;
}

/* Button group styling */
.button-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

/* Button styling */
.submit-btn,
.reset-btn {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

/* Submit button */
.submit-btn {
  background-color: #007bff;
  color: #fff;
}

.submit-btn:hover {
  background-color: #0056b3;
}

.submit-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

/* Reset button */
.reset-btn {
  background-color: #6c757d;
  color: #fff;
}

.reset-btn:hover {
  background-color: #5a6268;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .form-container {
    padding: 1rem;
    margin: 1rem;
  }

  .button-group {
    flex-direction: column;
    align-items: center;
  }

  .submit-btn,
  .reset-btn {
    width: 100%;
    max-width: 200px;
  }
}
</style>