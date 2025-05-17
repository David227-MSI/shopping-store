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
    if (name === 'Bvantgardey') return 'https://unhappyproductmedia.blob.core.windows.net/product-media/test/product/perfumeA.jpg'
    if (name === 'Whitepink') return 'https://unhappyproductmedia.blob.core.windows.net/product-media/test/product/perfumeB.jpg'
    if (name === 'MyPhone 15 Pro Max') return 'https://unhappyproductmedia.blob.core.windows.net/product-media/test/product/phone1.png'
    if (name === '黑色棉T') return 'https://unhappyproductmedia.blob.core.windows.net/product-media/test/product/black_T.png'
    if (name === '夏日晨露淡香水') return 'https://unhappyproductmedia.blob.core.windows.net/product-media/test/product/grass.png'
    if (name === '雲彩男款輕薄外套') return 'https://unhappyproductmedia.blob.core.windows.net/product-media/test/product/jacket_men.jpg'
    if (name === '雲彩女款休閒洋裝') return 'https://unhappyproductmedia.blob.core.windows.net/product-media/test/product/dress_women.jpg'
    if (name === 'StarPhone X9') return 'https://unhappyproductmedia.blob.core.windows.net/product-media/test/product/phone2.png'
    if (name === '竹風防滑拖鞋組') return 'https://unhappyproductmedia.blob.core.windows.net/product-media/test/product/slippers.jpg'
    if (name === '極光連帽機能外套') return 'https://unhappyproductmedia.blob.core.windows.net/product-media/test/product/jacket_aurora.jpg'
    if (name === 'Threelight Edge S5') return 'https://unhappyproductmedia.blob.core.windows.net/product-media/test/product/phone3.png'
    if (name === '木田可堆疊收納箱') return 'https://unhappyproductmedia.blob.core.windows.net/product-media/test/product/storage_box.jpg'
    if (name === '木田天然洗碗精') return 'https://unhappyproductmedia.blob.core.windows.net/product-media/test/product/dish_soap.jpg'
    if (name === '映月氣質長裙') return 'https://unhappyproductmedia.blob.core.windows.net/product-media/test/product/skirt.png'
    if (name === '聆香月光花語香水') return 'https://unhappyproductmedia.blob.core.windows.net/product-media/test/product/moon.png'
    if (name === 'QF-Smart X Ultra') return 'https://unhappyproductmedia.blob.core.windows.net/product-media/test/product/phone4.png'
    return 'https://unhappyproductmedia.blob.core.windows.net/product-media/test/product/product_coming_soon.jpg'
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