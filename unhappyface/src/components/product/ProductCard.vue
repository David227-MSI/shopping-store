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
  if (name === '夏日晨露淡香水') return '/images/grass.png'
  if (name === '雲彩男款輕薄外套') return '/images/jacket_men.jpg'
  if (name === '雲彩女款休閒洋裝') return '/images/dress_women.jpg'
  if (name === 'StarPhone X9') return '/images/phone2.png'
  if (name === '竹風防滑拖鞋組') return '/images/slippers.jpg'
  if (name === '極光連帽機能外套') return '/images/jacket_aurora.jpg'
  if (name === 'Threelight Edge S5') return '/images/phone3.png'
  if (name === '木田可堆疊收納箱') return '/images/storage_box.jpg'
  if (name === '木田天然洗碗精') return '/images/dish_soap.jpg'
  if (name === '映月氣質長裙') return '/images/skirt.png'
  if (name === '聆香月光花語香水') return '/images/moon.png'
  if (name === 'QF-Smart X Ultra') return '/images/phone4.png'
  return 'https://via.placeholder.com/300x180?text=No+Image'
}

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