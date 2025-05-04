<template>
  <div>
    <div class="layout">
      <div class="category-sidebar">
        <h3>分類快速選單</h3>
        <a href="/">🏠 回首頁</a>
      </div>

      <div class="main-content">
        <div class="container" v-if="product">
          <h1>{{ product?.name || '商品名稱' }}</h1>

          <div class="product-detail">
            <!-- 🔥 放大鏡圖片 -->
            <div 
              class="zoom-container"
              @mousemove="moveLens"
              @mouseenter="showLens = true"
              @mouseleave="showLens = false"
              ref="zoomContainer"
            >
              <img :src="productImage" alt="商品圖片" ref="productImageRef" class="zoom-image">
              <div v-show="showLens" class="lens" :style="lensStyle"></div>
            </div>

            <div class="detail-info">
              <p><strong>分類：</strong>{{ product?.categoryName || '未分類' }}</p>
              <p><strong>品牌：</strong>{{ product?.brandName || '未設定' }}</p>
              <p><strong>價格：</strong><span class="price-tag">{{ product?.unitPrice ?? '-' }} 元</span></p>
              <p><strong>描述：</strong></p>
              <p>{{ product?.description || '暫無商品描述。' }}</p>
<!-- 🔥 購買數量選擇器 -->
<div class="quantity-selector">
  <button @click="decreaseQuantity">➖</button>
  <input type="text" v-model="quantity" readonly>
  <button @click="increaseQuantity">➕</button>
</div><div class="button-group">
  <!-- 三個按鈕 --><a href="#" class="action-button add-to-cart" @click.prevent="addToCart">🛒 加入購物車</a>
              <a href="/" class="action-button">🔙 返回商品列表</a>
              <a href="#" class="action-button" @click.prevent="toggleWishlist">
  <span v-if="isWishlisted">❤️ 已收藏</span>
  <span v-else>🤍 加入收藏</span>
</a>

</div>
              
            </div>
          </div>

          <!-- 使用者評論 -->
          <div class="review-section">
            <h2>💬 使用者評論</h2>
            <ReviewList :product-id="product.id" />
          </div>

          <!-- 推薦商品 -->
          <div class="recommend-section" style="margin-top: 40px;">
            <h2>🎁 推薦商品</h2>
            <div class="product-list" style="display: flex; gap: 20px;">
              <div class="product" v-for="recommend in recommended" :key="recommend.id" style="width: 30%;">
                <img :src="getProductImage(recommend.name)" alt="推薦商品圖片" style="width: 100%; height: auto;">
                <h3>{{ recommend.name }}</h3>
                <p>{{ recommend.unitPrice }} 元</p>
                <a class="action-button" :href="`/products/${recommend.id}`">🔍 查看</a>
              </div>
            </div>
          </div>
        </div>

        <div v-else>
          <p>⚠️ 商品資料讀取失敗，請返回首頁。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ReviewList from '@/components/ra/review/ReviewList.vue'
import axios from 'axios'
import Swal from 'sweetalert2'

// 基本資料
const route = useRoute();
const router = useRouter();

const product = ref({ id: parseInt(route.params.id) });
const reviews = ref([]);
const recommended = ref([]);
const cartCount = ref(0);
const showBackToTop = ref(false);
// 購買數量功能
const quantity = ref(1);

const increaseQuantity = () => {
  quantity.value++;
  triggerQuantityShake();
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
    triggerQuantityShake();
  }
};
const triggerQuantityShake = () => {
  const input = document.querySelector('.quantity-selector input');
  if (input) {
    input.classList.remove('shake');
    void input.offsetWidth; // 重新觸發動畫
    input.classList.add('shake');
  }
};
// ❤️ 收藏功能
const isWishlisted = ref(false);

const toggleWishlist = () => {
  isWishlisted.value = !isWishlisted.value;
};
// 放大鏡功能
const showLens = ref(false);
const lensX = ref(0);
const lensY = ref(0);
const zoomFactor = 2.25;

const zoomContainer = ref(null);
const productImageRef = ref(null);

const moveLens = (event) => {
  const rect = zoomContainer.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  lensX.value = x;
  lensY.value = y;
};

const lensStyle = computed(() => {
  const size = 150;
  return {
    top: `${lensY.value - size / 2}px`,
    left: `${lensX.value - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    backgroundImage: `url(${productImageRef.value?.src})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${productImageRef.value?.width * zoomFactor}px ${productImageRef.value?.height * zoomFactor}px`,
    backgroundPosition: `-${lensX.value * zoomFactor - size / 2}px -${lensY.value * zoomFactor - size / 2}px`
  };
});

// 回到頂端功能
const scrollToTopAnimated = () => {
  const scrollDuration = 500;
  const scrollStep = -window.scrollY / (scrollDuration / 15);

  const scrollInterval = setInterval(() => {
    if (window.scrollY !== 0) {
      window.scrollBy(0, scrollStep);
    } else {
      clearInterval(scrollInterval);
      triggerShakeAnimation();
    }
  }, 15);
};

const triggerShakeAnimation = () => {
  const btn = document.getElementById('backToTopBtn');
  if (btn) {
    btn.classList.add('shake-animation');
    setTimeout(() => {
      btn.classList.remove('shake-animation');
    }, 500);
  }
}

// 資料處理
const fetchProductDetail = async () => {
  try {
    const { data } = await axios.get(`/api/products/${route.params.id}`);
    if (data && data.id) {
      product.value = data;
    } else {
      console.warn('商品不存在，返回首頁');
      router.push('/');
    }
  } catch (error) {
    console.error('取得商品資料失敗', error);
    router.push('/');
  }
}

// 取得評論
async function fetchReviews() {
  try {
    const res = await axios.get(`/api/products/${route.params.id}/reviews`, {
      params: { sort:'LATEST', page:0, size:10 }
    })
    reviews.value = res.data.data.content
  } catch (e) {
    console.warn('取得評論失敗（已忽略）', e)
  }
}

const fetchRecommended = async () => {
  try {
    const { data } = await axios.get(`/api/products/${route.params.id}/recommended`);
    recommended.value = data;
  } catch (error) {
    console.error('取得推薦商品失敗', error);
  }
}

const addToCart = (event) => {
  if (!product.value) return;

  for (let i = 0; i < quantity.value; i++) {
    const img = document.createElement('img');
    img.src = productImage.value || '/images/default.png';
    img.style.position = 'fixed';
    img.style.left = `${event.clientX}px`;
    img.style.top = `${event.clientY}px`;
    img.style.width = '80px';
    img.style.height = '80px';
    img.style.borderRadius = '50%';
    img.style.zIndex = 2000;
    img.style.pointerEvents = 'none';
    img.style.transition = 'all 0.9s cubic-bezier(0.22, 1, 0.36, 1)';

    document.body.appendChild(img);

    setTimeout(() => {
      const randomOffsetX = Math.random() * 100 - 50;
      const randomOffsetY = Math.random() * 100 - 30;

      img.style.left = `calc(92% + ${randomOffsetX}px)`;
      img.style.top = `calc(2% + ${randomOffsetY}px)`;
      img.style.width = '0px';
      img.style.height = '0px';
      img.style.opacity = '0';
    }, 10 + i * 100);

    setTimeout(() => {
      document.body.removeChild(img);
    }, 1000 + i * 100);
  }

  // ✅ 注意：這兩行要在 function 內
  cartCount.value += quantity.value;
  Swal.fire({
    icon: 'success',
    title: '已加入購物車！',
    text: `${product.value.name} 已成功加入購物車（${quantity.value} 件）！`,
    timer: 1500,
    showConfirmButton: false
  });
};

const renderStars = (count) => {
  if (!count) return '';
  return '★'.repeat(count);
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
}

const getProductImage = (name) => {
  if (name === '香水 A') return 'https://unhappyproductmedia.blob.core.windows.net/product-media/test/perfumeA.jpg';
  if (name === '香水 B') return 'https://unhappyproductmedia.blob.core.windows.net/product-media/test/perfumeB.jpg';
  if (name === 'MyPhone 15 Pro Max') return 'https://unhappyproductmedia.blob.core.windows.net/product-media/test/phone1.png';
  if (name === '黑色棉T') return 'https://unhappyproductmedia.blob.core.windows.net/product-media/test/black_T.png';
  return 'https://unhappyproductmedia.blob.core.windows.net/product-media/test/茶茶.png';
}

const productImage = computed(() => {
  return getProductImage(product.value?.name || '');
});


// 畫面載入 / 離開
const handleScroll = () => {
  showBackToTop.value = window.scrollY > 200;
}

onMounted(() => {
  fetchProductDetail();
  fetchReviews();
  fetchRecommended();
  window.addEventListener('scroll', handleScroll);
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
})
</script>

<style scoped>
@import "@/assets/main.css";
/* 放大鏡基本CSS這邊可以額外補充 */
</style>
