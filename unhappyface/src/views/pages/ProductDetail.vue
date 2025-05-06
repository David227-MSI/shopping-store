<template>
    <div>
       <!-- ✅ 補上 Header，這樣購物車才會出現 -->
   <Header :cartCount="cartCount" />
   <div class="detail-layout">
        <!-- 左邊圖片 -->
        <ZoomImage
          :productImage="productImage"
        />
  
        <!-- 右邊資訊 -->
        <ProductInfo
          :product="product"
          :quantity="quantity"
          :isWishlisted="product?.isWishlisted ?? false"
          @increase="increaseQuantity"
          @decrease="decreaseQuantity"
          @add-to-cart="addToCart"
          @toggle-wishlist="toggleWishlist"
        />
      </div>
  
      <!-- 添加縮略圖區塊 -->
      <!-- 使用 v-if="productImages.length > 1" 只在有多張圖片時顯示 -->
      <div v-if="productImages.length > 1" class="thumbnail-gallery">
        <!-- 使用 v-for 迴圈顯示圖片列表 -->
          <img
          v-for="(image, index) in productImages"
          :key="index"
          :src="image"
          alt="Product thumbnail"
          class="thumbnail"
          :class="{ 'is-selected': image === selectedMainImage }"
          @click="selectMainImage(image)"
        />
      </div>

      <div class="review-section">
        <h2 >💬 使用者評論</h2>
      <ReviewList v-if="product" :product-id="product.id" />
      </div>

      <RecommendList
    :products="recommended"
    @add-to-cart="(product, event) => addToCart(product, event)"
    @toggle-wishlist="toggleWishlist"
  />
  
  
      <BackToTop v-show="showBackToTop" @scrollToTop="scrollToTopAnimated" />
    </div>
  </template>
  <style scoped>
  .detail-layout {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: 50px;
    padding: 40px;
  }
  </style>
  <script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import axios from 'axios'
  import Swal from 'sweetalert2'
  import Header from '@/components/common/Header.vue'
  import ZoomImage from '@/components/product/ZoomImage.vue'
  import ProductInfo from '@/components/product/ProductInfo.vue'
  import ReviewList from '@/components/ra/review/ReviewList.vue'
  import RecommendList from '@/components/product/RecommendList.vue'
  import BackToTop from '@/components/common/BackToTop.vue'
  
  // 🛒 購買數量功能
  const quantity = ref(1)
  
  
  
  
  const route = useRoute()
  const router = useRouter()
  
  const product = ref(null)
  const reviews = ref([])
  const recommended = ref([])
  const cartCount = ref(0)
  const showBackToTop = ref(false)
  const isWishlisted = ref(false)
  
  const selectedMainImage = ref(''); // 儲存當前顯示的主圖 URL
  const productImages = ref([]); // 儲存所有圖片的 URL 列表
  
  const increaseQuantity = () => {
    quantity.value++
    triggerQuantityShake()
  }
  
  const decreaseQuantity = () => {
    if (quantity.value > 1) {
      quantity.value--
      triggerQuantityShake()
    }
  }
  
  const triggerQuantityShake = () => {
    const input = document.querySelector('.quantity-selector input')
    if (input) {
      input.classList.remove('shake')
      void input.offsetWidth
      input.classList.add('shake')
    }
  }
  const toggleWishlist = (item) => {
    if (!item) return
    item.isWishlisted = !item.isWishlisted
    Swal.fire({
      icon: item.isWishlisted ? 'success' : 'info',
      title: item.isWishlisted ? '已加入收藏！' : '已取消收藏！',
      text: item.name,
      timer: 1200,
      showConfirmButton: false
    })
  }
  
  
  const scrollToTopAnimated = () => {
    const scrollDuration = 500
    const scrollStep = -window.scrollY / (scrollDuration / 15)
    const scrollInterval = setInterval(() => {
      if (window.scrollY !== 0) {
        window.scrollBy(0, scrollStep)
      } else {
        clearInterval(scrollInterval)
        const btn = document.getElementById('backToTopBtn')
        if (btn) {
          btn.classList.add('shake-animation')
          setTimeout(() => btn.classList.remove('shake-animation'), 500)
        }
      }
    }, 15)
  }
  
  const fetchProductDetail = async () => {
    try {
      const { data } = await axios.get(`/api/products/${route.params.id}`)
      if (data && data.id) {
        product.value = data
      } else {
        router.push('/')
      }
    } catch (err) {
      console.error('獲取產品詳細資料失敗:', err)
      if (axios.isAxiosError(err) && err.response?.status === 404) {
         router.push('/404'); // 假設您有一個 404 頁面
      } else {
         router.push('/'); // 其他錯誤導向首頁
      }
    }
  };

// 新增一個函式來單獨獲取產品圖片列表
const fetchProductImages = async () => {
  try {
    const response = await axios.get(`/api/media/product/${route.params.id}`);
    const apiResponse = response.data;

    if (apiResponse.success === true && apiResponse.data && Array.isArray(apiResponse.data) && apiResponse.data.length > 0) {
      console.log('API responded successfully with data.');
      console.log('Raw API data for images:', apiResponse.data);

      productImages.value = apiResponse.data.map(mediaDto => mediaDto.mediaUrl);
      selectedMainImage.value = productImages.value[0];

      console.log('productImages ref after mapping:', productImages.value);
      console.log('selectedMainImage ref after setting:', selectedMainImage.value);
    } else {
      console.log('API response indicates failure or data is empty/invalid (based on success field).');
      productImages.value = [];
      selectedMainImage.value = getProductImage(product.value?.name || '');
    }
  } catch (err) {
    console.error('獲取產品圖片失敗:', err);
    productImages.value = [];
    selectedMainImage.value = getProductImage(product.value?.name || '');
  }
};

  // 新增方法：點擊縮略圖時，更新 selectedMainImage 的值
  const selectMainImage = (imageUrl) => {
  selectedMainImage.value = imageUrl;
  // 如果需要，點擊縮略圖時可以讓主圖區域也捲動到頂部
  // window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
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
      const { data } = await axios.get(`/api/products/${route.params.id}/recommended`)
      recommended.value = data
    } catch (e) {
      console.error('推薦商品讀取失敗', e)
    }
  }
  
  const addToCart = (targetProductOrEvent, optionalEvent) => {
    let item = product.value
    let event = targetProductOrEvent
  
    // 如果是從推薦商品來的，第一參數是 product，第二是 event
    if (optionalEvent && targetProductOrEvent?.id) {
      item = targetProductOrEvent
      event = optionalEvent
    }
  
    if (!item || !event) return
  
    for (let i = 0; i < quantity.value; i++) {
      const img = document.createElement('img')
      img.src = getProductImage(item.name)
      img.style.position = 'fixed'
      img.style.left = `${event.clientX}px`
      img.style.top = `${event.clientY}px`
      img.style.width = '80px'
      img.style.height = '80px'
      img.style.borderRadius = '50%'
      img.style.zIndex = 2000
      img.style.pointerEvents = 'none'
      img.style.transition = 'all 0.9s cubic-bezier(0.22, 1, 0.36, 1)'
      document.body.appendChild(img)
      setTimeout(() => {
        img.style.left = `calc(92% + ${Math.random() * 100 - 50}px)`
        img.style.top = `calc(2% + ${Math.random() * 100 - 30}px)`
        img.style.width = '0px'
        img.style.height = '0px'
        img.style.opacity = '0'
      }, 10 + i * 100)
      setTimeout(() => document.body.removeChild(img), 1000 + i * 100)
    }
  
    cartCount.value += quantity.value
    Swal.fire({
      icon: 'success',
      title: '已加入購物車！',
      text: `${item.name} 已成功加入購物車（${quantity.value} 件）！`,
      timer: 1500,
      showConfirmButton: false
    })
  }
  
  
  
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
    return '/images/pose_kiri_man.png'
  }
  
  const productImage = computed(() => {
    // 如果 selectedMainImage 有值，就用它；否則使用舊的根據產品名稱獲取佔位圖的邏輯 (作為備用)
    return selectedMainImage.value || getProductImage(product.value?.name || '');
  });
  
  const handleScroll = () => showBackToTop.value = window.scrollY > 200
  onMounted(() => {
    fetchProductDetail()
    fetchReviews()
    fetchRecommended()
    window.addEventListener('scroll', handleScroll)
  })

  onMounted(() => {
  console.log('--- ProductDetail Component Mounted ---');
  console.log('Route params ID:', route.params.id);

  fetchProductDetail(); // 獲取產品基本資料
  fetchProductImages(); // *** 正確：在 mounted 時呼叫獲取圖片的函式 ***
  fetchReviews(); // 獲取評論
  fetchRecommended(); // 獲取推薦商品

  console.log('--- onMounted finished initiating fetches ---');

  window.addEventListener('scroll', handleScroll);
  })

  onUnmounted(() => window.removeEventListener('scroll', handleScroll))
  
  
  </script>
  
  <style scoped>
  @import "@/assets/main.css";

  .detail-layout {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: 50px;
    padding: 40px;
  }

    /* *** 添加縮略圖區塊和縮略圖的樣式 *** */
  .thumbnail-gallery {
    display: flex; /* 讓縮略圖並排顯示 */
    justify-content: center; /* 讓縮略圖區塊在父容器中置中 */
    margin-top: 20px; /* 在主圖區域下方添加間距 */
    gap: 10px; /* 縮略圖之間的間距 */
    flex-wrap: wrap; /* 如果圖片太多，允許換行 */
  }

  .thumbnail {
    width: 60px; /* 縮略圖寬度，您可以調整大小 */
    height: 60px; /* 縮略圖高度 */
    object-fit: cover; /* 圖片裁切以填充容器，保持圖片不變形 */
    border: 2px solid transparent; /* 預設邊框透明 */
    border-radius: 4px; /* 可選：圓角 */
    cursor: pointer; /* 滑鼠懸停時顯示手形光標 */
    transition: border-color 0.2s, transform 0.2s; /* 邊框顏色和大小變化的過渡效果 */
  }

  .thumbnail:hover {
    border-color: #a47551; /* 懸停時邊框變色 (使用輔色調) */
    transform: scale(1.05); /* 懸停時稍微放大 */
  }

  .thumbnail.is-selected {
     border-color: #5C4033; /* 選中時邊框變色 (使用主色調) */
    box-shadow: 0 0 5px rgba(92, 64, 51, 0.5); /* 可選：選中時添加陰影 */
  }
  </style>