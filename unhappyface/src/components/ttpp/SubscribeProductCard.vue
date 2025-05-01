<template>
    <div class="product">
      <img :src="getImage(product.name)" :alt="product.name" />
      <div class="info">
        <h2>{{ product.name || '無名稱' }}</h2>
        <p>{{ product.category?.name || '未知分類' }} / {{ product.brand?.name || '未知品牌' }}</p>
        <span class="price-tag">{{ product.unitPrice ? `${product.unitPrice} 元` : '價格未定' }}</span>
        <div class="button-group">
          <a
            class="action-button"
            :href="`/products/${product.id}`"
          >
            🔍 商品詳情
          </a>
          <a
            class="action-button add-to-cart"
            href="#"
            @click.prevent="$emit('add-to-cart', product)"
          >
            🛒 加入購物車
          </a>
          <a
            class="action-button"
            href="#"
            @click.prevent="$emit('remove-subscription', product.id)"
          >
            取消追蹤
          </a>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps(['product'])
  defineEmits(['remove-subscription', 'add-to-cart'])
  
  const getImage = (name) => {
    if (name === '香水 A') return '/images/perfumeA.jpg'
    if (name === '香水 B') return '/images/perfumeB.jpg'
    if (name === 'MyPhone 15 Pro Max') return '/images/phone1.png'
    if (name === '黑色棉T') return '/images/black_T.png'
    return 'https://via.placeholder.com/300x180?text=No+Image'
  }
  </script>
  
  <style scoped>
  .product {
    animation: float-in 0.5s ease-out;
  }
  
  .info {
    padding: 10px;
  }
  
  .button-group {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
  }
  </style>