<template>
  <div class="container">
    <h1>我的優惠券列表</h1>

    <div class="search-bar">
      <div class="filter-left">
        <div>
          <select v-model="filters.applicableType" class="filter-select">
            <option :value="null">全部種類</option>
            <option value="ALL">全品項適用</option>
            <option value="BRAND">特定品牌適用</option>
            <option value="PRODUCT">特定商品適用</option>
            <option value="CATEGORY">特定分類適用</option>
          </select>
        </div>
        <div>
          <select v-model="filters.discountType" class="filter-select">
            <option :value="null">全部折扣類型</option>
            <option value="VALUE">面額折扣</option>
            <option value="PERCENTAGE">百分比折扣</option>
          </select>
        </div>
        <div>
          <select v-model="statusFilter" class="filter-select">
            <option :value="null">全部狀態</option>
            <option value="VALID">可使用</option>
            <option value="EXPIRING">即將到期</option>
          </select>
        </div>
      </div>
      </div>

    <div class="coupon-list">
      <CouponCard
        class="coupon-card"
        v-for="item in filteredCoupons"
        :key="item.id"
        :coupon="item"
        @open-detail="handleDetail"
        @transfer-coupon="handleTransfer"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import CouponCard from '@/components/ttpp/UserCouponCard.vue';

const filters = ref({
  userId: 1002,
  isUsed: false,
  applicableType: null,
  discountType: null,
});

const statusFilter = ref(null);
const coupons = ref([]);

const search = async () => {
  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/coupons/user/query`, filters.value);
    coupons.value = res.data.data.couponList;
  } catch (err) {
    Swal.fire('查詢失敗', err.response?.data?.message || '錯誤', 'error');
  }
};

watch(filters, search, { deep: true });
search();

const filteredCoupons = computed(() => {
  return coupons.value.filter(coupon => {
    const applicableTypeMatch = filters.value.applicableType === null || coupon.applicableType === filters.value.applicableType;
    const discountTypeMatch = filters.value.discountType === null || coupon.discountType === filters.value.discountType;

    const now = new Date();
    const startTime = new Date(coupon.startTime);
    const endTime = new Date(coupon.endTime);
    const oneWeekLater = new Date(now);
    oneWeekLater.setDate(now.getDate() + 7);

    const isValid = now >= startTime && now <= endTime;
    const isExpiringSoon = now < endTime && endTime <= oneWeekLater;

    const statusMatch = () => {
      if (statusFilter.value === 'VALID') {
        return isValid;
      } else if (statusFilter.value === 'EXPIRING') {
        return isExpiringSoon;
      }
      return true; // statusFilter.value === null (全部狀態)
    };

    return applicableTypeMatch && discountTypeMatch && statusMatch();
  });
});

watch(statusFilter, () => {
  // filteredCoupons 計算屬性會自動更新
});

const handleDetail = (coupon) => {
  Swal.fire({
    title: '優惠券詳情',
    html: `<pre>${JSON.stringify(coupon, null, 2)}</pre>`,
    width: 600,
  });
};

const handleTransfer = async (coupon) => {
  const { value: email } = await Swal.fire({
    title: '轉贈優惠券',
    input: 'email',
    inputLabel: '請輸入受贈者 Email',
    inputPlaceholder: 'someone@example.com',
    showCancelButton: true,
  });

  if (!email) return;

  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/coupons/transfer`, {
      couponId: coupon.id,
      recipientMail: email,
    });

    Swal.fire('轉贈成功', `優惠券已轉贈給 ${res.data.data.ownerMail}`, 'success');
    search();
  } catch (err) {
    Swal.fire('轉贈失敗', err.response?.data?.message || '錯誤', 'error');
  }
};
</script>

<style scoped>
/* ... (你的樣式保持不變) ... */
.container {
  animation: float-in 0.5s ease-out;
}

.search-bar {
  background: #fffaf4;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-left,
.filter-right {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input,
.filter-select {
  transition: border-color 0.3s;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
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