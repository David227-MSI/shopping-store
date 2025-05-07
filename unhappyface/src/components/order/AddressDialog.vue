<template>
  <div class="dialog-overlay" @click.self.prevent>
    <div class="dialog fade-in-down" :class="{ shake: hasError }">
      <h2>選擇宅配地址</h2>

      <!-- 切換方式 -->
      <div class="radio-group">
        <button
            class="radio-btn"
            :class="{ active: selectedType === 'member' }"
            @click="selectedType = 'member'"
        >
          使用會員地址
        </button>
        <button
            class="radio-btn"
            :class="{ active: selectedType === 'custom' }"
            @click="selectedType = 'custom'"
        >
          使用其他宅配地址
        </button>
      </div>

      <!-- 會員地址 -->
      <div v-if="selectedType === 'member'" class="member-info">
        <p><strong>預設地址</strong></p>
        <p><strong>姓名：</strong>{{ memberInfo.username }} </p>
        <p><strong>電話：</strong>{{ maskPhone(memberInfo.phone) }}</p>
        <p><strong>地址：</strong>{{ memberInfo.address }}</p>
      </div>

      <!-- 自訂地址 -->
      <div v-if="selectedType === 'custom'" class="custom-form">
        <div>
          <input
              v-model="customName"
              placeholder="收件人姓名"
              :class="{ error: errors.customName }"
              @input="clearError('customName')"
          />
          <p v-if="errors.customName" class="error-msg">收件人為必填</p>
        </div>

        <div>
          <input
              v-model="customPhone"
              placeholder="手機或市話"
              :class="{ error: errors.customPhone }"
              @input="clearError('customPhone')"
          />
          <p v-if="errors.customPhone" class="error-msg">電話為必填</p>
        </div>

        <div>
          <select v-model="selectedCity" :class="{ error: errors.selectedCity }" @change="clearError('selectedCity')">
            <option disabled value="">請選擇縣市</option>
            <option v-for="city in cityList" :key="city">{{ city }}</option>
          </select>
          <p v-if="errors.selectedCity" class="error-msg">請選擇縣市</p>
        </div>

        <div>
          <select v-model="selectedDistrict" :class="{ error: errors.selectedDistrict }" @change="clearError('selectedDistrict')">
            <option disabled value="">請選擇區域</option>
            <option v-for="district in districtOptions" :key="district">{{ district }}</option>
          </select>
          <p v-if="errors.selectedDistrict" class="error-msg">請選擇區域</p>
        </div>

        <div>
          <input
              v-model="customDetail"
              placeholder="詳細地址"
              :class="{ error: errors.customDetail }"
              @input="clearError('customDetail')"
          />
          <p v-if="errors.customDetail" class="error-msg">詳細地址為必填</p>
        </div>
      </div>

      <div class="dialog-actions">
        <button class="cancel-btn" @click="onCancel">取消</button>
        <button class="confirm-btn" @click="submit">確定</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import rawData from '@/assets/CityCountyData.json';

const props = defineProps({
  show: Boolean,
  memberInfo: Object,
});

const emit = defineEmits(['confirm', 'close']);

const selectedType = ref('member');
const customName = ref('');
const customPhone = ref('');
const selectedCity = ref('');
const selectedDistrict = ref('');
const customDetail = ref('');
const errors = ref({});
const hasError = ref(false);

const addressData = {};
rawData.forEach((entry) => {
  addressData[entry.CityName] = entry.AreaList.map((a) => a.AreaName);
});
const cityList = Object.keys(addressData);
const districtOptions = computed(() => addressData[selectedCity.value] || []);

const maskPhone = (phone) =>
    phone ? phone.replace(/(\d{2})(\d{4})(\d{4})/, '$1••••$3') : '';

const clearError = (field) => {
  if (errors.value[field]) {
    errors.value[field] = false;
  }
};

const validateFields = () => {
  const e = {};
  if (!customName.value) e.customName = true;
  if (!customPhone.value) e.customPhone = true;
  if (!selectedCity.value) e.selectedCity = true;
  if (!selectedDistrict.value) e.selectedDistrict = true;
  if (!customDetail.value) e.customDetail = true;
  errors.value = e;
  return Object.keys(e).length === 0;
};

const submit = () => {
  if (selectedType.value === 'member') {
    emit('confirm', {
      name: props.memberInfo.username,
      phone: props.memberInfo.phone,
      address: props.memberInfo.address,
    });
  } else {
    if (!validateFields()) {
      hasError.value = true;
      setTimeout(() => (hasError.value = false), 400);
      return;
    }

    const address = `${selectedCity.value}${selectedDistrict.value}${customDetail.value}`;
    emit('confirm', {
      name: customName.value,
      phone: customPhone.value,
      address,
    });
  }
};

watch(
    () => props.show,
    (val) => {
      if (val) {
        selectedType.value = 'member';
        customName.value = '';
        customPhone.value = '';
        selectedCity.value = '';
        selectedDistrict.value = '';
        customDetail.value = '';
        errors.value = {};
        hasError.value = false;
      }
    }
);

const onCancel = () => emit('close');
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: white;
  padding: 20px;
  width: 90%;
  max-width: 400px;
  border: 1px solid #aaa;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, opacity 0.3s ease;
  opacity: 1;
}

.fade-in-down {
  animation: fadeInDown 0.35s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.shake {
  animation: shake 0.4s ease;
}

@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  50% { transform: translateX(6px); }
  75% { transform: translateX(-6px); }
  100% { transform: translateX(0); }
}

.radio-group {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.radio-btn {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  background: white;
  font-weight: 600;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.radio-btn:hover {
  background: #f2e8f6;
}

.radio-btn.active {
  background: #7e3b92;
  color: white;
  border-color: #7e3b92;
}

input,
select {
  width: 100%;
  padding: 6px;
  margin-top: 4px;
  margin-bottom: 8px;
  border: 1px solid #ccc;
  font-size: 14px;
  border-radius: 6px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

input:focus,
select:focus {
  outline: none;
  border-color: #7e3b92;
  box-shadow: 0 0 0 2px rgba(126, 59, 146, 0.2);
}

input.error,
select.error {
  border-color: red;
}

.error-msg {
  color: red;
  font-size: 12px;
  margin-top: -6px;
  margin-bottom: 8px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}

button {
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 6px;
  border: 1px solid #bbb;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: white;
  color: #7e3b92;
  border: 1.5px solid #7e3b92;
}

.cancel-btn:hover {
  background: #f6ecfa;
}

.confirm-btn {
  background: linear-gradient(to right, #a944e1, #7e3b92);
  color: white;
  border: none;
  box-shadow: 0 2px 8px rgba(126, 59, 146, 0.3);
  font-weight: bold;
}

.confirm-btn:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 14px rgba(126, 59, 146, 0.4);
}

.member-info {
  background: #f9f9f9;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  margin-bottom: 12px;
}
</style>
