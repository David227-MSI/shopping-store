<template>
  <div class="checkout-container">
    <h1 class="page-title">結帳頁面</h1>

    <!-- 進度條 -->
    <div class="step-bar">
      <span class="step active">1. 購物車</span>
      <span class="step active">2. 填寫資料</span>
      <span class="step">3. 完成訂單</span>
    </div>

    <!-- 左邊 -->
    <div class="checkout-main">
      <div class="left-side">
        <!-- 收件人資訊 -->
        <div class="info-card">
          <h2>收件人資訊</h2>
          <p><strong>姓名：</strong>{{ recipientInfo.name }}</p>
          <p><strong>電話：</strong>{{ recipientInfo.phone }}</p>
          <p><strong>地址：</strong>{{ recipientInfo.address }}</p>
          <button class="edit-btn" @click="showAddressDialog = true">修改收件資訊</button>
        </div>

        <!-- 購物車明細 -->
        <div class="info-card">
          <h2>購物車明細</h2>
          <ul class="item-list">
            <li v-for="item in cartItems" :key="item.productId">
              {{ item.productName }} × {{ item.quantity }}　｜小計 {{ item.subtotal }} 元
            </li>
          </ul>
        </div>
      </div>

      <!-- 右邊 -->
      <div class="right-side">
        <!-- 結帳明細 -->
        <div class="info-card checkout-box">
          <h2>結帳明細</h2>
          <div class="summary-item">
            <span>商品總金額</span>
            <span>{{ totalAmount }} 元</span>
          </div>
          <div class="summary-item">
            <span>折價券</span>
            <span class="discount">- {{ discountAmount }} 元</span>
          </div>
          <div class="summary-total">
            <span>結帳金額</span>
            <span class="final">{{ totalAmount - discountAmount }} 元</span>
          </div>
          <button class="submit-btn" :disabled="isSubmitting" @click="submitOrder">
            {{ isSubmitting ? '送出中...' : '送出訂單並付款' }}
          </button>
        </div>

        <!-- 付款方式說明 + 動畫 -->
        <div class="info-card">
          <h2>付款方式</h2>
          <p>本商店僅支援綠界 <strong>信用卡</strong> 線上付款</p>
          <p class="note">付款成功後將跳轉至訂單完成頁面</p>
          <LottieAnimation :animationData="approved" :loop="true" />
        </div>
      </div>
    </div>

    <AddressDialog
        v-if="showAddressDialog"
        :show="showAddressDialog"
        :memberInfo="userStore.user"
        @close="showAddressDialog = false"
        @confirm="handleAddressConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart/cartStore.js';
import { useUserStore } from '@/stores/cart/userStore.js';
import axios from '@/services/order/axios';
import Swal from 'sweetalert2';
import AddressDialog from '@/components/AddressDialog.vue';
import LottieAnimation from '@/components/LottiePlayer.vue';
import approved from '@/assets/animations/approved.json';
import { useCouponStore } from '@/stores/cart/couponStore.js';

const router = useRouter();
const cartStore = useCartStore();
const userStore = useUserStore();
const couponStore = useCouponStore();
const discountAmount = computed(() => couponStore.discountAmount);
const selectedCouponId = computed(() => couponStore.selectedCouponId);

const userId = computed(() => cartStore.userId);
const cartItems = computed(() => cartStore.cartItems);
const totalAmount = computed(() => cartItems.value.reduce((sum, item) => sum + item.subtotal, 0));

const isSubmitting = ref(false);
const showAddressDialog = ref(false);
const recipientInfo = ref({ name: '', phone: '', address: '' });

onMounted(() => {
  loadCart();
  recipientInfo.value = {
    name: userStore.user?.username || '',
    phone: userStore.user?.phone || '',
    address: userStore.user?.address || '',
  };
});

const loadCart = async () => {
  if (userId.value) {
    const response = await axios.get(`/api/cart/${userId.value}`);
    cartStore.setCartItems(response);
  }
};

const handleAddressConfirm = (newInfo) => {
  recipientInfo.value = { ...newInfo };
  showAddressDialog.value = false;
};

const submitOrder = async () => {
  const confirm = await Swal.fire({
    title: '確認送出訂單？',
    text: '請再次確認購物車內容與收件資訊。',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: '確認送出',
    cancelButtonText: '取消'
  });
  if (!confirm.isConfirmed) return;

  try {
    isSubmitting.value = true;
    const orderItems = cartItems.value.map(item => ({ productId: item.productId, quantity: item.quantity }));
    const orderRequest = {
      userId: userId.value,
      couponPublishedId: selectedCouponId.value,
      recipientName: recipientInfo.value.name,
      recipientPhone: recipientInfo.value.phone,
      recipientAddress: recipientInfo.value.address,
      items: orderItems,
    };
    const { orderId, finalAmount } = await axios.post('/api/orders', orderRequest);
    const fields = await axios.post('/api/ecpay/start-payment', { orderId, amount: finalAmount });
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5';
    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  } catch (err) {
    console.error('送出訂單失敗', err);
    Swal.fire('送出失敗', '請稍後再試', 'error');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.checkout-container {
  max-width: 1200px;
  margin: 50px auto;
  padding: 30px;
}
.page-title {
  text-align: center;
  font-size: 2.4rem;
  font-weight: bold;
  color: #7e3b92;
  margin-bottom: 30px;
}
.step-bar {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  font-size: 18px;
  margin-bottom: 40px;
}
.step { color: #bbb; font-weight: bold; }
.step.active {
  color: #7e3b92;
  border-bottom: 2px solid #7e3b92;
  padding-bottom: 4px;
}
.checkout-main {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}
.left-side, .right-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.info-card {
  background: #fef6ff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e0cce9;
  box-shadow: 0 4px 12px rgba(126, 59, 146, 0.1);
}
.info-card h2 {
  font-size: 20px;
  margin-bottom: 12px;
  color: #7e3b92;
}
.item-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.edit-btn {
  margin-top: 12px;
  padding: 8px 16px;
  background: #7e3b92;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.3s;
}
.edit-btn:hover {
  background: #9b59b6;
}
.summary-item {
  display: flex;
  justify-content: space-between;
  margin: 12px 0;
  font-size: 16px;
  color: #555;
}
.summary-total {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-top: 16px;
  font-size: 18px;
  color: #333;
}
.final { font-size: 20px; color: #3c0f61; }
.discount { color: #e53935; }
.submit-btn {
  width: 100%;
  margin-top: 20px;
  padding: 14px;
  font-size: 18px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(to right, #a951d2, #7e3b92);
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}
.submit-btn:hover {
  transform: scale(1.02);
  opacity: 0.95;
}
.note {
  font-size: 14px;
  color: #888;
  margin-top: 6px;
}
</style>
