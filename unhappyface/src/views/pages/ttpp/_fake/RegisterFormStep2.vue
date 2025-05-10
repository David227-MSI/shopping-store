<template>
    <div>
     <h2>個人資料</h2>
     <div class="form-group">
      <label for="birthday">生日</label>
      <input type="date" id="birthday" v-model="optionalData.birth">
      <div v-if="errors.birth" class="error-text">{{ errors.birth }}</div>
     </div>
     <div class="form-group">
      <label for="phone">電話</label>
      <input type="tel" id="phone" v-model="optionalData.phone" placeholder="您的電話號碼">
      <div v-if="errors.phone" class="error-text">{{ errors.phone }}</div>
     </div>
     <div class="form-group">
      <label for="city">縣市</label>
      <select id="city" v-model="selectedCity">
       <option value="" disabled>請選擇縣市</option>
       <option :value="city" :key="city" v-for="city in cities">{{ city }}</option>
      </select>
      <div v-if="errors.city" class="error-text">{{ errors.city }}</div>
     </div>
     <div class="form-group">
      <label for="district">區域</label>
      <select id="district" v-model="selectedDistrict" :disabled="!selectedCity">
       <option value="" disabled>請選擇區域</option>
       <option :value="district" :key="district" v-for="district in districts">{{ district }}</option>
      </select>
      <div v-if="errors.district" class="error-text">{{ errors.district }}</div>
     </div>
     <div class="form-group">
      <label for="detailAddress">詳細地址</label>
      <textarea id="detailAddress" v-model="detailAddress" placeholder="請輸入詳細地址"></textarea>
      <div v-if="errors.detailAddress" class="error-text">{{ errors.detailAddress }}</div>
     </div>
     <div class="button-group">
      <button type="button" class="back-button" @click="emit('back')">返回</button>
      <button type="button" class="next-button" @click="emit('next', { ...optionalData, city: selectedCity, district: selectedDistrict, detailAddress: detailAddress })" :disabled="isSubmitting">
       <span v-if="isSubmitting">處理中...</span>
       <span v-else>下一步，驗證信箱</span>
      </button>
     </div>
    </div>
   </template>
  
   <script setup>
   import { ref, reactive, watch, computed } from 'vue';
   import taiwanAddressData from '@/assets/CityCountyData.json'; // 確保路徑正確
  
   const props = defineProps({
    optionalData: Object,
    errors: Object,
    isSubmitting: Boolean,
   });
  
   const emit = defineEmits(['next', 'back']);
  
   const optionalData = reactive({ ...props.optionalData });
  
   const cities = ref(taiwanAddressData.map(item => item.CityName));
   const selectedCity = ref(props.optionalData?.city || '');
   const districts = ref(computed(() => {
    const selectedCityData = taiwanAddressData.find(cityData => cityData.CityName === selectedCity.value);
    return selectedCityData ? selectedCityData.AreaList.map(area => area.AreaName) : [];
   }));
   const selectedDistrict = ref(props.optionalData?.district || '');
   const detailAddress = ref(props.optionalData?.detailAddress || '');
  
   // 監聽選取的縣市，更新區域選項
   watch(selectedCity, (newCity) => {
    selectedDistrict.value = ''; // 重置選取的區域
   });
  
   // 監聽選取的區域和詳細地址，更新 optionalData 中的完整地址 (這裡我們在 emit 時傳遞)
   // watch(() => [selectedCity.value, selectedDistrict.value, detailAddress.value], ([newCity, newDistrict, newDetailAddress]) => {
   //  optionalData.address = `<span class="math-inline">\{newCity \|\| ''\}</span>{newDistrict || ''}${newDetailAddress || ''}`;
   // });
   </script>
  
  <style scoped>
  .form-group {
   margin-bottom: 20px;
  }
 
  label {
   display: block;
   margin-bottom: 8px;
   color: var(--text-dark);
   font-weight: bold;
  }
 
  input[type="date"],
  input[type="tel"],
  select,
  textarea {
   width: 100%;
   padding: 10px 12px;
   border: 1px solid #d2b48c;
   border-radius: 6px;
   box-sizing: border-box;
   font-family: inherit;
   font-size: 1rem;
  }
 
  textarea {
   min-height: 80px;
  }
 
  .error-text {
   color: #e74c3c;
   margin-top: 5px;
   margin-bottom: 10px;
   font-size: 0.9rem;
  }
 
  .button-group {
   display: flex;
   gap: 10px;
   margin-top: 20px;
  }
 
  .back-button,
  .next-button {
   padding: 12px 20px;
   border: none;
   border-radius: 6px;
   font-weight: bold;
   cursor: pointer;
   font-size: 1rem;
   transition: background-color 0.3s;
   flex-grow: 1;
  }
 
  .back-button {
   background-color: #f0f0f0;
   color: var(--text-dark);
   border: 1px solid #ccc;
  }
 
  .back-button:hover {
   background-color: #e0e0e0;
  }
 
  .next-button {
   background-color: var(--primary);
   color: var(--text-light);
  }
 
  .next-button:hover {
   background-color: #40291d;
  }
 
  .next-button:disabled {
   opacity: 0.7;
   cursor: not-allowed;
  }
  </style>