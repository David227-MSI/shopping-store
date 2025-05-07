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
      <div class="form-group">
        <label for="email">電子郵件</label>
        <input type="email" id="email" :value="userStore.email" readonly>
        <small class="form-text">電子郵件為您的登入帳號，無法修改。</small>
      </div>
      <div class="form-group">
        <label for="username">使用者名稱</label>
        <input type="text" id="username" v-model="profileData.username">
      </div>
      <div class="form-group">
        <label for="phone">電話</label>
        <input type="tel" id="phone" v-model="profileData.phone">
      </div>
      <div class="form-group">
        <label for="address">地址</label>
        <textarea id="address" v-model="profileData.address"></textarea>
      </div>
      <button @click="updateProfileData" :disabled="isUpdatingProfile" class="save-button">
        <span v-if="isUpdatingProfile">儲存中...</span>
        <span v-else>儲存資料</span>
      </button>
    </div>

    <div v-if="currentTab === 'password'" class="password-content">
      <div v-if="passwordMismatchError" class="error-message">{{ passwordMismatchError }}</div>
      <div class="form-group">
        <label for="oldPassword">舊密碼</label>
        <input type="password" id="oldPassword" v-model="profileData.oldPassword" required>
      </div>
      <div class="form-group">
        <label for="newPassword">新密碼</label>
        <input type="password" id="newPassword" v-model="profileData.newPassword" required>
      </div>
      <div class="form-group">
        <label for="confirmNewPassword">確認新密碼</label>
        <input type="password" id="confirmNewPassword" v-model="confirmNewPassword" required>
      </div>
      <button
        @click="updatePassword"
        :disabled="isUpdatingPassword || passwordMismatchError"
        class="save-button"
      >
        <span v-if="isUpdatingPassword">更新中...</span>
        <span v-else>更新密碼</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';

const router = useRouter();
const userStore = useUserStore();

const currentTab = ref('profile');
const tabs = ref([
  { name: 'profile', label: '基本資料' },
  { name: 'password', label: '修改密碼' },
]);

// 共用基本資料和密碼資料
const profileData = ref({
  id: userStore.userId,
  email: userStore.email,
  username: userStore.username,
  phone: userStore.phone,
  address: userStore.address,
  oldPassword: null,
  newPassword: null,
});
const isUpdatingProfile = ref(false);

// 密碼確認欄位
const confirmNewPassword = ref('');
const passwordMismatchError = ref('');

watch([() => profileData.value.newPassword, confirmNewPassword], ([newPassword, confirmPassword]) => {
  if (newPassword !== confirmPassword) {
    passwordMismatchError.value = '新密碼與確認新密碼不符。';
  } else {
    passwordMismatchError.value = '';
  }
});

const updateProfileData = async () => {
  isUpdatingProfile.value = true;

  try {
    const dataToSend = { ...profileData.value };
    // 移除密碼相關欄位，因為這個按鈕是用於更新基本資料
    delete dataToSend.oldPassword;
    delete dataToSend.newPassword;

    const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/user/secure/modify`, dataToSend, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`,
      },
    });

    if (response.data.success) {
      userStore.setUser(response.data.data);
      Swal.fire({
        icon: 'success',
        title: '成功',
        text: '基本資料已成功更新！',
        timer: 1500,
        showConfirmButton: false,
      });
      // router.push('/profile');
    } else {
      Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: response.data.message || '更新基本資料失敗，請稍後再試。',
      });
    }
  } catch (error) {
    console.error('更新基本資料錯誤:', error);
    Swal.fire({
      icon: 'error',
      title: '錯誤',
      text: '更新基本資料時發生網路錯誤。',
    });
  } finally {
    isUpdatingProfile.value = false;
  }
};

const updatePassword = async () => {
  isUpdatingPassword.value = true;

  if (passwordMismatchError.value) {
    Swal.fire({
      icon: 'warning',
      title: '警告',
      text: '請修正密碼不一致的問題。',
    });
    isUpdatingPassword.value = false;
    return;
  }

  try {
    const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/user/secure/modify`, {
      id: userStore.userId,
      oldPassword: profileData.value.oldPassword,
      newPassword: profileData.value.newPassword,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`,
      },
    });

    if (response.data.success) {
      Swal.fire({
        icon: 'success',
        title: '成功',
        text: '密碼已成功更新！',
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        profileData.value.oldPassword = null;
        profileData.value.newPassword = null;
        confirmNewPassword.value = '';
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: response.data.message || '更新密碼失敗，請檢查舊密碼是否正確。',
      });
    }
  } catch (error) {
    console.error('更新密碼錯誤:', error);
    Swal.fire({
      icon: 'error',
      title: '錯誤',
      text: '更新密碼時發生網路錯誤。',
    });
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