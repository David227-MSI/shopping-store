<template>
    <div class="register-container">
      <h1>註冊帳號</h1>
      <form @submit.prevent="submitStep" class="register-form">
        <div v-if="error" class="error-message">{{ error }}</div>
  
        <div v-if="step === 1">
          <div class="form-group">
            <label for="email">電子郵件</label>
            <input type="email" id="email" v-model="registrationData.email" placeholder="請輸入您的電子郵件" required>
          </div>
  
          <div class="form-group">
            <label for="username">使用者名稱</label>
            <input type="text" id="username" v-model="registrationData.username" placeholder="請輸入您的使用者名稱" required>
          </div>
  
          <div class="form-group">
            <label for="password">密碼</label>
            <input type="password" id="password" v-model="registrationData.password" placeholder="請輸入您的密碼" required>
            <div v-if="passwordStrength" class="password-strength">
              強度：<span :class="passwordStrengthClass">{{ passwordStrength }}</span>
            </div>
          </div>
  
          <div class="form-group">
            <label for="confirmPassword">確認密碼</label>
            <input type="password" id="confirmPassword" v-model="registrationData.confirmPassword" placeholder="請再次輸入您的密碼" required>
            <div v-if="registrationData.password !== registrationData.confirmPassword && registrationData.confirmPassword" class="error-text">
              密碼不一致
            </div>
          </div>
  
          <div class="form-group terms-checkbox">
            <input type="checkbox" id="terms" v-model="agreedToTerms" required>
            <label for="terms">我同意<router-link to="/terms" target="_blank" class="terms-link">服務條款</router-link> 和 <router-link to="/privacy" target="_blank" class="privacy-link">隱私權政策</router-link></label>
            <div v-if="!agreedToTerms && isSubmitting" class="error-text">請同意服務條款和隱私權政策</div>
          </div>
  
          <button type="submit" class="next-button" :disabled="isSubmitting">
            <span v-if="isSubmitting">驗證中...</span>
            <span v-else>下一步，驗證信箱</span>
          </button>
        </div>
  
        <div v-if="step === 2">
          <h2>完善您的個人資料</h2>
  
          <div class="form-group">
            <label for="birthday">生日</label>
            <input type="date" id="birthday" v-model="optionalData.birth">
          </div>
  
          <div class="form-group">
            <label for="phone">電話</label>
            <input type="tel" id="phone" v-model="optionalData.phone" placeholder="您的電話號碼">
          </div>
  
          <div class="form-group">
            <label for="address">地址</label>
            <textarea id="address" v-model="optionalData.address" placeholder="您的地址"></textarea>
          </div>
  
          <div class="button-group">
            <button type="button" class="back-button" @click="step = 1">返回</button>
            <button type="submit" class="register-button" :disabled="isSubmittingOptional">
              <span v-if="isSubmittingOptional">註冊中...</span>
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
  import { ref, reactive, computed } from 'vue';
  import { useRouter, RouterLink } from 'vue-router';
  
  const step = ref(1); // 1: 基本資訊, 2: 進階資訊
  const registrationData = reactive({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const optionalData = reactive({
    birth: '',
    phone: '',
    address: '',
  });
  const error = ref('');
  const isSubmitting = ref(false);
  const isSubmittingOptional = ref(false);
  const agreedToTerms = ref(false);
  const router = useRouter();
  
  // 密碼強度驗證 (簡單範例)
  const passwordStrength = computed(() => {
    if (!registrationData.password) return '';
    if (registrationData.password.length < 6) return '弱';
    if (/\d/.test(registrationData.password) && /[a-zA-Z]/.test(registrationData.password)) return '中';
    return '強';
  });
  
  const passwordStrengthClass = computed(() => {
    if (passwordStrength.value === '弱') return 'weak';
    if (passwordStrength.value === '中') return 'medium';
    if (passwordStrength.value === '強') return 'strong';
    return '';
  });
  
  const submitStep = async () => {
    isSubmitting.value = true;
    error.value = '';
  
    if (step.value === 1) {
      if (!agreedToTerms.value) {
        isSubmitting.value = false;
        return;
      }
  
      if (registrationData.password !== registrationData.confirmPassword) {
        error.value = '確認密碼與密碼不符。';
        isSubmitting.value = false;
        return;
      }
  
      // 模擬發送驗證信和下一步 API 請求
      try {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 模擬 2 秒的延遲
        // 假設驗證信已發送成功
        step.value = 2; // 切換到下一步
      } catch (err) {
        error.value = '驗證信發送失敗，請稍後再試。';
        console.error('驗證信發送錯誤:', err);
      } finally {
        isSubmitting.value = false;
      }
    } else if (step.value === 2) {
      isSubmittingOptional.value = true;
      // 模擬最終註冊 API 請求，包含基本資訊和可選資訊
      try {
        const registerData = { ...registrationData, ...optionalData };
        console.log('註冊資料:', registerData); // 實際應用中會發送到後端
        await new Promise(resolve => setTimeout(resolve, 1500)); // 模擬 1.5 秒的延遲
        router.push('/login?registered=true'); // 註冊成功後導向登入頁面
      } catch (err) {
        error.value = '註冊失敗，請稍後再試。';
        console.error('最終註冊錯誤:', err);
      } finally {
        isSubmittingOptional.value = false;
      }
    }
  };
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