<template>
    <div class="container">
      <h1>我的追蹤清單</h1>
  
      <!-- 搜尋列 -->
      <div class="search-bar">
        <div class="filter-left">
          <div>
            <label>分類：</label>
            <select v-model="filters.category" class="filter-select">
              <option value="">全部</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
          </div>
          <div>
            <label>品牌：</label>
            <select v-model="filters.brand" class="filter-select">
              <option value="">全部</option>
              <option v-for="b in brands" :key="b.id" :value="b.id">
                {{ b.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="filter-right">
          <input
            type="text"
            v-model="filters.search"
            placeholder="商品名稱或關鍵字"
            class="search-input"
          />
          <button class="search-button" @click="fetchSubscriptions">搜尋</button>
          <button class="reset-button" @click="resetFilters">清除</button>
        </div>
      </div>
  
      <!-- 商品列表 -->
      <div v-if="products.length === 0 && brands.length === 0" class="empty-state">
        <p>暫無追蹤的商品或品牌</p>
      </div>
      <div v-else>
        <h2 class="section-title">追蹤的商品</h2>
        <div v-if="products.length === 0" class="empty-state">
          <p>暫無追蹤的商品</p>
        </div>
        <div class="product-list">
          <SubscribeProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
            @remove-subscription="removeProductSubscription"
            @add-to-cart="addToCart"
          />
        </div>
  
        <!-- 品牌列表 -->
        <h2 class="section-title">追蹤的品牌</h2>
        <div v-if="brands.length === 0" class="empty-state">
          <p>暫無追蹤的品牌</p>
        </div>
        <div class="brand-list">
          <div
            v-for="brand in brands"
            :key="brand.id"
            class="brand-card"
          >
            <div class="brand-info">
              <h3>{{ brand.name }}</h3>
              <button
                class="action-button"
                @click="removeBrandSubscription(brand.id)"
              >
                取消追蹤
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue'
  import axios from 'axios'
  import Swal from 'sweetalert2'
  import SubscribeProductCard from '@/components/ttpp/SubscribeProductCard.vue'
  
  const filters = ref({
    userId: 1001,
    category: '',
    brand: '',
    search: ''
  })
  
  const products = ref([])
  const brands = ref([])
  const categories = ref([])
  
  const fetchSubscriptions = async () => {
    try {
      // 查詢追蹤的商品
      const productRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/user/subscriptions/products`,
        filters.value
      )
      products.value = productRes.data.data.productList || []
  
      // 查詢追蹤的品牌
      const brandRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/subscriptions/brands`,
        filters.value
      )
      brands.value = brandRes.data.data.brandList || []
    } catch (err) {
      Swal.fire('查詢失敗', err.response?.data?.message || '錯誤', 'error')
    }
  }
  
  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories`)
      categories.value = data
    } catch (err) {
      Swal.fire('分類載入失敗', err.response?.data?.message || '錯誤', 'error')
    }
  }
  
  const resetFilters = () => {
    filters.value.category = ''
    filters.value.brand = ''
    filters.value.search = ''
    fetchSubscriptions()
  }
  
  const removeProductSubscription = async (productId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/subscriptions/products/${productId}`, {
        data: { userId: filters.value.userId }
      })
      products.value = products.value.filter(p => p.id !== productId)
      Swal.fire({
        icon: 'success',
        title: '已取消追蹤',
        text: '商品已從追蹤清單移除！',
        timer: 1500,
        showConfirmButton: false
      })
    } catch (err) {
      Swal.fire('操作失敗', err.response?.data?.message || '錯誤', 'error')
    }
  }
  
  const removeBrandSubscription = async (brandId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/subscriptions/brands/${brandId}`, {
        data: { userId: filters.value.userId }
      })
      brands.value = brands.value.filter(b => b.id !== brandId)
      Swal.fire({
        icon: 'success',
        title: '已取消追蹤',
        text: '品牌已從追蹤清單移除！',
        timer: 1500,
        showConfirmButton: false
      })
    } catch (err) {
      Swal.fire('操作失敗', err.response?.data?.message || '錯誤', 'error')
    }
  }
  
  const addToCart = async (product) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/cart`, {
        userId: filters.value.userId,
        productId: product.id,
        quantity: 1
      })
      Swal.fire({
        icon: 'success',
        title: '已加入購物車！',
        text: `${product.name} 已成功加入購物車！`,
        timer: 1500,
        showConfirmButton: false
      })
    } catch (err) {
      Swal.fire('操作失敗', err.response?.data?.message || '錯誤', 'error')
    }
  }
  
  const getProductImage = (name) => {
    if (name === '香水 A') return '/images/perfumeA.jpg'
    if (name === '香水 B') return '/images/perfumeB.jpg'
    if (name === 'MyPhone  Asc 15 Pro Max') return '/images/phone1.png'
    if (name === '黑色棉T') return '/images/black_T.png'
    return 'https://via.placeholder.com/300x180?text=No+Image'
  }
  
  // 監聽篩選條件變化
  watch(filters, fetchSubscriptions, { deep: true })
  
  // 初始化
  onMounted(() => {
    fetchCategories()
    fetchSubscriptions()
  })
  </script>
  
  <style scoped>
  .container {
    animation: float-in 0.5s ease-out;
  }
  
  .search-bar {
    background: #fffaf4;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  .filter-left label,
  .filter-right label {
    font-size: 0.9rem;
    color: var(--text-dark);
    margin-bottom: 5px;
    display: block;
  }
  
  .search-input,
  .filter-select {
    transition: border-color 0.3s;
  }
  
  .search-input:focus,
  .filter-select:focus {
    border-color: var(--accent);
    outline: none;
  }
  
  .section-title {
    font-size: 1.5rem;
    color: var(--primary);
    margin: 20px 0 10px;
  }
  
  .empty-state {
    text-align: center;
    padding: 20px;
    background: #fffaf4;
    border-radius: 12px;
    margin-top: 20px;
  }
  
  .empty-state p {
    font-size: 1.2rem;
    color: var(--text-dark);
  }
  
  .product-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }
  
  .brand-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }
  
  .brand-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.05);
    padding: 15px;
    transition: transform 0.2s;
  }
  
  .brand-card:hover {
    transform: translateY(-5px);
  }
  
  .brand-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .brand-info h3 {
    font-size: 1.2rem;
    color: var(--primary);
    margin: 0;
  }
  
  @media (max-width: 768px) {
    .search-bar {
      flex-direction: column;
      align-items: stretch;
    }
  
    .filter-left,
    .filter-right {
      flex-direction: column;
      gap: 10px;
    }
  
    .product-list,
    .brand-list {
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    }
  }
  </style>