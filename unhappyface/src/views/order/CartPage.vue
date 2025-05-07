<template>
  <div class="cart-container">
    <h1 class="page-title">購物車</h1>

    <!-- 進度條 -->
    <div class="step-bar">
      <span class="step active">1. 購物車</span>
      <span class="step">2. 填寫資料</span>
      <span class="step">3. 完成訂單</span>
    </div>

    <div v-if="cartItems.length === 0" class="empty-cart">
      <p>目前購物車內沒有商品</p>
    </div>

    <div v-else class="cart-main">
      <!-- 左邊 商品列表 / 追蹤未放功能 (只提供按鈕) -->
      <div class="cart-list">
        <ul>
          <li v-for="item in cartItems" :key="item.id" class="cart-item">
            <div class="item-image">
              <img :src="getImageUrl(item.productName)" alt="商品圖片" />
            </div>
            <div class="item-info">
              <div class="product-name">{{ item.productName }}</div>
              <div class="product-detail">單價: {{ item.price }} 元</div>
              <div class="item-actions">
                <button @click="updateQuantity(item.productId, item.quantity - 1)" :disabled="isLoading || item.quantity <= 1">-</button>
                <span class="quantity">{{ item.quantity }}</span>
                <button @click="updateQuantity(item.productId, item.quantity + 1)" :disabled="isLoading">+</button>
                <button @click="removeItem(item.productId)" :disabled="isLoading" class="delete-btn">刪除</button>
                <button disabled class="watch-button">追蹤</button>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- 右邊 結帳資訊 / 優惠捲只幫忙放位置 (無功能) -->
      <div class="checkout-summary">
        <div class="summary-card">
          <!-- 插入動畫 -->
          <div class="cart-animation-wrapper">
            <LottieAnimation :animationData="cartAnimation" :autoplay="true" :loop="true" />
          </div>
          <h2>結帳明細</h2>
          <div class="summary-item">
            <span>商品總金額</span>
            <span>${{ totalAmount }}</span>
          </div>
          <div class="summary-item">
            <span>折價券</span>
            <span class="discount">- ${{ discountAmount }}</span>
          </div>
          <div class="summary-total">
            <span>結帳金額</span>
            <span>${{ totalAmount - discountAmount }}</span>
          </div>
          <button @click="goToCheckout" :disabled="isLoading || cartItems.length === 0" class="checkout-btn">
            {{ isLoading ? '處理中...' : '結帳' }}
          </button>
          <button @click="clearCart" :disabled="isLoading || cartItems.length === 0" class="clear-btn">
            清空購物車
          </button>
        </div>

        <div class="coupon-card">
          <h3>折價券</h3>
          <p v-if="selectedCoupon">已選擇：{{ selectedCoupon.discountType === 'VALUE'
              ? `折抵 $${selectedCoupon.discountValue}`
              : `打 ${selectedCoupon.discountValue} 折（最多折 $${selectedCoupon.maxDiscount ?? '無'})` }}</p>
          <p v-else>尚未選擇折價券</p>
          <button @click="openCouponModal" class="coupon-btn">選擇優惠券</button>
        </div>
      </div>
    </div>
    <teleport to="body">
      <CouponDialog
          v-if="showCouponDialog"
          :couponList="couponStore.couponList"
          :selectedId="couponStore.selectedCouponId"
          @close="showCouponDialog = false"
          @confirm="applyCoupon"
      />
    </teleport>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/services/order/orderAxios.js';
import { useCartStore } from '@/stores/cart/cartStore.js';
import { useCouponStore } from '@/stores/cart/couponStore.js';
import Swal from 'sweetalert2';
import LottieAnimation from '@/components/order/LottiePlayer.vue';
import CouponDialog from '@/components/order/CouponDialog.vue';
import cartAnimation from '@/assets/animations/cartAnimation.json';

const router = useRouter();
const cartStore = useCartStore();
const couponStore = useCouponStore();

const userId = computed(() => cartStore.userId);
const cartItems = computed(() => cartStore.cartItems);
const totalAmount = computed(() => cartStore.totalAmount);
const selectedCoupon = computed(() => couponStore.selectedCoupon);
const discountAmount = computed(() => couponStore.discountAmount);

const isLoading = ref(false);
const showCouponDialog = ref(false);

const openCouponModal = () => {
  console.log('優惠券清單：', couponStore.couponList);
  showCouponDialog.value = true;
};

const applyCoupon = (couponId) => {
  couponStore.selectedCouponId = couponId;
  showCouponDialog.value = false;
};

const loadCart = async () => {
  try {
    if (userId.value) {
      const response = await axios.get(`/api/cart/${userId.value}`);
      cartStore.setCartItems(response);
    }
  } catch (error) {
    console.error('載入購物車失敗', error);
    Swal.fire({
      icon: 'error',
      title: '載入失敗',
      text: '無法載入購物車資料，請稍後再試！',
    });
  }
};

const updateQuantity = async (productId, newQuantity) => {
  if (newQuantity < 1) return;
  isLoading.value = true;
  try {
    if (userId.value) {
      await axios.put('/api/cart', { userId: userId.value, productId, quantity: newQuantity });
      await loadCart();
    } else {
      cartStore.updateItemQuantity(productId, newQuantity);
    }
    await Swal.fire({
      icon: 'success',
      title: '更新成功！',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1000,
      timerProgressBar: true,
    });
  } catch (error) {
    console.error('更新商品數量失敗', error);
  } finally {
    isLoading.value = false;
  }
};

const removeItem = async (productId) => {
  isLoading.value = true;
  try {
    if (userId.value) {
      await axios.delete(`/api/cart/${userId.value}/${productId}`);
      await loadCart();
    } else {
      cartStore.removeItem(productId);
    }
    await Swal.fire({
      icon: 'success',
      title: '刪除成功！',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1000,
      timerProgressBar: true,
    });
  } catch (error) {
    console.error('刪除商品失敗', error);
  } finally {
    isLoading.value = false;
  }
};

const clearCart = async () => {
  isLoading.value = true;
  try {
    if (userId.value) {
      await axios.delete(`/api/cart/clear/${userId.value}`);
      await loadCart();
    } else {
      cartStore.clearCart();
    }
    await Swal.fire({
      icon: 'success',
      title: '購物車已清空！',
      showConfirmButton: false,
      timer: 1200,
    });
  } catch (error) {
    console.error('清空購物車失敗', error);
  } finally {
    isLoading.value = false;
  }
};

const goToCheckout = async () => {
  if (cartItems.value.length === 0) {
    await Swal.fire({
      icon: 'warning',
      title: '購物車是空的！',
      text: '請先加入商品再結帳',
      confirmButtonText: '了解',
    });
    return;
  }
  try {
    router.push({ name: 'checkout' });
  } catch (error) {
    console.error('跳轉結帳頁失敗', error);
  }
};

onMounted(() => {
  loadCart();
});

const getImageUrl = (productName) => {
  if (productName.includes('香水')) {
    return 'https://www.jomalone.com.tw/media/export/cms/products/1000x1000/jo_sku_L00C01_1000x1000_0.png';
  }
  if (productName.toLowerCase().includes('iphone')) {
    return 'https://d2lfcsub12kx0l.cloudfront.net/tw/product/img/Apple_apple_iphone_plus_0907185907356_360x270.jpg';
  }
  return 'https://via.placeholder.com/80?text=No+Image';
};
</script>

<style scoped>
.cart-container {
  max-width: 1200px;
  margin: 60px auto;
  padding: 30px;
  background: #fff;
}

.page-title {
  text-align: center;
  font-size: 32px;
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
.step {
  color: #bbb;
  font-weight: bold;
}
.step.active {
  color: #7e3b92;
  border-bottom: 2px solid #7e3b92;
  padding-bottom: 4px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
.actions button {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: #7e3b92;
  color: white;
  font-weight: bold;
  cursor: pointer;
}
.actions button:hover {
  background: #a95fd1;
}

.cart-main {
  display: flex;
  gap: 40px;
}

.cart-list {
  flex: 2;
}

.cart-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.cart-item {
  display: flex;
  align-items: center;
  background: #f9f6fc;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #eee;
  border-radius: 12px;
}

.item-image {
  width: 100px;
  height: 100px;
  margin-right: 24px;
  border-radius: 12px;
  overflow: hidden;
  background: #f0f0f0;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.product-name {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 6px;
  color: #4a1d5d;
}

.product-detail {
  font-size: 16px;
  color: #666;
  margin-bottom: 12px;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-actions button {
  padding: 6px 14px;
  font-size: 15px;
  border: 1px solid #ccc;
  background: white;
  color: #333;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.item-actions button:hover {
  background: #f1e6f5;
}
.item-actions .delete-btn {
  border-color: #e53935;
  color: #e53935;
}
.item-actions .delete-btn:hover {
  background: #e53935;
  color: #fff;
}
.watch-button {
  border-color: #7e3b92;
  color: #7e3b92;
}
.watch-button:hover {
  background: #7e3b92;
  color: white;
}

.quantity {
  min-width: 30px;
  text-align: center;
}

.checkout-summary {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.summary-card,
.coupon-card {
  padding: 20px;
  background: #fefaff;
  border-radius: 12px;
  border: 1px solid #e2d4ee;
}

.summary-card h2,
.coupon-card h3 {
  margin-bottom: 20px;
  font-size: 22px;
  font-weight: bold;
  color: #7e3b92;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 17px;
  color: #555;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  font-size: 20px;
  font-weight: bold;
  margin: 20px 0;
  color: #333;
}

.discount {
  color: #e53935;
}
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.dialog {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

.checkout-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(to right, #a951d2, #7e3b92);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
}
.checkout-btn:hover {
  opacity: 0.95;
  transform: scale(1.02);
}

.clear-btn {
  margin-top: 12px;
  width: 100%;
  padding: 12px;
  background: #fff;
  border: 2px solid #7e3b92;
  border-radius: 10px;
  color: #7e3b92;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}
.clear-btn:hover {
  background: #f5ecfa;
}

.coupon-btn {
  padding: 8px 16px;
  border-radius: 8px;
  background: #7e3b92;
  color: white;
  border: none;
  cursor: pointer;
}
.coupon-btn:hover {
  background: #a85fd1;
}

.empty-cart {
  text-align: center;
  font-size: 20px;
  color: #888;
  padding: 80px 0;
}

.lottie-animation-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
}
.lottie-animation-wrapper .lottie-player {
  width: 100px;
  height: 100px;
}

</style>
