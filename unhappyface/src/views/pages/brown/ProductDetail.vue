<template>
    <div>
       <!-- ✅ 補上 Header，這樣購物車才會出現 -->
   <Header :cartCount="cartCount" />
   <div class="product-page-content">
   <div class="detail-layout">
        <!-- 左邊圖片 -->
        <ZoomImage
          :mediaItem="currentMainMedia"
        />
  
        <!-- 右邊資訊 -->
        <ProductInfo
          :product="product"
          :quantity="quantity"
          :isWishlisted="isWishlisted? isWishlisted : false"
          @increase="increaseQuantity"
          @decrease="decreaseQuantity"
          @add-to-cart="addToCart"
          @toggle-wishlist="toggleWishlist"
        />
      </div>

      <div v-if="productMediaList.length > 1" class="thumbnail-gallery">
        <div
          v-for="(media, index) in productMediaList"
          :key="media.id || index"
          class="thumbnail-wrapper"
          :class="{ 'is-selected': media.mediaUrl === selectedMainMedia?.mediaUrl }"
          @click="selectMainMedia(media)"
        >
          <img
            v-if="media.mediaType === 'IMAGE'"
            :src="media.mediaUrl"
            :alt="media.altText || 'Product thumbnail'"
            class="thumbnail"
            loading="lazy"
          />
          <video
            v-else-if="media.mediaType === 'VIDEO'"
            :src="media.mediaUrl"
            :alt="media.altText || 'Product video thumbnail'"
            class="thumbnail video-thumbnail"
            preload="metadata"
          ></video>
          <span v-else class="thumbnail-placeholder">N/A</span>

          <div v-if="media.mediaType === 'VIDEO'" class="video-play-icon">▶️</div>
        </div>
      </div>
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

  <script setup>
  import { ref, computed, onMounted, onUnmounted, onUnmounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useUserStore } from '@/stores/userStore'
  import axios from 'axios'
  import Swal from 'sweetalert2'
  import { useCartStore } from '@/stores/cart/cartStore.js'
  import Header from '@/components/common/Header.vue'
  import ZoomImage from '@/components/product/ZoomImage.vue'
  import ProductInfo from '@/components/product/ProductInfo.vue'
  import ReviewList from '@/components/ra/review/ReviewList.vue'
  import RecommendList from '@/components/product/RecommendList.vue'
  import BackToTop from '@/components/common/BackToTop.vue'

  const cartStore = useCartStore()
  // 🛒 購買數量功能
  const quantity = ref(1)
  
  
  
  
  const route = useRoute()
  const router = useRouter()
  const userStore = useUserStore()

  const product = ref(null)
  const reviews = ref([])
  const recommended = ref([])
  const cartCount = ref(0)
  const showBackToTop = ref(false)
  const isWishlisted = ref(false)
  const productId = ref(null)
  
  const selectedMainImage = ref('');
  const productImages = ref([]);
  
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









  const toggleWishlist = async (item) => {
    if (!item) return;
    if (userStore.userId) {
      try {
        const response = await axios.post(`/api/user/subscribes/switch`, {
          userId: userStore.userId,
          itemId: item.id,
          itemType: 'PRODUCT'
        })
        if (response.data.success) {
          isWishlisted.value = !isWishlisted.value
          console.log('item.isWishlisted: ' + isWishlisted.value);

          Swal.fire({
            icon: isWishlisted.value ? 'success' : 'info',
            title: isWishlisted.value ? '已加入收藏！' : '已取消收藏！',
            text: item.name,
            timer: 1200,
            showConfirmButton: false
          })
          fetchProductDetail();
        } else {
          Swal.fire({
            icon: 'error',
            title: '操作失敗',
            text: response.data.message || '無法更新收藏狀態',
          })
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: '操作失敗',
          text: '與伺服器通訊發生錯誤',
        })
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: '請先登入',
        text: '登入後才能使用收藏功能',
        confirmButtonText: '前往登入'
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/secure/login') // 請確保你的登入路由是正確的
        }
      })
    }
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
    console.log('--- fetchProductDetail function called (combined API) ---');
    try {
      const response = await axios.get(`/api/products/${route.params.id}`);

      const apiResponse = response.data;
      const productData = apiResponse.data;
      if (apiResponse.success === true && productData && productData.id) {
        product.value = productData;
        console.log('獲取到的 ProductDTO 數據:', productData);

        checkWishlistStatus(productData.id);

        if (productData.images && Array.isArray(productData.images) && productData.images.length > 0) {

          productMediaList.value = productData.images
              .sort((a, b) => a.mediaOrder - b.mediaOrder);

          const mainMedia = productMediaList.value.find(m => m.isMain) || productMediaList.value[0];
          selectedMainMedia.value = mainMedia;

          console.log('媒體列表從產品詳細 API 獲取成功:', productMediaList.value);
          console.log('Selected main media:', selectedMainMedia.value);
        } else {
          productMediaList.value = [];

          selectedMainMedia.value = {
            mediaUrl: getProductImage(productData.name || ''),
            mediaType: 'IMAGE',
            altText: productData.name || 'Placeholder Image'
          };
          console.log('產品詳細 API 返回的媒體列表為空或不存在，使用備用圖片。');
        }
    } else {
      console.error('獲取產品詳細資料失敗：API 返回失敗狀態或無效數據', apiResponse);
      router.push('/');
    }
  } catch (err) {
    console.error('獲取產品詳細資料失敗:', err);
    if (axios.isAxiosError(err) && err.response?.status === 404) {
        console.error('產品不存在 (404)');
        router.push('/404');
    } else {
        console.error('其他 API 錯誤');
        router.push('/');
    }
  }
};

  // 修改縮圖點擊事件，接收完整的媒體物件 (包含 mediaType, mediaUrl 等)
  const selectMainMedia = (mediaItem) => {
    selectedMainMedia.value = mediaItem;
    // 如果點擊的是影片，確保其自動播放
    if (mediaItem.mediaType === 'VIDEO') {
      // 給予 DOM 渲染一點時間，然後嘗試播放
      setTimeout(() => {
        const videoElement = document.querySelector('.main-media-container video');
        if (videoElement) {
          // 為了確保播放，可能需要先暫停再播放 (特別是在某些移動瀏覽器)
          videoElement.pause();
          videoElement.currentTime = 0; // 從頭開始
          videoElement.play().catch(e => console.error("Error playing video:", e));
        }
      }, 50);
    }
  };
  
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
  
  const addToCart = async (targetProductOrEvent, optionalEvent) => {
    let item = product.value
    let event = targetProductOrEvent
  
    // 如果是從推薦商品來的，第一參數是 product，第二是 event
    if (optionalEvent && targetProductOrEvent?.id) {
      item = targetProductOrEvent
      event = optionalEvent
    }
  
    if (!item || !event) return

    try {
      await cartStore.addToCart({
        ...item,
        quantity: quantity.value
      })

    // 動畫部分保持不變
    for (let i = 0; i < quantity.value; i++) {
      const img = document.createElement('img');
      // 使用 getProductImage 獲取圖片 URL，這部分邏輯沒變
      img.src = getProductImage(item.name); // 注意這裡還是使用圖片作為動畫
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
        img.style.left = `calc(92% + ${Math.random() * 100 - 50}px)`;
        img.style.top = `calc(2% + ${Math.random() * 100 - 30}px)`;
        img.style.width = '0px';
        img.style.height = '0px';
        img.style.opacity = '0';
      }, 10 + i * 100);
      setTimeout(() => document.body.removeChild(img), 1000 + i * 100);
    }

    // 購物車數量更新可能會由 store 內部處理，這裡的 cartCount.value += quantity.value 可能需要調整
    // 如果 Header 組件是直接讀取 cartStore 的 state，這裡就不需要手動更新 cartCount 了
    // cartCount.value += quantity.value // 如果 cartCount 是從 store 映射來的，請刪除這行

    Swal.fire({
      icon: 'success',
      title: '已加入購物車！',
      text: `<span class="math-inline">\{item\.name\} 已成功加入購物車（</span>{quantity.value} 件）！`,
      timer: 1500,
      showConfirmButton: false
    });
  } catch (error) {
    console.error('加入購物車錯誤', error);
    Swal.fire({
      icon: 'error',
      title: '加入購物車失敗',
      text: '請稍後再試',
      timer: 1500,
      showConfirmButton: false
    });
  }


  const checkWishlistStatus = async (productId) => {
    try {
      const response = await axios.post(`/api/user/subscribes/getSubscribeStatus`, {
        userId: userStore.userId,
        itemType: 'PRODUCT',
        itemId: productId
      })

      isWishlisted.value = response.data.data
      // console.log('userId: ' + userStore.userId);
      // console.log('productId ' + productId)
      // console.log('data ' + response.data.data);
      // console.log('isWishlisted ' + isWishlisted.value);

    } catch (error) {
      console.error('Error checking wishlist status:', error)
      isWishlisted.value = false // 出錯時預設為未收藏
    }
  }

  
  
  const getProductImage = (name) => {
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
  
  const handleScroll = () => showBackToTop.value = window.scrollY > 200

  onMounted(() => {
    console.log('--- ProductDetail Component Mounted ---');
    console.log('Route params ID:', route.params.id);
    fetchProductDetail();
    fetchReviews();
    fetchRecommended();
    console.log('--- onMounted finished initiating fetches ---');
    window.addEventListener('scroll', handleScroll)
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

  .product-page-content {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
  }

  .thumbnail-gallery {
    display: flex;
    justify-content: flex-start;
    margin-top: 5px;
    gap: 10px;
    flex-wrap: wrap;
    padding: 0 40px;
    margin-bottom: 20px;
  }

.thumbnail-wrapper {
  position: relative;
  width: 60px; /* 縮圖容器寬度 */
  height: 60px; /* 縮圖容器高度 */
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.2s;
  overflow: hidden; /* 確保內容不會溢出圓角 */
  display: flex; /* 使用 flex 居中內容 */
  justify-content: center;
  align-items: center;
  background-color: #eee; /* 預設背景色 */
}

.thumbnail-wrapper:hover {
  border-color: #a47551;
  transform: scale(1.05);
}

.thumbnail-wrapper.is-selected {
  border-color: #5c4033;
  box-shadow: 0 0 5px rgba(92, 64, 51, 0.5);
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 圖片和影片覆蓋容器 */
  display: block;
}

.video-thumbnail {
  /* 影片縮圖的特定樣式 */
  background-color: black;
}

.video-play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 20px; /* 播放圖示大小 */
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  padding: 5px;
  line-height: 1;
  pointer-events: none; /* 允許點擊穿透到 wrapper */
  z-index: 1; /* 確保在影片縮圖之上 */
}

/* 可選：如果媒體類型未知，顯示佔位符的樣式 */
.thumbnail-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
  color: #ccc;
  font-size: 12px;
}
</style>