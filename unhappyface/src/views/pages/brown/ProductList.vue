<template>
    <div>
      <!-- 導覽列 -->
      <Header :cartCount="cartCount" />
  
      <!-- Banner 輪播 -->
      <BannerSwiper :banners="banners" />
  
      <div class="layout">
        <!-- 側邊分類欄 -->
        <CategorySidebar
    :sideCategories="sideCategories"
    @filter-category="filterByCategory"
    @toggle-sub="toggleSubCategory"
  />
  
        <div class="main-content">
          <div class="container">
            <!-- 搜尋列 -->
            <ProductSearchBar
              :categories="categories"
              :brands="brands"
              v-model:selectedCategory="selectedCategory"
              v-model:selectedBrand="selectedBrand"
              v-model:searchKeyword="searchKeyword"
              @search="searchProducts"
              @reset="resetFilters"
              @categoryChanged="fetchBrands"
            />
  
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
  
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import axios from 'axios'
  import Swal from 'sweetalert2'
  
  import Header from '@/components/common/Header.vue'
  import Footer from '@/components/common/Footer.vue'
   /* import BannerSwiper from '@/components/common/BannerSwiper.vue' */
  import CategorySidebar from '@/components/common/CategorySidebar.vue'
  import ProductSearchBar from '@/components/product/ProductSearchBar.vue'
  import ProductCard from '@/components/product/ProductCard.vue'
  
  const banners = [
    '/images/banner1.jpg',
    '/images/banner2.jpg',
    '/images/banner3.jpg'
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
  

  const toggleSubCategory = (category) => {
    category.show = !category.show
  }
  onMounted(() => {
    fetchCategories()
    fetchBrands()
    fetchProducts()
  })
  </script>
  
  <style scoped>
  @import '@/assets/main.css';
  </style>