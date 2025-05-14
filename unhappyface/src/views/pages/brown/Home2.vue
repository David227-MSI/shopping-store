<template>
  
    <div>
      <!-- 導覽列 -->
      <Header :cartCount="cartCount" />

<!-- 🔍 搜尋列整體包裝 -->
<div class="search-bar keyword-with-logo">
  <!-- 左側 LOGO -->
  <img src="https://unhappyproductmedia.blob.core.windows.net/product-media/test/Web/logo1.png" alt="LOGO" class="search-logo" style="margin-right: 50px;" />

<!-- 中間搜尋欄區塊 -->
<div style="flex: 1; display: flex; justify-content: center;">
  <div style="display: flex; flex-direction: column; width: 100%; max-width: 600px;">
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
      <a href="/products/1">月亮香水</a> /
      <a href="/products/2">竹風拖鞋</a> /
      <a href="/products/3">奧創手機</a> /
      <a href="/products/4">雲彩洋裝</a> 
    </div>
  </div>
</div>


  <!-- 右側活動圖 -->
  <div class="promo-image" style="margin-left: 20px;">
    <img src="https://unhappyproductmedia.blob.core.windows.net/product-media/test/Web/promo.gif" alt="活動檔期" />
  </div>
</div>
</div>
<div class="top-banner-layout">
  <!-- 左側：分類選單 -->
  
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
                @add-to-cart="addToCart"
                @toggle-wishlist="toggleWishlist"
              />
            </div>
          </div>
        </div>
      </div>
  </template>
  
  <script setup>
 import { ref, onMounted, watch } from 'vue'
 import { useRoute, useRouter } from 'vue-router'
  import axios from 'axios'
  import Swal from 'sweetalert2'
  import Header from '@/components/common/Header.vue'
  import Footer from '@/components/common/Footer.vue'
  import CategorySidebar from '@/components/common/CategorySidebar.vue'
  import ProductSearchBar from '@/components/product/ProductSearchBar.vue'
  import ProductCard from '@/components/product/ProductCard.vue'
  import BannerSwiper from '@/components/common/BannerSwiper.vue'
 const route = useRoute()
const router = useRouter()
   
// ✅ 🔁 監聽網址列 ?keyword=xxx，自動搜尋
watch(
  () => route.query.keyword,
  (newKeyword) => {
    if (newKeyword) {
      fetchByKeyword(newKeyword)
    }
  },
  { immediate: true }
)
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
  const cartCount = ref(0)
  
// ✅ 正確方式：一進入就根據網址 keyword 查詢
watch(
  () => route.query.keyword,
  (newKeyword) => {
    if (newKeyword) {
      searchKeyword.value = newKeyword
      fetchByKeyword(newKeyword)
    }
  },
  { immediate: true }
)

async function fetchByKeyword(keyword) {
  try {
    const response = await axios.get('/api/products/search', {
      params: { keyword }
    });
    products.value = response.data;
    console.log('✅ 查到商品：', products.value)
  } catch (err) {
    console.error('❌ 查詢失敗：', err)
  }
}
const fetchProducts = async () => {
  try {
    const response = await axios.get('/api/products', {
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
    const { data } = await axios.get('/api/categories')
    categories.value = data
  }
  
const fetchBrands = async () => {
  try {
    const response = await axios.get('/api/brands', {
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
  
  const addToCart = (product) => {
    cartCount.value++
    Swal.fire({
      icon: 'success',
      title: '已加入購物車！',
      text: `${product.name} 已成功加入購物車！`,
      timer: 1500,
      showConfirmButton: false
    })
  }
  
  const toggleWishlist = (product) => {
    product.isWishlisted = !product.isWishlisted
    Swal.fire({
      icon: product.isWishlisted ? 'success' : 'info',
      title: product.isWishlisted ? '已加入收藏！' : '已取消收藏！',
      text: product.name,
      timer: 1200,
      showConfirmButton: false
    })
  }
  const toggleSubCategory = (category) => {
    category.show = !category.show
  }
  onMounted(() => {
    fetchCategories()
    fetchBrands()
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
  margin-right: 1300px; /* ✅ 左推 10px，更靠邊緣一點 */
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
  justify-content: center;
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
.search-logo {
  transform: translateX(100px); /* 向右移動 */
}

.promo-image {
  transform: translateX(-100px); /* 向左移動 */
}

  </style>