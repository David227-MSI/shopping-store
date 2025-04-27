<template>
  <div class="coupon-container">
    <h1 class="title">優惠券列表</h1>

    <!-- 搜尋欄位 -->
    <div class="filters">
      <input
        v-model="filters.search"
        type="text"
        placeholder="輸入優惠券關鍵字..."
        class="filter-input"
      />

      <select v-model="filters.applicableType" class="filter-select">
        <option :value="null">全部種類</option>
        <option value="ALL">全品項適用</option>
        <option value="BRAND">特定品牌適用</option>
        <option value="PRODUCT">特定商品適用</option>
        <option value="CATEGORY">特定分類適用</option>
      </select>

      <select v-model="filters.status" class="filter-select">
        <option :value="null">全部狀態</option>
        <option value="VALID">有效</option>
        <option value="EXPIRING">即將到期</option>
        <option value="EXPIRED">已過期</option>
      </select>

      <div class="checkbox-group">
        <label class="checkbox-label">
          <input type="radio" :value="null" v-model="filters.isUsed" name="usedStatus" />
          全部
        </label>
        <label class="checkbox-label">
          <input type="radio" :value="true" v-model="filters.isUsed" name="usedStatus" />
          已使用
        </label>
        <label class="checkbox-label">
          <input type="radio" :value="false" v-model="filters.isUsed" name="usedStatus" />
          未使用
        </label>
      </div>
    </div>

    <!-- 優惠券清單 -->
    <div class="coupon-list">
      <div
        v-for="item in coupons"
        :key="item.id"
        class="coupon-item"
        @click="openDetail(item.id)"
      >
        <h2 class="coupon-title">{{ formatCouponTitle(item) }}</h2>
        <div class="coupon-info">
          <span>{{ formatApplicableType(item.applicableType) }}</span>
          <span>{{ formatDateRange(item.startTime, item.endTime) }}</span>
        </div>
        <div class="coupon-status">
          <span v-if="item.isUsed" class="status used">已使用</span>
          <span v-else-if="isExpiring(item.endTime)" class="status expiring">即將到期</span>
          <span v-else-if="isExpired(item.endTime)" class="status expired">已過期</span>
          <span v-else class="status valid">有效</span>
          <span v-if="item.tradeable" class="status tradeable">可交易</span>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <CouponModal
      v-if="showModal"
      :coupon="selectedCoupon"
      @close="showModal = false"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import CouponModal from '@/components/ttpp/CouponDetailModal.vue';

const filters = ref({
  userId: 1001,
  search: '',
  applicableType: null,
  status: null,
  isUsed: null,
});

const coupons = ref([]);
const selectedCoupon = ref(null);
const showModal = ref(false);

const search = async () => {
  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/coupons/user/query`, filters.value);
    coupons.value = res.data.data.couponList;
  } catch (err) {
    Swal.fire('查詢失敗', err.response?.data?.message || '錯誤', 'error');
  }
};

const openDetail = async (id) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/coupons/user/coupon/${id}`);
    selectedCoupon.value = res.data.data;
    showModal.value = true;
  } catch (err) {
    Swal.fire('查詢細節失敗', err.response?.data?.message || '錯誤', 'error');
  }
};

const formatCouponTitle = (coupon) => {
  if (coupon.discountType === 'VALUE') {
    return `$${coupon.discountValue} 折扣`;
  }
  return `${coupon.discountValue}% 折扣${coupon.maxDiscount ? ` (最高 $${coupon.maxDiscount})` : ''}`;
};

const formatApplicableType = (type) => {
  const types = {
    ALL: '全品項適用',
    BRAND: '特定品牌',
    PRODUCT: '特定商品',
    CATEGORY: '特定類別',
  };
  return types[type] || type;
};

const formatDate = (dateString) => {
  if (!dateString) return '無';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const formatDateRange = (start, end) => {
  return `${formatDate(start)} - ${formatDate(end)}`;
};

const isExpiring = (endTime) => {
  if (!endTime) return false;
  const end = new Date(endTime);
  const now = new Date();
  const daysUntilExpiry = (end - now) / (1000 * 60 * 60 * 24);
  return daysUntilExpiry > 0 && daysUntilExpiry <= 7; // 7 天內到期
};

const isExpired = (endTime) => {
  if (!endTime) return false;
  const end = new Date(endTime);
  const now = new Date();
  return end < now;
};

// 監聽篩選條件變化
watch(filters, search, { deep: true });

// 初始化查詢
search();
</script>

<style scoped>
.coupon-container {
  padding: 1.5rem;
  background-color: #1c1a2e;
  min-height: 100vh;
  color: #e0e0e0;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 1.5rem;
  letter-spacing: 0.025em;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.filter-input,
.filter-select {
  padding: 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #3a3a5a;
  background-color: #2a2a3e;
  color: #e0e0e0;
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #6b7280;
  background-color: #555590;
}

.filter-select {
  flex: 1;
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg fill='%23e0e0e0' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.5rem;
}

.checkbox-group {
  display: flex;
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  font-weight: 500;
  color: #d1d5db;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  background-color: #2a2a3e;
  transition: background-color 0.3s ease;
}

.checkbox-label:hover {
  background-color: #33334d;
}

.checkbox-label input {
  accent-color: #6b7280;
}

.coupon-list {
  display: grid;
  gap: 1.5rem;
}

.coupon-item {
  background-color: #2a2a3e;
  padding: 1.25rem;
  border-radius: 0.5rem;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;
}

.coupon-item:hover {
  transform: translateY(-4px);
  background-color: #33334d;
  box-shadow: 0px 6px 16px rgba(0, 0, 0, 0.3);
}

.coupon-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
}

.coupon-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #9ca3af;
  margin-top: 0.5rem;
}

.coupon-status {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.status {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
}

.status.valid {
  background-color: #34d399;
  color: #1a1a2e;
}

.status.expiring {
  background-color: #facc15;
  color: #1a1a2e;
}

.status.expired {
  background-color: #9ca3af;
  color: #1a1a2e;
}

.status.used {
  background-color: #6b7280;
  color: #e0e0e0;
}

.status.tradeable {
  background-color: #3b82f6;
  color: #e0e0e0;
}
</style>