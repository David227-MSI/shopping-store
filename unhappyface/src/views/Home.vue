<template>
  <div class="home-container">
    <h1>歡迎來到首頁</h1>
    <p v-if="userStore.userInfo">已登入帳號：{{ userStore.userInfo.email }}</p>

    <button @click="goToCart">前往購物車</button>
    <button @click="addTestProduct" class="guest-add">加入商品（訪客）</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/cart/userStrore.js';
import { useCartStore } from '@/stores/cart/cartStore.js';
import Swal from 'sweetalert2';

const router = useRouter();
const userStore = useUserStore();
const cartStore = useCartStore();

const goToCart = () => {
  router.push('/cart');
};

// 測試商品加入購物車（會自動判斷是訪客還是會員）
const addTestProduct = async () => {
  await cartStore.addToCart({
    id: 104,
  });
  Swal.fire('已加入購物車', '', 'success');
};
</script>

<style scoped>
.home-container {
  max-width: 600px;
  margin: 50px auto;
  padding: 2rem;
  border-radius: 10px;
  background-color: #fff;
  text-align: center;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
button {
  margin: 10px;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  background-color: #7e3b92;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
button.guest-add {
  background-color: #4a90e2;
}
</style>
