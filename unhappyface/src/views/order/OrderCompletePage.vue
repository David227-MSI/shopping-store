<template>
  <div class="order-complete">
    <h1>訂單完成！🎉</h1>

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
import axios from '@/services/order/axios';
import Swal from 'sweetalert2';

const route = useRoute();
const router = useRouter();
const order = ref(null);
const orderDetails = ref([]);
const isNavigating = ref(false);

// 取得訂單資料
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

// 返回首頁
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

// 前往訂單列表
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

// 格式化日期時間
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
  max-width: 800px;
  margin: 50px auto;
  padding: 30px;
  text-align: center;
  background: #fafafa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.order-info {
  text-align: left;
  margin-top: 20px;
}

.product-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.product-table th,
.product-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.product-table th {
  background-color: #f0f0f0;
}

.buttons {
  margin-top: 30px;
  text-align: center;
}

button {
  margin: 0 10px;
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
}
</style>
