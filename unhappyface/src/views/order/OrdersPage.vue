<template>
  <div class="orders-page">
    <h1 class="page-title">訂單列表</h1>

    <!-- 加上 isLoading 判斷，避免尚未載入時顯示空 -->
    <div v-if="orders.length === 0 && !isLoading" class="empty-text">
      尚未有訂單記錄。
    </div>

    <div v-for="order in orders" :key="order.orderId" class="order-card">
      <div class="order-header">
        <span><strong>訂單編號：</strong>{{ order.orderId }}</span>
        <span><strong>成立時間：</strong>{{ formatDate(order.createdAt) }}</span>
      </div>

      <div class="order-body">
        <p><strong>總金額：</strong>{{ order.totalAmount }} 元</p>
        <p><strong>折扣金額：</strong>{{ order.discountAmount }} 元</p>
        <p><strong>付款金額：</strong>{{ order.finalAmount }} 元</p>
        <p><strong>訂單狀態：</strong>{{ order.statusText || '—' }}</p>
        <p><strong>付款狀態：</strong>{{ order.paymentStatusText || '—' }}</p>
        <p><strong>付款方式：</strong>{{ order.paymentMethod || '—' }}</p>
        <p><strong>綠界交易編號：</strong>{{ order.transactionNumber || '—' }}</p>
        <p><strong>收件者：</strong>{{ order.recipientName || '—' }}</p>
        <p><strong>收件電話：</strong>{{ order.recipientPhone || '—' }}</p>
        <p><strong>收件地址：</strong>{{ order.recipientAddress || '—' }}</p>
      </div>

      <div class="order-footer">
        <button class="reorder-btn" @click="reorder(order.orderId)">再次加入購物車</button>
        <button @click="openOrderDetail(order.orderId)">查看明細</button>
      </div>
    </div>

    <!-- Loading 動畫 -->
    <div class="loading-overlay" v-if="isLoading">
      <div class="loader"></div>
    </div>

    <!-- 商品明細彈窗 -->
    <OrderDetailModal
        v-if="showModal"
        :visible="showModal"
        :order-id="selectedOrderId"
        @close="showModal = false"
    />
  </div>
</template>

<script setup>
import {ref, watch} from 'vue';
import {useUserStore} from '@/stores/userStore.js';
import {useCartStore} from '@/stores/cart/cartStore.js';
import Swal from 'sweetalert2';
import axios from '@/services/order/orderAxios.js';
import OrderDetailModal from '@/components/order/OrderDetailModal.vue';

const orders = ref([]);
const showModal = ref(false);
const selectedOrderId = ref(null);
const userStore = useUserStore();
const cartStore = useCartStore();
const isLoading = ref(false); // ✅ 加入 loading 狀態

watch(
    () => userStore.userId,
    async (userId) => {
      if (!userId) return;
      try {
        isLoading.value = true;
        const res = await axios.get(`/api/orders/user/${userId}`);
        orders.value = res;
      } catch (err) {
        console.error('無法取得訂單清單', err);
      } finally {
        isLoading.value = false;
      }
    },
    {immediate: true}
);

// 查看明細並抓資料
const openOrderDetail = (orderId) => {
  selectedOrderId.value = orderId;
  showModal.value = true;
};

// 時間格式化
const formatDate = (datetime) => {
  if (!datetime) return '';
  const date = new Date(datetime);
  return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString().padStart(2, '0')}-${date.getDate()
      .toString().padStart(2, '0')} ${date.getHours()
      .toString().padStart(2, '0')}:${date.getMinutes()
      .toString().padStart(2, '0')}`;
};

const reorder = async (orderId) => {
  try {
    const res = await axios.get(`/api/orders/${orderId}`);
    const items = res.orderDetails;

    if (!items || items.length === 0) {
      return Swal.fire('無法再次購買', '此訂單沒有商品', 'warning');
    }

    for (const item of items) {
      const product = { id: item.productId };

      if (cartStore.isLoggedIn()) {
        await axios.post('/api/cart', {
          userId: userStore.userId,
          productId: item.productId,
          quantity: item.quantity,
        });
      } else {
        const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
        const existing = guestCart.find(p => p.productId === item.productId);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          guestCart.push({ productId: item.productId, quantity: item.quantity });
        }
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
      }
    }

    if (cartStore.isLoggedIn()) {
      await cartStore.fetchCart();
    } else {
      cartStore.loadGuestCart();
    }

    Swal.fire('已加入購物車', '該筆訂單商品已加入購物車', 'success');
  } catch (err) {
    console.error('再次購買失敗', err);
    Swal.fire('錯誤', '加入失敗，請稍後再試', 'error');
  }
};

</script>

<style scoped>

.order-footer button + button {
  margin-left: 12px;
}

.orders-page {
  max-width: 880px;
  margin: 40px auto;
  padding: 20px;
  background: #fffaf4;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary);
  text-align: center;
  margin-bottom: 30px;
  position: relative;
}

.empty-text {
  text-align: center;
  color: #aaa;
  font-style: italic;
  font-size: 1.1rem;
}

.order-card {
  background: #ffffff;
  border: 1px solid #e2cfc0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.order-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 14px;
  font-weight: bold;
  color: var(--primary);
  font-size: 1.05rem;
}

.order-body p {
  margin: 5px 0;
  color: #3e2f28;
  font-size: 0.95rem;
}

.order-body .discount {
  color: #e53935;
  font-weight: bold;
}

.order-footer {
  margin-top: 16px;
  text-align: right;
}

.order-footer button {
  background: var(--primary);
  border: none;
  color: white;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.order-footer button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(126, 59, 146, 0.2);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.6);
  z-index: 9998;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loader {
  width: 60px;
  height: 60px;
  border: 6px solid #ccc;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
