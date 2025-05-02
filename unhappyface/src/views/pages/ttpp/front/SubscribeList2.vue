<template>
  <div class="container">
    <h1>我的追蹤清單</h1>

    <div class="search-bar">
      <div class="filter-left">
        <div>
          <label>商品分類：</label>
          <select v-model="filters.categoryId" class="filter-select">
            <option value="">全部</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">
              {{ c.name }}
            </option>
          </select>
        </div>
      </div>
      <div class="filter-right">
        <input
          type="text"
          v-model="filters.keyword"
          placeholder="搜尋商品或品牌名稱"
          class="search-input"
        />
        <button class="search-button" @click="fetchSubscriptions">搜尋</button>
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
        @remove-subscription="removeProductSubscription"
        @add-to-cart="addToCart"
      />
    </div>

    <!-- <h2 class="section-title">追蹤的品牌</h2>
    <div v-if="followedBrands.length === 0" class="empty-state">
      <p>暫無追蹤的品牌</p>
    </div>
    <div class="brand-list">
      <div
        v-for="brand in followedBrands"
        :key="brand.id"
        class="brand-card"
      >
        <div class="brand-info">
          <img :src="brand.imageUrl" :alt="brand.name" class="brand-image">
          <h3><a :href="brand.linkUrl" target="_blank">{{ brand.name }}</a></h3>
          <button
            class="action-button"
            @click="removeBrandSubscription(brand.id)"
          >
            取消追蹤
          </button>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import SubscribeProductCard from '@/components/ttpp/SubscribeProductCard.vue'

const filters = ref({
  userId: 1001, // 這裡應該從你的用戶驗證/狀態管理中獲取
  categoryId: '', // 對應後端 DTO 的 categoryId
  keyword: null // 對應後端 DTO 的 keyword
})

const followedProducts = ref([])
const followedBrands = ref([])
const categories = ref([])

const fetchSubscriptions = async () => {
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/user/subscribes/query`,
      filters.value // 直接將 filters 物件作為請求體發送
    )

    if (res.data.success) {
      followedProducts.value = res.data.data.products || []
      followedBrands.value = res.data.data.brands || []
    } else {
      Swal.fire('查詢追蹤清單失敗', res.data.message || '錯誤', 'error')
      followedProducts.value = []
      followedBrands.value = []
    }
  } catch (err) {
    Swal.fire('查詢追蹤清單發生錯誤', err.response?.data?.message || '網路錯誤', 'error')
    followedProducts.value = []
    followedBrands.value = []
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
  filters.value.categoryId = null
  filters.value.keyword = null
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

// 監聽商品分類和搜尋關鍵字變化，自動重新載入追蹤清單
watch([() => filters.value.categoryId, () => filters.value.keyword], fetchSubscriptions)

// 初始化
onMounted(() => {
  fetchCategories()
  fetchSubscriptions()
})
</script>

<style scoped>
/* ... (之前的樣式保持不變) */
</style>

<style scoped>
.container {
  padding: 20px;
}

.search-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-left,
.filter-right {
  display: flex;
  gap: 15px;
  align-items: center;
}

.filter-select,
.search-input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.search-button,
.reset-button,
.action-button {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.search-button {
  background-color: #007bff;
  color: white;
}

.reset-button {
  background-color: #6c757d;
  color: white;
}

.action-button {
  background-color: #dc3545;
  color: white;
  margin-left: 10px;
}

.section-title {
  margin-top: 30px;
  margin-bottom: 15px;
}

.empty-state {
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  text-align: center;
  color: #777;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.brand-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.brand-card {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-image {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.brand-info h3 {
  margin: 0 0 5px 0;
}

.brand-info a {
  text-decoration: none;
  color: #333;
}
</style>