import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from '@/services/order/orderAxios.js';

export const useCartStore = defineStore('cart', () => {
  const cartItems = ref([]);
  const userId = ref(null);

  const isLoggedIn = () => !!userId.value;

  const totalAmount = computed(() =>
      cartItems.value.reduce((sum, item) => sum + item.subtotal, 0)
  );

  // 抓會員購物車
  async function fetchCart() {
    if (!isLoggedIn()) return;
    const response = await axios.get(`/api/cart/${userId.value}`);
    cartItems.value = response;
  }

  // 加入購物車（統一入口）
  async function addToCart(product) {
    if (isLoggedIn()) {
      await axios.post('/api/cart', {
        userId: userId.value,
        productId: product.id,
        quantity: 1,
      });
      await fetchCart();
    } else {
      addGuestCartItem(product);
    }
  }

  // 訪客加入購物車（存 localStorage）
  function addGuestCartItem(product) {
    const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
    const existing = guestCart.find(item => item.productId === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      guestCart.push({ productId: product.id, quantity: 1 });
    }
    localStorage.setItem('guestCart', JSON.stringify(guestCart));
    loadGuestCart(); // 更新畫面
  }

  // 載入訪客購物車 → 給畫面用
  function loadGuestCart() {
    const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
    cartItems.value = guestCart.map(item => ({
      ...item,
      id: item.productId, // 或單純用 productId 當 key
    }));
  }

  // 更新數量
  async function updateQuantity(productId, newQuantity) {
    if (isLoggedIn()) {
      await axios.put('/api/cart', { userId: userId.value, productId, quantity: newQuantity });
      await fetchCart();
    } else {
      const item = cartItems.value.find(item => item.productId === productId);
      if (item) {
        item.quantity = newQuantity;
        item.subtotal = item.price * newQuantity;
        updateGuestStorage();
      }
    }
  }

  // 刪除商品
  async function removeItem(productId) {
    if (isLoggedIn()) {
      await axios.delete(`/api/cart/${userId.value}/${productId}`);
      await fetchCart();
    } else {
      cartItems.value = cartItems.value.filter(item => item.productId !== productId);
      updateGuestStorage();
    }
  }

  // 清空
  async function clearCart() {
    if (isLoggedIn()) {
      await axios.delete(`/api/cart/clear/${userId.value}`);
      await fetchCart();
    } else {
      cartItems.value = [];
      localStorage.removeItem('guestCart');
    }
  }

  // 登入後合併
  async function loginAndMerge(newUserId) {
    const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
    for (const item of guestCart) {
      await axios.post('/api/cart', {
        userId: newUserId,
        productId: item.productId,
        quantity: item.quantity,
      });
    }
    localStorage.removeItem('guestCart');
    userId.value = newUserId;
    await fetchCart();
  }

  // 設定畫面上的購物車（可直接替換）
  function setCartItems(items) {
    cartItems.value = items;
  }

  // 把畫面上的 cartItems 儲存回 localStorage（for 訪客）
  function updateGuestStorage() {
    const guest = cartItems.value.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));
    localStorage.setItem('guestCart', JSON.stringify(guest));
  }

  return {
    cartItems,
    userId,
    totalAmount,
    isLoggedIn,
    addToCart,
    addGuestCartItem,
    loadGuestCart,
    updateQuantity,
    removeItem,
    clearCart,
    fetchCart,
    loginAndMerge,
    setCartItems,
  };
}, {
  persist: {
    paths: ['cartItems'],
  }
});
