<template>
  <transition name="fade">
    <div class="modal-overlay" v-if="visible" @click.self="close">
      <div class="modal-content">
        <h2 class="modal-title">商品明細</h2>

        <div v-if="isLoading" class="empty-text">載入中...</div>

        <table class="product-table" v-else>
          <thead>
          <tr>
            <th>產品圖片</th>
            <th>商品名稱</th>
            <th>數量</th>
            <th>單價</th>
            <th>小計</th>
            <th>評論</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in orderDetails" :key="item.productId">
            <td>
              <img
                  :src="productImageMap[item.productId] || '/images/placeholder.png'"
                  alt="商品圖片"
                  class="product-img"
                  @error="(e) => e.target.src = '/images/placeholder.png'"
              />
            </td>
            <td>
              <a
                  :href="`/products/${item.productId}`"
                  class="product-link"
                  target="_blank"
              >
                {{ item.productName }}
              </a>
            </td>
            <td>{{ item.quantity }}</td>
            <td>{{ item.unitPrice }} 元</td>
            <td>{{ item.subtotal }} 元</td>
            <!-- 評論欄位 -->
            <td>
              <button class="review-btn" type="button" title="撰寫評論" @click="openReview(item.productId)">撰寫評論</button>
            </td>
          </tr>
          <tr v-if="discountAmount > 0">
            <td colspan="5" class="text-right">折價券</td>
            <td class="discount">-{{ discountAmount }} 元</td>
          </tr>
          <tr>
            <td colspan="5" class="text-right total-label">總計</td>
            <td class="total-value">{{ finalAmount }} 元</td>
          </tr>
          </tbody>
        </table>

        <button class="close-btn" @click="close">關閉</button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from '@/services/order/orderAxios.js';

const props = defineProps({
  visible: Boolean,
  orderId: Number
});

const emit = defineEmits(['close']);
const close = () => emit('close');

const orderDetails = ref([]);
const discountAmount = ref(0);
const finalAmount = ref(0);
const isLoading = ref(false);
const productImageMap = ref({});

// 載入訂單明細 + 抓圖片
watch(
    () => props.orderId,
    async (newId) => {
      if (!newId) return;
      isLoading.value = true;
      try {
        const res = await axios.get(`/api/orders/${newId}`);
        orderDetails.value = res.orderDetails || [];
        discountAmount.value = res.order.discountAmount || 0;
        finalAmount.value = res.order.finalAmount || 0;

        // 同步抓主圖
        const tasks = orderDetails.value.map(async (item) => {
          try {
            const imgRes = await axios.get(`/api/media/product/${item.productId}/main`);
            productImageMap.value[item.productId] = imgRes.data?.mediaUrl || '/images/placeholder.png';
          } catch {
            productImageMap.value[item.productId] = '/images/placeholder.png';
          }
        });
        await Promise.all(tasks);
      } catch (err) {
        console.error('載入訂單明細失敗', err);
      } finally {
        isLoading.value = false;
      }
    },
    { immediate: true }
);
</script>

<style scoped>
.product-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  transition: transform 0.2s ease-in-out;
}
.product-img:hover {
  transform: scale(1.08);
}

.review-btn {
  background-color: #a07855;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.85rem;
  box-shadow: 0 2px 6px rgba(160, 120, 85, 0.2);
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}
.review-btn:hover {
  background-color: #8c6242;
  box-shadow: 0 4px 12px rgba(140, 98, 66, 0.3);
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 9999;
}
.modal-content {
  background: #fffaf4;
  padding: 30px;
  border-radius: 16px;
  width: 92%;
  max-width: 720px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  animation: fadeInUp 0.4s ease;
}
.modal-title {
  font-size: 1.6rem;
  font-weight: bold;
  text-align: center;
  color: var(--primary);
  margin-bottom: 20px;
}
.product-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  font-size: 0.95rem;
  border-radius: 10px;
  overflow: hidden;
}
.product-table th {
  background-color: #f4ede1;
  color: #5b3a29;
  padding: 12px;
  text-align: center;
}
.product-table td {
  background-color: #fffefb;
  color: #3e2c23;
  padding: 12px;
  text-align: center;
  border-bottom: 1px solid #f0e8da;
  transition: background-color 0.3s ease;
}
.product-table tr:nth-child(even) td {
  background-color: #fdf7ef;
}
.product-table tbody tr:hover td {
  background-color: #f3ede4;
}
.product-link {
  color: var(--primary);
  text-decoration: none;
  transition: color 0.2s;
}
.product-link:hover {
  text-decoration: underline;
  color: #9b59b6;
}
.discount {
  color: #e53935 !important;
  font-weight: bold;
}
.total-label {
  font-weight: bold;
  color: #333;
  background: #fafafa;
}
.total-value {
  font-weight: bold;
  background: #fff0f6;
  color: #333;
}
.empty-text {
  text-align: center;
  padding: 20px;
  color: #999;
  font-style: italic;
}
.close-btn {
  display: block;
  margin: 30px auto 0;
  padding: 10px 24px;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  background: var(--primary);
  color: white;
  box-shadow: 0 4px 12px rgba(126, 59, 146, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}
.close-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(126, 59, 146, 0.4);
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(40px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
