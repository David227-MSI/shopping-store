<template>
  <form @submit.prevent="onSubmit">
    <div class="form-group">
      <label>適用類型</label>
      <select v-model="form.applicableType" @input="validateField('applicableType')">
        <option value="ALL">全品項適用</option>
        <option value="PRODUCT">商品適用</option>
        <option value="BRAND">品牌適用</option>
      </select>
      <div class="error">{{ errors.applicableType }}</div>
    </div>

    <div v-if="form.applicableType !== 'ALL'" class="form-group">
      <label>Applicable ID</label>
      <input type="number" v-model.number="form.applicableId" @input="validateField('applicableId')" />
      <div class="error">{{ errors.applicableId }}</div>
    </div>

    <div class="form-group">
      <label>最低消費</label>
      <input type="number" v-model.number="form.minSpend" @input="validateField('minSpend')" />
      <div class="error">{{ errors.minSpend }}</div>
    </div>

    <div class="form-group">
      <label>折扣類型</label>
      <select v-model="form.discountType" @input="validateField('discountType')">
        <option value="VALUE">金額折扣</option>
        <option value="PERCENTAGE">百分比折扣</option>
      </select>
      <div class="error">{{ errors.discountType }}</div>
    </div>

    <div class="form-group">
      <label>折扣值</label>
      <input type="number" v-model.number="form.discountValue" @input="validateField('discountValue')" />
      <div class="error">{{ errors.discountValue }}</div>
    </div>

    <div v-if="form.discountType === 'PERCENTAGE'" class="form-group">
      <label>最高折抵金額</label>
      <input type="number" v-model.number="form.maxDiscount" @input="validateField('maxDiscount')" />
      <div class="error">{{ errors.maxDiscount }}</div>
    </div>

    <div class="form-group">
      <label>可否交易</label>
      <input type="checkbox" v-model="form.tradeable" @change="validateField('tradeable')" />
    </div>

    <div class="form-group">
      <label>開始時間</label>
      <input type="datetime-local" v-model="form.startTime" @input="validateField('startTime')" />
      <div class="error">{{ errors.startTime }}</div>
    </div>

    <div class="form-group">
      <label>到期時間</label>
      <input type="datetime-local" v-model="form.endTime" @input="validateField('endTime')" />
      <div class="error">{{ errors.endTime }}</div>
    </div>

    <button type="submit">建立優惠券模板</button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const form = ref({
  applicableType: 'ALL',
  applicableId: null,
  minSpend: 200,
  discountType: 'VALUE',
  discountValue: 50,
  maxDiscount: null,
  tradeable: true,
  startTime: '',
  endTime: ''
})

const errors = ref({})
const debounce = (fn, delay) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }
}

const clientValidate = (field) => {
  const value = form.value[field]
  let error = null
  const now = new Date()

  switch (field) {
    case 'applicableType':
      if (!value) error = '請選擇適用類型'
      break
    case 'applicableId':
      if (form.value.applicableType !== 'ALL' && (!value || value < 1)) {
        error = '請輸入有效的 ID'
      }
      break
    case 'minSpend':
      if (value < 0) error = '最低消費金額不能為負'
      break
    case 'discountType':
      if (!value) error = '請選擇折扣類型'
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
      if (!value) {
        error = '請輸入開始時間'
      } else if (new Date(value) < now) {
        error = '開始時間不能早於目前時間'
      }
      break
    case 'endTime':
      if (!value) {
        error = '請輸入到期時間'
      } else if (form.value.startTime && new Date(value) <= new Date(form.value.startTime)) {
        error = '到期時間必須晚於開始時間'
      }
      break
  }

  return error
}

const serverValidate = async (field) => {
  if (field === 'applicableId' && form.value.applicableType !== 'ALL') {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/validate/applicableId`, {
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

const validateField = debounce(async (field) => {
  const clientError = clientValidate(field)
  if (clientError) {
    errors.value[field] = clientError
    return
  }

  const serverError = await serverValidate(field)
  if (serverError) {
    errors.value[field] = serverError
  } else {
    errors.value[field] = null
  }
}, 300)

const onSubmit = async () => {
  errors.value = {}

  const fields = Object.keys(form.value)
  for (const field of fields) {
    const err = clientValidate(field) || (await serverValidate(field))
    if (err) errors.value[field] = err
  }

  if (Object.values(errors.value).some(e => e)) {
    Swal.fire({
      icon: 'error',
      title: '欄位驗證失敗',
      text: '請確認所有欄位皆正確填寫'
    })
    return
  }

  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/coupons/template`, form.value)
    Swal.fire({
      icon: 'success',
      title: '建立成功',
      text: `優惠券模板 ID：${res.data.data.id}`,
      confirmButtonText: '確認'
    })

    // Reset form
    form.value = {
      applicableType: 'ALL',
      applicableId: null,
      minSpend: 200,
      discountType: 'VALUE',
      discountValue: 50,
      maxDiscount: null,
      tradeable: true,
      startTime: '',
      endTime: ''
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
  font-size: 0.85em;
}
</style>
