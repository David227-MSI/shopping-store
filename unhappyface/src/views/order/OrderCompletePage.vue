<template>
  <div class="order-complete">
    <!-- 成功動畫區 -->
    <div class="animation-container">
      <LottiePlayer :animationData="paymentSuccess" :loop="true" />
    </div>

    <h1 class="title">付款成功 🎉</h1>
    <p class="subtitle">感謝您的訂購，我們將盡快為您出貨！</p>

    <div class="info-card" v-if="order">
      <p><strong>訂單編號：</strong> {{ order.orderId }}</p>
      <p><strong>總金額：</strong> {{ order.finalAmount }} 元</p>
      <p><strong>付款狀態：</strong> {{ order.paymentStatusText }}</p>
      <p><strong>訂單建立時間：</strong> {{ formatDate(order.createdAt) }}</p>

      <table class="item-table">
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
        <tfoot>
        <tr v-if="order.couponDiscountType === 'VALUE'">
          <td colspan="3" class="text-right">折價券</td>
          <td class="text-red">-{{ order.discountAmount }} 元</td>
        </tr>
        <tr v-else-if="order.couponDiscountType === 'PERCENTAGE'">
          <td colspan="3" class="text-right">
            折價券（{{ parseInt(order.couponDiscountValue) }}%）
          </td>
          <td class="text-red">-{{ order.discountAmount }} 元</td>
        </tr>
        <tr>
          <td colspan="3" class="text-right"><strong>總計</strong></td>
          <td><strong>{{ order.finalAmount }} 元</strong></td>
        </tr>
        </tfoot>
      </table>
    </div>

    <div class="action-buttons">
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
import { useCartStore } from '@/stores/cart/cartStore';

const route = useRoute();
const router = useRouter();
const order = ref(null);
const orderDetails = ref([]);
const isNavigating = ref(false);
const cartStore = useCartStore();

onMounted(async () => {
  const orderId = route.params.orderId;
  if (!orderId) return;

  try {
    const response = await axios.get(`/api/orders/${orderId}`);
    order.value = response.order;
    orderDetails.value = response.orderDetails;
    await cartStore.fetchCart();
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
  background: #fffaf4;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(126, 59, 146, 0.05);
}

.animation-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  min-height: 140px;
}

.title {
  font-size: 2.2rem;
  font-weight: bold;
  color: var(--primary);
}

.subtitle {
  color: #6b4c83;
  margin-bottom: 20px;
  text-align: center;
}

.info-card {
  background: #ffffff;
  border: 1px solid #e2cfc0;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  line-height: 1.6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}
.item-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  font-size: 0.95rem;
  border-radius: 10px;
  overflow: hidden;
}

.item-table th {
  background: #f4ede1; /* 米白偏淺褐 */
  color: #5b3a29; /* 深咖色 */
  padding: 10px;
  text-align: center;
}

.item-table td {
  background-color: #fffaf4;
  color: #3e2c23;
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #f0e8da;
  transition: background-color 0.3s ease;
}

.item-table tr:nth-child(even) td {
  background-color: #fdf7ef;
}

.item-table tbody tr:hover td {
  background-color: #f0e6db;
}

.item-table tfoot td {
  font-weight: bold;
}

.text-right {
  text-align: right;
}

.text-red {
  color: #e53935 !important;
}

.action-buttons {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

button {
  padding: 12px 30px;
  font-size: 1rem;
  border: none;
  border-radius: 10px;
  background: var(--primary);
  color: white;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(126, 59, 146, 0.3);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(126, 59, 146, 0.4);
}

button:disabled {
  background: #ccc;
  box-shadow: none;
  cursor: not-allowed;
}
</style>
