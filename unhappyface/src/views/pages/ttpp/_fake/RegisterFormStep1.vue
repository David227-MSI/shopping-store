<template>
    <div>
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
      <label for="terms">我同意 <RouterLink to="/terms" target="_blank" class="terms-link">服務條款</RouterLink> 和 <RouterLink to="/privacy" target="_blank" class="privacy-link">隱私權政策</RouterLink></label>
      <div v-if="errors.terms" class="error-text">{{ errors.terms }}</div>
     </div>
     <button type="button" class="next-button" @click="emit('next', { ...registrationData, agreedToTerms: agreedToTerms })" :disabled="isSubmitting">
      <span v-if="isSubmitting">處理中...</span>
      <span v-else>下一步，個人資料</span>
     </button>
    </div>
   </template>
  
   <script setup>
   import { ref, reactive, computed, watch } from 'vue';
   import { RouterLink } from 'vue-router';
  
   const props = defineProps({
    registrationData: Object,
    errors: Object,
    agreedToTerms: Boolean,
    isSubmitting: Boolean,
   });
  
   const emit = defineEmits(['next']);
  
   const registrationData = reactive({ ...props.registrationData });
   const agreedToTerms = ref(props.agreedToTerms);
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
 
  input[type="email"],
  input[type="text"],
  input[type="password"] {
   width: 100%;
   padding: 10px 12px;
   border: 1px solid #d2b48c;
   border-radius: 6px;
   box-sizing: border-box;
   font-family: inherit;
   font-size: 1rem;
  }
 
  .error-text {
   color: #e74c3c;
   margin-top: 5px;
   margin-bottom: 10px;
   font-size: 0.9rem;
  }
 
  .next-button {
   padding: 12px 20px;
   border: none;
   border-radius: 6px;
   font-weight: bold;
   cursor: pointer;
   font-size: 1rem;
   transition: background-color 0.3s;
   width: 100%;
   margin-top: 15px;
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
 
  .terms-checkbox label {
   font-weight: normal;
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
  </style>