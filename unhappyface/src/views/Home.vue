<template>
    <div>
      <!-- 導覽列 -->
      <Header :cartCount="cartCount" />

<!-- 🔍 搜尋列整體包裝 -->
<div class="search-bar keyword-with-logo">
  <!-- 左側 LOGO -->
  <img src="https://unhappyproductmedia.blob.core.windows.net/product-media/test/Web/logo1.png" alt="LOGO" class="search-logo" />

<!-- 中間搜尋欄區塊 -->
<div style="flex: 1; display: flex; justify-content: center;">
  <div class="search-input-container"> 
    <!-- 搜尋列 -->
    <div style="display: flex; gap: 12px; align-items: center;">
      <input
        type="text"
        placeholder="請輸入商品關鍵字"
        v-model="searchKeyword"
        @keyup.enter="searchProducts"
        style="flex: 1;"
      />
      <button class="search-button" @click="searchProducts">🔍 搜尋</button>
    </div>

    <!-- 熱門商品 對齊上方 input -->
    <div class="hot-keywords" style="margin-top: 6px;">
      熱門商品：
      <router-link :to="{ name: 'ProductDetail', params: { id: 111 } }">月光香水</router-link> /
      <router-link :to="{ name: 'ProductDetail', params: { id: 105 } }">竹風拖鞋</router-link> /
      <router-link :to="{ name: 'ProductDetail', params: { id: 112 } }">奧創手機</router-link> /
      <router-link :to="{ name: 'ProductDetail', params: { id: 103 } }">雲彩洋裝</router-link>
    </div>
  </div>
</div>


  <!-- 右側活動圖 -->
  <div class="promo-image" style="margin-left: 120px;">
    <img src="https://unhappyproductmedia.blob.core.windows.net/product-media/test/Web/promo.gif" alt="活動檔期" style="width: 350px; height: 180px;"/>
  </div>
</div>
</div>
<div class="top-banner-layout">
  <!-- 左側：分類選單 -->
  <div class="left-sidebar">
    <CategorySidebar
      :sideCategories="sideCategories"
      @filter-category="filterByCategory"
      @toggle-sub="toggleSubCategory"
    />
  </div>

  <!-- 中間：輪播區 -->
  <div class="center-banner">
    <router-link to="/pages/user-event-list">
      <BannerSwiper :banners="banners" />
    </router-link>
  </div>

  <!-- 右側：預留區 -->
<!-- 右側：功能區 -->
<div class="right-placeholder">
  <div class="quick-actions">
    <div class="action-item">
      🛒 <span>購物車</span>
    </div>
    <div class="action-item">
      ❤️ <span>追蹤清單</span>
    </div>
    <div class="action-item">
      🎁 <span>優惠券</span>
    </div>
  </div>
</div>

</div>

  
      <div class="layout">
        <div class="main-content">
          <div class="container">
            <!-- 商品列表 -->
            <div class="product-list">
              <ProductCard
                v-for="product in products"
                :key="product.id"
                :product="product"
                :isWishlisted="wishlistedStatus[product.id]"
                @add-to-cart="addToCart"
                @toggle-wishlist="toggleWishlist"
              />
            </div>
          </div>
        </div>
      </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useUserStore } from '@/stores/userStore'
  import { useCartStore } from '@/stores/cart/cartStore.js'
  import axios from 'axios'
  import Swal from 'sweetalert2'
  
  import Header from '@/components/common/Header.vue'
  import Footer from '@/components/common/Footer.vue'
  //import BannerSwiper from '@/components/common/BannerSwiper.vue'
  import CategorySidebar from '@/components/common/CategorySidebar.vue'
  import ProductSearchBar from '@/components/product/ProductSearchBar.vue'
  import ProductCard from '@/components/product/ProductCard.vue'
  import BannerSwiper from '@/components/common/BannerSwiper.vue'

  const userStore = useUserStore()
  const cartStore = useCartStore()
  const router = useRouter()

  const banners = [
    'https://unhappyproductmedia.blob.core.windows.net/product-media/test/Web/banner1.jpg',
    'https://unhappyproductmedia.blob.core.windows.net/product-media/test/Web/banner2.jpg',
    'https://unhappyproductmedia.blob.core.windows.net/product-media/test/Web/banner3.jpg'
  ]
  
  const sideCategories = ref([
    {
      id: 1,
      name: '美妝',
      icon: '💄',
      show: false,
      subs: [
        { id: 2, name: '香水' },
        { id: 3, name: '女香' },
        { id: 4, name: '男香' }
      ]
    },
    {
      id: 5,
      name: '3C',
      icon: '📱',
      show: false,
      subs: [
        { id: 6, name: '手機' },
        { id: 7, name: '筆電' },
        { id: 8, name: '耳機' }
      ]
    },
    {
      id: 9,
      name: '服飾',
      icon: '👗',
      show: false,
      subs: [
        { id: 10, name: '男裝' },
        { id: 11, name: '女裝' }
      ]
    },
    {
      id: 12,
      name: '生活用品',
      icon: '🧻',
      show: false,
      subs: [
        { id: 13, name: '廚房用品' },
        { id: 14, name: '居家清潔' },
        { id: 15, name: '收納用品' },
        { id: 16, name: '盥洗用品' }
      ]
    }
  ])
  
  
  const products = ref([])
  const categories = ref([])
  const brands = ref([])
  const selectedCategory = ref('')
  const selectedBrand = ref('')
  const searchKeyword = ref('')

  const wishlistedStatus = ref({});

  // 🔍 進入頁面時立即搜尋「手機」
  onMounted(() => {
    fetchByKeyword('手機')
  })
  async function fetchByKeyword(keyword) {
    try {
      const response = await axios.get('/api/user/products/search', {
        params: { keyword }
      });
      products.value = response.data;
      console.log('✅ 查到商品：', products.value)
    } catch (err) {
      console.error('❌ 查詢失敗：', err)
    }
  }

  const checkWishlistStatus = async (productId) => {
  if (!userStore.userId) {
    wishlistedStatus.value[productId] = false;
    return;
  }
  try {
    const response = await axios.post(`/api/user/subscribes/getSubscribeStatus`, {
      userId: userStore.userId,
      itemType: 'PRODUCT',
      itemId: productId
    });
    wishlistedStatus.value[productId] = response.data.data;
  } catch (error) {
    console.error('Error checking wishlist status for product ' + productId + ':', error);
    wishlistedStatus.value[productId] = false; // 發生錯誤預設未收藏
  }
};


  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/user/products', {
        params: {
          category: selectedCategory.value || null,
          brand: selectedBrand.value || null,
          search: searchKeyword.value || null
        }
      });

      // ⏺️ 確認實際發出什麼請求
      console.log("📦 發出請求 URL：", response.config.url);

      if (Array.isArray(response.data?.data)) {
        products.value = response.data.data;
      } else {
        console.error('⚠️ 回傳格式錯誤：', response.data);
        products.value = [];
      }
    } catch (error) {
      console.error('❌ 取得商品失敗：', error);
      products.value = [];
    }
  };
  
  const fetchCategories = async () => {
    const { data } = await axios.get('/api/user/categories')
    categories.value = data
  }

  const fetchBrands = async () => {
    try {
      const response = await axios.get('/api/user/brands', {
        params: {
          category: selectedCategory.value || null
        }
      });
      console.log("📦 發送 brands 查詢：", response.config.url);
      brands.value = response.data;
    } catch (error) {
      console.error('❌ 取得品牌失敗：', error);
      brands.value = [];
    }
  }
  
  const filterByCategory = (categoryId) => {
    selectedCategory.value = categoryId
    fetchProducts()
  }

  const searchProducts = () => {
    if (searchKeyword.value.trim()) {
      router.push({
        path: '/products',
        query: { keyword: searchKeyword.value.trim() }
      })
    }
  }
  
  const resetFilters = () => {
    selectedCategory.value = ''
    selectedBrand.value = ''
    searchKeyword.value = ''
    fetchProducts()
  }

  const addToCart = async (product) => {
    try {
      await cartStore.addToCart(product)
      Swal.fire({
        icon: 'success',
        title: '已加入購物車！',
        text: `${product.name} 已成功加入購物車！`,
        timer: 1500,
        showConfirmButton: false
      })
    } catch (error) {
      console.error('加入購物車失敗', error)
      Swal.fire({
        icon: 'error',
        title: '加入購物車失敗',
        text: '請稍後再試',
        timer: 1500,
        showConfirmButton: false
      })
    }
  }


  
  const toggleWishlist = async (item) => {
    if (!item) return;
    if (userStore.userId) {
      try {
        const response = await axios.post(`/api/user/subscribes/switch`, {
          userId: userStore.userId,
          itemId: item.id,
          itemType: 'PRODUCT'
        })
        if (response.data.success) {
          wishlistedStatus.value[item.id] = !wishlistedStatus.value[item.id];
      Swal.fire({
        icon: wishlistedStatus.value[item.id] ? 'success' : 'info',
        title: wishlistedStatus.value[item.id] ? '已加入收藏！' : '已取消收藏！',
        text: item.name,
        timer: 1200,
        showConfirmButton: false
      });
          fetchProducts();
        } else {
          Swal.fire({
            icon: 'error',
            title: '操作失敗',
            text: response.data.message || '無法更新收藏狀態',
          })
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: '操作失敗',
          text: error + '與伺服器通訊發生錯誤',
        })
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: '請先登入',
        text: '登入後才能使用收藏功能',
        confirmButtonText: '前往登入'
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/secure/login')
        }
      })
    }
  }

  const toggleSubCategory = (category) => {
    category.show = !category.show
  }
  onMounted(async () => {
    fetchCategories()
    fetchBrands()
    await fetchProducts()
    products.value.forEach(product => {
    checkWishlistStatus(product.id);
  });
  })
  </script>
  
  <style scoped>
  @import '@/assets/main.css';
  .top-banner-layout {
  display: flex;
  justify-content: center;         /* ✅ 讓整個三欄組置中 */
  align-items: flex-start;
  gap: 102px;                       /* ✅ 左中右間距 */
  max-width: 1200px;               /* ✅ 總寬度可調，控制三欄整體寬度 */
  margin: 0 auto;                  /* ✅ 置中 */
  padding: 0;                      /* ✅ 不多給 padding */
}

/* 左右側欄 */
.left-sidebar {
  width: 120px;                    /* ✅ 左右欄寬一致，對稱 */
  flex-shrink: 0;
  margin-left: 80px;
  margin-right: 80px; /* ✅ 左推 10px，更靠邊緣一點 */
}
.right-placeholder {
  width: 120px;                    /* ✅ 左右欄寬一致，對稱 */
  flex-shrink: 0;
  margin-left: -70px;
  margin-right: 80px;
}

/* 中間橫幅 */
.center-banner {
  flex: 1;                         /* ✅ 自動撐滿中間寬度 */
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.right-placeholder {
  width: 180px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.quick-actions {
  width: 100%;
  background-color: #fffaf0;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-item {
  font-size: 16px;
  font-weight: 500;
  color: #5c4328;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.action-item:hover {
  background-color: #f2e3d2;
}
.right-placeholder {
  width: 180px;
  flex-shrink: 0;
  position: sticky;
  top: 100px; /* ✅ 你可以調整這個值：離視窗頂端的距離 */
  z-index: 1;
}

.promo-image {
  transform: translateX(-30px);  /*向左移動 */
}

  </style>