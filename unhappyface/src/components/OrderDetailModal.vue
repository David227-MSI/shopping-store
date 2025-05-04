<template>
  <transition name="fade">
    <div class="modal-overlay" v-if="visible" @click.self="close">
      <div class="modal-content">
        <h2 class="modal-title">商品明細</h2>

        <div v-if="isLoading" class="empty-text">載入中...</div>

        <table class="product-table" v-else>
          <thead>
          <tr>
            <th>商品名稱</th>
            <th>數量</th>
            <th>單價</th>
            <th>小計</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in orderDetails" :key="item.productId">
            <td>
              <!-- ⚠️ 將來連結到產品頁面替換為 <router-link> 或 <a> -->
              <a :href="`/product/${item.productId}`" class="product-link" target="_blank">
                {{ item.productName }}
              </a>
            </td>
            <td>{{ item.quantity }}</td>
            <td>{{ item.unitPrice }} 元</td>
            <td>{{ item.subtotal }} 元</td>
          </tr>
          <tr v-if="discountAmount > 0">
            <td colspan="3" class="text-right">折價券</td>
            <td class="discount">-{{ discountAmount }} 元</td>
          </tr>
          <tr>
            <td colspan="3" class="text-right total-label">總計</td>
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
import axios from '@/services/order/axios';

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
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 9999;
}
.modal-content {
  background: #fef6ff;
  padding: 30px;
  border-radius: 16px;
  width: 92%;
  max-width: 720px;
  box-shadow: 0 6px 20px rgba(126, 59, 146, 0.2);
  animation: fadeInUp 0.4s ease;
}
.modal-title {
  font-size: 1.6rem;
  font-weight: bold;
  text-align: center;
  color: #7e3b92;
  margin-bottom: 20px;
}
.product-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  font-size: 0.95rem;
}
.product-table th,
.product-table td {
  padding: 12px;
  text-align: center;
  border: 1px solid #e0cce9;
}
.product-table th {
  background-color: #f8e6ff;
  color: #6a1b9a;
}
.product-link {
  color: #7e3b92;
  text-decoration: none;
  transition: color 0.2s;
}
.product-link:hover {
  text-decoration: underline;
  color: #9b59b6;
}
.discount {
  color: #c0392b;
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
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  color: white;
  box-shadow: 0 4px 12px rgba(155, 89, 182, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}
.close-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(155, 89, 182, 0.6);
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