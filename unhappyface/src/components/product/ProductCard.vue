<template>
    <div class="product">
      <img :src="product.mainImageUrl || defaultImageUrl" :alt="product.name + '圖片'">
      <h3>{{ product.name }}</h3>
      <p class="price">{{ product.unitPrice }} 元</p>
      
      <!-- 查看、加入購物車、收藏 三個按鈕統一樣式 -->
      <div style="margin-top: 8px;">
        <a class="action-button" :href="`/products/${product.id}`">🔍 查看</a>
        <a class="action-button" @click="$emit('add-to-cart', product, $event)">🛒</a>
        <a href="#" 
        class="action-button" 
        @click.prevent="$emit('toggle-wishlist', product)">
          <span v-if="isWishlisted">❤️</span>
          <span v-else>🤍</span>
        </a>
      </div>
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    product: Object,
    isWishlisted: Boolean
  })
  
const defaultImageUrl = 'https://unhappyproductmedia.blob.core.windows.net/product-media/test/product/product_coming_soon.jpg';


  </script>
  <style scoped>
.product {
  text-align: center;
}

.product img {
  width: 100%;
  max-width: 165px;
  height: auto;
  border-radius: 16px; /* ✅ 圓角化圖片 */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* ✅ 加些柔光陰影 */
  transition: transform 0.2s ease-in-out;
}

.product img:hover {
  transform: scale(1.03); /* ✅ 滑過放大一點點 */
}
  </style>