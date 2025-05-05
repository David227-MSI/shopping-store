<template>
    <div class="product">
      <img :src="getProductImage(product.name)" alt="商品圖片">
      <h3>{{ product.name }}</h3>
      <p class="price">{{ product.unitPrice }} 元</p>
      
      <!-- 查看、加入購物車、收藏 三個按鈕統一樣式 -->
      <div style="margin-top: 8px;">
        <a class="action-button" :href="`/products/${product.id}`">🔍 查看</a>
        <a class="action-button" @click="$emit('add-to-cart', product, $event)">🛒</a>
        <a href="#" class="action-button" @click.prevent="$emit('toggle-wishlist', product)">
          <span v-if="product.isWishlisted">❤️</span>
          <span v-else>🤍</span>
        </a>
      </div>
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    product: Object
  })
  
  const getProductImage = (name) => {
    if (name === '香水 A') return '/images/perfumeA.jpg'
    if (name === '香水 B') return '/images/perfumeB.jpg'
    if (name === 'MyPhone 15 Pro Max') return '/images/phone1.png'
    if (name === '黑色棉T') return '/images/black_T.png'
    return 'https://via.placeholder.com/300x180?text=No+Image'
  }
  </script>
  <style scoped>
  .product {
    text-align: center; /* ✅ 讓所有文字、按鈕置中 */
  }
  </style>