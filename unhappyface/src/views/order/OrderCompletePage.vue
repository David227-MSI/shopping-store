<template>
  <div class="order-complete">
    <!-- 成功動畫區 -->
    <div class="animation-container">
      <LottiePlayer :animationData="paymentSuccess" :loop="true" />
    </div>

    <h1 class="gradient-text">付款成功 🎉</h1>
    <p class="subtitle">感謝您的訂購，我們將盡快為您出貨！</p>

    <div class="order-info" v-if="order">
      <p><strong>訂單編號：</strong> {{ order.orderId }}</p>
      <p><strong>總金額：</strong> {{ order.finalAmount }} 元</p>
      <p><strong>付款狀態：</strong> {{ order.paymentStatusText }}</p>
      <p><strong>訂單建立時間：</strong> {{ formatDate(order.createdAt) }}</p>

      <table class="product-table">
        <thead>
        <tr>
          <th>商品名稱</th>
          <th>數量</th>
          <th>單價</th>
          <th>小計</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in orderDetails" :key="item.productId">
          <td>{{ item.productName }}</td>
          <td>{{ item.quantity }}</td>
          <td>{{ item.unitPrice }} 元</td>
          <td>{{ item.subtotal }} 元</td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="buttons">
      <button @click="goHome" :disabled="isNavigating">🏠 回首頁</button>
      <button @click="goOrders" :disabled="isNavigating">📋 查看訂單列表</button>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import axios from '@/services/order/orderAxios.js';
import Swal from 'sweetalert2';
import LottiePlayer from '@/components/order/LottiePlayer.vue';
import paymentSuccess from '@/assets/animations/paymentSuccess.json';

const route = useRoute();
const router = useRouter();
const order = ref(null);
const orderDetails = ref([]);
const isNavigating = ref(false);

onMounted(async () => {
  const orderId = route.params.orderId;
  if (!orderId) return;

  try {
    const response = await axios.get(`/api/orders/${orderId}`);
    order.value = response.order;
    orderDetails.value = response.orderDetails;
  } catch (error) {
    console.error('載入訂單失敗', error);
  }
});

const goHome = async () => {
  if (isNavigating.value) return;
  isNavigating.value = true;
  try {
    await router.push({ name: 'home' });
  } catch (error) {
    await Swal.fire('錯誤', '跳轉失敗，請稍後再試', 'error');
  } finally {
    isNavigating.value = false;
  }
};

const goOrders = async () => {
  if (isNavigating.value) return;
  isNavigating.value = true;
  try {
    await router.push({ name: 'orders' });
  } catch (error) {
    await Swal.fire('錯誤', '跳轉失敗，請稍後再試', 'error');
  } finally {
    isNavigating.value = false;
  }
};

const formatDate = (datetime) => {
  if (!datetime) return '';
  const date = new Date(datetime);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-` +
      `${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:` +
      `${date.getMinutes().toString().padStart(2, '0')}`;
};
</script>

<style scoped>
.order-complete {
  max-width: 960px;
  margin: 60px auto;
  padding: 40px 30px;
  text-align: center;
  border-radius: 16px;
  background: linear-gradient(135deg, #fcf7ff, #f3e9ff);
  box-shadow: 0 10px 40px rgba(126, 59, 146, 0.1);
  animation: fadeIn 0.7s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.animation-container {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  min-height: 150px;
}

h1.gradient-text {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.subtitle {
  color: #9c4bcc;
  font-size: 1.1rem;
  margin-bottom: 30px;
}

.order-info {
  background: #ffffff;
  text-align: left;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  margin-top: 20px;
  line-height: 1.6;
}

.order-info p {
  margin: 8px 0;
}

.product-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  font-size: 0.95rem;
  border-radius: 8px;
  overflow: hidden;
}

.product-table th {
  background-color: #f4e3ff;
  color: #7e3b92;
  font-weight: bold;
  padding: 12px;
}

.product-table td {
  background-color: #fff;
  padding: 10px;
  border-bottom: 1px solid #eee;
  text-align: center;
}

.product-table tr:nth-child(even) td {
  background-color: #fdf7ff;
}

.buttons {
  margin-top: 30px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

button {
  padding: 12px 30px;
  font-size: 1rem;
  border: none;
  border-radius: 10px;
  background: linear-gradient(to right, #9b59b6, #7e3b92);
  color: white;
  box-shadow: 0 4px 15px rgba(155, 89, 182, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  font-weight: bold;
}

button:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 25px rgba(126, 59, 146, 0.4);
}

button:disabled {
  background: #ccc;
  box-shadow: none;
  cursor: not-allowed;
}
</style>
