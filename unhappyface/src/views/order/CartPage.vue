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
      <!-- 左邊 商品列表 / 收藏未放功能 (只提供按鈕) -->
      <div class="cart-list">
        <div class="select-all-bar">
          <label>
            <input
                type="checkbox"
                :checked="selectedItems.length === cartItems.length"
                @change="toggleSelectAll"
            />
            全選 / 取消全選
          </label>
        </div>
        <ul>
          <li v-for="item in cartItems" :key="item.productId" class="cart-item">
            <div class="checkbox-wrapper">
              <input
                  type="checkbox"
                  :checked="selectedItems.includes(item.productId)"
                  @change="toggleItemSelection(item.productId)"
              />
            </div>
            <div class="item-image">
              <img :src="productImageMap[item.productId]" alt="商品圖片" />
            </div>
            <div class="item-info">
              <div class="product-name">{{ item.productName }}</div>
              <div class="product-brand">品牌：{{ item.brandName }}</div>
              <div class="product-category">分類：{{ item.categoryName }}</div>
              <div class="product-detail">單價: {{ item.price }} 元</div>
              <div class="product-detail">小計: {{ item.price * item.quantity }} 元</div>
              <div class="item-actions">
                <button @click="updateQuantity(item.productId, item.quantity - 1)" :disabled="isLoading || item.quantity <= 1">-</button>
                <span class="quantity">{{ item.quantity }}</span>
                <button @click="updateQuantity(item.productId, item.quantity + 1)" :disabled="isLoading">+</button>
                <button @click="removeItem(item.productId)" :disabled="isLoading" class="delete-btn">刪除</button>
                <button
                  @click="toggleWatch(item.productId)"
                  :class="{'watched': watchedProducts.has(item.productId)}"
                  :disabled="isLoading"
                  class="watch-button"
                >
                  {{ watchedProducts.has(item.productId) ? '取消收藏' : '收藏' }}
                </button>  
              </div>
            </div>
          </li>
        </ul>
        <div class="cart-list-footer">
          <button @click="clearCart" :disabled="isLoading || cartItems.length === 0" class="clear-btn">
            清空購物車
          </button>
        </div>
      </div>

      <!-- 右邊 結帳資訊 -->
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
        </div>

        <div class="coupon-card">
          <h3>折價券</h3>
          <p v-if="selectedCoupon">
            已選擇：
            {{ selectedCoupon.discountType === 'VALUE'
              ? `折抵 $${selectedCoupon.discountValue}`
              : `${selectedCoupon.discountValue}% 折扣（最多折 $${selectedCoupon.maxDiscount ?? '無'})` }}
          </p>
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
import { useUserStore } from '@/stores/userStore.js';
import Swal from 'sweetalert2';
import LottieAnimation from '@/components/order/LottiePlayer.vue';
import CouponDialog from '@/components/order/CouponDialog.vue';
import cartAnimation from '@/assets/animations/cartAnimation.json';

const router = useRouter();
const cartStore = useCartStore();
const userStore = useUserStore();
const couponStore = useCouponStore();
const productImageMap = ref({});

const watchedProducts = ref(new Set());

const userId = computed(() => userStore.userId);
const cartItems = computed(() => cartStore.cartItems);
const totalAmount = computed(() => cartStore.selectedTotalAmount);
const selectedCoupon = computed(() => couponStore.selectedCoupon);
const discountAmount = computed(() => couponStore.discountAmount);
const selectedItems = computed(() => cartStore.selectedItems);

const isLoading = ref(false);
const showCouponDialog = ref(false);
const toggleItemSelection = cartStore.toggleItemSelection;

const toggleSelectAll = () => {
  if (selectedItems.value.length === cartItems.value.length) {
    cartStore.deselectAllItems();
  } else {
    cartStore.selectAllItems();
  }
};

const openCouponModal = () => {
  console.log('優惠券清單：', couponStore.couponList);
  showCouponDialog.value = true;
};

const applyCoupon = (couponId) => {
  couponStore.setSelectedCoupon(couponId);
  showCouponDialog.value = false;
};

// 抓不到 fallback 為 /images/placeholder.png
const fetchMainImageForCartItems = async () => {
  const promises = cartItems.value.map(async (item) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/media/${item.productId}/main`);
      const mediaUrl = res.data?.mediaUrl || '/images/placeholder.png';
      productImageMap.value[item.productId] = mediaUrl;
    } catch {
      productImageMap.value[item.productId] = '/images/placeholder.png';
    }
  });
  await Promise.all(promises);
};

const loadCart = async () => {
  try {
    if (userId.value) {
      await cartStore.fetchCart();
    }
    await fetchMainImageForCartItems();
    await loadWatchStatus();
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
      await cartStore.updateQuantity(productId, newQuantity); // cartStore 自己會處理邏輯
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
      await cartStore.removeItem(productId);
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
      await cartStore.clearCart();
      await cartStore.fetchCart();
    } else {
      await cartStore.clearCart();
      await cartStore.fetchCart();
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


const loadWatchStatus = async () => {
  // console.log('loadWatchStatus 開始，cartItems:', cartItems.value);
  if (userId.value && cartItems.value.length > 0) {
    try {
      const requests = cartItems.value.map(item =>
        axios.post(`${import.meta.env.VITE_API_URL}/api/user/subscribes/getSubscribeStatus`, {
          userId: userId.value,
          itemType: 'PRODUCT',
          itemId: item.productId
        })
      );

      const responses = await Promise.all(requests);

      responses.forEach((res, index) => {
        // console.log(`商品 ${cartItems.value[index].productId} 的收藏狀態回應：`, res.data);
        // 直接檢查 res.data 的布林值
        if (res.data === true) {
          // console.log('收藏成功，productId:', cartItems.value[index].productId);
          watchedProducts.value.add(cartItems.value[index].productId);
        } else {
          // console.log('未收藏，productId:', cartItems.value[index].productId, '回應:', res.data);
        }
      });
      // console.log('loadWatchStatus 完成，watchedProducts:', watchedProducts.value);
    } catch (error) {
      console.error('載入收藏狀態失敗', error);
    }
  } else {
    watchedProducts.value.clear();
    console.log('loadWatchStatus 完成，因無使用者或無購物車商品，已清空 watchedProducts');
  }
};



const toggleWatch = async (productId) => {
  if (!userId.value) {
    Swal.fire({
      icon: 'warning',
      title: '請先登入',
      text: '登入後才能使用收藏功能',
      confirmButtonText: '前往登入',
    });
    return;
  }

  isLoading.value = true;
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/subscribes/switch`, {
      userId: userId.value,
      itemId: productId,
      itemType: 'PRODUCT'
    });
    console.log('後端 switch API 回應:', response.data);

    if (response?.success) {
      const isSubscribing = response.data.isSubscribing; // 直接從 response.data 取值
      console.log('isSubscribing 狀態:', isSubscribing);

      if (isSubscribing !== undefined) {
        if (isSubscribing) {
          watchedProducts.value.add(productId);
          Swal.fire({
            icon: 'success',
            title: '已加入收藏！',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true,
          });
        } else {
          watchedProducts.value.delete(productId);
          Swal.fire({
            icon: 'info',
            title: '已取消收藏！',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true,
          });
        }
      } else {
        Swal.fire({
          icon: 'warning',
          title: '操作成功',
          text: '但未收到收藏狀態更新',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true,
        });
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: '操作失敗',
        text: response.data?.message || '無法更新收藏狀態',
      });
    }
  } catch (error) {
    console.error('切換收藏狀態失敗', error);
    Swal.fire({
      icon: 'error',
      title: '操作失敗',
      text: '與伺服器通訊發生錯誤',
    });
  } finally {
    isLoading.value = false;
  }
};



onMounted(async () => {
  await loadCart();
  cartStore.selectAllItems();
  loadWatchStatus();

});

</script>

<style scoped>

.select-all-bar {
  margin-bottom: 10px;
  font-weight: bold;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  padding-right: 8px;
}

.product-brand,
.product-category {
  font-size: 0.95rem;
  color: #5c4328;
  margin: 4px 0;
}

.cart-container {
  background-color: var(--background);
  padding: 40px 20px;
  color: var(--text-dark);
}

.page-title {
  text-align: center;
  color: var(--primary);
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 30px;
}

.step-bar {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}
.step {
  font-weight: bold;
  color: #aaa;
}
.step.active {
  color: var(--primary);
}

.empty-cart {
  text-align: center;
  font-size: 1.2rem;
  color: #666;
  padding: 50px 0;
}

.cart-main {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  margin-top: 20px;
}

.cart-list {
  flex: 2;
}
.cart-list-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
}
.cart-item {
  display: flex;
  gap: 20px;
  padding: 20px;
  margin-bottom: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}
.item-image img {
  width: 120px;
  height: 120px;
  object-fit: contain;
  border-radius: 10px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.item-image img:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.item-info {
  flex: 1;
}
.product-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--primary);
}
.product-detail {
  margin: 4px 0;
  font-size: 0.95rem;
}
.item-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.item-actions button {
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}
.item-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.delete-btn {
  background-color: #e57373;
  color: white;
}
.watch-button {
  background-color: #d8c7b0;
  color: var(--text-dark);
  font-weight: bold;
  padding: 6px 12px;
  border: 1px solid #a88b6a;
  border-radius: 8px;
  cursor: pointer;
}
.watch-button:hover {
  background-color: #f0e6d5;
}

.checkout-summary {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.summary-card {
  background: #fffaf4;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}
.cart-animation-wrapper {
  width: 100%;
  height: 150px;
  margin-bottom: 10px;
}
.summary-card h2 {
  color: var(--primary);
  margin-bottom: 15px;
}
.summary-item,
.summary-total {
  display: flex;
  justify-content: space-between;
  margin: 8px 0;
}
.summary-total {
  font-weight: bold;
  font-size: 1.2rem;
  border-top: 1px solid #ccc;
  padding-top: 8px;
}
.discount {
  color: #e57373;
}
.checkout-btn {
  background-color: var(--primary);
  color: white;
  border: none;
  padding: 18px 40px;
  font-size: 1.4rem;
  font-weight: bold;
  border-radius: 16px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 100%;
  margin-top: 24px;
}
.checkout-btn:hover {
  background-color: #40291d;
  transform: translateY(-2px);
}
.clear-btn {
  background-color: #c0a674;
  color: var(--text-dark);
  border: none;
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.clear-btn:hover {
  background-color: #b0935c;
}

.coupon-card {
  margin-top: 30px;
  padding: 20px;
  background: #fffaf4;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}
.coupon-card h3 {
  color: var(--primary);
  margin-bottom: 10px;
}
.coupon-btn {
  background-color: var(--primary);
  color: white;
  border: none;
  padding: 10px 18px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 15px;
}
.coupon-btn:hover {
  background-color: #40291d;
}
</style>
