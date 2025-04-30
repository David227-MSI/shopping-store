<template>
  <form @submit.prevent="onSubmit">
    <div>
      <label>適用類型</label>
      <select v-model="form.applicableType" @blur="validateField('applicableType')">
        <option value="ALL">全品項適用</option>
        <option value="PRODUCT">商品適用</option>
        <option value="BRAND">品牌適用</option>
      </select>
      <p class="error" v-if="errors.applicableType">{{ errors.applicableType }}</p>
    </div>

    <div v-if="form.applicableType !== 'ALL'">
      <label>Applicable ID</label>
      <input type="number" v-model.number="form.applicableId" @blur="validateField('applicableId')" />
      <p class="error" v-if="errors.applicableId">{{ errors.applicableId }}</p>
    </div>

    <div>
      <label>最低消費</label>
      <input type="number" v-model.number="form.minSpend" @blur="validateField('minSpend')" />
      <p class="error" v-if="errors.minSpend">{{ errors.minSpend }}</p>
    </div>

    <div>
      <label>折扣類型</label>
      <select v-model="form.discountType" @blur="validateField('discountType')">
        <option value="VALUE">金額折扣</option>
        <option value="PERCENTAGE">百分比折扣</option>
      </select>
      <p class="error" v-if="errors.discountType">{{ errors.discountType }}</p>
    </div>

    <div>
      <label>折扣值</label>
      <input type="number" v-model.number="form.discountValue" @blur="validateField('discountValue')" />
      <p class="error" v-if="errors.discountValue">{{ errors.discountValue }}</p>
    </div>

    <div v-if="form.discountType === 'PERCENTAGE'">
      <label>最高折抵金額</label>
      <input type="number" v-model.number="form.maxDiscount" @blur="validateField('maxDiscount')" />
      <p class="error" v-if="errors.maxDiscount">{{ errors.maxDiscount }}</p>
    </div>

    <div>
      <label>可否交易</label>
      <input type="checkbox" v-model="form.tradeable" @blur="validateField('tradeable')" />
      <p class="error" v-if="errors.tradeable">{{ errors.tradeable }}</p>
    </div>

    <div>
      <label>開始時間</label>
      <input type="datetime-local" v-model="form.startTime" @blur="validateField('startTime')" />
      <p class="error" v-if="errors.startTime">{{ errors.startTime }}</p>
    </div>

    <div>
      <label>到期時間</label>
      <input type="datetime-local" v-model="form.endTime" @blur="validateField('endTime')" />
      <p class="error" v-if="errors.endTime">{{ errors.endTime }}</p>
    </div>

    <button type="submit">建立優惠券模板</button>

    <p v-if="formError" class="error">{{ formError }}</p>
    <p v-if="success" class="success">{{ success }}</p>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const form = ref({
  applicableType: 'ALL',
  applicableId: null,
  minSpend: 0,
  discountType: 'VALUE',
  discountValue: 0.01,
  maxDiscount: null,
  tradeable: true,
  startTime: null,
  endTime: null
})

const errors = ref({})
const formError = ref(null)
const success = ref(null)

// 防抖函數，限制 AJAX 請求頻率
const debounce = (fn, delay) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }
}

// 客戶端驗證邏輯
const clientValidate = (field) => {
  const value = form.value[field]
  let error = null

  switch (field) {
    case 'minSpend':
      if (value < 0) error = '最低消費金額不能為負'
      break
    case 'discountValue':
      if (value <= 0) error = '折扣值必須大於 0'
      break
    case 'maxDiscount':
      if (form.value.discountType === 'PERCENTAGE' && (!value || value <= 0)) {
        error = '最高折抵金額必須大於 0'
      }
      break
    case 'startTime':
      if (value) {
        const start = new Date(value)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (start < today) error = '開始時間不能早於今天'
      }
      break
    case 'endTime':
      if (value && form.value.startTime) {
        const start = new Date(form.value.startTime)
        const end = new Date(value)
        if (end <= start) error = '到期時間必須晚於開始時間'
      }
      break
    case 'applicableType':
      if (!value) error = '請選擇適用類型'
      break
    case 'discountType':
      if (!value) error = '請選擇折扣類型'
      break
  }

  return error
}

// 伺服器端驗證（例如檢查 applicableId 是否有效）
const serverValidate = async (field) => {
  if (field === 'applicableId' && form.value.applicableType !== 'ALL' && form.value.applicableId) {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/validate/applicableId`, {
        params: {
          type: form.value.applicableType,
          id: form.value.applicableId
        }
      })
      return res.data.valid ? null : '無效的 Applicable ID'
    } catch (err) {
      return err.response?.data?.message || '伺服器驗證失敗'
    }
  }
  return null
}

// 驗證欄位
const validateField = debounce(async (field) => {
  errors.value[field] = null

  // 執行客戶端驗證
  const clientError = clientValidate(field)
  if (clientError) {
    errors.value[field] = clientError
    return
  }

  // 執行伺服器端驗證（如果需要）
  const serverError = await serverValidate(field)
  if (serverError) {
    errors.value[field] = serverError
  }
}, 300)

const onSubmit = async () => {
  errors.value = {}
  formError.value = null
  success.value = null

  // 提交前再次驗證所有欄位
  const fields = Object.keys(form.value)
  for (const field of fields) {
    const error = clientValidate(field) || (await serverValidate(field))
    if (error) errors.value[field] = error
  }

  if (Object.keys(errors.value).length > 0) {
    formError.value = '請修正表單中的錯誤'
    return
  }

  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/coupons/template`, form.value)
    success.value = '優惠券模板建立成功，ID：' + res.data.data.id
  } catch (err) {
    if (err.response?.data?.errors) {
      errors.value = err.response.data.errors
    } else {
      formError.value = err.response?.data?.message || '發生錯誤，請稍後再試'
    }
  }
}
</script>

<style scoped>
form {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.error {
  color: red;
  font-size: 0.85em;
  margin-top: -8px;
}
.success {
  color: green;
  font-weight: bold;
}
</style>
