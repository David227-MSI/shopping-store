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
            <label>追蹤類型：</label>
            <select v-model="filters.itemType" class="filter-select">
              <option value="">全部</option>
              <option v-for="type in itemTypeOptions" :key="type.id" :value="type.id">
                {{ type.name }}
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
  itemType: '',
  category: '',
  search: ''
})

const products = ref([])
const brands = ref([])
const categories = ref([])
const itemTypeOptions = ref([
  { id: 'PRODUCT', name: '商品' },
  { id: 'BRAND', name: '品牌' }
])

const fetchSubscriptions = async () => {
  try {
    const queryParams = {
      userId: filters.value.userId, // 確保後端能正確識別用戶
      itemType: filters.value.itemType,
      categoryId: filters.value.category || null, // 送出 null 而非空字串給後端
      keyword: filters.value.search || null // 送出 null 而非空字串給後端
    }

    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/user/subscribes/query`,
      queryParams
    )

    if (res.data.success) {
      products.value = res.data.data.products || []
      brands.value = res.data.data.brands || [] // 假設後端會回傳 brands 陣列
    } else {
      Swal.fire('查詢追蹤清單失敗', res.data.message || '錯誤', 'error')
      products.value = []
      brands.value = []
    }
  } catch (err) {
    Swal.fire('查詢追蹤清單發生錯誤', err.response?.data?.message || '網路錯誤', 'error')
    products.value = []
    brands.value = []
  }
}

const fetchCategories = async () => {
  try {
    const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/subscribes/categories`)
    categories.value = data
  } catch (err) {
    Swal.fire('分類載入失敗', err.response?.data?.message || '錯誤', 'error')
  }
}

const resetFilters = () => {
  filters.value.category = ''
  filters.value.itemType = ''
  filters.value.search = ''
  fetchSubscriptions()
}

const removeProductSubscription = (productId) => {
  // 呼叫後端 API 移除商品追蹤
  console.log('移除商品追蹤:', productId)
  // ... 你的移除邏輯
}

const removeBrandSubscription = (brandId) => {
  // 呼叫後端 API 移除品牌追蹤
  console.log('移除品牌追蹤:', brandId)
  // ... 你的移除邏輯
}

const addToCart = (product) => {
  // 加入購物車邏輯
  console.log('加入購物車:', product)
  // ... 你的加入購物車邏輯
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