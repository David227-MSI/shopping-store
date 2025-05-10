<template>
  <div class="register-container">
   <h1>註冊帳號</h1>
   <form @submit.prevent="submitStep" class="register-form">
    <div v-if="errors.general" class="error-message">{{ errors.general }}</div>

    <div v-if="step === 1">
     <h2>基本資訊</h2>
     <div class="form-group">
      <label for="email">電子郵件</label>
      <input type="email" id="email" v-model="registrationData.email" placeholder="請輸入您的電子郵件" required>
      <div v-if="errors.email" class="error-text">{{ errors.email }}</div>
     </div>

     <div class="form-group">
      <label for="username">使用者名稱</label>
      <input type="text" id="username" v-model="registrationData.username" placeholder="請輸入您的使用者名稱" required>
      <div v-if="errors.username" class="error-text">{{ errors.username }}</div>
     </div>

     <div class="form-group">
      <label for="password">密碼</label>
      <input type="password" id="password" v-model="registrationData.password" placeholder="請輸入您的密碼" required @input="updatePasswordStrength">
      <div v-if="errors.password" class="error-text">{{ errors.password }}</div>
      <div v-if="passwordStrengthText" class="password-strength">
       強度：<span :class="passwordStrengthClass">{{ passwordStrengthText }}</span>
      </div>
     </div>

     <div class="form-group">
      <label for="confirmPassword">確認密碼</label>
      <input type="password" id="confirmPassword" v-model="registrationData.confirmPassword" placeholder="請再次輸入您的密碼" required>
      <div v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</div>
     </div>

     <div class="form-group terms-checkbox">
      <input type="checkbox" id="terms" v-model="agreedToTerms" required>
      <label for="terms">我同意<router-link to="/terms" target="_blank" class="terms-link">服務條款</router-link> 和 <router-link to="/privacy" target="_blank" class="privacy-link">隱私權政策</router-link></label>
      <div v-if="errors.terms" class="error-text">{{ errors.terms }}</div>
     </div>

     <button type="submit" class="next-button" :disabled="isSubmitting">
      <span v-if="isSubmitting">處理中...</span>
      <span v-else>下一步，個人資料</span>
     </button>
    </div>

    <div v-if="step === 2">
     <h2>個人資料</h2>
     <div class="form-group">
      <label for="birthday">生日</label>
      <input type="date" id="birthday" v-model="optionalData.birth" required>
      <div v-if="errors.birth" class="error-text">{{ errors.birth }}</div>
     </div>

     <div class="form-group">
      <label for="phone">電話</label>
      <input type="tel" id="phone" v-model="optionalData.phone" placeholder="您的電話號碼">
      <div v-if="errors.phone" class="error-text">{{ errors.phone }}</div>
     </div>

     <div class="form-group">
      <label for="city">縣市</label>
      <select id="city" v-model="selectedCity" required>
       <option value="" disabled>請選擇縣市</option>
       <option :value="city" :key="city" v-for="city in cities">{{ city }}</option>
      </select>
      <div v-if="errors.city" class="error-text">{{ errors.city }}</div>
     </div>

     <div class="form-group">
      <label for="district">區域</label>
      <select id="district" v-model="selectedDistrict" :disabled="!selectedCity" required>
       <option value="" disabled>請選擇區域</option>
       <option :value="district" :key="district" v-for="district in districts">{{ district }}</option>
      </select>
      <div v-if="errors.district" class="error-text">{{ errors.district }}</div>
     </div>

     <div class="form-group">
      <label for="detailAddress">詳細地址</label>
      <textarea id="detailAddress" v-model="optionalData.detailAddress" placeholder="您的詳細地址" required></textarea>
      <div v-if="errors.detailAddress" class="error-text">{{ errors.detailAddress }}</div>
     </div>

     <div class="button-group">
      <button type="button" class="back-button" @click="step = 1">返回</button>
      <button type="submit" class="next-button" :disabled="isSubmitting">
       <span v-if="isSubmitting">處理中...</span>
       <span v-else>下一步，驗證信箱</span>
      </button>
     </div>
    </div>

    <div v-if="step === 3">
     <h2>驗證您的電子郵件</h2>
     <p>我們已將驗證碼寄送至 {{ registrationData.email }}，請在下方輸入您收到的驗證碼。</p>
     <div class="form-group">
      <label for="verificationCode">驗證碼</label>
      <input type="text" id="verificationCode" v-model="verificationCode" placeholder="請輸入驗證碼" required>
      <div v-if="errors.verificationCode" class="error-text">{{ errors.verificationCode }}</div>
     </div>
     <div class="button-group">
      <button type="button" class="back-button" @click="step = 2">返回</button>
      <button type="button" class="resend-button" @click="resendVerificationEmail" :disabled="isResending">
       <span v-if="isResending">重新發送中...</span>
       <span v-else>重新發送驗證信</span>
      </button>
      <button type="button" class="register-button" @click="submitFinalRegistration" :disabled="isSubmittingFinal">
       <span v-if="isSubmittingFinal">註冊中...</span>
       <span v-else>完成註冊</span>
      </button>
     </div>
    </div>

    <div class="options" v-if="step === 1">
     <router-link to="/secure/login" class="login-link">已經有帳號了嗎？前往登入頁面</router-link>
    </div>
   </form>
  </div>
 </template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
 import { useRouter, RouterLink } from 'vue-router';
 import axios from 'axios';
 import taiwanAddressData from '@/assets/CityCountyData.json';
 import Swal from 'sweetalert2';

 const step = ref(1); // 1: 基本資訊, 2: 個人資料, 3: 驗證信箱
 const registrationData = reactive({
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
 });
 const optionalData = reactive({
  birth: '',
  phone: '',
  detailAddress: '',
 });
 const errors = reactive({ // 管理所有錯誤訊息
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  birth: '',
  phone: '',
  city: '',
  district: '',
  detailAddress: '',
  terms: '',
  verificationCode: '',
  general: '' // 用於顯示一般錯誤，例如 API 請求失敗
 });
 const isSubmitting = ref(false); // 第一、二步的提交狀態
 const isSubmittingFinal = ref(false); // 第三步（的提交狀態
 const isResending = ref(false); // 重新發送驗證信的狀態
 const agreedToTerms = ref(false);
 const router = useRouter();
 const verificationCode = ref(''); // 用於存放使用者輸入的驗證碼

 const cities = ref(taiwanAddressData.map(item => item.CityName));
 const selectedCity = ref('');
 const districts = ref(computed(() => {
  const selectedCityData = taiwanAddressData.find(cityData => cityData.CityName === selectedCity.value);
  return selectedCityData ? selectedCityData.AreaList.map(area => area.AreaName) : [];
 }));
 const selectedDistrict = ref('');

 // 密碼強度驗證
 const passwordStrengthText = ref('');
 const passwordStrengthClass = ref('');

 const updatePasswordStrength = () => {
  const password = registrationData.password;
  const hasSpecialChar = /[^\w\s]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  let strength = 0;
  if (password.length >= 8) strength++;
  if (hasSpecialChar) strength++;
  if (hasUpperCase) strength++;
  if (hasLowerCase) strength++;
  if (hasNumber) strength++;

  if (strength <= 2 && password.length > 0) {
   passwordStrengthText.value = '弱';
   passwordStrengthClass.value = 'weak';
  } else if (strength <= 4 && password.length > 0) {
   passwordStrengthText.value = '中';
   passwordStrengthClass.value = 'medium';
  } else if (strength === 5 && password.length > 0) {
   passwordStrengthText.value = '強';
   passwordStrengthClass.value = 'strong';
  } else {
   passwordStrengthText.value = '';
   passwordStrengthClass.value = '';
  }
 };

 // 驗證電子郵件格式
 const validateEmail = (email) => {
  if (!email) {
   return '電子郵件為必要資訊';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
   return '請提供有效的電子郵件';
  }
  return '';
 };

 // 驗證使用者名稱
 const validateUsername = (username) => {
  if (!username) {
   return '使用者名稱為必要資訊';
  }
  if (username.length > 50) {
   return '使用者名稱不能超過 50 個字元';
  }
  return '';
 };

 // 驗證密碼
 const validatePassword = (password) => {
  if (!password) {
   return '密碼為必要資訊';
  }
  if (password.length < 8 || password.length > 256) {
   return '密碼長度需為 8~256 字元';
  }
  if (!/[^\w\s]/.test(password)) {
   return '密碼必須包含至少一個特殊字元';
  }
  if (!/[A-Z]/.test(password)) {
   return '密碼必須包含至少一個大寫字母';
  }
  if (!/[a-z]/.test(password)) {
   return '密碼必須包含至少一個小寫字母';
  }
  if (!/[0-9]/.test(password)) {
   return '密碼必須包含至少一個數字';
  }
  return '';
 };

 // 驗證確認密碼
 const validateConfirmPassword = (confirmPassword) => {
  if (!confirmPassword) {
   return '請再次輸入密碼確認';
  }
  if (confirmPassword.length < 8 || confirmPassword.length > 256) {
   return '密碼長度需為 8~256 字元';
  }
  if (registrationData.password !== confirmPassword) {
   return '密碼不一致';
  }
  return '';
 };

 // 驗證生日
 const validateBirth = (birth) => {
  if (!birth) {
   return '生日為必要資訊';
  }
  const birthDate = new Date(birth);
  const today = new Date();
  if (birthDate >= today) {
   return '生日必須是過去的日期';
  }
  return '';
 };

 // 驗證電話號碼 (台灣手機號碼格式)
 const validatePhone = (phone) => {
  if (phone && !/^09\d{8}$/.test(phone)) {
   return '手機號碼格式不正確 (例如：09XXXXXXXX)';
  }
  return '';
 };

 // 驗證詳細地址
 const validateDetailAddress = (detailAddress) => {
  if (!detailAddress) {
   return '請輸入詳細地址';
  }
  if (detailAddress.length > 255) {
   return '詳細地址不能超過 255 個字元';
  }
  return '';
 };

 // 驗證驗證碼
 const validateVerificationCode = (code) => {
  if (!code) {
   return '請輸入驗證碼';
  }
  return '';
 };

 // 監聽選取的縣市，更新區域選項
 watch(selectedCity, (newCity) => {
  selectedDistrict.value = ''; // 重置選取的區域
 });

 // 使用 watch 監聽每個欄位的變化
 watch(() => registrationData.email, (newEmail) => {
  errors.email = validateEmail(newEmail);
 });

 watch(() => registrationData.username, (newUsername) => {
  errors.username = validateUsername(newUsername);
 });

 watch(() => registrationData.password, (newPassword) => {
  errors.password = validatePassword(newPassword);
  // 當密碼變更時，也需要重新驗證確認密碼
  errors.confirmPassword = validateConfirmPassword(registrationData.confirmPassword);
 });

 watch(() => registrationData.confirmPassword, (newConfirmPassword) => {
  errors.confirmPassword = validateConfirmPassword(newConfirmPassword);
 });

 watch(() => optionalData.birth, (newBirth) => {
  errors.birth = validateBirth(newBirth);
 });

 watch(() => optionalData.phone, (newPhone) => {
  errors.phone = validatePhone(newPhone);
 });

 watch(() => optionalData.detailAddress, (newDetailAddress) => {
  errors.detailAddress = validateDetailAddress(newDetailAddress);
 });

 watch(agreedToTerms, (newAgreedToTerms) => {
  if (!newAgreedToTerms && step.value === 1) {
   errors.terms = '請同意服務條款和隱私權政策';
  } else {
   errors.terms = '';
  }
 });

 const submitStep = async () => {
  isSubmitting.value = true;
  errors.general = ''; // 清空一般錯誤訊息

  if (step.value === 1) {
   // 第一步的驗證
   errors.email = validateEmail(registrationData.email);
   errors.username = validateUsername(registrationData.username);
   errors.password = validatePassword(registrationData.password);
   errors.confirmPassword = validateConfirmPassword(registrationData.confirmPassword);
   errors.terms = agreedToTerms.value ? '' : '請同意服務條款和隱私權政策';

   if (errors.email || errors.username || errors.password || errors.confirmPassword || errors.terms) {
    isSubmitting.value = false;
    return;
   }
   step.value = 2; // 前往第二步
   isSubmitting.value = false; // 立即解除第一步提交按鈕的禁用狀態
  } else if (step.value === 2) {
   // 第二步的驗證
   errors.birth = validateBirth(optionalData.birth);
   errors.phone = validatePhone(optionalData.phone);
   errors.city = validateCity(selectedCity.value);
   errors.district = validateDistrict(selectedDistrict.value);
   errors.detailAddress = validateDetailAddress(optionalData.detailAddress);

   if (errors.birth || errors.phone || errors.city || errors.district || errors.detailAddress) {
    isSubmitting.value = false;
    return;
   }

   // 先切換到第三步
   step.value = 3;
   isSubmitting.value = false; // 立即解除第二步提交按鈕的禁用狀態

   // 在背景非同步地發送驗證信請求
   axios.post(
    `${import.meta.env.VITE_API_URL}/api/user/secure/sendVerifyEmail`,
    {
     email: registrationData.email,
     username: registrationData.username,
    }
   )
    .then(response => {
     console.log('驗證信發送成功:', response.data);
     Swal.fire({
      icon: 'success',
      title: '驗證信已發送',
      text: response.data.message,
      confirmButtonText: '好的'
     });
    })
    .catch(error => {
     console.error('驗證信發送失敗:', error.response ? error.response.data : error.message);
     errors.general = error.response?.data?.message || '驗證信發送失敗，請稍後再試。';
     Swal.fire({
      icon: 'error',
      title: '發送失敗',
      text: errors.general,
      confirmButtonText: '好的'
     });
     step.value = 1; // 如果發送失敗，可以考慮返回第一步讓使用者檢查郵箱
    });
  }
 };
 const resendVerificationEmail = async () => {
  isResending.value = true;
  errors.general = '';
  try {
   const response = await axios.post(
    `${import.meta.env.VITE_API_URL}/api/user/secure/resendVerifyEmail`, // 假設後端有這個 API
    { email: registrationData.email }
   );
   console.log('驗證信重新發送成功:', response.data);
   Swal.fire({
    icon: 'success',
    title: '重新發送成功',
    text: response.data.message,
    confirmButtonText: '好的'
   });
  } catch (error) {
   console.error('驗證信重新發送失敗:', error.response ? error.response.data : error.message);
   errors.general = error.response?.data?.message || '重新發送驗證信失敗，請稍後再試。';
   Swal.fire({
    icon: 'error',
    title: '重新發送失敗',
    text: errors.general,
    confirmButtonText: '好的'
   });
  } finally {
   isResending.value = false;
  }
 };

 const submitFinalRegistration = async () => {
  isSubmittingFinal.value = true;
  errors.general = '';
  errors.verificationCode = '';

  const isVerificationCodeValid = validateVerificationCode(verificationCode.value) === '';
  if (!isVerificationCodeValid) {
   errors.verificationCode = '請輸入驗證碼';
   isSubmittingFinal.value = false;
   return;
  }

  const registerData = {
   ...registrationData,
   ...optionalData,
   verificationCode: verificationCode.value,
   address: `${selectedCity.value}${selectedDistrict.value}${optionalData.detailAddress}`
  };

  try {
   const response = await axios.post(
    `${import.meta.env.VITE_API_URL}/api/user/secure/register`,
    registerData
   );
   console.log('註冊成功:', response.data);
   isSubmittingFinal.value = false;
   Swal.fire({
    icon: 'success',
    title: '註冊成功！',
    text: '您的帳號已成功註冊，將自動導向登入頁面。',
    confirmButtonText: '好的',
    timer: 2000,
    showConfirmButton: false,
    willClose: () => {
     router.push('/secure/login?registered=true');
    }
   });
  } catch (error) {
   console.error('註冊失敗:', error.response ? error.response.data : error.message);
   errors.general = error.response?.data?.message || '註冊失敗，請檢查驗證碼或稍後再試。';
   if (error.response?.data?.message?.includes('驗證碼')) {
    errors.verificationCode = error.response.data.message; // 更明確地顯示驗證碼錯誤
   }
  } finally {
   isSubmittingFinal.value = false;
  }
 };

 // 驗證縣市
 const validateCity = (city) => {
  if (!city) return '請選擇縣市';
  return '';
 };

 // 驗證區域
 const validateDistrict = (district) => {
  if (!selectedCity.value) return '請先選擇縣市';
  if (!district) return '請選擇區域';
  return '';
 };

 // 監聽選取的縣市，更新區域選項
 watch(selectedCity, (newCity) => {
  selectedDistrict.value = ''; // 重置選取的區域
  errors.district = ''; // 清空區域錯誤
 });

 // 監聽區域的變化
 watch(selectedDistrict, (newDistrict) => {
  errors.district = validateDistrict(newDistrict);
 });

 // 使用 watch 監聽每個欄位的變化
 watch(() => registrationData.email, (newEmail) => {
  errors.email = validateEmail(newEmail);
 });

 watch(() => registrationData.username, (newUsername) => {
  errors.username = validateUsername(newUsername);
 });

 watch(() => registrationData.password, (newPassword) => {
  errors.password = validatePassword(newPassword);
  // 當密碼變更時，也需要重新驗證確認密碼
  errors.confirmPassword = validateConfirmPassword(registrationData.confirmPassword);
 });

 watch(() => registrationData.confirmPassword, (newConfirmPassword) => {
  errors.confirmPassword = validateConfirmPassword(newConfirmPassword);
 });

 watch(() => optionalData.birth, (newBirth) => {
  errors.birth = validateBirth(newBirth);
 });

 watch(() => optionalData.phone, (newPhone) => {
  errors.phone = validatePhone(newPhone);
 });

 watch(() => optionalData.detailAddress, (newDetailAddress) => {
  errors.detailAddress = validateDetailAddress(newDetailAddress);
 });

 watch(agreedToTerms, (newAgreedToTerms) => {
  if (!newAgreedToTerms && step.value === 1) {
   errors.terms = '請同意服務條款和隱私權政策';
  } else {
   errors.terms = '';
  }
 });
</script>

<style scoped>
.register-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 40px;
  background-color: var(--background);
}

h1 {
  color: var(--primary);
  font-size: 2.5rem;
  margin-bottom: 30px;
  font-weight: bold;
}

.register-form {
  background-color: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 400px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-dark);
  font-weight: bold;
}

input[type="email"],
input[type="text"],
input[type="password"],
input[type="date"],
input[type="tel"],
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

.next-button,
.register-button,
.back-button {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
  width: 100%;
  margin-top: 15px;
}

.next-button {
  background-color: var(--primary);
  color: var(--text-light);
}

.next-button:hover {
  background-color: #40291d;
}

.register-button {
  background-color: var(--accent);
  color: var(--text-light);
}

.register-button:hover {
  background-color: #8b5e3b;
}

.back-button {
  background-color: #f0f0f0;
  color: var(--text-dark);
  border: 1px solid #ccc;
}

.back-button:hover {
  background-color: #e0e0e0;
}

.error-message,
.error-text {
  color: #e74c3c;
  margin-top: 5px;
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.password-strength {
  font-size: 0.9rem;
  margin-top: 5px;
  color: #777;
}

.password-strength .weak {
  color: #e74c3c;
}

.password-strength .medium {
  color: #f39c12;
}

.password-strength .strong {
  color: #27ae60;
}

.terms-checkbox {
  display: flex;
  align-items: center;
}

.terms-checkbox input[type="checkbox"] {
  width: auto;
  margin-right: 10px;
}

.terms-link,
.privacy-link {
  color: var(--primary);
  text-decoration: none;
  transition: color 0.3s;
}

.terms-link:hover,
.privacy-link:hover {
  color: #40291d;
}

.options {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.login-link {
  color: var(--accent);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s;
}

.login-link:hover {
  color: #8b5e3b;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.register-form h2 {
  color: var(--accent);
  margin-bottom: 20px;
  text-align: center;
}
</style>
