<template>
    <div>
      <!-- 頂部導覽列 -->
      <div class="topbar">
        <a href="/">🏠 回首頁</a>
        <a href="#">📱 App下載</a>
        <a href="#">💎 點點購</a>
        <a href="#">📚 書店</a>
        <a href="#">🔑 登入</a>
        <a href="#">🆕 註冊</a>
        <a href="#">👤 會員中心</a>
        <a href="#">📦 查訂單</a>
        <a href="#">⭐️ 追蹤清單</a>
        <a href="#">🎫 折價券</a>
        <a href="#">🛒 購物車(<span>{{ cartCount }}</span>)</a>
      </div>
  
      <!-- Banner 輪播 -->
      <div class="swiper mySwiper">
        <div class="swiper-wrapper">
          <div class="swiper-slide" v-for="(banner, index) in banners" :key="index">
            <img :src="banner" alt="banner圖片">
          </div>
        </div>
        <div class="swiper-pagination"></div>
      </div>
  
      <div class="layout">
        <!-- 左側分類選單 -->
        <div class="category-sidebar">
          <h3>分類快速選單</h3>
          <ul>
            <li v-for="category in sideCategories" :key="category.id">
              <button class="toggle-btn" @click="toggleSub(category)">
                {{ category.icon }} {{ category.name }}
              </button>
              <ul v-show="category.show" class="sub-category">
                <li v-for="sub in category.subs" :key="sub.id">
                  <a @click.prevent="filterByCategory(sub.id)">{{ sub.name }}</a>
                </li>
              </ul>
            </li>
        
          </ul>
        </div>
  
        <!-- 商品主內容 -->
        <div class="main-content">
          <div class="container">
            <h1></h1>
  
            <!-- 搜尋列 -->
            <div class="search-bar">
              <div class="filter-left">
                <div>
                  <label>分類：</label>
                  <select v-model="selectedCategory" @change="fetchBrands">
                    <option value="">全部</option>
                    <option v-for="c in categories" :key="c.id" :value="c.id">
                      {{ c.name }}
                    </option>
                  </select>
                </div>
                <div>
                  <label>品牌：</label>
                  <select v-model="selectedBrand">
                    <option value="">全部</option>
                    <option v-for="b in brands" :key="b.id" :value="b.id">
                      {{ b.name }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="filter-right">
                <input type="text" v-model="searchKeyword" placeholder="商品名稱或關鍵字">
                <button class="search-button" @click="searchProducts">搜尋</button>
                <button class="reset-button" @click="resetFilters">清除</button>
              </div>
            </div>
  
            <!-- 商品列表 -->
            <div class="product-list">
              <div class="product" v-for="product in products" :key="product.id">
                <div>
                  <img :src="getProductImage(product.name)" alt="商品圖片">
                </div>
                <div class="info">
  <h2>{{ product.name }}</h2>
  <p>{{ product.category.name }} / {{ product.brand.name }}</p>
  <span class="price-tag">{{ product.unitPrice }} 元</span><br>

  <a class="action-button" :href="`/products/${product.id}`">🔍 商品詳情</a><br>
  <a class="action-button add-to-cart" href="#" @click.prevent="addToCart(product)">🛒 加入購物車</a><br>

  <!-- 🔥 加入收藏按鈕 -->
  <a class="action-button wishlist-button" href="#" @click.prevent="toggleWishlist(product)">
  <span :class="{ 'wishlisted': product.isWishlisted }">
    {{ product.isWishlisted ? '❤️ 已收藏' : '🤍 加入收藏' }}
  </span>
</a>
</div>

              </div>
            </div>
            
          </div>
        </div>
      </div>
  
      <!-- Footer -->
      <footer class="site-footer">
        <div class="footer-links">
          <a href="#">關於我們</a> |
          <a href="#">客服中心</a> |
          <a href="#">隱私權政策</a> |
          <a href="#">常見問題</a>
        </div>
        <div class="footer-social">
          <a href="#"><img src="/images/facebook.png" alt="Facebook"></a>
          <a href="#"><img src="/images/instagram.png" alt="Instagram"></a>
          <a href="#"><img src="/images/line.png" alt="LINE"></a>
        </div>
        <p class="footer-copy">© 2025 專題商城 All Rights Reserved.</p>
      </footer>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import axios from 'axios'
  import Swal from 'sweetalert2'
  import 'swiper/css'
  import Swiper from 'swiper'
  
  const banners = [
    '/images/banner1.jpg',
    '/images/banner2.jpg',
    '/images/banner3.jpg'
  ]
  
  const sideCategories = ref([
    { id: 1, name: '美妝', icon: '💄', show: false, subs: [
      { id: 2, name: '香水' }, { id: 3, name: '女香' }, { id: 4, name: '男香' }
    ]},
    { id: 2, name: '3C', icon: '📱', show: false, subs: [
      { id: 6, name: '手機' }, { id: 7, name: '筆電' }, { id: 8, name: '耳機' }
    ]},
    { id: 3, name: '服飾', icon: '👗', show: false, subs: [
      { id: 10, name: '男裝' }, { id: 11, name: '女裝' }
    ]}
  ])
  
  const products = ref([])
  const categories = ref([])
  const brands = ref([])
  const selectedCategory = ref('')
  const selectedBrand = ref('')
  const searchKeyword = ref('')
  const cartCount = ref(0)
  
  const fetchProducts = async () => {
    const { data } = await axios.get('/api/products', {
      params: {
        category: selectedCategory.value,
        brand: selectedBrand.value,
        search: searchKeyword.value
      }
    })
    products.value = data
  }
  
  const fetchCategories = async () => {
    const { data } = await axios.get('/api/categories')
    categories.value = data
  }
  
  const fetchBrands = async () => {
    const { data } = await axios.get('/api/brands', {
      params: { category: selectedCategory.value }
    })
    brands.value = data
  }
  
  const toggleSub = (category) => {
    category.show = !category.show
  }
  
  const filterByCategory = (categoryId) => {
    selectedCategory.value = categoryId
    fetchProducts()
  }
  
  const searchProducts = () => {
    fetchProducts()
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
  product.isWishlisted = !product.isWishlisted;

  // 小動畫：愛心抖一下
  const wishlistButton = document.querySelector('.wishlist-button span');
  if (wishlistButton) {
    wishlistButton.classList.remove('animate-bounce');
    void wishlistButton.offsetWidth; // 觸發 reflow 重新套用動畫
    wishlistButton.classList.add('animate-bounce');
  }

  Swal.fire({
    icon: product.isWishlisted ? 'success' : 'info',
    title: product.isWishlisted ? '已加入收藏！' : '已取消收藏！',
    text: product.name,
    timer: 1200,
    showConfirmButton: false
  })
};

  const getProductImage = (name) => {
    if (name === '香水 A') return '/images/perfumeA.jpg'
    if (name === '香水 B') return '/images/perfumeB.jpg'
    if (name === 'MyPhone 15 Pro Max') return '/images/phone1.png'
    if (name === '黑色棉T') return '/images/black_T.png'
    return 'https://via.placeholder.com/300x180?text=No+Image'
  }
  
  onMounted(() => {
    fetchCategories()
    fetchBrands()
    fetchProducts()
    new Swiper(".mySwiper", {
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true
      }
    })
  })
  </script>
  
  <style scoped>
  @import "@/assets/styles.css"; /* 假設 styles.css 有放到 src/assets 裡面 */
  </style>
  