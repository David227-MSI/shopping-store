<template>
  <div class="login-container">
    <h1>會員登入</h1>
    <form @submit.prevent="login" class="login-form">
      <div v-if="error" class="error-message">{{ error }}</div>
      <div class="form-group">
        <label for="email">電子郵件</label>
        <input
          type="email"
          id="email"
          v-model="email"
          placeholder="請輸入您的電子郵件"
          required
          @blur="validateEmail" />
        <div v-if="emailError" class="error-message">{{ emailError }}</div>
      </div>
      <div class="form-group">
        <label for="password">密碼</label>
        <input type="password" id="password" v-model="password" placeholder="請輸入您的密碼" required>
      </div>
      <button type="submit" class="login-button" :disabled="isSubmitting || emailError">
        <span v-if="isSubmitting">登入中...</span>
        <span v-else>登入</span>
      </button>
      <div class="options">
        <router-link to="/register" class="register-link">還沒有帳號嗎？立即註冊</router-link>
        <router-link to="/forgot-password" class="forgot-password-link">忘記密碼？</router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useUserStore } from '@/stores/userStore'; // 確保路徑正確

const email = ref('');
const password = ref('');
const error = ref('');
const isSubmitting = ref(false);
const router = useRouter();
const userStore = useUserStore(); // 取得 userStore 的實例

const login = async () => {
  isSubmitting.value = true;
  error.value = '';

  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/secure/login`, {
      email: email.value,
      password: password.value,
    });

    // 登入成功
    isSubmitting.value = false;
    Swal.fire({
      icon: 'success',
      title: '登入成功！',
      text: `歡迎回來，${response.data.data.username}`,
      confirmButtonText: '前往首頁',
    }).then(() => {
      // 將使用者資訊儲存到 Pinia store
      userStore.setUser(response.data.data);

      router.push('/'); // 導向首頁
    });

  } catch (err) {
    isSubmitting.value = false;
    if (err.response && err.response.data && err.response.data.message) {
      error.value = err.response.data.message;
    } else if (err.request) {
      error.value = '無法連接到伺服器，請檢查網路連線。';
      console.error('登入錯誤 (無回應):', err.request);
    } else {
      error.value = '登入發生未知錯誤，請稍後再試。';
      console.error('登入錯誤 (請求失敗):', err.message);
    }
  }
};
</script>

<style scoped>
/* 你原來的樣式保持不變 */
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh; /* 至少佔據視窗高度的 80% */
  padding: 40px;
  background-color: var(--background);
}

h1 {
  color: var(--primary);
  font-size: 2.5rem;
  margin-bottom: 30px;
  font-weight: bold;
}

.login-form {
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
input[type="password"] {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d2b48c;
  border-radius: 6px;
  box-sizing: border-box;
  font-family: inherit;
  font-size: 1rem;
}

.login-button {
  background-color: var(--primary);
  color: var(--text-light);
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
  width: 100%;
}

.login-button:hover {
  background-color: #40291d;
}

.error-message {
  color: #e74c3c;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #fdecea;
  border: 1px solid #e74c3c;
  border-radius: 6px;
}

.options {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.register-link,
.forgot-password-link {
  color: var(--accent);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s;
}

.register-link:hover,
.forgot-password-link:hover {
  color: #8b5e3b;
}
</style>