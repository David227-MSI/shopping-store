<template>
    <div v-if="product">
      <p><strong>分類：</strong>{{ product.categoryName || '未分類' }}</p>
      <p><strong>品牌：</strong>{{ product.brandName || '未設定' }}</p>
      <p><strong>價格：</strong><span class="price-tag">{{ product.unitPrice }} 元</span></p>
      <p><strong>描述：</strong></p>
      <p>{{ product.description || '暫無商品描述。' }}</p>
  
      <div class="quantity-selector">
        <button @click="$emit('decrease')">➖</button>
        <input type="text" :value="quantity" readonly>
        <button @click="$emit('increase')">➕</button>
      </div>
  
      <div class="button-group">
        <a href="#" class="action-button add-to-cart" @click="$emit('addToCart', $event)">
  🛒 加入購物車
</a>
        <a href="/" class="action-button">🔙 返回商品列表</a>
        <a href="#" class="action-button" @click.prevent="$emit('toggle-wishlist')">
          <span v-if="isWishlisted">❤️ 已收藏</span>
          <span v-else>🤍 加入收藏</span>
        </a>
      </div>
    </div>
    <div v-else>
      <p>🔄 商品載入中...</p>
    </div>
  </template>
  
  <script setup>
  defineProps({
    product: Object,
    quantity: Number,
    isWishlisted: Boolean
  })
  
  defineEmits(['increase', 'decrease', 'add-to-cart', 'toggle-wishlist'])
  </script>
  