<template>
  <div class="login-container">
    <h1>會員登入</h1>
    <form @submit.prevent="handleLogin">
      <input v-model="email" type="email" placeholder="電子郵件" required />
      <input v-model="password" type="password" placeholder="密碼" required />
      <button type="submit">登入</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import axios from '@/services/order/axiosRaw.js';
import { useCartStore } from '@/stores/cart/cartStore';
import { useUserStore } from '@/stores/cart/userStore.js';

const email = ref('');
const password = ref('');
const router = useRouter();
const cartStore = useCartStore();
const userStore = useUserStore();

const handleLogin = async () => {
  try {
    const res = await axios.post('/api/user/secure/login', {
      email: email.value,
      password: password.value
    });

    const result = res.data;

    if (!result.success) {
      Swal.fire('登入失敗', result.message || '請檢查帳號密碼', 'error');
      return;
    }

    // 從後端回傳資料中解構出會員資訊
    const { token, userId, username, email: userEmail, phone, address } = result.data;

    // 儲存 token，設定 userId
    localStorage.setItem('token', token);
    cartStore.userId = userId;

    // 存入 Pinia
    userStore.setUser({ userId, username, email: userEmail, phone, address });

    // 檢查是否有訪客購物車需要合併
    if (cartStore.cartItems.length > 0) {
      const confirmResult = await Swal.fire({
        title: '是否合併訪客購物車？',
        showCancelButton: true,
        confirmButtonText: '合併',
        cancelButtonText: '不合併'
      });

      if (confirmResult.isConfirmed) {
        await cartStore.loginAndMerge(userId);
        Swal.fire('合併成功', '', 'success');
      } else {
        cartStore.clearCart();
        await cartStore.fetchCart();
      }
    } else {
      await cartStore.fetchCart();
    }

    Swal.fire('登入成功', '', 'success');
    router.push('/');
  } catch (error) {
    console.error('登入錯誤', error);
    Swal.fire('錯誤', '伺服器錯誤，請稍後再試', 'error');
  }
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 60px auto;
  padding: 30px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}
input {
  display: block;
  width: 100%;
  margin: 12px 0;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
button {
  width: 100%;
  padding: 12px;
  background: #1976d2;
  color: white;
  border: none;
  font-size: 18px;
  border-radius: 8px;
  cursor: pointer;
}
button:hover {
  background: #125aa0;
}
</style>
