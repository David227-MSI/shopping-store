<template>
    <div class="container member-center">
      <h1>會員中心</h1>
  
      <div class="member-dashboard">
        <div class="sidebar">
          <h3>會員功能</h3>
          <ul>
            <li><router-link to="/secure/modify" active-class="active">修改個人資料</router-link></li>
            <li><router-link to="/member/orders" active-class="active">我的訂單</router-link></li>
            <li><router-link to="/pages/user-coupon-list" active-class="active">我的優惠券</router-link></li>
            <li><router-link to="/pages/user-notification-list" active-class="active">我的通知訊息</router-link></li>
            <li><router-link to="/pages/user-subscribe-list" active-class="active">我的追蹤清單</router-link></li>
            <li><router-link to="/secure/modify" active-class="active">收貨地址管理</router-link></li>
            <li><button @click="logout" class="logout-button">登出</button></li>
          </ul>
        </div>
        <div class="main-content">
          <router-view></router-view>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router';
  import { useUserStore } from '@/stores/userStore';
  import { useAuth } from '@/services/logout';
  import Swal from 'sweetalert2';
  
  const { logout } = useAuth();
  const router = useRouter();
  const userStore = useUserStore();
  
  
  </script>
  
  <style scoped>
  .member-center {
    margin-top: 50px; /* 調整與上方元素的間距 */
  }
  
  .member-dashboard {
    display: flex;
    gap: 30px;
    padding: 20px;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
  
  .sidebar {
    width: 250px;
    padding: 20px;
    background-color: #f9f5f0;
    border-radius: 12px;
  }
  
  .sidebar h3 {
    color: var(--primary);
    margin-bottom: 15px;
    font-size: 1.6rem;
    font-weight: bold;
  }
  
  .sidebar ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .sidebar li {
    margin-bottom: 10px;
  }
  
  .sidebar li a {
    display: block;
    padding: 10px 15px;
    text-decoration: none;
    color: var(--text-dark);
    border-radius: 8px;
    transition: background-color 0.3s;
  }
  
  .sidebar li a:hover,
  .sidebar li a.active {
    background-color: #f5e1c9;
    color: var(--primary);
    font-weight: bold;
  }
  
  .logout-button {
    width: 100%;
    padding: 10px 15px;
    border: none;
    border-radius: 8px;
    background-color: #d33;
    color: var(--text-light);
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s;
    font-size: 1rem;
  }
  
  .logout-button:hover {
    background-color: #c82333;
  }
  
  .main-content {
    flex: 1;
    padding: 20px;
    background-color: #fffaf5;
    border-radius: 12px;
  }
  
  </style>