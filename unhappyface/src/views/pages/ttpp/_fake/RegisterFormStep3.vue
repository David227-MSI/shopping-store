<template>
    <div>
     <h2>驗證您的電子郵件</h2>
     <p>我們已將驗證碼寄送至 {{ registrationData.email }}，請在下方輸入您收到的驗證碼。</p>
     <div class="form-group">
      <label for="verificationCode">驗證碼</label>
      <input type="text" id="verificationCode" v-model="verificationCode" placeholder="請輸入驗證碼" required>
      <div v-if="errors.verificationCode" class="error-text">{{ errors.verificationCode }}</div>
     </div>
     <div class="button-group">
      <button type="button" class="back-button" @click="emit('back')">返回</button>
      <button type="button" class="resend-button" @click="emit('resend')" :disabled="isResending">
       <span v-if="isResending">重新發送中...</span>
       <span v-else>重新發送驗證信</span>
      </button>
      <button type="button" class="register-button" @click="emit('submit', verificationCode)" :disabled="isSubmittingFinal">
       <span v-if="isSubmittingFinal">註冊中...</span>
       <span v-else>完成註冊</span>
      </button>
     </div>
    </div>
   </template>
  
   <script setup>
   import { ref } from 'vue';
  
   const props = defineProps({
    registrationData: Object,
    errors: Object,
    isSubmittingFinal: Boolean,
    isResending: Boolean,
   });
  
   const emit = defineEmits(['back', 'resend', 'submit']);
  
   const verificationCode = ref('');
   </script>
  
   <style scoped>
    



   .button-group {
    display: flex;
    gap: 10px;
    margin-top: 20px;
   }
  
   .resend-button {
    background-color: #f0f0f0;
    color: #333;
    border: 1px solid #ccc;
    padding: 8px 15px;
    border-radius: 5px;
    cursor: pointer;
   }
  
   .resend-button:hover {
    background-color: #e0e0e0;
   }
  
   .resend-button:disabled {
    background-color: #ddd;
    color: #777;
    border-color: #ccc;
    cursor: not-allowed;
   }
  
   .register-button {
    background-color: #4caf50;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
   }
  
   .register-button:hover {
    background-color: #45a049;
   }
  
   .register-button:disabled {
    background-color: #a9a9a9;
    cursor: not-allowed;
   }
   </style>