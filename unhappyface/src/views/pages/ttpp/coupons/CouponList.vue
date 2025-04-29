<template>
  <div class="container">
    <h1>優惠券列表</h1>

    <!-- 搜尋欄位 -->
    <div class="search-bar">
      <div class="filter-left">
        <div>
          <input
            v-model="filters.search"
            type="text"
            placeholder="輸入優惠券關鍵字..."
            class="search-input"
          />
        </div>
        <div>
          <select v-model="filters.applicableType" class="filter-select">
            <option :value="null">全部種類</option>
            <option value="ALL">全品項適用</option>
            <option value="BRAND">特定品牌適用</option>
            <option value="PRODUCT">特定商品適用</option>
            <option value="CATEGORY">特定分類適用</option>
          </select>
        </div>
      </div>
      <div class="filter-right">
        <div>
          <select v-model="filters.status" class="filter-select">
            <option :value="null">全部狀態</option>
            <option value="VALID">有效</option>
            <option value="EXPIRING">即將到期</option>
            <option value="EXPIRED">已過期</option>
          </select>
        </div>
        <div class="radio-group">
          <label class="radio-label">
            <input type="radio" :value="null" v-model="filters.isUsed" name="usedStatus" />
            全部
          </label>
          <label class="radio-label">
            <input type="radio" :value="true" v-model="filters.isUsed" name="usedStatus" />
            已使用
          </label>
          <label class="radio-label">
            <input type="radio" :value="false" v-model="filters.isUsed" name="usedStatus" />
            未使用
          </label>
        </div>
      </div>
    </div>

    <!-- 優惠券清單 -->
    <div class="coupon-list">
      <CouponCard
        class="coupon-card"
        v-for="item in coupons"
        :key="item.id"
        :coupon="item"
        @open-detail="openDetail"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import CouponCard from '@/components/ttpp/CouponCard.vue'

const filters = ref({
  userId: 1001,
  search: '',
  applicableType: null,
  status: null,
  isUsed: null,
});

const coupons = ref([]);

const search = async () => {
  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/coupons/user/query`, filters.value);
    coupons.value = res.data.data.couponList;
  } catch (err) {
    Swal.fire('查詢失敗', err.response?.data?.message || '錯誤', 'error');
  }
};

// 監聽篩選條件變化
watch(filters, search, { deep: true });

// 初始化查詢
search();
</script>












<style scoped>
.container {
  animation: float-in 0.5s ease-out;
}

.search-bar {
  background: #fffaf4;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-input,
.filter-select {
  transition: border-color 0.3s;
}

.search-input:focus,
.filter-select:focus {
  border-color: var(--accent);
  outline: none;
}

.radio-group {
  display: flex;
  gap: 15px;
  align-items: center;
}

.radio-label {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: var(--text-dark);
}

.radio-label input {
  margin-right: 5px;
}

.coupon-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.coupon-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}

.coupon-card:hover {
  transform: translateY(-5px);
}

@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-left,
  .filter-right {
    flex-direction: column;
    gap: 10px;
  }

  .coupon-list {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}
</style>