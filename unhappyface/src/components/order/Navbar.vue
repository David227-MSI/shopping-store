<template>
  <nav class="navbar">
    <div class="nav-left">
      <router-link to="/" class="logo">MyShop</router-link>
    </div>
    <div class="nav-right">
      <button @click="handleCartClick" class="nav-btn">購物車</button>
      <router-link to="/login" class="nav-btn">登入</router-link>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const router = useRouter();

// 登入才能使用購物車 ( 單純測試用 )
const handleCartClick = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    const result = await Swal.fire({
      title: '請先登入',
      text: '登入後可查看購物車與結帳',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: '前往登入',
      cancelButtonText: '取消'
    });

    if (result.isConfirmed) {
      router.push('/login');
    }
  } else {
    router.push('/cart');
  }
};
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #f0e6f7;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #7e3b92;
  text-decoration: none;
}
.nav-btn {
  margin-left: 1rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #7e3b92;
  border-radius: 8px;
  color: #7e3b92;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.nav-btn:hover {
  background-color: #7e3b92;
  color: white;
}
</style>
