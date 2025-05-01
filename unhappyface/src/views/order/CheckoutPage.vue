<template>
  <div>
    <h1>結帳頁面</h1>

    <!-- 收件人資訊 -->
    <div class="info-block">
      <h2>收件人資訊</h2>
      <p>姓名: {{ userInfo.name }}</p>
      <p>電話: {{ userInfo.phone }}</p>
      <p>地址: {{ userInfo.address }}</p>
    </div>

    <!-- 購物車商品清單 -->
    <div class="info-block">
      <h2>購物車明細</h2>
      <ul>
        <li v-for="item in cartItems" :key="item.id">
          {{ item.productName }} - 數量: {{ item.quantity }} - 小計: {{ item.subtotal }} 元
        </li>
      </ul>
    </div>

    <!-- 總金額 -->
    <div class="info-block">
      <h2>總金額：{{ totalAmount }} 元</h2>
    </div>

    <!-- 送出訂單按鈕 -->
    <button :disabled="isSubmitting" @click="submitOrder">
      {{ isSubmitting ? '送出中...' : '送出訂單' }}
    </button>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue';
import {useRouter} from 'vue-router';
import {useCartStore} from '@/stores/cart/cartStore.js';
import axios from '@/services/order/axios';
import Swal from 'sweetalert2';

const router = useRouter();
const cartStore = useCartStore();
const userId = computed(() => cartStore.userId);
const cartItems = computed(() => cartStore.cartItems);
const isSubmitting = ref(false);

const userInfo = ref({
  name: '測試使用者',
  phone: '0912345678',
  address: '台北市信義區',
});

// 載入購物車
const loadCart = async () => {
  if (userId.value) {
    const response = await axios.get(`/api/cart/${userId.value}`);
    cartStore.setCartItems(response);
  }
};

// 計算總金額
const totalAmount = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.subtotal, 0);
});

// 送出訂單
const submitOrder = async () => {
  const result = await Swal.fire({
    title: '確認送出訂單？',
    text: '請再次確認購物車內容與收件資訊。',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: '確認送出',
    cancelButtonText: '取消',
  });

  if (!result.isConfirmed) {
    return;
  }

  try {
    isSubmitting.value = true;

    const orderItems = cartItems.value.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    const orderRequest = {
      userId: userId.value,
      couponPublishedId: null,
      recipientName: userInfo.value.name,
      recipientPhone: userInfo.value.phone,
      recipientAddress: userInfo.value.address,
      items: orderItems,
    };

    const orderResponse = await axios.post('/api/orders', orderRequest);

    const orderId = orderResponse.orderId;
    const finalAmount = orderResponse.finalAmount;

    // 呼叫綠界付款 API
    const paymentResponse = await axios.post('/api/ecpay/start-payment', {
      orderId: orderId,
      amount: finalAmount
    });

    console.log('後端傳回來的內容：', paymentResponse);

    // 後端傳回來的form插進DOM並送出
    const fields = await axios.post('/api/ecpay/start-payment', {
      orderId,
      amount: finalAmount
    });

    console.log('🔍 綠界欄位內容：', fields);

    // 🔧 改為純 JS 動態建立 form，避免瀏覽器阻擋
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

  } catch (error) {
    console.error('送出訂單失敗', error);
    await Swal.fire({
      icon: 'error',
      title: '訂單送出失敗',
      text: '請稍後再試！',
    });
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  loadCart();
});
</script>

<style scoped>
.info-block {
  margin-bottom: 20px;
}

button {
  margin-top: 20px;
}
</style>
