<template>
    <div class="create-coupon-template">
      <h2>建立優惠券模板</h2>
  
      <form @submit.prevent="onSubmit" class="coupon-form">
        <div v-if="formError" class="form-error">{{ formError }}</div>
  
        <div class="form-left">
          <div class="form-group upload-container">
            <label>上傳圖片</label>
            <div class="upload-box" @click="triggerFileUpload">
              <div v-if="!imgURL" class="add">+</div>
              <img v-if="imgURL" :src="imgURL" style="width: 100%; height: 100%; object-fit: contain" />
              <input type="file" class="theFile" @change="fileChange" accept="image/*" ref="fileInput" />
            </div>
            <p v-if="errors.mediaData" class="error">{{ errors.mediaData }}</p>
          </div>
        </div>
  
        <div class="form-right">
          <div class="form-group">
            <label for="applicableType">適用類型</label>
            <select
              id="applicableType"
              v-model="form.applicableType"
              @change="onApplicableTypeChange"
              :class="{ error: errors.applicableType }"
            >
              <option value="ALL">全部</option>
              <option value="BRAND">品牌</option>
              <option value="PRODUCT">商品</option>
            </select>
            <div class="error">{{ errors.applicableType }}</div>
          </div>
  
          <div class="form-group" v-if="form.applicableType !== 'ALL'">
            <label for="applicableId">適用項目</label>
            <div class="selector-input-group">
              <input
                id="applicableId"
                v-model="applicableName"
                type="text"
                readonly
                placeholder="點擊選擇適用商品或商家"
              />
              <button type="button" @click="openSelector">選擇</button>
            </div>
            <div class="error">{{ errors.applicableId }}</div>
          </div>
  
          <div class="form-group">
            <label for="minSpend">最低消費金額</label>
            <input
              id="minSpend"
              v-model.number="form.minSpend"
              @input="validateField('minSpend')"
              type="number"
              min="0"
              step="0.01"
            />
            <div class="error">{{ errors.minSpend }}</div>
          </div>
  
          <div class="form-group">
            <label for="discountType">折扣類型</label>
            <select
              id="discountType"
              v-model="form.discountType"
              @change="onDiscountTypeChange"
              :class="{ error: errors.discountType }"
            >
              <option value="VALUE">固定金額</option>
              <option value="PERCENTAGE">百分比</option>
            </select>
            <div class="error">{{ errors.discountType }}</div>
          </div>
  
          <div class="form-group">
            <label for="discountValue">折扣值</label>
            <input
              id="discountValue"
              v-model.number="form.discountValue"
              @input="validateField('discountValue')"
              type="number"
              step="0.01"
              min="0.01"
            />
            <div class="error">{{ errors.discountValue }}</div>
          </div>
  
          <div class="form-group" v-if="form.discountType === 'PERCENTAGE'">
            <label for="maxDiscount">最大折扣金額</label>
            <input
              id="maxDiscount"
              v-model.number="form.maxDiscount"
              @input="validateField('maxDiscount')"
              type="number"
              step="0.01"
              min="0.01"
            />
            <div class="error">{{ errors.maxDiscount }}</div>
          </div>
  
          <div class="form-group">
            <label for="tradeable">是否可轉贈</label>
            <select
              id="tradeable"
              v-model="form.tradeable"
              :class="{ error: errors.tradeable }"
            >
              <option :value="true">可轉贈</option>
              <option :value="false">不可轉贈</option>
            </select>
            <div class="error">{{ errors.tradeable }}</div>
          </div>
  
          <div class="form-group">
            <label for="startTime">開始時間</label>
            <input
              id="startTime"
              v-model="form.startTime"
              @input="validateField('startTime')"
              type="datetime-local"
            />
            <div class="error">{{ errors.startTime }}</div>
          </div>
  
          <div class="form-group">
            <label for="endTime">結束時間</label>
            <input
              id="endTime"
              v-model="form.endTime"
              @input="validateField('endTime')"
              type="datetime-local"
            />
            <div class="error">{{ errors.endTime }}</div>
          </div>
  
          <button type="submit" :disabled="isSubmitting">
            <span v-if="isSubmitting">建立中...</span>
            <span v-else>建立優惠券模板</span>
          </button>
        </div>
      </form>
  
      <ProductSelector
        v-if="showProductSelector"
        :selected-id="selectedApplicableId"
        @product-selected="handleProductSelected"
        @close="closeSelector"
      />
  
      <BrandSelector
        v-if="showBrandSelector"
        :selected-id="selectedApplicableId"
        @brand-selected="handleBrandSelected"
        @close="closeSelector"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed } from 'vue';
  import axios from 'axios';
  import Swal from 'sweetalert2';
  import ProductSelector from '@/components/ttpp/back/ProductSelector.vue'; // 確保路徑正確
  import BrandSelector from '@/components/ttpp/back/BrandSelector.vue';   // 確保路徑正確
  
  const form = ref({
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
  });
  
  const errors = ref({});
  const formError = ref(null);
  const isSubmitting = ref(false);
  
  const selectedFile = ref(null);
  const imgURL = ref(null);
  const fileInput = ref(null);
  
  const showProductSelector = ref(false);
  const showBrandSelector = ref(false);
  const selectedApplicableId = ref(null);
  const applicableName = ref('');
  
  const triggerFileUpload = () => {
    fileInput.value.click();
  };
  
  const fileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    selectedFile.value = file;
  
    const reader = new FileReader();
    reader.readAsDataURL(file);
  
    reader.onload = () => {
      imgURL.value = reader.result;
    };
  };
  
  const debounce = (fn, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  };
  
  const clientValidate = (field) => {
    const value = form.value[field];
    const start = form.value.startTime ? new Date(form.value.startTime) : null;
    const end = form.value.endTime ? new Date(form.value.endTime) : null;
  
    switch (field) {
      case 'applicableType':
        return !value ? '請選擇適用類型' : null;
      case 'applicableId':
        return form.value.applicableType !== 'ALL' && !selectedApplicableId.value ? '請選擇適用商品或商家' : null;
      case 'minSpend':
        return value < 0 ? '最低消費金額不能為負數' : null;
      case 'discountType':
        return !value ? '請選擇折扣類型' : null;
      case 'discountValue':
        return value <= 0 ? '折扣值必須大於 0' : null;
      case 'maxDiscount':
        return form.value.discountType === 'PERCENTAGE' && (value === null || value <= 0) ? '最大折扣金額必須大於 0' : null;
      case 'tradeable':
        return value === null ? '請選擇是否可轉贈' : null;
      case 'startTime':
        if (!value) return '請輸入開始時間';
        if (end && start >= end) return '開始時間必須早於結束時間';
        return null;
      case 'endTime':
        if (!value) return '請輸入結束時間';
        if (start && end <= start) return '結束時間必須晚於開始時間';
        return null;
      case 'mediaData':
        return !selectedFile.value ? '請上傳圖片' : null;
    }
    return null;
  };
  
  const validateField = debounce((field) => {
    errors.value[field] = clientValidate(field);
  }, 300);
  
  const onApplicableTypeChange = () => {
    selectedApplicableId.value = null;
    form.value.applicableId = null;
    applicableName.value = '';
    delete errors.value.applicableId;
  };
  
  const onDiscountTypeChange = () => {
    if (form.value.discountType !== 'PERCENTAGE') {
      form.value.maxDiscount = null;
      delete errors.value.maxDiscount;
    }
  };
  
  const openSelector = () => {
    if (form.value.applicableType === 'PRODUCT') {
      showProductSelector.value = true;
      showBrandSelector.value = false;
    } else if (form.value.applicableType === 'BRAND') {
      showProductSelector.value = false;
      showBrandSelector.value = true;
    }
  };
  
  const closeSelector = () => {
    showProductSelector.value = false;
    showBrandSelector.value = false;
  };
  
  const handleProductSelected = (product) => {
    selectedApplicableId.value = product ? product.id : null;
    applicableName.value = product ? product.name : '';
    form.value.applicableId = selectedApplicableId.value;
    closeSelector();
    validateField('applicableId');
  };
  
  const handleBrandSelected = (brand) => {
    selectedApplicableId.value = brand ? brand.id : null;
    applicableName.value = brand ? brand.name : '';
    form.value.applicableId = selectedApplicableId.value;
    closeSelector();
    validateField('applicableId');
  };
  
  const onSubmit = async () => {
    errors.value = {};
    formError.value = null;
    isSubmitting.value = true;
  
    const fields = Object.keys(form.value).filter(f => f !== 'mediaType');
    for (const field of fields) {
      const err = clientValidate(field);
      if (err) errors.value[field] = err;
    }
    if (!selectedFile.value) {
      errors.value.mediaData = '請上傳圖片';
    }
  
    if (Object.values(errors.value).some(e => e)) {
      formError.value = '請修正表單錯誤後再送出';
      isSubmitting.value = false;
      return;
    }
  
    const formData = new FormData();
    for (const key in form.value) {
      if (form.value[key] !== null && form.value[key] !== undefined) {
        formData.append(key, form.value[key]);
      }
    }
    if (selectedFile.value) {
      formData.append('mediaData', selectedFile.value);
    }
    formData.append('mediaType', 'IMAGE'); // Hardcoded to IMAGE for now, adjust if needed
  
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/coupons/template`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
  
      await Swal.fire({
        icon: 'success',
        title: '優惠券模板建立成功',
        text: `模板 ID：${res.data.data.id}`,
        confirmButtonText: '確定',
      });
  
      form.value = {
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
      };
      imgURL.value = null;
      selectedFile.value = null;
      selectedApplicableId.value = null;
      applicableName.value = '';
      errors.value = {};
      formError.value = null;
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: '建立失敗',
        text: err.response?.data?.message || err.message,
      });
    } finally {
      isSubmitting.value = false;
    }
  };
  </script>
  
  <style scoped>
  .create-coupon-template {
    max-width: 1000px;
    margin: auto;
    padding: 30px;
  }
  
  .coupon-form {
    display: grid;
    grid-template-columns: 400px 1fr;
    gap: 30px;
    align-items: start;
  }
  
  .form-left {
    padding-right: 20px;
  }
  
  .form-right {
    display: flex;
    flex-direction: column;
    gap: 1.5em;
    padding-left: 20px;
  }
  
  .form-group {
    margin-bottom: 1.5em;
  }
  
  label {
    display: block;
    margin-bottom: 0.75em;
    font-weight: bold;
    color: #333;
  }
  
  input,
  select {
    width: 100%;
    padding: 0.75em;
    box-sizing: border-box;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
  }
  
  button {
    padding: 0.8em 1.5em;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1.1rem;
    transition: background-color 0.3s ease;
  }
  
  button:hover:enabled {
    background-color: #0056b3;
  }
  
  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  .error {
    color: #dc3545;
    font-size: 0.9rem;
    margin-top: 0.25em;
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
    border: 10px dashed #eee;
    width: 100%;
    height: 350px;
    text-align: center;
    position: relative;
    overflow: hidden;
    border-radius: 6px;
    background-color: #f9f9f9;
    cursor: pointer;
  }
  
  .add {
    font: bold 120px Tahoma;
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
  
  .selector-input-group {
    display: flex;
    align-items: center;
  }
  
  .selector-input-group input {
    flex-grow: 1;
    margin-right: 10px;
    cursor: pointer;
  }
  
  .selector-input-group button {
    flex-shrink: 0;
}

@media (max-width: 768px) {
  .create-coupon-template {
    padding: 20px;
  }

  .coupon-form {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .form-left,
  .form-right {
    width: 100%;
    padding: 0;
  }

  .upload-box {
    height: 250px;
  }
}
</style>