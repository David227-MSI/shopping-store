<template>
    <div class="add-prize">
      <h2>為活動新增獎項</h2>
      <p>活動 ID：{{ eventId }}</p>
  
      <form @submit.prevent="onSubmit" class="coupon-form">
        <div v-if="formError" class="form-error">{{ formError }}</div>
  
        <div class="form-right">
          <div class="form-group">
            <label for="itemType">獎品類型</label>
            <select
              id="itemType"
              v-model="form.itemType"
              @change="onItemTypeChange"
              :class="{ error: errors.itemType }"
            >
              <option disabled value="">請選擇</option>
              <option value="PRODUCT">商品</option>
              <option value="COUPON_TEMPLATE">折價券模板</option>
            </select>
            <div class="error">{{ errors.itemType }}</div>
          </div>
  
          <div class="form-group" v-if="form.itemType !== ''">
            <label for="itemId">獎品</label>
            <div class="selector-input-group">
              <input
                id="itemId"
                v-model="itemName"
                type="text"
                readonly
                placeholder="點擊選擇獎品"
              />
              <button type="button" @click="openSelector">選擇</button>
            </div>
            <div class="error">{{ errors.itemId }}</div>
          </div>
  
          <div class="form-group">
            <label for="quantity">數量</label>
            <input
              id="quantity"
              v-model.number="form.quantity"
              @input="validateField('quantity')"
              type="number"
              min="0"
            />
            <div class="error">{{ errors.quantity }}</div>
          </div>
  
          <div class="form-group">
            <label for="totalSlots">總名額</label>
            <input
              id="totalSlots"
              v-model.number="form.totalSlots"
              @input="validateField('totalSlots')"
              type="number"
              min="1"
            />
            <div class="error">{{ errors.totalSlots }}</div>
          </div>
  
          <div class="form-group">
            <label for="winRate">中獎機率（0 ~ 1）</label>
            <input
              id="winRate"
              v-model="form.winRate"
              @input="validateField('winRate')"
              type="text"
            />
            <div class="error">{{ errors.winRate }}</div>
          </div>
  
          <div class="form-group">
            <label for="title">獎項名稱</label>
            <input
              id="title"
              v-model="form.title"
              @input="validateField('title')"
              type="text"
              maxlength="100"
            />
            <div class="error">{{ errors.title }}</div>
          </div>
  
          <button type="submit" :disabled="isSubmitting">
            <span v-if="isSubmitting">新增中...</span>
            <span v-else>新增獎項</span>
          </button>
        </div>
      </form>
  
      <ProductSelector
        v-if="showProductSelector"
        :selected-id="selectedItemId"
        @product-selected="handleProductSelected"
        @close="closeSelector"
      />
  
      <CouponTemplateSelector
        v-if="showCouponTemplateSelector"
        :selected-id="selectedItemId"
        :event-id="eventId"
        @coupon-template-selected="handleCouponTemplateSelected"
        @close="closeSelector"
      />
  
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
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import axios from 'axios';
  import Swal from 'sweetalert2';
  import ProductSelector from '@/components/ttpp/back/ProductSelector.vue'; // 確保路徑正確
  import CouponTemplateSelector from '@/components/ttpp/back/CouponTemplateSelector.vue'; // 確保路徑正確
  
  const route = useRoute();
  const eventId = ref(parseInt(route.params.eventId || 0));
  
  const form = ref({
    itemType: '',
    itemId: null,
    quantity: 1,
    totalSlots: 1,
    winRate: '0.2',
    title: '',
  });
  
  const errors = ref({});
  const formError = ref(null);
  const isSubmitting = ref(false);
  const prizes = ref([]);
  
  const showProductSelector = ref(false);
  const showCouponTemplateSelector = ref(false);
  const selectedItemId = ref(null);
  const itemName = ref('');
  
  const debounce = (fn, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  };
  
  const clientValidate = (field) => {
    const val = form.value[field];
  
    switch (field) {
      case 'itemType':
        return !val ? '請選擇獎品類型' : null;
      case 'itemId':
        return !val || val <= 0 ? '請選擇有效的獎品' : null;
      case 'quantity':
        return val < 0 ? '數量不得為負' : null;
      case 'totalSlots':
        return val <= 0 ? '總名額必須大於 0' : null;
      case 'winRate':
        const num = parseFloat(val);
        return isNaN(num) || num < 0 || num > 1 ? '中獎機率需在 0 到 1 之間' : null;
      case 'title':
        return !val ? '請輸入獎項名稱' : null;
    }
  
    return null;
  };
  
  const validateField = debounce((field) => {
    errors.value[field] = clientValidate(field);
  }, 300);
  
  const onItemTypeChange = () => {
    form.value.itemId = null;
    selectedItemId.value = null;
    itemName.value = '';
    delete errors.value.itemId;
  };
  
  const openSelector = () => {
    if (form.value.itemType === 'PRODUCT') {
      showProductSelector.value = true;
      showCouponTemplateSelector.value = false;
    } else if (form.value.itemType === 'COUPON_TEMPLATE') {
      showProductSelector.value = false;
      showCouponTemplateSelector.value = true;
    }
  };
  
  const closeSelector = () => {
    showProductSelector.value = false;
    showCouponTemplateSelector.value = false;
  };
  
  const handleProductSelected = (product) => {
    selectedItemId.value = product ? product.id : null;
    itemName.value = product ? product.name : '';
    form.value.itemId = selectedItemId.value;
    closeSelector();
    validateField('itemId');
  };
  
  const handleCouponTemplateSelected = (couponTemplate) => {
    selectedItemId.value = couponTemplate ? couponTemplate.id : null;
    itemName.value = couponTemplate ? couponTemplate.title : ''; // 假設 CouponTemplate 物件有 title 屬性
    form.value.itemId = selectedItemId.value;
    closeSelector();
    validateField('itemId');
  };
  
  const onSubmit = async () => {
    errors.value = {};
    formError.value = null;
    isSubmitting.value = true;
  
    for (const field of Object.keys(form.value)) {
      const err = clientValidate(field);
      if (err) errors.value[field] = err;
    }
  
    if (Object.values(errors.value).some(e => e)) {
      formError.value = '請修正錯誤後再送出';
      isSubmitting.value = false;
      return;
    }
  
    try {
      const payload = {
        ...form.value,
        eventId: eventId.value,
      };
  
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/events/addPrize`,
        payload
      );
  
      prizes.value.push(res.data.data);
  
      await Swal.fire({
        icon: 'success',
        title: '獎項新增成功',
        text: res.data.data.title,
        confirmButtonText: '繼續新增',
      });
  
      form.value = {
        itemType: '',
        itemId: null,
        quantity: 1,
        totalSlots: 1,
        winRate: '0.2',
        title: '',
      };
      itemName.value = '';
      selectedItemId.value = null;
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: '新增失敗',
        text: err.response?.data?.message || '請稍後再試',
      });
    } finally {
      isSubmitting.value = false;
    }
  };
  </script>
  
  <style scoped>
  .add-prize {
    max-width: 1000px;
    margin: auto;
    padding: 30px;
  }
  
  .coupon-form {
    display: grid;
    grid-template-columns: 1fr; /* 單欄顯示 */
    gap: 1.5em;
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
    .add-prize {
      padding: 20px;
    }
  
    .coupon-form {
      grid-template-columns: 1fr;
      gap: 20px;
    }
  }
  </style>