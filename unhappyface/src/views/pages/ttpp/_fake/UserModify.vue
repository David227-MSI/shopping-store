<template>
    <div class="profile-container">
      <h1>會員資料修改</h1>
      <div class="tab-container">
        <button
          v-for="tab in tabs"
          :key="tab.name"
          :class="{ active: currentTab === tab.name }"
          @click="currentTab = tab.name"
          class="tab-button"
        >
          {{ tab.label }}
        </button>
      </div>
  
      <div v-if="currentTab === 'profile'" class="profile-content">
        <div v-if="profileError" class="error-message">{{ profileError }}</div>
        <div v-if="profileSuccess" class="success-message">{{ profileSuccess }}</div>
        <div class="form-group">
          <label for="email">電子郵件</label>
          <input type="email" id="email" :value="profileData.email" readonly>
          <small class="form-text">電子郵件為您的登入帳號，無法修改。</small>
        </div>
        <div class="form-group">
          <label for="username">使用者名稱</label>
          <input type="text" id="username" v-model="profileData.username">
        </div>
        <div class="form-group">
          <label for="birthday">生日</label>
          <input type="date" id="birthday" v-model="profileData.birth">
        </div>
        <div class="form-group">
          <label for="phone">電話</label>
          <input type="tel" id="phone" v-model="profileData.phone">
        </div>
        <div class="form-group">
          <label for="address">地址</label>
          <textarea id="address" v-model="profileData.address"></textarea>
        </div>
        <button @click="updateProfile" :disabled="isUpdatingProfile" class="save-button">
          <span v-if="isUpdatingProfile">儲存中...</span>
          <span v-else>儲存資料</span>
        </button>
      </div>
  
      <div v-if="currentTab === 'password'" class="password-content">
        <div v-if="passwordError" class="error-message">{{ passwordError }}</div>
        <div v-if="passwordSuccess" class="success-message">{{ passwordSuccess }}</div>
        <div class="form-group">
          <label for="oldPassword">舊密碼</label>
          <input type="password" id="oldPassword" v-model="passwordData.oldPassword" required>
        </div>
        <div class="form-group">
          <label for="newPassword">新密碼</label>
          <input type="password" id="newPassword" v-model="passwordData.newPassword" required>
        </div>
        <div class="form-group">
          <label for="confirmNewPassword">確認新密碼</label>
          <input type="password" id="confirmNewPassword" v-model="passwordData.confirmNewPassword" required>
        </div>
        <button @click="updatePassword" :disabled="isUpdatingPassword" class="save-button">
          <span v-if="isUpdatingPassword">更新中...</span>
          <span v-else>更新密碼</span>
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const currentTab = ref('profile');
  const tabs = ref([
    { name: 'profile', label: '基本資料' },
    { name: 'password', label: '修改密碼' },
  ]);
  
  // 基本資料相關
  const profileData = ref({
    email: 'user@example.com', // 假設的初始資料
    username: '',
    birth: '',
    phone: '',
    address: '',
  });
  const profileError = ref('');
  const profileSuccess = ref('');
  const isUpdatingProfile = ref(false);
  
  const updateProfile = async () => {
    isUpdatingProfile.value = true;
    profileError.value = '';
    profileSuccess.value = '';
  
    // 模擬更新基本資料 API 請求
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模擬 1 秒的延遲
      profileSuccess.value = '基本資料已成功更新！';
    } catch (error) {
      profileError.value = '更新基本資料失敗，請稍後再試。';
      console.error('更新基本資料錯誤:', error);
    } finally {
      isUpdatingProfile.value = false;
    }
  };
  
  // 密碼修改相關
  const passwordData = ref({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const passwordError = ref('');
  const passwordSuccess = ref('');
  const isUpdatingPassword = ref(false);
  
  const updatePassword = async () => {
    isUpdatingPassword.value = true;
    passwordError.value = '';
    passwordSuccess.value = '';
  
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      passwordError.value = '新密碼與確認新密碼不符。';
      isUpdatingPassword.value = false;
      return;
    }
  
    // 模擬更新密碼 API 請求
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // 模擬 1.5 秒的延遲
      passwordSuccess.value = '密碼已成功更新！';
      // 清空密碼欄位
      passwordData.oldPassword = '';
      passwordData.newPassword = '';
      passwordData.confirmNewPassword = '';
    } catch (error) {
      passwordError.value = '更新密碼失敗，請稍後再試。';
      console.error('更新密碼錯誤:', error);
    } finally {
      isUpdatingPassword.value = false;
    }
  };
  </script>
  
  <style scoped>
  .profile-container {
    padding: 40px;
    background-color: var(--background);
    min-height: 80vh;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  h1 {
    color: var(--primary);
    font-size: 2.5rem;
    margin-bottom: 30px;
    font-weight: bold;
  }
  
  .tab-container {
    display: flex;
    margin-bottom: 20px;
    border-bottom: 2px solid #d2b48c;
  }
  
  .tab-button {
    background-color: transparent;
    border: none;
    padding: 10px 20px;
    font-size: 1rem;
    font-weight: bold;
    color: var(--accent);
    cursor: pointer;
    transition: color 0.3s, border-bottom 0.3s;
    border-bottom: 2px solid transparent;
  }
  
  .tab-button:hover {
    color: #8b5e3b;
  }
  
  .tab-button.active {
    color: var(--primary);
    border-bottom: 2px solid var(--primary);
  }
  
  .profile-content,
  .password-content {
    background-color: #fff;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    width: 90%;
    max-width: 600px;
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
  input[type="date"],
  input[type="tel"],
  input[type="password"],
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
  
  .form-text {
    display: block;
    margin-top: 5px;
    font-size: 0.8rem;
    color: #777;
  }
  
  .save-button {
    background-color: var(--accent);
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
  
  .save-button:hover {
    background-color: #8b5e3b;
  }
  
  .error-message {
    color: #e74c3c;
    margin-bottom: 15px;
    padding: 10px;
    background-color: #fdecea;
    border: 1px solid #e74c3c;
    border-radius: 6px;
  }
  
  .success-message {
    color: #27ae60;
    margin-bottom: 15px;
    padding: 10px;
    background-color: #e6f9ec;
    border: 1px solid #27ae60;
    border-radius: 6px;
  }
  </style>