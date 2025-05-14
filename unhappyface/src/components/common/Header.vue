 <template>
   <div class="topbar">
     <a href="/">🏠 回首頁</a>
     <a href="#">📱 App下載</a>
     <a href="#">💎 點點購</a>
     <a href="#">📚 書店</a>

     <template v-if="!userStore.isLoggedIn">
       <a href="/secure/login">🔑 登入</a>
       <a href="/secure/register">🆕 註冊</a>
     </template>
     <template v-else>
       <a href="/secure/member-center">👤 會員中心</a>
       <template v-if="unreadNotificationCount > 0">
         <a href="/pages/user-notification-list">
           🔔 通知 (<span class="unread-count">{{ unreadNotificationCount }}</span>)
         </a>
       </template>
       <template v-else>
         <a href="/pages/user-notification-list">🔔 通知</a>
       </template>
       <a href="#" @click.prevent="logout">🚪 登出</a>
     </template>

     <a href="#" @click.prevent="handleOrdersClick">📦 查訂單</a>
     <a href="/pages/user-subscribe-list">⭐️ 追蹤清單</a>
     <a href="/pages/user-coupon-list">🎫 折價券</a>
     <a href="#" @click.prevent="handleCartClick">🛒 購物車 (<span>{{ cartCount }}</span>)</a>
   </div>
 </template>

<script setup>
import { useAuth } from '@/services/logout';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useCartStore } from '@/stores/cart/cartStore';
import { useNotificationStore } from '@/stores/ttpp/notificationStore';
import { ref, onMounted, computed } from 'vue';

const { logout } = useAuth();
const userStore = useUserStore();
const cartStore = useCartStore();
const router = useRouter()
const notificationStore = useNotificationStore();

const showNotifications = ref(false);
const notifications = computed(() => notificationStore.notifications);
const unreadNotificationCount = computed(() => notificationStore.unreadNotificationCount);

const handleCartClick = async () => {
  if (!userStore.isLoggedIn) {
    const result = await Swal.fire({
      title: '請先登入',
      text: '登入後可查看購物車與結帳功能',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: '前往登入',
      cancelButtonText: '取消'
    })

    if (result.isConfirmed) {
      router.push('/secure/login')
    }
  } else {
    router.push('/cart')
  }
}

const handleOrdersClick = async () => {
  if (!userStore.isLoggedIn) {
    const result = await Swal.fire({
      title: '請先登入',
      text: '登入後可查看訂單記錄',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: '前往登入',
      cancelButtonText: '取消'
    });

    if (result.isConfirmed) {
      router.push('/secure/login');
    }
  } else {
    router.push('/member/orders');
  }
};

const cartCount = computed(() => {
  return cartStore.cartItems.reduce((sum, item) => sum + item.quantity, 0);
});

onMounted(() => {
  if (userStore.isLoggedIn && userStore.userId) {
    notificationStore.fetchNotifications(userStore.userId);
  }
});


</script>

 <style scoped>
 /* 🔝 頂部導覽列 */
 .topbar {
   background-color: var(--primary);
   padding: 8px 20px;
   font-size: 0.9rem;
   display: flex;
   justify-content: space-between;
   align-items: center;
   flex-wrap: wrap;
   position: fixed;
   top: 0;
   left: 0;
   width: 100%;
   z-index: 999;
   box-shadow: 0 2px 6px rgba(0,0,0,0.1);
 }
 .topbar a {
   flex: 1;
   text-align: center;
   color: var(--text-light);
   text-decoration: none;
   font-weight: bold;
   min-width: 80px;
 }
 .topbar a:hover {
   text-decoration: underline;
 }
 .unread-count {
  color: rgb(255, 255, 255);
}
 </style>

