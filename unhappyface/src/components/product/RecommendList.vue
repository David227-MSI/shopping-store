<!-- RecommendList.vue -->
<template>
    <div class="recommend-section" style="margin-top: 40px;">
      <h2>🎁 推薦商品</h2>
      <div class="product-list" style="display: flex; gap: 20px;">
        <ProductCard
  v-for="item in products"
  :key="item.id"
  :product="item"
  @add-to-cart="$emit('add-to-cart', $event)"
  @toggle-wishlist="$emit('toggle-wishlist', $event)"
/>
      </div>
    </div>
  </template>
  
 <!-- RecommendList.vue -->
<script setup>
import ProductCard from '@/components/product/ProductCard.vue'
defineProps({ products: Array }) // ← 改名成 products
defineEmits(['add-to-cart', 'toggle-wishlist'])
</script>
  