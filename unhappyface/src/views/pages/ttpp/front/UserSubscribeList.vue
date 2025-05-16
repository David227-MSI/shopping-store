<template>
  <div class="container">
    <h1>我的追蹤清單</h1>

    <div class="search-bar">
      <div class="filter-left">
        <div>
          <label for="categoryFilter">商品分類：</label>
          <select v-model="filters.categoryId" class="filter-select" id="categoryFilter">
            <option value="">全部</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">
              {{ c.name }}
            </option>
          </select>
        </div>
      </div>
      <div class="filter-right">
        <div>
          <label for="keywordSearch">搜尋商品或品牌：</label>
          <input
            type="text"
            v-model="filters.keyword"
            placeholder="輸入關鍵字"
            class="search-input"
            id="keywordSearch"
          />
        </div>
        <button class="reset-button" @click="resetFilters">清除</button>
      </div>
    </div>

    <h2 class="section-title">追蹤的商品</h2>
    <div v-if="followedProducts.length === 0" class="empty-state">
      <p>暫無追蹤的商品</p>
    </div>
    <div class="product-list">
      <SubscribeProductCard
        v-for="product in followedProducts"
        :key="product.id"
        :product="product"
        @remove-subscription="handleProductSubscription"
        @add-to-cart="addToCart"
      />
    </div>

    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import SubscribeProductCard from '@/components/ttpp/UserSubscribeProductCard.vue';

import { useUserStore } from '@/stores/userStore';
import { useCartStore } from '@/stores/cart/cartStore';
import { useRouter } from 'vue-router';


const userStore = useUserStore();
const cartStore = useCartStore();
const router = useRouter();

const filters = ref({
  userId: null,
  categoryId: '',
  keyword: null,
});

const followedProducts = ref([]);
const followedBrands = ref([]);
const categories = ref([]);

const fetchSubscriptions = async () => {
  if (!userStore.token || !userStore.userId) {
    Swal.fire({
      icon: 'warning',
      title: '請先登入',
      text: '需要登入才能查看您的追蹤清單。',
      confirmButtonText: '前往登入',
    }).then(() => {
      router.push('/secure/login');
    });
    return;
  }

  filters.value.userId = userStore.userId;

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/user/subscribes/query`,
      filters.value
    );

    if (res.data.success) {
      followedProducts.value = res.data.data.products || [];
      followedBrands.value = res.data.data.brands || [];
    } else {
      Swal.fire('查詢追蹤清單失敗', res.data.message || '錯誤', 'error');
      followedProducts.value = [];
      followedBrands.value = [];
    }
  } catch (err) {
    Swal.fire('查詢追蹤清單發生錯誤', err.response?.data?.message || '網路錯誤', 'error');
    followedProducts.value = [];
    followedBrands.value = [];
  }
};

const fetchCategories = async () => {
  try {
    const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/categories`);
    categories.value = data;
  } catch (err) {
    Swal.fire('分類載入失敗', err.response?.data?.message || '錯誤', 'error');
  }
};

const resetFilters = () => {
  filters.value.categoryId = '';
  filters.value.keyword = null;
  fetchSubscriptions();
};

const handleProductSubscription = async (productId) => {
  if (!userStore.token || !userStore.userId) {
    Swal.fire({
      icon: 'warning',
      title: '請先登入',
      text: '需要登入才能操作追蹤功能。',
      confirmButtonText: '前往登入',
    }).then(() => {
      router.push('/secure/login');
    });
    return;
  }

  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/subscribes/switch`, {
      userId: userStore.userId,
      itemId: productId,
      itemType: 'PRODUCT',
    });

    if (res.data.success) {
      const isSubscribing = res.data.data.isSubscribing;
      // 重新載入追蹤清單以更新畫面
      fetchSubscriptions();
    } else {
      Swal.fire('操作失敗', res.data.message || '錯誤', 'error');
    }
  } catch (err) {
    Swal.fire('操作發生錯誤', err.response?.data?.message || '網路錯誤', 'error');
  }
};

const removeProductSubscription = (productId) => {
  // 直接呼叫切換追蹤狀態的函式，因為後端是 toggle 功能
  handleProductSubscription(productId);
};

const removeBrandSubscription = async (brandId) => {
  if (!userStore.token || !userStore.userId) {
    Swal.fire({
      icon: 'warning',
      title: '請先登入',
      text: '需要登入才能操作追蹤功能。',
      confirmButtonText: '前往登入',
    }).then(() => {
      router.push('/secure/login');
    });
    return;
  }

  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/subscribes/switch`, {
      userId: userStore.userId,
      itemId: brandId,
      itemType: 'BRAND',
    });

    if (res.data.success) {
      const isSubscribing = res.data.data.isSubscribing;
      // 重新載入追蹤清單以更新畫面
      fetchSubscriptions();
    } else {
      Swal.fire('操作失敗', res.data.message || '錯誤', 'error');
    }
  } catch (err) {
    Swal.fire('操作發生錯誤', err.response?.data?.message || '網路錯誤', 'error');
  }
};

const addToCart = async (product) => {
  try {
    await cartStore.addToCart(product); //
    await cartStore.fetchCart();
    Swal.fire({
      icon: 'success',
      title: '已加入購物車',
      text: product.name,
      timer: 1200,
      showConfirmButton: false
    });
  } catch (err) {
    console.error('加入購物車失敗', err);
    Swal.fire('加入失敗', '請稍後再試', 'error');
  }
  console.log('加入購物車:', product);
};

watch([() => filters.value.categoryId, () => filters.value.keyword], fetchSubscriptions);

onMounted(() => {
  if (!userStore.token) {
    Swal.fire({
      icon: 'warning',
      title: '請先登入',
      text: '需要登入才能查看您的追蹤清單。',
      confirmButtonText: '前往登入',
    }).then(() => {
      router.push('/secure/login');
    });
  } else if (!userStore.userId) {
    console.warn('已登入但 userStore 中沒有 userId');
    fetchCategories();
    fetchSubscriptions();
  } else {
    filters.value.userId = userStore.userId;
    fetchCategories();
    fetchSubscriptions();
  }
});
</script>






<style scoped>
/* 這裡的樣式會與 main.css 中的樣式合併，但 scoped 樣式只作用於此組件 */
.container {
  width: 85%;
  margin: 70px auto 20px auto; /* 調整上下 margin */
  padding: 20px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

h1 {
  text-align: center;
  color: var(--primary);
  font-size: 3rem;
  margin-bottom: 20px; /* 增加一點 margin */
  font-weight: bold;
}

.search-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.filter-left,
.filter-right {
  display: flex;
  gap: 20px;
}

.filter-left > div,
.filter-right > div {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 5px;
  color: var(--text-dark);
  font-weight: bold;
  font-size: 0.9rem;
}

.filter-select,
.search-input {
  width: 100%;
  min-width: 150px;
  max-width: 100%;
  padding: 8px 12px;
  border: 1px solid #d2b48c;
  border-radius: 6px;
  box-sizing: border-box;
  appearance: none;
  background-color: #fff;
  font-family: inherit;
  color: var(--text-dark);
}

.reset-button {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  background-color: #c0a674;
  color: var(--text-dark);
}

.reset-button:hover {
  background-color: #a68a58;
}

.section-title {
  margin-top: 20px;
  margin-bottom: 15px;
  color: var(--primary);
  font-size: 1.8rem;
  font-weight: bold;
  text-align: left; /* 調整標題對齊 */
}

.empty-state {
  text-align: center;
  color: #666;
  padding: 20px;
  border: 1px dashed #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); /* 參考 main.css */
  gap: 20px;
  margin-bottom: 20px; /* 增加一點 margin */
}
</style>