<template>
  <div>
     <!-- ✅ 補上 Header，這樣購物車才會出現 -->
 <Header :cartCount="cartCount" />
 <div class="detail-layout">
      <!-- 左邊圖片 -->
      <ZoomImage
        :productImage="productImage"
        @mousemove="moveLens"
        @mouseenter="showLens = true"
        @mouseleave="showLens = false"
        :lensStyle="lensStyle"
        ref="zoomContainer"
        refImage="productImageRef"
      />

      <!-- 右邊資訊 -->
      <ProductInfo
        :product="product"
        :quantity="quantity"
        :isWishlisted="isWishlisted"
        @increase="increaseQuantity"
        @decrease="decreaseQuantity"
        @add-to-cart="addToCart"
        @toggle-wishlist="toggleWishlist"
      />
    </div>


    <ReviewList :reviews="reviews" />

    <RecommendList
  :products="recommended"
  @add-to-cart="addToCart"
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
import ReviewList from '@/components/review/ReviewList.vue'
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

const showLens = ref(false)
const lensX = ref(0)
const lensY = ref(0)
const zoomFactor = 2.25
const zoomContainer = ref(null)
const productImageRef = ref(null)

const moveLens = (event) => {
  const rect = zoomContainer.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  lensX.value = x
  lensY.value = y
}

const lensStyle = computed(() => {
  const size = 150
  return {
    top: `${lensY.value - size / 2}px`,
    left: `${lensX.value - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    backgroundImage: `url(${productImageRef.value?.src})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${productImageRef.value?.width * zoomFactor}px ${productImageRef.value?.height * zoomFactor}px`,
    backgroundPosition: `-${lensX.value * zoomFactor - size / 2}px -${lensY.value * zoomFactor - size / 2}px`
  }
})

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
const toggleWishlist = (product) => {
  product.isWishlisted = !product.isWishlisted
  Swal.fire({
    icon: product.isWishlisted ? 'success' : 'info',
    title: product.isWishlisted ? '已加入收藏！' : '已取消收藏！',
    text: product.name,
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
    console.error(err)
    router.push('/')
  }
}

const fetchReviews = async () => {
  try {
    const { data } = await axios.get(`/api/products/${route.params.id}/reviews`)
    reviews.value = data
  } catch (e) {
    reviews.value = []
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

const addToCart = (event) => {
  if (!product.value) return
  for (let i = 0; i < quantity.value; i++) {
    const img = document.createElement('img')
    img.src = productImage.value || '/images/default.png'
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
  Swal.fire({ icon: 'success', title: '已加入購物車！', text: `${product.value.name} 已成功加入購物車（${quantity.value} 件）！`, timer: 1500, showConfirmButton: false })
}

const getProductImage = (name) => {
  if (name === '香水 A') return '/images/perfumeA.jpg'
  if (name === '香水 B') return '/images/perfumeB.jpg'
  if (name === 'MyPhone 15 Pro Max') return '/images/phone1.png'
  if (name === '黑色棉T') return '/images/black_T.png'
  return 'https://via.placeholder.com/300x180?text=No+Image'
}

const productImage = computed(() => getProductImage(product.value?.name || ''))

const handleScroll = () => showBackToTop.value = window.scrollY > 200
onMounted(() => {
  fetchProductDetail()
  fetchReviews()
  fetchRecommended()
  window.addEventListener('scroll', handleScroll)
})
onUnmounted(() => window.removeEventListener('scroll', handleScroll))


</script>

<style scoped>
@import "@/assets/styles.css";
</style>
